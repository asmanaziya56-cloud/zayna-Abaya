import { Router } from 'express';
import { orderController } from './order.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { optionalAuth } from '../../middleware/optionalAuth.js';
import { roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import {
  createOrderSchema,
  cancelOrderSchema,
  updateFulfillmentSchema
} from './order.schema.js';

const router = Router();

// Order creation supports both guest and authenticated checkout
router.post('/', optionalAuth, validate({ body: createOrderSchema }), orderController.createOrder);

// Public tracking lookup
router.get('/track/:orderNumber', orderController.trackOrder);

// Authenticated customer routes
router.get('/me', requireAuth, orderController.getMyOrders);
router.get('/:id', requireAuth, orderController.getOrderById);
router.patch('/:id/cancel', requireAuth, validate({ body: cancelOrderSchema }), orderController.cancelOrder);

// Admin orders management
router.get('/', requireAuth, roleGuard(['admin', 'superadmin']), orderController.listAdminOrders);
router.patch(
  '/:id/fulfillment',
  requireAuth,
  roleGuard(['admin', 'superadmin']),
  validate({ body: updateFulfillmentSchema }),
  orderController.updateFulfillment
);

export const orderRoutes = router;
