import { z } from 'zod';

export const createReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(150).optional().or(z.literal('')),
  comment: z.string().min(2, 'Please enter your feedback').max(2000),
  images: z.array(z.string()).optional(),
  userName: z.string().optional(),
  userEmail: z.string().optional()
});

export const updateReviewStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected'])
});
