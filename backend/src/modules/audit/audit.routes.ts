import { Router } from 'express';
import { auditController } from './audit.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { roleGuard } from '../../middleware/roleGuard.js';

const router = Router();

router.use(requireAuth, roleGuard(['admin', 'superadmin']));
router.get('/', auditController.getAuditLogs);

export const auditRoutes = router;
