import { apiClient } from './client';
import { IUser } from '../../types';

export interface UserStats {
  totalStaff: number;
  totalAdmins: number;
  totalCustomers: number;
  suspendedCount: number;
}

export interface ListUsersResponse {
  users: IUser[];
  customers: IUser[];
  stats: UserStats;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const usersApi = {
  async listUsers(params?: { page?: number; limit?: number; search?: string; role?: string }): Promise<ListUsersResponse> {
    const res = await apiClient.get('/users', { params });
    return res.data;
  },

  async createStaff(data: {
    name: string;
    email: string;
    role: 'admin' | 'staff';
    password: string;
    sendResetEmail?: boolean;
  }): Promise<{ user: IUser; resetLink?: string; message: string }> {
    const res = await apiClient.post('/users/staff', data);
    return res.data;
  },

  async updateUserRole(userId: string, role: string): Promise<{ data: IUser; message: string }> {
    const res = await apiClient.patch(`/users/${userId}/role`, { role });
    return res.data;
  },

  async toggleUserStatus(userId: string, isActive: boolean): Promise<{ data: IUser; message: string }> {
    const res = await apiClient.patch(`/users/${userId}/status`, { isActive });
    return res.data;
  },

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete(`/users/${userId}`);
    return res.data;
  },

  async sendResetPassword(userId: string): Promise<{ success: boolean; message: string; resetLink?: string }> {
    const res = await apiClient.post(`/users/${userId}/send-reset-password`);
    return res.data;
  },

  async sendTestEmail(email: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post('/settings/test-email', { email });
    return res.data;
  }
};
