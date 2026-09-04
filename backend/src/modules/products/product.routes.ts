import { Router } from 'express';
import { productController } from './product.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema
} from './product.schema.js';

const router = Router();

// Public routes
router.get('/', validate({ query: productQuerySchema }), productController.getProducts);
router.get('/:slug', productController.getProductBySlug);

// Admin routes
router.post('/', requireAuth, roleGuard(['admin', 'superadmin']), validate({ body: createProductSchema }), productController.createProduct);
router.patch('/:id', requireAuth, roleGuard(['admin', 'superadmin']), validate({ body: updateProductSchema }), productController.updateProduct);
router.delete('/:id', requireAuth, roleGuard(['admin', 'superadmin']), productController.deleteProduct);

export const productRoutes = router;
