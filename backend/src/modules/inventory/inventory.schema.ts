import { z } from 'zod';

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  quantityChange: z.number().int().refine((val) => val !== 0, 'Quantity change cannot be zero'),
  reason: z.enum(['restock', 'damage', 'audit_correction', 'return', 'manual_adjustment']),
  notes: z.string().max(250).optional()
});
