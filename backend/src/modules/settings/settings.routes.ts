import { Router } from 'express';
import { siteSettingsController } from './settings.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import { updateSettingsSchema } from './settings.schema.js';

const router = Router();

// Public store branding and checkout configuration
router.get('/public', siteSettingsController.getPublicSettings);

// Admin routes
router.get('/', requireAuth, roleGuard(['admin', 'superadmin']), siteSettingsController.getAllSettings);
router.patch(
  '/',
  requireAuth,
  roleGuard(['admin', 'superadmin']),
  validate({ body: updateSettingsSchema }),
  siteSettingsController.updateSettings
);
router.post(
  '/test-email',
  requireAuth,
  roleGuard(['admin', 'superadmin']),
  siteSettingsController.sendTestEmail
);

export const settingsRoutes = router;
