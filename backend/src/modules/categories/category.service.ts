import { Category } from './category.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class CategoryService {
  async getActiveCategories() {
    return Category.find({ active: true }).sort({ sortOrder: 1, name: 1 }).lean();
  }

  async getAllCategories() {
    return Category.find().sort({ sortOrder: 1, name: 1 }).lean();
  }

  async getCategoryBySlug(slug: string) {
    const category = await Category.findOne({ slug }).lean();
    if (!category) {
      throw new AppError({ message: 'Category not found', statusCode: 404, code: 'NOT_FOUND' });
    }
    return category;
  }

  async createCategory(data: any) {
    const existing = await Category.findOne({ slug: data.slug });
    if (existing) {
      throw new AppError({ message: 'Category with this slug already exists', statusCode: 409, code: 'CONFLICT' });
    }
    return Category.create(data);
  }

  async updateCategory(id: string, data: any) {
    if (data.slug) {
      const existing = await Category.findOne({ slug: data.slug, _id: { $ne: id } });
      if (existing) {
        throw new AppError({ message: 'Category with this slug already exists', statusCode: 409, code: 'CONFLICT' });
      }
    }
    const category = await Category.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!category) {
      throw new AppError({ message: 'Category not found', statusCode: 404, code: 'NOT_FOUND' });
    }
    return category;
  }

  async deleteCategory(id: string) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new AppError({ message: 'Category not found', statusCode: 404, code: 'NOT_FOUND' });
    }
    return { success: true };
  }
}

export const categoryService = new CategoryService();
