"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ChevronLeft, ShoppingCart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import serverAxios from '@/lib/axios-server';
import AuthModal from '@/components/AuthModal';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const total = getTotal();
  const imageRefs = useRef<{[key: string]: HTMLImageElement | null}>({});
  
  // Adding states
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Creating throttled update function
  const throttledUpdateQuantity = useCallback((id: number, quantity: number) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    updateQuantity(id, quantity);
    
    // Don't allow updates within 300ms
    setTimeout(() => {
      setIsUpdating(false);
    }, 300);
  }, [isUpdating, updateQuantity]);
  
  // Cleanup function
  const cleanupResources = useCallback(() => {
    
    
    // Clean up image references
    Object.keys(imageRefs.current).forEach(key => {
      imageRefs.current[key] = null;
    });
    imageRefs.current = {};
    
    // Try to trigger browser garbage collection
    if (typeof window !== 'undefined' && 'gc' in window) {
      try {
        // @ts-ignore
        window.gc();
      } catch (e) {
        // gc might not be available, ignore errors
      }
    }
  }, []);
  
  // Clean up on component unmount
  useEffect(() => {
    // Handle page visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
       
        cleanupResources();
      }
    };
    
    // Clean up before page unload
    const handleBeforeUnload = () => {
      
      cleanupResources();
    };
    
    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupResources();
    };
  }, [cleanupResources]);
  
  // Increase item quantity
  const handleIncreaseQuantity = (id: number, currentQuantity: number) => {
    throttledUpdateQuantity(id, currentQuantity + 1);
  };
  
  // Decrease item quantity
  const handleDecreaseQuantity = (id: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      throttledUpdateQuantity(id, currentQuantity - 1);
    } else {
      removeItem(id);
    }
  };
  
  // Remove item
  const handleRemoveItem = (id: number) => {
    removeItem(id);
  };
  
  // Clear cart
  const handleClearCart = () => {
    clearCart();
  };
  
  // Checkout and create order
  const handleCheckout = async () => {
    // Check if user is logged in
    if (!session) {
      // Show auth modal instead of redirecting
      setShowAuthModal(true);
      return;
    }
    
    // Check if cart is empty
    if (items.length === 0) {
      setErrorMessage("Cart is empty, cannot checkout");
      return;
    }
    
    setIsCreatingOrder(true);
    setErrorMessage("");
    
    try {
      // Prepare order details data
      const orderDetails = items.map(item => ({
        goodsId: item.id,
        num: item.quantity,
        type: 'normal',
        goodsPrice: item.price
      }));
      
      // Call create order API
      const response = await serverAxios.post('/coolStuffUser/createCoolStuffOrder', 
        {
          orderDetails: orderDetails,
          totalPrice: total,
          status: "Pending Payment"
        },
        {
          headers: {
            'headlesscmstoken': session.backendToken || ''
          }
        }
      );
      
      // Get created order number
      const orderNo = response.data.orderNo;
      
      // Clear cart after successful checkout
      clearCart();
      
      // Redirect to order details page
      router.push(`/order/${orderNo}`);
    } catch (error: any) {
      console.error('Failed to create order:', error);
      setErrorMessage(error.response?.data?.msg || 'Failed to create order, please try again');
    } finally {
      setIsCreatingOrder(false);
    }
  };
  
  // Handle auth modal close
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
  };
  
  // If cart is empty, show empty state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Shopping Cart</h1>
        
        <div className="bg-gray-900 rounded-lg p-8 flex flex-col items-center">
          <ShoppingCart size={64} className="text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-400 mb-6">You have no items in your shopping cart</p>
          <Link href="/" className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-white container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart items list */}
        <div className="md:col-span-2">
          <div className="bg-gray-900 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Cart Items ({items.length})</h2>
              <button 
                onClick={handleClearCart}
                className="text-gray-400 hover:text-red-500 transition-colors flex items-center"
              >
                <Trash2 size={16} className="mr-1" /> Clear Cart
              </button>
            </div>
            
            {items.map(item => (
              <div key={item.id} className="border-b border-gray-800 py-4 last:border-0">
                <div className="flex gap-4">
                  {/* Product image - optimized image loading config */}
                  <div className="w-24 h-24 relative rounded-md overflow-hidden shrink-0">
                    <Image
                      ref={(el) => { 
                        if (el?.parentElement) {
                          imageRefs.current[`img-${item.id}`] = el.parentElement as HTMLImageElement;
                        }
                      }}
                      src={item.img}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="object-cover"
                      loading="lazy"
                      sizes="96px"
                      placeholder="empty"
                      onError={() => {
                        console.log(`Image failed to load: ${item.img}`);
                      }}
                    />
                  </div>
                  
                  {/* Product info */}
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <Link href={`/product/${item.id}`} className="text-lg font-medium hover:text-pink-500 transition-colors">
                        {item.name}
                      </Link>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {/* Price info */}
                    <div className="mt-2">
                      {item.price < item.originalPrice ? (
                        <div className="flex items-center">
                          <span className="text-gray-400 line-through mr-2">${item.originalPrice.toFixed(2)}</span>
                          <span className="text-pink-500 font-bold">${item.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="font-bold">${item.price.toFixed(2)}</span>
                      )}
                    </div>
                    
                    {/* Quantity control */}
                    <div className="mt-4 flex items-center">
                      <button 
                        onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-l-md hover:bg-gray-700 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 h-8 flex items-center justify-center bg-gray-800 border-x border-gray-700">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded-r-md hover:bg-gray-700 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                      
                      <span className="ml-auto font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-6">
              <Link 
                href="/"
                className="text-pink-500 hover:text-pink-400 transition-colors flex items-center"
              >
                <ChevronLeft size={16} className="mr-1" /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        
        {/* Order summary */}
        <div className="md:col-span-1">
          <div className="bg-gray-900 rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-gray-800 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-600 rounded-md text-red-200 text-sm">
                {errorMessage}
              </div>
            )}
            
            <button 
              onClick={handleCheckout}
              disabled={isCreatingOrder}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg mt-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingOrder ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : 'Checkout'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose} 
        initialMode='login'
        callbackUrl='/cart'
      />
    </div>
  );
} 