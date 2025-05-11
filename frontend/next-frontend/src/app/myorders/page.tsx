"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import serverAxios from '@/lib/axios-server';
import { ShoppingBag, Clock, CreditCard, CheckCircle, AlertCircle, TruckIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Order item interface
interface OrderItem {
  id: number;
  goodsId: number;
  num: number;
  goodsPrice: number;
  goodsName: string;
  goodsImg: string;
  subtotal: number;
  type: string;
}

// Order interface
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

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (status === 'loading') return;
      
      if (!session) {
        router.push('/');
        return;
      }
      
      setLoading(true);
      setError('');
      
      try {
        const response = await serverAxios.get('/coolStuffUser/selectAllOrderByUser', {
          headers: {
            'headlesscmstoken': session.backendToken || ''
          }
        });
        
        // In production, we should sanitize logs to remove sensitive data
        // console.log only for development, remove or sanitize for production
        if (process.env.NODE_ENV === 'development') {
          console.log('Order response received');
          // For debug purposes only
          // console.log(response);
        }
        
        // Check the response structure and extract data correctly
        if (response.data && Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          // Handle unexpected response format
          setOrders([]);
          setError('Unable to load orders. Please try again later.');
        }
      } catch (err: any) {
        console.error('Error fetching orders:', err instanceof Error ? err.message : 'Unknown error');
        setError(err.response?.data?.message || 'Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [session, status, router]);
  
  // Get status badge styling based on order status
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending payment':
      case 'not_pay':
        return {
          color: 'bg-yellow-500',
          icon: <Clock className="w-4 h-4 mr-1" />,
          text: 'Pending Payment'
        };
      case 'pending shipment':
      case 'not_send':
        return {
          color: 'bg-blue-500',
          icon: <CreditCard className="w-4 h-4 mr-1" />,
          text: 'Pending Shipment'
        };
      
      case 'dispatched':
        return {
          color: 'bg-green-500',
          icon: <TruckIcon className="w-4 h-4 mr-1" />,
          text: 'Dispatched'
        };
      case 'completed':
      case 'done':
        return {
          color: 'bg-green-500',
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
          text: 'Completed'
        };
      case 'cancelled':
      case 'cancel':
        return {
          color: 'bg-red-500',
          icon: <AlertCircle className="w-4 h-4 mr-1" />,
          text: 'Cancelled'
        };
      case 'refunded':
      case 'refund_done':
        return {
          color: 'bg-purple-500',
          icon: <CreditCard className="w-4 h-4 mr-1" />,
          text: 'Refunded'
        };
      case 'reviewed':
      case 'comment_done':
        return {
          color: 'bg-blue-400',
          icon: <CheckCircle className="w-4 h-4 mr-1" />,
          text: 'Reviewed'
        };
      default:
        return {
          color: 'bg-gray-500',
          icon: <ShoppingBag className="w-4 h-4 mr-1" />,
          text: status
        };
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Get first item image or placeholder
  const getOrderImage = (order: Order) => {
    if (order.orderDetails && Array.isArray(order.orderDetails) && order.orderDetails.length > 0 && order.orderDetails[0].goodsImg) {
      return order.orderDetails[0].goodsImg;
    }
    return '/images/placeholder-product.jpg'; // Fallback image path
  };
  
  // Calculate total items count
  const getTotalItems = (order: Order) => {
    if (!order.orderDetails || !Array.isArray(order.orderDetails)) return 0;
    return order.orderDetails.reduce((sum, item) => sum + item.num, 0);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          <div className="bg-gray-900 rounded-lg p-8 flex justify-center items-center">
            <div className="w-6 h-6 border-t-2 border-b-2 border-white rounded-full animate-spin mr-3"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          <div className="bg-gray-900 rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-xl mb-4">Something went wrong</p>
            <p className="text-gray-400 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          <div className="bg-gray-900 rounded-lg p-8 flex flex-col items-center">
            <ShoppingBag className="w-16 h-16 text-gray-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-gray-400 mb-6">Looks like you haven't placed any orders yet.</p>
            <Link 
              href="/"
              className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Orders list
  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        
        <div className="space-y-6">
          {orders.map(order => {
            const badge = getStatusBadge(order.status);
            return (
              <div key={order.id} className="bg-gray-900 rounded-lg overflow-hidden">
                {/* Order header */}
                <div className="border-b border-gray-800 p-4 flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">
                      Order #{order.orderNo}
                    </div>
                    <div className="text-sm text-gray-400">
                      Placed on {formatDate(order.createTime)}
                    </div>
                  </div>
                  <div className={`${badge.color} text-white text-sm px-3 py-1 rounded-full flex items-center`}>
                    {badge.icon}
                    {badge.text}
                  </div>
                </div>
                
                {/* Order summary */}
                <div className="p-4 flex flex-col md:flex-row justify-between">
                  <div className="flex flex-wrap mb-4 md:mb-0">
                    {/* Multiple item images display */}
                    {order.orderDetails && Array.isArray(order.orderDetails) && order.orderDetails.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {order.orderDetails.slice(0, 3).map((item, index) => (
                          <div key={index} className="w-20 h-20 relative rounded-md overflow-hidden flex-shrink-0 bg-gray-800">
                            <Image
                              src={item.goodsImg || '/images/placeholder-product.jpg'}
                              alt={item.goodsName || `Order item ${index + 1}`}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                        ))}
                        {order.orderDetails.length > 3 && (
                          <div className="w-20 h-20 flex items-center justify-center bg-gray-800 rounded-md">
                            <span className="text-sm font-medium text-gray-400">+{order.orderDetails.length - 3}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-md overflow-hidden relative flex-shrink-0 bg-gray-800">
                        <Image
                          src="/images/placeholder-product.jpg"
                          alt="Order preview"
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    )}
                    <div className="ml-4 mt-2">
                      <div className="text-sm text-gray-400">
                        {getTotalItems(order)} {getTotalItems(order) === 1 ? 'item' : 'items'}
                      </div>
                      <div className="font-semibold mt-1">
                        ${order.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="self-end md:self-center">
                    <Link
                      href={`/order/${order.orderNo}`}
                      className="inline-flex items-center text-pink-500 hover:text-pink-400 transition-colors"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 