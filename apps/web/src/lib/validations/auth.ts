import { z } from 'zod';

// Password requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// Login schema
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters'),
    email: z.string().min(1, 'Email is required').email('Invalid email address').toLowerCase(),
    handle: z
      .string()
      .min(3, 'Handle must be at least 3 characters')
      .max(30, 'Handle must be less than 30 characters')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Handle can only contain letters, numbers, underscores, and hyphens'
      )
      .toLowerCase(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    organization: z.string().optional(),
    acceptTerms: z
      .boolean()
      .refine(val => val === true, 'You must accept the terms and conditions'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address').toLowerCase(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Reset password schema
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Update profile schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .optional(),
  handle: z
    .string()
    .min(3, 'Handle must be at least 3 characters')
    .max(30, 'Handle must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Handle can only contain letters, numbers, underscores, and hyphens')
    .toLowerCase()
    .optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  organization: z.string().max(100).optional(),
  avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// 2FA setup schema
export const setup2FASchema = z.object({
  token: z
    .string()
    .length(6, 'Token must be 6 digits')
    .regex(/^\d+$/, 'Token must contain only numbers'),
});

export type Setup2FAInput = z.infer<typeof setup2FASchema>;

// 2FA verify schema
export const verify2FASchema = z.object({
  token: z
    .string()
    .length(6, 'Token must be 6 digits')
    .regex(/^\d+$/, 'Token must contain only numbers'),
});

export type Verify2FAInput = z.infer<typeof verify2FASchema>;
