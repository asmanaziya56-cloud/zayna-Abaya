import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().min(1).max(64),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(150).optional().or(z.literal('')),
  comment: z.string().min(2, 'Please enter your feedback').max(2000),
  images: z.array(z.string().max(1000)).max(10).optional(),
  userName: z.string().max(100).optional(),
  userEmail: z.string().email().max(254).optional()
});

export const updateReviewStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'])
});
