import React, { useState, useEffect, useRef } from 'react';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { toAUD } from '@/lib/currency';

interface StripePaymentButtonProps {
  orderNo: string;
  items: any[];
  totalAmount: number;
  token: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Stripe public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Payment form component
function CheckoutForm({ orderNo, totalAmount, onSuccess, onError }: { 
  orderNo: string; 
  totalAmount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/${orderNo}?success=true`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentError(error.message || 'An unexpected error occurred');
        onError && onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess && onSuccess();
        // Refresh the page to update order status
        window.location.reload();
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      onError && onError(error.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {paymentError && (
        <div className="text-red-500 mt-2">{paymentError}</div>
      )}
      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors disabled:opacity-70"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
            Processing...
          </div>
        ) : (
          `Pay Now (${toAUD(totalAmount)})`
        )}
      </button>
    </form>
  );
}

export default function StripePaymentButton({
  orderNo,
  items,
  totalAmount,
  token,
  onSuccess,
  onError
}: StripePaymentButtonProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'elements' | 'redirect'>('elements');
  
  // 使用useRef来存储订单号和令牌，避免这些值的变化触发重新渲染
  const orderNoRef = useRef(orderNo);
  const tokenRef = useRef(token);

  useEffect(() => {
    // 只在首次加载或值真正改变时更新ref
    orderNoRef.current = orderNo;
    tokenRef.current = token;
  }, [orderNo, token]);

  useEffect(() => {
    // 仅在组件挂载时创建一次PaymentIntent
    const createPaymentIntent = async () => {
      setLoading(true);
      try {
        // 使用本地API路由，避免直接调用外部服务
        const response = await axios.post('/api/stripe/payment-intent', {
          orderNo: orderNoRef.current,
          token: tokenRef.current
        });
        
        console.log('Payment Intent API response:', response.data);
        
        // 检查并解析响应
        if (response.data && response.data.code === "200") {
          // 后端返回的结构是 { code: "200", msg: "请求成功", data: { clientSecret: "xxx" } }
          if (response.data.data && response.data.data.clientSecret) {
            setClientSecret(response.data.data.clientSecret);
          } else {
            console.error('响应缺少clientSecret:', response.data);
            throw new Error('支付初始化失败: 找不到有效的支付密钥');
          }
        } else {
          throw new Error(response.data.msg || '初始化支付失败');
        }
      } catch (error: any) {
        console.error('创建支付意向出错:', error);
        
        // 提取错误信息
        let errorMsg = '支付初始化失败';
        if (error.response && error.response.data) {
          errorMsg = error.response.data.msg || error.response.data.error || errorMsg;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        setError(errorMsg);
        onError && onError(errorMsg);
        
        // 尝试备用支付方式
        tryCheckoutSession();
      } finally {
        setLoading(false);
      }
    };
    
    // 尝试使用结账会话方式
    const tryCheckoutSession = async () => {
      setLoading(true);
      try {
        // 使用本地API路由，避免直接调用外部服务
        const response = await axios.post('/api/stripe/checkout', {
          orderNo: orderNoRef.current,
          token: tokenRef.current
        });
        
        console.log('Checkout Session API response:', response.data);
        
        if (response.data && response.data.code === "200") {
          if (response.data.data && response.data.data.url) {
            setPaymentMethod('redirect');
            // 重定向到Stripe的结账页面
            window.location.href = response.data.data.url;
          } else {
            throw new Error('结账会话创建失败: 缺少重定向URL');
          }
        } else {
          throw new Error(response.data.msg || '结账会话创建失败');
        }
      } catch (error: any) {
        console.error('创建结账会话出错:', error);
        
        // 提取错误信息
        let errorMsg = '支付方式初始化失败';
        if (error.response && error.response.data) {
          errorMsg = error.response.data.msg || error.response.data.error || errorMsg;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        setError(errorMsg);
        onError && onError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-b-2 border-purple-600 rounded-full animate-spin"></div>
        <span className="ml-2">Loading payment options...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}. Please refresh and try again.
      </div>
    );
  }

  if (paymentMethod === 'redirect') {
    return (
      <div className="p-4 text-center">
        Redirecting to Stripe checkout...
      </div>
    );
  }

  const options: any = {
    clientSecret,
    appearance: {
      theme: 'night',
      labels: 'floating'
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Payment</h3>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm 
            orderNo={orderNo} 
            totalAmount={totalAmount}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      )}
    </div>
  );
} 