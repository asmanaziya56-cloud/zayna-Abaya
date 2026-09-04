import { apiClient } from './client';
import { IAnnouncement, IHeroBanner, IInstagramPost, IFAQ } from '../../types';

export interface HomepageContent {
  announcement?: IAnnouncement;
  banners: IHeroBanner[];
  instagram: IInstagramPost[];
  faqs: IFAQ[];
}

export const contentApi = {
  async getHomepageContent(): Promise<HomepageContent> {
    const res = await apiClient.get('/content/homepage');
    return res.data?.data || { banners: [], instagram: [], faqs: [] };
  },

  async updateAnnouncement(message: string, link?: string, active = true): Promise<IAnnouncement> {
    const res = await apiClient.put('/content/announcement', { message, link, active });
    return res.data?.data;
  },

  async getFAQs(): Promise<IFAQ[]> {
    const res = await apiClient.get('/content/faqs');
    return res.data?.data || [];
  }
};
