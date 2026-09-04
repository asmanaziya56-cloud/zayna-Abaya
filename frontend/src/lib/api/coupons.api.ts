import { apiClient } from './client';

export interface ICouponData {
  _id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom?: string | Date;
  validUntil?: string | Date;
  maxUses?: number;
  usedCount?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const couponsApi = {
  async getCoupons(): Promise<ICouponData[]> {
    const res = await apiClient.get('/coupons');
    return res.data?.data || [];
  },

  async createCoupon(data: Partial<ICouponData>): Promise<ICouponData> {
    const res = await apiClient.post('/coupons', data);
    return res.data?.data;
  },

  async updateCoupon(id: string, data: Partial<ICouponData>): Promise<ICouponData> {
    const res = await apiClient.patch(`/coupons/${id}`, data);
    return res.data?.data;
  },

  async deleteCoupon(id: string): Promise<void> {
    await apiClient.delete(`/coupons/${id}`);
  }
};
