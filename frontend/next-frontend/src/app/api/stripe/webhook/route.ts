import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import serverAxios from '@/lib/axios-server';
import axios from 'axios';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

// Get webhook secret for validating requests from Stripe
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// 后端API地址
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    let event;
    
    // Verify event
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error(`⚠️ Webhook signature verification failed:`, err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // 直接将整个webhook事件转发到后端API
    try {
      await axios.post(`${API_URL}/api/stripe/webhook`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': signature
        }
      });
      console.log(`✅ Webhook event ${event.type} forwarded to backend API`);
    } catch (error: any) {
      console.error('Failed to forward webhook to backend:', error);
      // 即使转发失败，我们仍然尝试处理事件
    }

    // 作为备份，我们也在前端处理事件
    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
      let orderNo;
      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        orderNo = session.metadata?.orderNo;
      } else {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        orderNo = paymentIntent.metadata?.orderNo;
      }

      if (orderNo) {
        try {
          // 尝试通过后端API更新订单状态
          await axios.post(`${API_URL}/api/stripe/webhook`, {
            orderNo: orderNo,
            event_type: event.type
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`✅ Order ${orderNo} payment completed, status update requested`);
        } catch (error) {
          console.error('Failed to update order status:', error);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
} 