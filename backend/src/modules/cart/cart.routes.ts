import { Router } from 'express';
import { cartController } from './cart.controller.js';
import { optionalAuth } from '../../middleware/optionalAuth.js';
import { validate } from '../../middleware/validate.js';
import { addToCartSchema, updateCartItemSchema } from './cart.schema.js';

const router = Router();

// Cart supports both authenticated users and guests via optionalAuth
router.use(optionalAuth);

router.get('/', cartController.getCart);
router.post('/items', validate({ body: addToCartSchema }), cartController.addItem);
router.patch('/items/:itemId', validate({ body: updateCartItemSchema }), cartController.updateItemQuantity);
router.delete('/items/:itemId', cartController.removeItem);
router.post('/coupon', cartController.applyCoupon);
router.delete('/coupon', cartController.removeCoupon);
router.delete('/', cartController.clearCart);

export const cartRoutes = router;
