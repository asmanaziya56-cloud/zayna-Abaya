import { Router } from 'express';
import { userController } from './user.controller.js';
import { requireAuth } from '../../middleware/requireAuth.js';
import { roleGuard } from '../../middleware/roleGuard.js';
import { validate } from '../../middleware/validate.js';
import {
  updateProfileSchema,
  addressSchema,
  deleteAccountSchema,
  createStaffSchema,
  updateRoleSchema,
  toggleStatusSchema,
  changeEmailSchema,
  changePasswordSchema
} from './user.schema.js';

const router = Router();

// Current customer endpoints
router.get('/me', requireAuth, userController.getProfile);
router.patch('/me', requireAuth, validate({ body: updateProfileSchema }), userController.updateProfile);
router.patch('/me/email', requireAuth, validate({ body: changeEmailSchema }), userController.changeEmail);
router.patch('/me/password', requireAuth, validate({ body: changePasswordSchema }), userController.changePassword);
router.post('/me/addresses', requireAuth, validate({ body: addressSchema }), userController.addAddress);
router.patch('/me/addresses/:addressId', requireAuth, validate({ body: addressSchema.partial() }), userController.updateAddress);
router.delete('/me/addresses/:addressId', requireAuth, userController.deleteAddress);
router.delete('/me', requireAuth, validate({ body: deleteAccountSchema }), userController.deleteAccount);
router.get('/me/export', requireAuth, userController.exportData);


// Admin staff & user directory management
router.get('/', requireAuth, roleGuard(['admin', 'superadmin']), userController.listCustomers);
router.post('/staff', requireAuth, roleGuard(['admin', 'superadmin']), validate({ body: createStaffSchema }), userController.createStaff);
router.patch('/:userId/role', requireAuth, roleGuard(['admin', 'superadmin']), validate({ body: updateRoleSchema }), userController.updateUserRole);
router.patch('/:userId/status', requireAuth, roleGuard(['admin', 'superadmin']), validate({ body: toggleStatusSchema }), userController.toggleUserStatus);
router.delete('/:userId', requireAuth, roleGuard(['admin', 'superadmin']), userController.deleteUser);
router.post('/:userId/send-reset-password', requireAuth, roleGuard(['admin', 'superadmin']), userController.sendResetPassword);

export const userRoutes = router;
