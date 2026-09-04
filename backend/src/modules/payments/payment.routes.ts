import { Router } from 'express';
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

// Create Razorpay order (guests or logged-in users)
router.post(
  '/razorpay/order',
  optionalAuth,
  validate({ body: createRazorpayOrderSchema }),
  paymentController.createRazorpayOrder
);

// Client signature verification
router.post(
  '/razorpay/verify',
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
