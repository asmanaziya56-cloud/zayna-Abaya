import { z } from 'zod';

export const validateCouponSchema = z.object({
  code: z.string().min(1).toUpperCase().trim(),
  subtotal: z.number().nonnegative()
});

export const createCouponSchema = z.object({
  code: z.string().min(2).max(30).toUpperCase().trim(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().nonnegative().optional(),
  maxDiscountAmount: z.number().nonnegative().optional(),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional().default(() => new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000)),
  maxUses: z.number().int().positive().optional(),
  active: z.boolean().optional()
});

export const updateCouponSchema = createCouponSchema.partial();
