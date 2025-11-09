import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  setup2FASchema,
  verify2FASchema,
} from './auth';

describe('Auth Validations', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should lowercase email', () => {
      const result = loginSchema.parse({
        email: 'TEST@EXAMPLE.COM',
        password: 'password',
      });
      expect(result.email).toBe('test@example.com');
    });

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password',
      });
      expect(result.success).toBe(false);
    });

    it('should require email', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'password',
      });
      expect(result.success).toBe(false);
    });

    it('should require password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      handle: 'johndoe',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      acceptTerms: true,
    };

    it('should validate correct registration data', () => {
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject short name', () => {
      const result = registerSchema.safeParse({
        ...validData,
        name: 'J',
      });
      expect(result.success).toBe(false);
    });

    it('should reject long name', () => {
      const result = registerSchema.safeParse({
        ...validData,
        name: 'a'.repeat(101),
      });
      expect(result.success).toBe(false);
    });

    it('should reject short handle', () => {
      const result = registerSchema.safeParse({
        ...validData,
        handle: 'ab',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid handle characters', () => {
      const result = registerSchema.safeParse({
        ...validData,
        handle: 'john@doe',
      });
      expect(result.success).toBe(false);
    });

    it('should lowercase handle', () => {
      const result = registerSchema.parse({
        ...validData,
        handle: 'JOHNDOE',
      });
      expect(result.handle).toBe('johndoe');
    });

    it('should reject password without lowercase', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'PASSWORD123!',
        confirmPassword: 'PASSWORD123!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password without uppercase', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'password123!',
        confirmPassword: 'password123!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password without number', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'Password!',
        confirmPassword: 'Password!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject password without special character', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'Password123',
        confirmPassword: 'Password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({
        ...validData,
        password: 'Pass1!',
        confirmPassword: 'Pass1!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const result = registerSchema.safeParse({
        ...validData,
        confirmPassword: 'DifferentPassword123!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject if terms not accepted', () => {
      const result = registerSchema.safeParse({
        ...validData,
        acceptTerms: false,
      });
      expect(result.success).toBe(false);
    });

    it('should accept optional organization', () => {
      const result = registerSchema.safeParse({
        ...validData,
        organization: 'Tech Corp',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate correct email', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'test@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('should lowercase email', () => {
      const result = forgotPasswordSchema.parse({
        email: 'TEST@EXAMPLE.COM',
      });
      expect(result.email).toBe('test@example.com');
    });

    it('should reject invalid email', () => {
      const result = forgotPasswordSchema.safeParse({
        email: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    const validData = {
      token: 'reset-token-123',
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };

    it('should validate correct data', () => {
      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing token', () => {
      const result = resetPasswordSchema.safeParse({
        ...validData,
        token: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject weak password', () => {
      const result = resetPasswordSchema.safeParse({
        ...validData,
        password: 'weak',
        confirmPassword: 'weak',
      });
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const result = resetPasswordSchema.safeParse({
        ...validData,
        confirmPassword: 'Different123!',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('should validate optional fields', () => {
      const result = updateProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate name update', () => {
      const result = updateProfileSchema.safeParse({
        name: 'New Name',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short name', () => {
      const result = updateProfileSchema.safeParse({
        name: 'J',
      });
      expect(result.success).toBe(false);
    });

    it('should validate handle update', () => {
      const result = updateProfileSchema.safeParse({
        handle: 'newhandle',
      });
      expect(result.success).toBe(true);
    });

    it('should lowercase handle', () => {
      const result = updateProfileSchema.parse({
        handle: 'NEWHANDLE',
      });
      expect(result.handle).toBe('newhandle');
    });

    it('should validate bio', () => {
      const result = updateProfileSchema.safeParse({
        bio: 'This is my bio',
      });
      expect(result.success).toBe(true);
    });

    it('should reject long bio', () => {
      const result = updateProfileSchema.safeParse({
        bio: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
    });

    it('should validate avatar URL', () => {
      const result = updateProfileSchema.safeParse({
        avatarUrl: 'https://example.com/avatar.jpg',
      });
      expect(result.success).toBe(true);
    });

    it('should allow empty avatar URL', () => {
      const result = updateProfileSchema.safeParse({
        avatarUrl: '',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL', () => {
      const result = updateProfileSchema.safeParse({
        avatarUrl: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    const validData = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };

    it('should validate correct data', () => {
      const result = changePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing current password', () => {
      const result = changePasswordSchema.safeParse({
        ...validData,
        currentPassword: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject weak new password', () => {
      const result = changePasswordSchema.safeParse({
        ...validData,
        newPassword: 'weak',
        confirmPassword: 'weak',
      });
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const result = changePasswordSchema.safeParse({
        ...validData,
        confirmPassword: 'Different123!',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('setup2FASchema', () => {
    it('should validate 6-digit token', () => {
      const result = setup2FASchema.safeParse({
        token: '123456',
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-numeric token', () => {
      const result = setup2FASchema.safeParse({
        token: 'abc123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject token with wrong length', () => {
      const result = setup2FASchema.safeParse({
        token: '12345',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('verify2FASchema', () => {
    it('should validate 6-digit token', () => {
      const result = verify2FASchema.safeParse({
        token: '654321',
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-numeric token', () => {
      const result = verify2FASchema.safeParse({
        token: 'abcdef',
      });
      expect(result.success).toBe(false);
    });
  });
});
