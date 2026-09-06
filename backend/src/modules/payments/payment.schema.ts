import { z } from 'zod';

export const createRazorpayOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required').max(64)
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1).max(64),
  razorpayOrderId: z.string().min(1).max(256),
  razorpayPaymentId: z.string().min(1).max(256),
  razorpaySignature: z.string().min(1).max(256)
});

export const refundPaymentSchema = z.object({
  amount: z.number().int().positive().optional(),
  reason: z.string().min(3).max(200)
});
