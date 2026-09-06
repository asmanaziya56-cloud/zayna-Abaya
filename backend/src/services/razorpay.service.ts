import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';
import { safeCompare } from '../utils/tokenCompare.js';
import { logger } from '../utils/logger.js';

class RazorpayService {
  private instance: Razorpay | null = null;

  constructor() {
    if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && !env.RAZORPAY_KEY_ID.includes('placeholder')) {
      this.instance = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET
      });
      logger.info('Razorpay SDK initialized');
    } else {
      logger.warn('Razorpay credentials not configured or set to placeholder; running in mock sandbox mode');
    }
  }

  async createOrder(params: {
    amount: number; // in smallest currency unit (e.g. paise / cents)
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<{ id: string; amount: number; currency: string }> {
    if (this.instance) {
      const order = await this.instance.orders.create({
        amount: Math.round(params.amount),
        currency: params.currency || 'INR',
        receipt: params.receipt,
        notes: params.notes || {}
      });
      return {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency
      };
    }

    // Mock fallback for development / local testing
    const mockId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id: mockId,
      amount: Math.round(params.amount),
      currency: params.currency || 'INR'
    };
  }

  verifyPaymentSignature(params: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): boolean {
    if (env.NODE_ENV === 'production' && (!this.instance || !env.RAZORPAY_KEY_SECRET)) {
      logger.error('Payment signature verification attempted in production without configured Razorpay credentials');
      return false;
    }

    // In local development or test mode only, allow mock testing signatures
    if (env.NODE_ENV !== 'production' && !this.instance && params.signature.startsWith('mock_sig_')) {
      return true;
    }

    const secret = env.RAZORPAY_KEY_SECRET || 'dev_secret';
    const payload = `${params.orderId}|${params.paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return safeCompare(params.signature, expectedSignature);
  }

  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    if (env.NODE_ENV === 'production' && (!this.instance || !env.RAZORPAY_WEBHOOK_SECRET)) {
      logger.error('Webhook signature verification attempted in production without configured webhook secret');
      return false;
    }

    // In local development or test mode only, allow mock testing signatures
    if (env.NODE_ENV !== 'production' && !this.instance && signature.startsWith('mock_wh_sig_')) {
      return true;
    }

    const secret = env.RAZORPAY_WEBHOOK_SECRET || 'dev_webhook_secret';
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return safeCompare(signature, expectedSignature);
  }

  async refundPayment(params: {
    paymentId: string;
    amount?: number;
    notes?: Record<string, string>;
  }): Promise<any> {
    if (this.instance) {
      return this.instance.payments.refund(params.paymentId, {
        amount: params.amount,
        notes: params.notes
      });
    }

    return {
      id: `rfnd_mock_${Date.now()}`,
      payment_id: params.paymentId,
      amount: params.amount,
      status: 'processed'
    };
  }
}

export const razorpayService = new RazorpayService();
