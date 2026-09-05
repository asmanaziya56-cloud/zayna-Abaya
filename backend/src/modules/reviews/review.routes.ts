import { Router } from 'express';
import { reviewController } from './review.controller.js';
import { optionalAuth } from '../../middleware/optionalAuth.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import { createReviewSchema, updateReviewStatusSchema } from './review.schema.js';

const router = Router();

// Public: view approved reviews for a product
router.get('/product/:productId', reviewController.getProductReviews);

// Submit a review (authenticated or guest)
router.post('/', optionalAuth, validate({ body: createReviewSchema }), reviewController.createReview);

// Admin: view all reviews, update moderation status, delete
router.get('/admin/all', requireAuth, roleGuard(['admin', 'superadmin']), reviewController.getAllReviews);
router.patch(
  '/:id/status',
  requireAuth,
  roleGuard(['admin', 'superadmin']),
  validate({ body: updateReviewStatusSchema }),
  reviewController.updateReviewStatus
);
router.delete('/:id', requireAuth, roleGuard(['admin', 'superadmin']), reviewController.deleteReview);

export const reviewRoutes = router;
