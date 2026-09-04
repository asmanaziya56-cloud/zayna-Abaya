import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional()
});

export const changeEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
  currentPassword: z.string().min(1, 'Current password is required')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
});

export const addressSchema = z.object({
  label: z.string().max(30).optional(),
  fullName: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
  street: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  postalCode: z.string().min(4).max(20),
  country: z.string().min(2).max(100).default('India'),
  isDefault: z.boolean().optional()
});

export const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE MY ACCOUNT')
});

export const createStaffSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  role: z.enum(['admin', 'staff']),
  password: z.string().min(8).max(100),
  sendResetEmail: z.boolean().optional().default(false)
});

export const updateRoleSchema = z.object({
  role: z.enum(['superadmin', 'admin', 'staff', 'customer'])
});

export const toggleStatusSchema = z.object({
  isActive: z.boolean()
});
