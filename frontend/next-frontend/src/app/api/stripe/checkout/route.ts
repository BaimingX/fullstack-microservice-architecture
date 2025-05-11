import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import axios from 'axios';
import { toStripeCurrency } from '@/lib/currency';

// 初始化Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31' as any,
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
      // 调用后端API创建结账会话
      const response = await axios.post(`${API_URL}/api/stripe/checkout-session`, {
        orderNo
      }, {
        headers: {
          'Content-Type': 'application/json',
          'headlesscmstoken': token || ''
        }
      });

      // 检查响应状态
      if (response.data.code === 200) {
        return NextResponse.json(response.data);
      } else {
        throw new Error(response.data.msg || 'Failed to create checkout session');
      }
    } catch (apiError: any) {
      console.error('Backend API error:', apiError);
      throw new Error(apiError.message || 'Failed to communicate with backend API');
    }
  } catch (error: any) {
    console.error('Stripe 会话创建失败:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 