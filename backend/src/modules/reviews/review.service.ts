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

  async createReview(userId: string | undefined, data: { productId: string; rating: number; title?: string; comment: string; images?: string[]; userName?: string; userEmail?: string }) {
    const product = await Product.findOne({ _id: new Types.ObjectId(data.productId), isDeleted: { $ne: true } });
    if (!product) {
      throw new AppError({ message: 'Product not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    let resolvedUserName = data.userName || 'Verified Client';
    let resolvedUserEmail = data.userEmail || '';
    let userObjectId: Types.ObjectId | undefined = undefined;

    if (userId) {
      const u = await User.findById(userId);
      if (u) {
        userObjectId = u._id;
        resolvedUserName = u.name;
        resolvedUserEmail = u.email;
      }
    }

    const review = await Review.create({
      user: userObjectId,
      userName: resolvedUserName,
      userEmail: resolvedUserEmail,
      product: product._id,
      rating: data.rating,
      title: data.title || '',
      comment: data.comment,
      images: data.images || [],
      status: 'approved'
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
