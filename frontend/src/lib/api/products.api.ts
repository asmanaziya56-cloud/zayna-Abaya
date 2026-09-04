import { apiClient } from './client';
import { IProduct, ICategory, ICollection } from '../../types';

export interface GetProductsParams {
  category?: string;
  collectionId?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  inStock?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'bestseller' | 'featured';
  q?: string;
  page?: number;
  limit?: number;
}

export const productsApi = {
  async getProducts(params?: GetProductsParams): Promise<{ products: IProduct[]; total: number; page: number; totalPages: number }> {
    const res = await apiClient.get('/products', { params });
    // The endpoint returns { success: true, data: Product[] } or { success: true, data: { products, total, page, totalPages } }
    const data = res.data?.data;
    if (Array.isArray(data)) {
      return { products: data, total: data.length, page: 1, totalPages: 1 };
    }
    return {
      products: data?.products || [],
      total: data?.total || 0,
      page: data?.page || 1,
      totalPages: data?.totalPages || 1
    };
  },

  async getProductBySlug(slug: string): Promise<IProduct> {
    const res = await apiClient.get(`/products/${slug}`);
    const data = res.data?.data;
    return (data?.product || data) as IProduct;
  },

  async getCategories(): Promise<ICategory[]> {
    const res = await apiClient.get('/categories');
    return res.data?.data || [];
  },

  async updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory> {
    const res = await apiClient.patch(`/categories/${id}`, data);
    return res.data?.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  },

  async getCollections(): Promise<ICollection[]> {
    const res = await apiClient.get('/collections');
    return res.data?.data || [];
  },

  async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    const res = await apiClient.post('/products', productData);
    return res.data?.data;
  },

  async updateProduct(id: string, productData: Partial<IProduct>): Promise<IProduct> {
    const res = await apiClient.patch(`/products/${id}`, productData);
    return res.data?.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  async uploadImages(base64Images: string[]): Promise<string[]> {
    const res = await apiClient.post('/upload', { images: base64Images });
    return res.data?.data?.urls || [];
  }
};
