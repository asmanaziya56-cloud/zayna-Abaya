import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').max(254).toLowerCase().trim(),
  password: z.string().min(1, 'Password is required').max(128, 'Password cannot exceed 128 characters')
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required').max(256)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').max(254).toLowerCase().trim()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required').max(256),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});
