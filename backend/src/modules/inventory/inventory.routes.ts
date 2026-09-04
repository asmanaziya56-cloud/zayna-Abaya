import { Router } from 'express';
import { inventoryController } from './inventory.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import { stockAdjustmentSchema } from './inventory.schema.js';

const router = Router();

router.use(requireAuth, roleGuard(['admin', 'superadmin']));

router.get('/low-stock', inventoryController.getLowStock);
router.post('/adjustments', validate({ body: stockAdjustmentSchema }), inventoryController.adjustStock);

export const inventoryRoutes = router;
