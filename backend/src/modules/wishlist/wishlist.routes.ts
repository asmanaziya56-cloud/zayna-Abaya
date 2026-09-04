import { Router } from 'express';
import { z } from 'zod';
import { wishlistController } from './wishlist.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { validate } from '../../middleware/validate.js';

const router = Router();

const addWishlistSchema = z.object({
  productId: z.string().min(1)
});

router.use(requireAuth);

router.get('/', wishlistController.getWishlist);
router.post('/items', validate({ body: addWishlistSchema }), wishlistController.addProduct);
router.delete('/items/:productId', wishlistController.removeProduct);

export const wishlistRoutes = router;
