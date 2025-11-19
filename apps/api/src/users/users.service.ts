import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user by ID
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
        avatarUrl: true,
        bio: true,
        organization: true,
        roles: true,
        createdAt: true,
        lastLoginAt: true,
        gamificationProfile: {
          select: {
            xp: true,
            level: true,
            streakDays: true,
            vaultKeys: true,
            badges: true,
          },
        },
        _count: {
          select: {
            teamMemberships: true,
            challengeSubmissions: true,
            mentorProfiles: true,
            judgeAssignments: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Get user by handle
   */
  async findByHandle(handle: string) {
    const user = await this.prisma.user.findUnique({
      where: { handle: handle.toLowerCase() },
      select: {
        id: true,
        name: true,
        handle: true,
        avatarUrl: true,
        bio: true,
        organization: true,
        roles: true,
        createdAt: true,
        gamificationProfile: {
          select: {
            xp: true,
            level: true,
            badges: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Get user by email (exact match)
   * Used by admin interfaces for invitations and assignments
   */
  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
        avatarUrl: true,
        organization: true,
        roles: true,
        isActive: true,
        isBanned: true,
      },
    });

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Check if handle is taken (if updating)
    if (dto.handle) {
      const existing = await this.prisma.user.findUnique({
        where: { handle: dto.handle.toLowerCase() },
      });

      if (existing && existing.id !== userId) {
        throw new ConflictException('Handle already taken');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        handle: dto.handle?.toLowerCase(),
        bio: dto.bio,
        organization: dto.organization,
        avatarUrl: dto.avatarUrl,
      },
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
        avatarUrl: true,
        bio: true,
        organization: true,
      },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'USER_UPDATE_PROFILE',
        entityType: 'USER',
        entityId: userId,
        metadata: { fields: Object.keys(dto) },
      },
    });

    return user;
  }

  /**
   * Change password
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user || !user.password) {
      throw new BadRequestException('Invalid operation');
    }

    // Verify current password
    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'USER_CHANGE_PASSWORD',
        entityType: 'USER',
        entityId: userId,
      },
    });

    return { success: true, message: 'Password changed successfully' };
  }

  /**
   * Get user statistics
   */
  async getStats(userId: string) {
    const [gamification, teams, submissions, challenges] = await Promise.all([
      this.prisma.gamificationProfile.findUnique({
        where: { userId },
        select: {
          xp: true,
          level: true,
          streakDays: true,
          vaultKeys: true,
          badges: true,
        },
      }),
      this.prisma.teamMember.count({
        where: { userId },
      }),
      this.prisma.submission.count({
        where: {
          team: {
            members: {
              some: { userId },
            },
          },
        },
      }),
      this.prisma.challengeSubmission.count({
        where: { userId },
      }),
    ]);

    return {
      gamification: gamification || {
        xp: 0,
        level: 1,
        streakDays: 0,
        vaultKeys: 0,
        badges: [],
      },
      teams,
      submissions,
      challenges,
    };
  }

  /**
   * Search users
   */
  async search(query: string, limit = 10) {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { handle: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
        isActive: true,
        isBanned: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        handle: true,
        avatarUrl: true,
        organization: true,
        roles: true,
        isActive: true,
        isBanned: true,
        createdAt: true,
        lastLoginAt: true,
      },
      take: limit,
    });

    return users;
  }

  /**
   * Get user activity feed
   */
  async getActivityFeed(userId: string, limit = 20) {
    const events = await this.prisma.xpEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        eventType: true,
        points: true,
        refType: true,
        refId: true,
        createdAt: true,
      },
    });

    return events;
  }

  /**
   * Delete user account (soft delete)
   */
  async deleteAccount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: `deleted_${userId}@deleted.com`,
        handle: `deleted_${userId}`,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'USER_DELETE_ACCOUNT',
        entityType: 'USER',
        entityId: userId,
      },
    });

    return { success: true, message: 'Account deleted successfully' };
  }
}
