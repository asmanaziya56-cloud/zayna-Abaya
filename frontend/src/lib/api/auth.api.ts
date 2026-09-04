import { apiClient } from './client';
import { tokenStore } from '../auth/tokenStore';
import { IUser } from '../../types';

export const authApi = {
  async register(data: { name: string; email: string; password: string }): Promise<{ message: string }> {
    const res = await apiClient.post('/auth/register', data);
    return res.data?.data;
  },

  async login(data: { email: string; password: string }): Promise<{ user: IUser; accessToken: string }> {
    const res = await apiClient.post('/auth/login', data);
    const result = res.data?.data;
    if (result?.accessToken) {
      tokenStore.setAccessToken(result.accessToken);
    }
    return result;
  },

  async getMe(): Promise<IUser> {
    const res = await apiClient.get('/users/me');
    return res.data?.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      tokenStore.clearAccessToken();
    }
  },

  async updateProfile(data: Partial<IUser>): Promise<IUser> {
    const res = await apiClient.patch('/users/me', data);
    return res.data?.data;
  },

  async addAddress(address: any): Promise<IUser> {
    const res = await apiClient.post('/users/me/addresses', address);
    return res.data?.data;
  },

  async deleteAddress(addressId: string): Promise<IUser> {
    const res = await apiClient.delete(`/users/me/addresses/${addressId}`);
    return res.data?.data;
  },

  async forgotPassword(email: string): Promise<{ message: string; resetLink?: string }> {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data?.data;
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const res = await apiClient.post('/auth/reset-password', { token, password });
    return res.data?.data;
  }
};
