import { Router } from 'express';
import { collectionController } from './collection.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import { createCollectionSchema, updateCollectionSchema } from './collection.schema.js';

const router = Router();

// Public routes
router.get('/', collectionController.getActive);
router.get('/:slug', collectionController.getBySlug);

// Admin routes
router.get('/admin/all', requireAuth, roleGuard(['admin', 'superadmin']), collectionController.getAll);
router.post('/', requireAuth, roleGuard(['admin', 'superadmin']), validate({ body: createCollectionSchema }), collectionController.create);
router.patch('/:id', requireAuth, roleGuard(['admin', 'superadmin']), validate({ body: updateCollectionSchema }), collectionController.update);
router.delete('/:id', requireAuth, roleGuard(['admin', 'superadmin']), collectionController.delete);

export const collectionRoutes = router;
