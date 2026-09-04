import { apiClient } from './client';
import { ICart } from '../../types';

export const cartApi = {
  async getCart(): Promise<ICart> {
    const res = await apiClient.get('/cart');
    return res.data?.data;
  },

  async addItem(params: { productId: string; variantId?: string; quantity: number }): Promise<ICart> {
    const res = await apiClient.post('/cart/items', params);
    return res.data?.data;
  },

  async updateQuantity(itemId: string, quantity: number): Promise<ICart> {
    const res = await apiClient.patch(`/cart/items/${itemId}`, { quantity });
    return res.data?.data;
  },

  async removeItem(itemId: string): Promise<ICart> {
    const res = await apiClient.delete(`/cart/items/${itemId}`);
    return res.data?.data;
  },

  async applyCoupon(code: string): Promise<ICart> {
    const res = await apiClient.post('/cart/coupon', { code });
    return res.data?.data;
  },

  async removeCoupon(): Promise<ICart> {
    const res = await apiClient.delete('/cart/coupon');
    return res.data?.data;
  },

  async clearCart(): Promise<void> {
    await apiClient.delete('/cart');
  }
};
