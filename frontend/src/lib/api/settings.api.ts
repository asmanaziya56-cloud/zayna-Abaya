import { apiClient } from './client';
import { ISiteSettings } from '../../types';

export const settingsApi = {
  async getPublicSettings(): Promise<ISiteSettings> {
    const res = await apiClient.get('/settings/public');
    return res.data?.data;
  },

  async updateSettings(data: Partial<ISiteSettings>): Promise<ISiteSettings> {
    const res = await apiClient.patch('/settings', data);
    return res.data?.data;
  },

  async uploadMedia(files: string[]): Promise<string[]> {
    const res = await apiClient.post('/upload', { images: files });
    return res.data?.data?.urls || [];
  }
};
