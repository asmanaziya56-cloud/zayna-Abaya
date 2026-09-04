import { Router } from 'express';
import { couponController } from './coupon.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import {
  validateCouponSchema,
  createCouponSchema,
  updateCouponSchema
} from './coupon.schema.js';

const router = Router();

// Public coupon validation (for checkout)
router.post('/validate', validate({ body: validateCouponSchema }), couponController.validate);

// Admin routes
router.get('/', requireAuth, roleGuard(['admin', 'superadmin', 'staff']), couponController.getAll);
router.post('/', requireAuth, roleGuard(['admin', 'superadmin', 'staff']), validate({ body: createCouponSchema }), couponController.create);
router.patch('/:id', requireAuth, roleGuard(['admin', 'superadmin', 'staff']), validate({ body: updateCouponSchema }), couponController.update);
router.delete('/:id', requireAuth, roleGuard(['admin', 'superadmin', 'staff']), couponController.delete);

export const couponRoutes = router;
