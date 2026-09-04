import { z } from 'zod';

export const createRazorpayOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required')
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1)
});

export const refundPaymentSchema = z.object({
  amount: z.number().int().positive().optional(),
  reason: z.string().min(3).max(200)
});
