"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ShoppingBag, CreditCard, Truck, CheckCircle, MapPin, Edit2, Home, Check, ChevronLeft, Plus, Minus, Package, Clock } from "lucide-react";
import serverAxios from "@/lib/axios-server";
import { useSession } from "next-auth/react";
import StripePaymentButton from "@/components/payment/StripePaymentButton";
import { toAUD } from "@/lib/currency";
import Link from "next/link";

// Google Maps API type definition
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: any
          ) => any;
          AutocompleteSessionToken: new () => any;
        };
      };
    };
  }
}

interface OrderItem {
  id: number;
  goodsId: number;
  num: number;
  goodsPrice: number;
  goodsName: string;
  goodsImg: string;
  subtotal: number;
  type: string;
  orderType: string;
}

interface Order {
  id: number;
  orderNo: string;
  userId: number;
  status: string;
  totalPrice: number;
  createTime: string;
  payTime: string | null;
  orderDetails: OrderItem[];
}

// User address information type
interface UserAddress {
  addressLine1?: string | null;
  addressLine2?: string | null;
  suburb?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

// User profile type
interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  suburb?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

export default function OrderDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { data: session } = useSession();
  
  // Address related states
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [expandedForm, setExpandedForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<UserAddress>({
    addressLine1: "",
    addressLine2: "",
    suburb: "",
    state: "",
    postalCode: "",
    country: ""
  });
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  
  // New states - checkout flow control
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [quantities, setQuantities] = useState<{[key: number]: number}>({});
  const [paymentSuccessful, setPaymentSuccessful] = useState<boolean>(false);
  
  // Google Maps Autocomplete references
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const sessionTokenRef = useRef<any>(null);
  
  // Check if returning from Stripe payment
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  // Initialize payment success state from localStorage or URL params
  useEffect(() => {
    // Check local storage first
    const storedPaymentSuccess = localStorage.getItem(`payment_success_${params.orderId}`);
    
    if (storedPaymentSuccess === 'true') {
      setPaymentSuccessful(true);
      setIsConfirmed(true);
    } 
    else if (success === 'true') {
      // If directly returned from payment with success
      setIsConfirmed(true);
      setPaymentSuccessful(true);
      
      // Store payment success in localStorage to persist through refreshes
      localStorage.setItem(`payment_success_${params.orderId}`, 'true');
    } 
    else if (canceled === 'true') {
      setIsConfirmed(true);
    }
  }, [success, canceled, params.orderId]);

  // Initialize product quantities
  useEffect(() => {
    if (order && order.orderDetails) {
      const initialQuantities: {[key: number]: number} = {};
      order.orderDetails.forEach(item => {
        initialQuantities[item.id] = item.num;
      });
      setQuantities(initialQuantities);
    }
  }, [order]);

  // Google address autofill initialization
  const initAutocomplete = useCallback(() => {
    if (!window.google || !addressInputRef.current) return;

    // Create a new session token to optimize API calls
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }

    const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'au' }, // Restrict to Australian addresses
      fields: ['address_components', 'formatted_address'],
      sessionToken: sessionTokenRef.current,
      language: 'en'
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;
      
      // Parse address components
      const components: Record<string, string> = {};
      place.address_components.forEach((component: any) => {
        const type = component.types[0];
        components[type] = component.long_name;
      });

      // Update address state
      setShippingAddress({
        addressLine1: place.formatted_address || '',
        addressLine2: '',
        suburb: components['locality'] || '',
        state: components['administrative_area_level_1'] || '',
        postalCode: components['postal_code'] || '',
        country: components['country'] || 'Australia'
      });
      
      // Expand form to show details
      setExpandedForm(true);

      // Reset session token for next search
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    });
  }, []);

  // Initialize autocomplete when component mounts and Google API is loaded
  useEffect(() => {
    if (!showAddressForm) return;
    
    const checkAndInitGoogle = () => {
      if (typeof window !== 'undefined' && window.google?.maps?.places) {
        initAutocomplete();
      } else {
        // Wait for Google API to load
        const interval = setInterval(() => {
          if (typeof window !== 'undefined' && window.google?.maps?.places) {
            clearInterval(interval);
            initAutocomplete();
          }
        }, 100);
        
        // Stop checking after 5 seconds to avoid infinite loop
        setTimeout(() => clearInterval(interval), 5000);
      }
    };
    
    checkAndInitGoogle();
  }, [initAutocomplete, showAddressForm]);

  // Fetch order information
  useEffect(() => {
    let mounted = true;

    const fetchOrder = async () => {
      try {
        // Get token from session
        const token = session?.backendToken || '';
        const response = await serverAxios.get(`/coolStuffUser/selectByOrderNo/${params.orderId}`, {
          headers: {
            'headlesscmstoken': token
          }
        });
        if (mounted) {
          setOrder(response.data);
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to load order");
          console.error("Error fetching order:", err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (params.orderId && session) {
      fetchOrder();
    }

    return () => {
      mounted = false;
    };
  }, [params.orderId, session]);

  // Fetch user profile information
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id || !session?.backendToken) return;
      
      setLoadingProfile(true);
      try {
        const response = await serverAxios.get(`/coolStuffUser/selectById/${session.user.id}`, {
          headers: {
            'headlesscmstoken': session.backendToken
          }
        })as any; 
        
        
        const responseCode = response.code;
        const responseData = response.data;

        if (responseCode === "200" && responseData) {
          const profileData = responseData;
          setUserProfile(profileData);
          
          
          // Ensure address data is set correctly
          setShippingAddress({
            addressLine1: profileData.addressLine1 || '',
            addressLine2: profileData.addressLine2 || '',
            suburb: profileData.suburb || '',
            state: profileData.state || '',
            postalCode: profileData.postalCode || '',
            country: profileData.country || ''
          });
          
          // Check if address is complete
          if (profileData.addressLine1) {
            setSetAsDefault(true);
            setShowAddressForm(false);
          } else {
            setShowAddressForm(false);
          }
          
        } else {
          // API request successful but returned no data or error
          console.error('API returned error or no data:', response.data);
          setShowAddressForm(false);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setShowAddressForm(false);
      } finally {
        setLoadingProfile(false);
      }
    };

    if (session) {
      fetchUserProfile();
    }
  }, [session]);

  // Handle address input changes
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save address
  const saveAddress = async () => {
    if (!session?.user?.id || !session?.backendToken || !userProfile) return;
    
    setSavingAddress(true);
    try {
      // Prepare data to update
      const updateData = {
        ...userProfile,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2,
        suburb: shippingAddress.suburb,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country
      };
      
      // Only update user profile when set as default address is selected
      if (setAsDefault) {
        const response = await serverAxios.put('/coolStuffUser/update', updateData, {
          headers: {
            'headlesscmstoken': session.backendToken
          }
        }) as any;
        
        if (response.code === "200") {
          setUserProfile(updateData);
        }
      }
      
      // Hide form, show selected address
      setShowAddressForm(false);
      setIsEditingAddress(false);
      setExpandedForm(false);
    } catch (err) {
      console.error("Error saving address:", err);
    } finally {
      setSavingAddress(false);
    }
  };

  // Update product quantity
  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  // Calculate new order total
  const calculateNewTotal = () => {
    if (!order) return 0;
    
    return order.orderDetails.reduce((total, item) => {
      const quantity = quantities[item.id] || item.num;
      return total + (item.goodsPrice * quantity);
    }, 0);
  };

  // Confirm order information
  const confirmOrder = async () => {
    if (!order || !session?.backendToken) return;
    
    // Check if shipping address exists
    if (!shippingAddress.addressLine1) {
      setShowAddressForm(true);
      return;
    }
    
    setUpdatingOrder(true);
    try {
      // Prepare updated order details
      const updatedDetails = order.orderDetails.map(item => ({
        id: item.id,
        goodsId: item.goodsId,
        num: quantities[item.id] || item.num,
        goodsPrice: item.goodsPrice,
        type: item.type
      }));
      
      // Update order API call - corrected to POST method
      await serverAxios.post(`/coolStuffUser/updateOrder/${order.orderNo}`, {
        orderDetails: updatedDetails,
        totalPrice: calculateNewTotal(),
        // Add address information
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2,
        suburb: shippingAddress.suburb,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country
      }, {
        headers: {
          'headlesscmstoken': session.backendToken
        }
      });
      
      // Fetch updated order
      const response = await serverAxios.get(`/coolStuffUser/selectByOrderNo/${params.orderId}`, {
        headers: {
          'headlesscmstoken': session.backendToken
        }
      });
      
      setOrder(response.data);
      setIsConfirmed(true); // Show payment section after confirmation
    } catch (err) {
      console.error("Error updating order:", err);
    } finally {
      setUpdatingOrder(false);
    }
  };

  // Return to order confirmation
  const backToOrderConfirmation = () => {
    setIsConfirmed(false);
  };

  // Format address display
  const formatAddress = () => {
    const parts = [];
    if (shippingAddress.addressLine2) parts.push(shippingAddress.addressLine2);
    if (shippingAddress.addressLine1) parts.push(shippingAddress.addressLine1);
    
    const cityParts = [];
    if (shippingAddress.suburb) cityParts.push(shippingAddress.suburb);
    if (shippingAddress.state) cityParts.push(shippingAddress.state);
    if (shippingAddress.postalCode) cityParts.push(shippingAddress.postalCode);
    if (cityParts.length) parts.push(cityParts.join(', '));
    
    if (shippingAddress.country) parts.push(shippingAddress.country);
    
    return parts.join(', ');
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Cancelled":
        return "text-red-500";
      case "Pending Payment":
        return "text-yellow-500";
      case "Pending Shipment":
        return "text-blue-500";
      case "Pending Receipt":
        return "text-purple-500";
      case "Completed":
        return "text-green-500";
      case "Refunded":
        return "text-orange-500";
      case "Reviewed":
        return "text-teal-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "Cancelled":
        return "Cancelled";
      case "Pending Payment":
        return "Pending Payment";
      case "Pending Shipment":
        return "Pending Shipment";
      case "Pending Receipt":
        return "Pending Receipt";
      case "Completed":
        return "Completed";
      case "Refunded":
        return "Refunded";
      case "Reviewed":
        return "Reviewed";
      default:
        return status;
    }
  };

  // Render the Thank You page component
  const renderThankYouPage = () => {
    if (!order) return null;
    
    return (
      <div className="bg-gray-900 rounded-lg p-6 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Thank You for Your Order!</h1>
          <p className="text-gray-400">Your payment was successful and your order has been received.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <Package className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-xl font-semibold">Order Summary</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Order Number:</span>
                <span>{order.orderNo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Order Date:</span>
                <span>{new Date(order.createTime).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Order Status:</span>
                <span className={getStatusColor(order.status)}>{getStatusText(order.status)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Amount:</span>
                <span className="font-bold">{toAUD(order.totalPrice)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-xl font-semibold">Shipping Address</h2>
            </div>
            <p className="text-sm">{formatAddress()}</p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Purchased Items</h2>
          <div className="space-y-4">
            {order.orderDetails.map((item) => (
              <div key={item.id} className="flex items-center gap-4 bg-gray-800 rounded-lg p-3">
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={item.goodsImg}
                    alt={item.goodsName}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium line-clamp-1">{item.goodsName}</h3>
                  <div className="flex justify-between mt-1 text-sm text-gray-400">
                    <span>Qty: {quantities[item.id] || item.num}</span>
                    <span>{toAUD(item.goodsPrice)} each</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 mb-6">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold">What's Next?</h2>
          </div>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>We're processing your order now</li>
            <li>You'll receive a confirmation email shortly</li>
            <li>You can track your order's status in <Link href="/myorders" className="text-blue-400 hover:underline">Your Orders</Link></li>
            <li>Expected delivery: 5-7 business days</li>
          </ul>
        </div>
        
        <div className="flex justify-center mt-8 gap-4">
          <Link 
            href="/"
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/myorders"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            View Your Orders
          </Link>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-400">{error || "Order does not exist"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container mx-auto px-4 max-w-6xl relative">
        {/* If payment successful, show thank you page */}
        {paymentSuccessful ? (
          renderThankYouPage()
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left side - Order confirmation */}
            <div className={`transition-all duration-500 ease-in-out ${isConfirmed ? 'w-full md:w-1/4' : 'w-full md:w-3/4'}`}>
              <div className={`bg-gray-900 rounded-lg p-6 ${isConfirmed ? 'opacity-70' : ''}`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Order Details</h1>
              <p className="text-gray-400">Order Number: {order.orderNo}</p>
            </div>
            {!isConfirmed && (
            <div className={`text-lg font-semibold ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </div>
            )}
          </div>
                
                {/* Basic order information */}
                {!isConfirmed && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Order Time</p>
                <p>{new Date(order.createTime).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Payment Method</p>
                <p>Online Payment</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Shipping Method</p>
                <p>Standard Shipping</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Order Status</p>
                <p className={getStatusColor(order.status)}>{getStatusText(order.status)}</p>
            </div>
          </div>
        </div>
        )}

        {/* Shipping Address */}
                <div className="mb-6">
          <div className="flex items-center mb-4">
            <MapPin className="w-5 h-5 mr-2" />
            <h2 className="text-xl font-bold">Shipping Address</h2>
          </div>
          
          {loadingProfile ? (
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              <span>Loading address information...</span>
            </div>
          ) : showAddressForm ? (
            <div className="space-y-4">
                      {/* Address form content */}
              <div>
                <label htmlFor="addressLine1" className="block text-sm text-gray-400 mb-1">
                  Address
                </label>
                <input
                  ref={addressInputRef}
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  value={shippingAddress.addressLine1 || ''}
                  onChange={handleAddressChange}
                  placeholder="Start typing your address..."
                  className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              
              {expandedForm && (
                <>
                  <div>
                    <label htmlFor="addressLine2" className="block text-sm text-gray-400 mb-1">
                      Unit/Floor/Suite (Optional)
                    </label>
                    <input
                      type="text"
                      id="addressLine2"
                      name="addressLine2"
                      value={shippingAddress.addressLine2 || ''}
                      onChange={handleAddressChange}
                      placeholder="Apartment, suite, unit, etc."
                      className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="suburb" className="block text-sm text-gray-400 mb-1">
                        Suburb
                      </label>
                      <input
                        type="text"
                        id="suburb"
                        name="suburb"
                        value={shippingAddress.suburb || ''}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-sm text-gray-400 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={shippingAddress.state || ''}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="postalCode" className="block text-sm text-gray-400 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={shippingAddress.postalCode || ''}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="country" className="block text-sm text-gray-400 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={shippingAddress.country || ''}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="setAsDefault"
                  checked={setAsDefault}
                  onChange={(e) => setSetAsDefault(e.target.checked)}
                  className="h-4 w-4 rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="setAsDefault" className="ml-2 text-gray-300">
                  Set as default address
                </label>
              </div>
              
              <div className="flex gap-2 mt-2">
                <button
                  onClick={saveAddress}
                          disabled={!shippingAddress.addressLine1 || savingAddress || isConfirmed}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingAddress ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Save Address
                    </>
                  )}
                </button>
                
                {isEditingAddress && (
                  <button
                    onClick={() => {
                      setShowAddressForm(false);
                      setIsEditingAddress(false);
                      setExpandedForm(false);
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                            disabled={isConfirmed}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              {shippingAddress.addressLine1 ? (
                <div className="p-2">
                  <p className="text-white">{formatAddress()}</p>
                          {!isConfirmed && (
                  <button 
                    onClick={() => {
                      setIsEditingAddress(true);
                      setShowAddressForm(true);
                    }}
                    className="text-blue-500 hover:text-blue-400 text-sm flex items-center mt-2"
                              disabled={isConfirmed}
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Change
                  </button>
                          )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md"
                          disabled={isConfirmed}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Add Shipping Address
                </button>
              )}
            </div>
          )}
        </div>

                {/* Product list */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-4">Product Information</h2>
                  <div className="space-y-4">
                    {order.orderDetails.map((item) => (
                      <div key={item.id} className="flex flex-col md:flex-row gap-4 bg-gray-800 rounded-lg p-3">
                        {/* Product image */}
                        <div className="w-full md:w-1/4 flex-shrink-0">
                          <img
                            src={item.goodsImg}
                            alt={item.goodsName}
                            className="w-full h-auto aspect-square object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          {/* Product title */}
                          <h3 className="text-lg font-semibold line-clamp-1 mb-2">{item.goodsName}</h3>
                          
                          {/* Product information */}
                          <div className="grid grid-cols-1 gap-y-2">
                            <div>
                              <p className="text-gray-400 text-sm">Unit Price:</p>
                              <p className="font-semibold">{toAUD(item.goodsPrice)}</p>
                            </div>
                            
                            <div>
                              <p className="text-gray-400 text-sm">Type:</p>
                              <p className="font-semibold capitalize">{item.type.toLowerCase()}</p>
                            </div>
                            
                            <div>
                              <p className="text-gray-400 text-sm">Quantity:</p>
                              {!isConfirmed ? (
                                <div className="flex items-center mt-1">
                                  <button 
                                    onClick={() => updateQuantity(item.id, (quantities[item.id] || item.num) - 1)}
                                    className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-l flex items-center justify-center"
                                    disabled={isConfirmed || (quantities[item.id] || item.num) <= 1}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <input
                                    type="number"
                                    value={quantities[item.id] || item.num}
                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                    className="w-12 h-8 bg-gray-700 text-center text-white border-x border-gray-600"
                                    min="1"
                                    disabled={isConfirmed}
                                  />
                                  <button 
                                    onClick={() => updateQuantity(item.id, (quantities[item.id] || item.num) + 1)}
                                    className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-r flex items-center justify-center"
                                    disabled={isConfirmed}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <p className="font-semibold">{quantities[item.id] || item.num}</p>
                              )}
                            </div>
                            
                            <div>
                              <p className="text-gray-400 text-sm">Subtotal:</p>
                              <p className="font-semibold">{toAUD((quantities[item.id] || item.num) * item.goodsPrice)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

        {/* Order amount */}
                <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Order Amount</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Product Total</span>
                      <span>{toAUD(calculateNewTotal())}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="border-t border-gray-800 pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold">
                        <span>Total Amount</span>
                        <span>{toAUD(calculateNewTotal())}</span>
                      </div>
                    </div>
              </div>
            </div>
            
                {/* Only show confirm order button if not confirmed already */}
                {!isConfirmed && (
                  <div className="flex justify-end">
                    <button
                      onClick={confirmOrder}
                      disabled={!shippingAddress.addressLine1 || updatingOrder}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingOrder ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        'Confirm Order & Proceed to Payment'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Payment section */}
            <div className={`transition-all duration-500 ease-in-out ${isConfirmed ? 'w-full md:w-3/4' : 'w-full md:w-1/4'}`}>
              <div className={`bg-gray-900 rounded-lg p-6 h-full ${!isConfirmed ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Payment</h2>
                  {isConfirmed && (
                    <button
                      onClick={backToOrderConfirmation}
                      className="text-blue-500 hover:text-blue-400 flex items-center"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back to Order
                    </button>
                  )}
                </div>
                
                {isConfirmed && order.status === "Pending Payment" && (
                  <div className="space-y-6">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Order Summary</h3>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-400">Order Number</span>
                        <span>{order.orderNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Amount</span>
                        <span className="font-bold">{toAUD(order.totalPrice)}</span>
                      </div>
                    </div>
                    
                <StripePaymentButton 
                  orderNo={order.orderNo}
                  items={order.orderDetails}
                  totalAmount={order.totalPrice}
                  token={session?.backendToken || ''}
                  onError={(errorMsg) => setError(errorMsg)}
                      onSuccess={() => {
                        setPaymentSuccessful(true);
                        // Store payment success in localStorage
                        localStorage.setItem(`payment_success_${order.orderNo}`, 'true');
                      }}
                />
              </div>
            )}
          </div>
        </div>
          </div>
        )}
      </div>
    </div>
  );
} 