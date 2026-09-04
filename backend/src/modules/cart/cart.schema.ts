import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
  sessionId: z.string().optional()
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0),
  sessionId: z.string().optional()
});
