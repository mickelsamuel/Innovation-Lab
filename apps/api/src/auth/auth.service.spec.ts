import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { EmailService } from '../email/email.service';
import { prismaMock, resetPrismaMock } from '../../test/utils/prisma-mock';
import { TestDataFactory } from '../../test/utils/test-data-factory';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import { Role } from '@innovation-lab/database';

jest.mock('bcryptjs');
jest.mock('speakeasy');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let gamificationService: GamificationService;
  let emailService: EmailService;

  beforeEach(async () => {
    resetPrismaMock();
    TestDataFactory.resetCounters();

    // Setup bcrypt mocks
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
            signAsync: jest.fn().mockResolvedValue('mock-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config: Record<string, any> = {
                JWT_SECRET: 'test-secret',
                JWT_EXPIRY: '15m',
                JWT_REFRESH_EXPIRY: '7d',
              };
              return config[key] || defaultValue;
            }),
          },
        },
        {
          provide: GamificationService,
          useValue: {
            updateDailyStreak: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
            sendEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    gamificationService = module.get<GamificationService>(GamificationService);
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      name: 'John Doe',
      email: 'john@test.com',
      handle: 'johndoe',
      password: 'Password123!',
      organization: 'Test Org',
      acceptTerms: true,
    };

    it('should successfully register a new user', async () => {
      const expectedUser = {
        id: 'user-1',
        email: 'john@test.com',
        name: 'John Doe',
        handle: 'johndoe',
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        ...expectedUser,
        password: 'hashed',
        roles: [Role.PARTICIPANT],
      } as any);
      prismaMock.gamificationProfile.create.mockResolvedValue({} as any);
      prismaMock.xpEvent.create.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', 'john@test.com');
      expect(result).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('handle', 'johndoe');
      expect(result).toHaveProperty('message', 'Registration successful! Welcome to Innovation Lab.');

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(2); // Check email and handle
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: registerDto.name,
          email: registerDto.email.toLowerCase(),
          handle: registerDto.handle.toLowerCase(),
          organization: registerDto.organization,
          roles: [Role.PARTICIPANT],
        }),
        select: expect.any(Object),
      });

      // Verify gamification profile created
      expect(prismaMock.gamificationProfile.create).toHaveBeenCalledWith({
        data: {
          userId: expectedUser.id,
          xp: 50,
          level: 1,
        },
      });

      // Verify XP event recorded
      expect(prismaMock.xpEvent.create).toHaveBeenCalled();

      // Verify audit log created
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const existingUser = TestDataFactory.createUser({ email: registerDto.email });
      prismaMock.user.findUnique.mockResolvedValue(existingUser as any);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if handle already exists', async () => {
      const existingUser = TestDataFactory.createUser({ handle: registerDto.handle });
      prismaMock.user.findUnique
        .mockResolvedValueOnce(null) // Email check passes
        .mockResolvedValue(existingUser as any); // Handle check fails

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('should hash the password before storing', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'john@test.com',
        name: 'John Doe',
        handle: 'johndoe',
        password: 'hashed-password',
        roles: [Role.PARTICIPANT],
      } as any);
      prismaMock.gamificationProfile.create.mockResolvedValue({} as any);
      prismaMock.xpEvent.create.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      await service.register(registerDto);

      const createCall = prismaMock.user.create.mock.calls[0][0];
      const storedPassword = createCall.data.password;

      // Verify password was hashed (bcrypt hash is 60 chars)
      expect(storedPassword).not.toBe(registerDto.password);
      expect(typeof storedPassword).toBe('string');
    });

    it('should convert email and handle to lowercase', async () => {
      const dtoWithMixedCase = {
        ...registerDto,
        email: 'John@TEST.COM',
        handle: 'JohnDoe',
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'john@test.com',
        name: 'John Doe',
        handle: 'johndoe',
        password: 'hashed',
        roles: [Role.PARTICIPANT],
      } as any);
      prismaMock.gamificationProfile.create.mockResolvedValue({} as any);
      prismaMock.xpEvent.create.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      await service.register(dtoWithMixedCase);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'john@test.com',
          handle: 'johndoe',
        }),
        select: expect.any(Object),
      });
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'john@test.com',
      password: 'Password123!',
    };

    const mockUser = {
      id: 'user-1',
      email: 'john@test.com',
      name: 'John Doe',
      handle: 'johndoe',
      password: 'hashed-password',
      roles: [Role.PARTICIPANT],
      isActive: true,
      isBanned: false,
      totpEnabled: false,
    };

    it('should successfully login a user', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      prismaMock.user.update.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result).toHaveProperty('user');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        roles: mockUser.roles,
      });

      // Verify last login was updated
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { lastLoginAt: expect.any(Date) },
      });

      // Verify streak was updated
      expect(gamificationService.updateDailyStreak).toHaveBeenCalledWith(mockUser.id);

      // Verify audit log
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid email or password');

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const invalidDto = { ...loginDto, password: 'WrongPassword123!' };

      await expect(service.login(invalidDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(invalidDto)).rejects.toThrow('Invalid email or password');

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for banned account', async () => {
      const bannedUser = { ...mockUser, isBanned: true };
      prismaMock.user.findUnique.mockResolvedValue(bannedUser as any);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Account has been banned');

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for inactive account', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      prismaMock.user.findUnique.mockResolvedValue(inactiveUser as any);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Account is not active');

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for missing password (OAuth account)', async () => {
      const oauthUser = { ...mockUser, password: null };
      prismaMock.user.findUnique.mockResolvedValue(oauthUser as any);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid authentication method');

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('should handle email case-insensitively', async () => {
      const dtoWithUpperCase = { ...loginDto, email: 'JOHN@TEST.COM' };
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      prismaMock.user.update.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      await service.login(dtoWithUpperCase);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'john@test.com' },
        select: expect.any(Object),
      });
    });
  });

  describe('refreshToken', () => {
    const mockUser = {
      id: 'user-1',
      email: 'john@test.com',
      roles: [Role.PARTICIPANT],
      isActive: true,
      isBanned: false,
    };

    it('should successfully refresh an access token', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockPayload = { sub: mockUser.id };

      (jwtService.verify as jest.Mock).mockReturnValue(mockPayload);
      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await service.refreshToken(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('expiresIn', 900);

      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, {
        secret: 'test-secret',
      });
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: expect.any(Object),
      });
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const invalidToken = 'invalid-token';

      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(invalidToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken(invalidToken)).rejects.toThrow('Invalid refresh token');

      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for banned user', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockPayload = { sub: mockUser.id };
      const bannedUser = { ...mockUser, isBanned: true };

      (jwtService.verify as jest.Mock).mockReturnValue(mockPayload);
      prismaMock.user.findUnique.mockResolvedValue(bannedUser as any);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken(refreshToken)).rejects.toThrow('Invalid refresh token');
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockPayload = { sub: mockUser.id };
      const inactiveUser = { ...mockUser, isActive: false };

      (jwtService.verify as jest.Mock).mockReturnValue(mockPayload);
      prismaMock.user.findUnique.mockResolvedValue(inactiveUser as any);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken(refreshToken)).rejects.toThrow('Invalid refresh token');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockPayload = { sub: 'non-existent-user' };

      (jwtService.verify as jest.Mock).mockReturnValue(mockPayload);
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken(refreshToken)).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('setup2FA', () => {
    it('should generate 2FA secret and QR code', async () => {
      const userId = 'user-123';
      const mockUser = { email: 'test@example.com' };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      // Mock speakeasy.generateSecret
      jest.spyOn(speakeasy, 'generateSecret').mockReturnValue({
        base32: 'JBSWY3DPEHPK3PXP',
        otpauth_url: 'otpauth://totp/Innovation%20Lab%20(test@example.com)?secret=JBSWY3DPEHPK3PXP&issuer=Innovation%20Lab',
      } as any);

      const result = await service.setup2FA(userId);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCode');
      expect(result.secret).toBeDefined();
      expect(result.qrCode).toBeDefined();
    });

    it('should throw BadRequestException for non-existent user', async () => {
      const userId = 'non-existent';
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.setup2FA(userId)).rejects.toThrow('User not found');
    });
  });

  describe('verify2FA', () => {
    it('should verify valid 2FA token', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const token = '123456'; // Mock token

      // Mock speakeasy verification
      jest.spyOn(speakeasy.totp, 'verify').mockReturnValue(true);

      const result = service.verify2FA(secret, token);

      expect(result).toBe(true);
    });

    it('should reject invalid 2FA token', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const token = 'wrong';

      jest.spyOn(speakeasy.totp, 'verify').mockReturnValue(false);

      const result = service.verify2FA(secret, token);

      expect(result).toBe(false);
    });
  });

  describe('enable2FA', () => {
    it('should enable 2FA for user', async () => {
      const userId = 'user-123';
      const secret = 'JBSWY3DPEHPK3PXP';

      prismaMock.user.update.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      await service.enable2FA(userId, secret);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          totpSecret: expect.any(String), // Secret is encrypted before storage
          totpEnabled: true,
        },
      });
      expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actorId: userId,
            action: 'USER_ENABLE_2FA',
          }),
        })
      );
    });
  });

  describe('disable2FA', () => {
    it('should disable 2FA for user', async () => {
      const userId = 'user-123';

      prismaMock.user.update.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      await service.disable2FA(userId);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          totpSecret: null,
          totpEnabled: false,
        },
      });
      expect(prismaMock.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actorId: userId,
            action: 'USER_DISABLE_2FA',
          }),
        })
      );
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email for existing user', async () => {
      const dto = { email: 'test@example.com' };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      prismaMock.user.update.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);
      emailService.sendEmail = jest.fn().mockResolvedValue(undefined);

      const result = await service.forgotPassword(dto);

      expect(result.success).toBe(true);
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({
            passwordResetToken: expect.any(String),
            passwordResetExpires: expect.any(Date),
          }),
        })
      );
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockUser.email,
          subject: 'Password Reset Request',
          template: 'password-reset',
        })
      );
    });

    it('should return success even if user does not exist (prevent enumeration)', async () => {
      const dto = { email: 'nonexistent@example.com' };

      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword(dto);

      expect(result.success).toBe(true);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('should handle case-insensitive email lookup', async () => {
      const dto = { email: 'TEST@EXAMPLE.COM' };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      prismaMock.user.update.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);
      emailService.sendEmail = jest.fn().mockResolvedValue(undefined);

      await service.forgotPassword(dto);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should continue even if email sending fails', async () => {
      const dto = { email: 'test@example.com' };
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
      prismaMock.user.update.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);
      emailService.sendEmail = jest.fn().mockRejectedValue(new Error('SMTP error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await service.forgotPassword(dto);

      expect(result.success).toBe(true);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      const dto = {
        token: 'valid-reset-token',
        newPassword: 'NewPassword123!',
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        passwordResetToken: 'hashed-token',
        passwordResetExpires: new Date(Date.now() + 3600000),
      };

      prismaMock.user.findMany.mockResolvedValue([mockUser] as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      prismaMock.user.update.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);
      emailService.sendEmail = jest.fn().mockResolvedValue(undefined);

      const result = await service.resetPassword(dto);

      expect(result.success).toBe(true);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          password: 'new-hashed-password',
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
    });

    it('should throw error for invalid token', async () => {
      const dto = {
        token: 'invalid-token',
        newPassword: 'NewPassword123!',
      };

      const mockUser = {
        id: 'user-123',
        passwordResetToken: 'hashed-token',
        passwordResetExpires: new Date(Date.now() + 3600000),
      };

      prismaMock.user.findMany.mockResolvedValue([mockUser] as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.resetPassword(dto)).rejects.toThrow('Invalid or expired password reset token');
    });

    it('should throw error for expired token', async () => {
      const dto = {
        token: 'expired-token',
        newPassword: 'NewPassword123!',
      };

      // No users with valid expiry
      prismaMock.user.findMany.mockResolvedValue([]);

      await expect(service.resetPassword(dto)).rejects.toThrow('Invalid or expired password reset token');
    });

    it('should send confirmation email after password reset', async () => {
      const dto = {
        token: 'valid-token',
        newPassword: 'NewPassword123!',
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        passwordResetToken: 'hashed-token',
        passwordResetExpires: new Date(Date.now() + 3600000),
      };

      prismaMock.user.findMany.mockResolvedValue([mockUser] as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      prismaMock.user.update.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);
      emailService.sendEmail = jest.fn().mockResolvedValue(undefined);

      await service.resetPassword(dto);

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockUser.email,
          subject: 'Password Changed Successfully',
          template: 'password-changed',
        })
      );
    });

    it('should continue even if confirmation email fails', async () => {
      const dto = {
        token: 'valid-token',
        newPassword: 'NewPassword123!',
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        passwordResetToken: 'hashed-token',
        passwordResetExpires: new Date(Date.now() + 3600000),
      };

      prismaMock.user.findMany.mockResolvedValue([mockUser] as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      prismaMock.user.update.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);
      emailService.sendEmail = jest.fn().mockRejectedValue(new Error('Email error'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await service.resetPassword(dto);

      expect(result.success).toBe(true);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
