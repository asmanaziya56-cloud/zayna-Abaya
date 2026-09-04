import { Types } from 'mongoose';
import { Review } from './review.model.js';
import { Product } from '../products/product.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class ReviewService {
  async getProductReviews(productId: string) {
    return Review.find({
      product: new Types.ObjectId(productId),
      status: 'approved'
    }).sort({ createdAt: -1 });
  }

  async createReview(userId: string, data: { productId: string; rating: number; title?: string; comment: string }) {
    const [product, user] = await Promise.all([
      Product.findOne({ _id: new Types.ObjectId(data.productId), isDeleted: { $ne: true } }),
      User.findById(userId)
    ]);

    if (!product) {
      throw new AppError({ message: 'Product not found', statusCode: 404, code: 'NOT_FOUND' });
    }
    if (!user) {
      throw new AppError({ message: 'User not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    const review = await Review.create({
      user: user._id,
      userName: user.name,
      product: product._id,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      status: 'pending' // Defaults to pending moderation
    });

    return review;
  }

  async getAllReviews(query: { status?: string }) {
    const filter: Record<string, any> = {};
    if (query.status) {
      filter.status = query.status;
    }
    return Review.find(filter).populate('product', 'name slug').sort({ createdAt: -1 });
  }

  async updateReviewStatus(reviewId: string, status: 'pending' | 'approved' | 'rejected') {
    const review = await Review.findByIdAndUpdate(reviewId, { $set: { status } }, { new: true });
    if (!review) {
      throw new AppError({ message: 'Review not found', statusCode: 404, code: 'NOT_FOUND' });
    }
    return review;
  }

  async deleteReview(reviewId: string) {
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      throw new AppError({ message: 'Review not found', statusCode: 404, code: 'NOT_FOUND' });
    }
    return { success: true };
  }
}

export const reviewService = new ReviewService();
