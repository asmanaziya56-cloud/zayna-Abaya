import { Router } from 'express';
import { categoryController } from './category.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from './category.schema.js';

const router = Router();

// Public routes
router.get('/', categoryController.getActive);
router.get('/:slug', categoryController.getBySlug);

// Admin routes
router.get('/admin/all', requireAuth, roleGuard(['admin', 'superadmin']), categoryController.getAll);
router.post('/', requireAuth, roleGuard(['admin', 'superadmin']), validate({ body: createCategorySchema }), categoryController.create);
router.patch('/:id', requireAuth, roleGuard(['admin', 'superadmin']), validate({ body: updateCategorySchema }), categoryController.update);
router.delete('/:id', requireAuth, roleGuard(['admin', 'superadmin']), categoryController.delete);

export const categoryRoutes = router;
