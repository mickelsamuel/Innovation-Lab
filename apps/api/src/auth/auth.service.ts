import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterDto, RegisterResponseDto } from './dto/register.dto';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  PasswordResetResponseDto,
} from './dto/password-reset.dto';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as crypto from 'crypto';
import { Role } from '@innovation-lab/database';
import { GamificationService } from '../gamification/gamification.service';
import { EmailService } from '../email/email.service';

// Encryption key derivation from environment variable
const ENCRYPTION_KEY = crypto
  .createHash('sha256')
  .update(process.env.TOTP_ENCRYPTION_SECRET || 'default-secret-change-in-production')
  .digest();
const IV_LENGTH = 16;

/**
 * Encrypt a TOTP secret for secure storage
 */
function encryptTotpSecret(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt a TOTP secret from storage
 */
function decryptTotpSecret(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly gamificationService: GamificationService,
    private readonly emailService: EmailService
  ) {}

  /**
   * Register new user
   */
  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    // Check if handle already exists
    const existingHandle = await this.prisma.user.findUnique({
      where: { handle: dto.handle.toLowerCase() },
    });

    if (existingHandle) {
      throw new ConflictException('Handle already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        handle: dto.handle.toLowerCase(),
        password: hashedPassword,
        organization: dto.organization,
        roles: [Role.PARTICIPANT], // Default role
        emailVerified: new Date(), // Auto-verify for now (can add email verification later)
      },
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
      },
    });

    // Create gamification profile
    await this.prisma.gamificationProfile.create({
      data: {
        userId: user.id,
        xp: 50, // Welcome XP
        level: 1,
      },
    });

    // Record XP event
    await this.prisma.xpEvent.create({
      data: {
        userId: user.id,
        eventType: 'SIGNUP',
        points: 50,
        refType: 'USER',
        refId: user.id,
      },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'USER_REGISTER',
        entityType: 'USER',
        entityId: user.id,
      },
    });

    return {
      ...user,
      message: 'Registration successful! Welcome to Innovation Lab.',
    };
  }

  /**
   * Login user
   */
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    // Find user (without password hash for security)
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
        roles: true,
        isActive: true,
        isBanned: true,
        totpEnabled: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check account status
    if (user.isBanned) {
      throw new UnauthorizedException('Account has been banned');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is not active');
    }

    // Fetch password separately for verification only
    const userWithPassword = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        password: true,
      },
    });

    // Verify password
    if (!userWithPassword?.password) {
      throw new UnauthorizedException('Invalid authentication method');
    }

    const isValidPassword = await bcrypt.compare(dto.password, userWithPassword.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if 2FA is enabled (would need additional verification step)
    if (user.totpEnabled) {
      // In a real implementation, return a flag indicating 2FA is required
      // For now, we'll skip this step
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Update daily login streak and award XP
    await this.gamificationService.updateDailyStreak(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.roles);

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'USER_LOGIN',
        entityType: 'USER',
        entityId: user.id,
      },
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        roles: user.roles,
      },
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, roles: true, isActive: true, isBanned: true },
      });

      if (!user || user.isBanned || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = await this.generateAccessToken(user.id, user.email, user.roles);

      return {
        accessToken,
        expiresIn: 900, // 15 minutes
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    userId: string,
    email: string,
    roles: string[]
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId, email, roles),
      this.generateRefreshToken(userId, email, roles),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes
    };
  }

  /**
   * Generate access token (short-lived)
   */
  private async generateAccessToken(
    userId: string,
    email: string,
    roles: string[]
  ): Promise<string> {
    const payload = { sub: userId, email, roles };
    return this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRY', '15m'),
    });
  }

  /**
   * Generate refresh token (long-lived)
   */
  private async generateRefreshToken(
    userId: string,
    email: string,
    roles: string[]
  ): Promise<string> {
    const payload = { sub: userId, email, roles };
    return this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRY', '7d'),
    });
  }

  /**
   * Setup 2FA for user
   */
  async setup2FA(userId: string): Promise<{ secret: string; qrCode: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `Innovation Lab (${user.email})`,
      issuer: 'Innovation Lab',
    });

    // Store secret temporarily (would save to database in real implementation)
    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url || '',
    };
  }

  /**
   * Verify 2FA token
   */
  verify2FA(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after
    });
  }

  /**
   * Verify 2FA token for a user (with encrypted secret retrieval)
   */
  async verify2FAForUser(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { totpSecret: true, totpEnabled: true },
    });

    if (!user || !user.totpEnabled || !user.totpSecret) {
      return false;
    }

    // Decrypt secret before verification
    const decryptedSecret = decryptTotpSecret(user.totpSecret);
    return this.verify2FA(decryptedSecret, token);
  }

  /**
   * Enable 2FA for user
   */
  async enable2FA(userId: string, secret: string): Promise<void> {
    // Encrypt TOTP secret before storing
    const encryptedSecret = encryptTotpSecret(secret);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totpSecret: encryptedSecret,
        totpEnabled: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'USER_ENABLE_2FA',
        entityType: 'USER',
        entityId: userId,
      },
    });
  }

  /**
   * Disable 2FA for user
   */
  async disable2FA(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totpSecret: null,
        totpEnabled: false,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'USER_DISABLE_2FA',
        entityType: 'USER',
        entityId: userId,
      },
    });
  }

  /**
   * Request password reset
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<PasswordResetResponseDto> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        success: true,
        message:
          'If an account exists with this email, you will receive password reset instructions',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiresAt,
      },
    });

    // Send reset email
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    try {
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        template: 'password-reset',
        context: {
          name: user.name,
          resetUrl,
          expiresIn: '1 hour',
        },
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'USER_PASSWORD_RESET_REQUEST',
        entityType: 'USER',
        entityId: user.id,
      },
    });

    return {
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions',
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(dto: ResetPasswordDto): Promise<PasswordResetResponseDto> {
    // Find users with non-expired reset tokens
    const users = await this.prisma.user.findMany({
      where: {
        passwordResetExpires: {
          gte: new Date(),
        },
        passwordResetToken: {
          not: null,
        },
      },
    });

    // Find user with matching token
    let matchedUser = null;
    for (const user of users) {
      if (user.passwordResetToken) {
        const isValid = await bcrypt.compare(dto.token, user.passwordResetToken);
        if (isValid) {
          matchedUser = user;
          break;
        }
      }
    }

    if (!matchedUser) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Update password and clear reset token
    await this.prisma.user.update({
      where: { id: matchedUser.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Send confirmation email
    try {
      await this.emailService.sendEmail({
        to: matchedUser.email,
        subject: 'Password Changed Successfully',
        template: 'password-changed',
        context: {
          name: matchedUser.name,
        },
      });
    } catch (error) {
      console.error('Failed to send password changed email:', error);
    }

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: matchedUser.id,
        action: 'USER_PASSWORD_RESET',
        entityType: 'USER',
        entityId: matchedUser.id,
      },
    });

    return {
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    };
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user || !user.password) {
      throw new BadRequestException('Invalid user or authentication method');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'USER_PASSWORD_CHANGE',
        entityType: 'USER',
        entityId: userId,
      },
    });

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  /**
   * Delete user account
   */
  async deleteAccount(
    userId: string,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true, email: true },
    });

    if (!user || !user.password) {
      throw new BadRequestException('Invalid user or authentication method');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Password is incorrect');
    }

    // Log audit before deletion
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'USER_DELETE_ACCOUNT',
        entityType: 'USER',
        entityId: userId,
      },
    });

    // Delete user (cascade will handle related records)
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      message: 'Account deleted successfully',
    };
  }
}
