import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { paymentController } from './payment.controller.js';
import { optionalAuth } from '../../middleware/optionalAuth.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import {
  createRazorpayOrderSchema,
  verifyPaymentSchema,
  refundPaymentSchema
} from './payment.schema.js';

const router = Router();

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many payment requests. Please wait a moment and try again.'
    }
  }
});

// Create Razorpay order (guests or logged-in users)
router.post(
  '/razorpay/order',
  paymentLimiter,
  optionalAuth,
  validate({ body: createRazorpayOrderSchema }),
  paymentController.createRazorpayOrder
);

// Client signature verification
router.post(
  '/razorpay/verify',
  paymentLimiter,
  validate({ body: verifyPaymentSchema }),
  paymentController.verifyPayment
);

// Razorpay Webhook (idempotent signature verified)
router.post('/razorpay/webhook', paymentController.handleWebhook);

// Admin refunds
router.post(
  '/:id/refund',
  requireAuth,
  roleGuard(['admin', 'superadmin']),
  validate({ body: refundPaymentSchema }),
  paymentController.refundPayment
);

export const paymentRoutes = router;
