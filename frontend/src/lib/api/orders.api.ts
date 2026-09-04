import { apiClient } from './client';
import { IOrder, IAddress } from '../../types';

export interface CreateOrderPayload {
  items?: Array<{ productId: string; variantId?: string; quantity: number }>;
  guestEmail?: string;
  guestPhone?: string;
  shippingAddress: IAddress;
  couponCode?: string;
  idempotencyKey?: string;
}

export const ordersApi = {
  async createOrder(payload: CreateOrderPayload): Promise<IOrder> {
    const res = await apiClient.post('/orders', payload);
    return res.data?.data;
  },

  async getMyOrders(): Promise<IOrder[]> {
    const res = await apiClient.get('/orders/me');
    return res.data?.data || [];
  },

  async getOrderById(orderId: string): Promise<IOrder> {
    const res = await apiClient.get(`/orders/${orderId}`);
    return res.data?.data;
  },

  async trackOrder(orderNumber: string, email: string): Promise<IOrder> {
    const res = await apiClient.get(`/orders/track/${orderNumber}`, { params: { email } });
    return res.data?.data;
  },

  // Razorpay payment integration
  async createRazorpayOrder(orderId: string): Promise<{ razorpayOrderId: string; amount: number; currency: string; keyId: string }> {
    const res = await apiClient.post('/payments/razorpay/order', { orderId });
    return res.data?.data;
  },

  async verifyRazorpayPayment(payload: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<{ status: string; order: IOrder }> {
    const res = await apiClient.post('/payments/razorpay/verify', payload);
    return res.data?.data;
  },

  // Admin endpoints
  async getAdminOrders(): Promise<IOrder[]> {
    const res = await apiClient.get('/orders');
    return res.data?.data?.orders || res.data?.data || [];
  },

  async updateFulfillment(orderId: string, payload: { status: string; courier?: string; trackingNumber?: string; trackingUrl?: string }): Promise<IOrder> {
    const res = await apiClient.patch(`/orders/${orderId}/fulfillment`, payload);
    return res.data?.data;
  }
};
