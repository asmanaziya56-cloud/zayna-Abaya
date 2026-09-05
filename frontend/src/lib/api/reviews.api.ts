import { apiClient } from './client';

export interface IReviewData {
  _id?: string;
  userName: string;
  userEmail?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  createdAt?: string;
}

export const reviewsApi = {
  async getProductReviews(productId: string): Promise<IReviewData[]> {
    const res = await apiClient.get(`/reviews/product/${productId}`);
    return res.data?.data || [];
  },

  async createReview(payload: {
    productId: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
    userName?: string;
    userEmail?: string;
  }): Promise<IReviewData> {
    const res = await apiClient.post('/reviews', payload);
    return res.data?.data;
  }
};
