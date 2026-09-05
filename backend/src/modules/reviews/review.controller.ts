import { Request, Response, NextFunction } from 'express';
import { reviewService } from './review.service.js';

export class ReviewController {
  async getProductReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviews = await reviewService.getProductReviews(req.params.productId as string);
      res.json({ success: true, data: reviews });
    } catch (err) {
      next(err);
    }
  }

  async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await reviewService.createReview(req.user?._id, req.body);
      res.status(201).json({ success: true, data: review });
    } catch (err) {
      next(err);
    }
  }

  async getAllReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviews = await reviewService.getAllReviews(req.query);
      res.json({ success: true, data: reviews });
    } catch (err) {
      next(err);
    }
  }

  async updateReviewStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await reviewService.updateReviewStatus(req.params.id as string, req.body.status);
      res.json({ success: true, data: review });
    } catch (err) {
      next(err);
    }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await reviewService.deleteReview(req.params.id as string);
      res.json({ success: true, data: { message: 'Review deleted' } });
    } catch (err) {
      next(err);
    }
  }
}

export const reviewController = new ReviewController();
