import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(5).max(1000)
});

export const updateReviewStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'])
});
