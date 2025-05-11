import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import axios from 'axios';
import { toStripeCurrency } from '@/lib/currency';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

// 后端API地址
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  try {
    const { orderNo, token } = await req.json();

    if (!orderNo) {
      return NextResponse.json(
        { error: 'Missing order number' },
        { status: 400 }
      );
    }

    try {
      // 调用后端API创建支付意向
      const response = await axios.post(`${API_URL}/api/stripe/payment-intent`, {
        orderNo
      }, {
        headers: {
          'Content-Type': 'application/json',
          'headlesscmstoken': token || ''
        }
      });
      
      console.log('API响应:', response.data);
      
      // 检查响应状态
      if (response.data && response.data.code === "200") {
        // 直接返回后端的响应
        return NextResponse.json(response.data);
      } else {
        throw new Error(response.data.msg || 'Failed to create payment intent.');
      }
    } catch (apiError: any) {
      console.error('Backend API error:', apiError);
      throw new Error(apiError.message || 'Failed to communicate with backend API');
    }
  } catch (error: any) {
    console.error('Payment intent creation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 