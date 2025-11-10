import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotificationType } from '@prisma/client';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  link?: string;
}

export interface NotificationPreferencesDto {
  emailHackathonRegistration?: boolean;
  emailSubmissionReceived?: boolean;
  emailJudgeAssigned?: boolean;
  emailMentorAssigned?: boolean;
  emailJudgingComplete?: boolean;
  emailWinnerAnnouncement?: boolean;
  emailChallengeSubmission?: boolean;
  emailChallengeReviewed?: boolean;
  emailChallengeAccepted?: boolean;
  emailChallengeWinner?: boolean;
  emailTeamInvitation?: boolean;
  emailTeamInvitationAccepted?: boolean;
  emailLevelUp?: boolean;
  emailBadgeUnlocked?: boolean;
  inAppHackathonRegistration?: boolean;
  inAppSubmissionReceived?: boolean;
  inAppJudgeAssigned?: boolean;
  inAppMentorAssigned?: boolean;
  inAppJudgingComplete?: boolean;
  inAppWinnerAnnouncement?: boolean;
  inAppChallengeSubmission?: boolean;
  inAppChallengeReviewed?: boolean;
  inAppChallengeAccepted?: boolean;
  inAppChallengeWinner?: boolean;
  inAppTeamInvitation?: boolean;
  inAppTeamInvitationAccepted?: boolean;
  inAppLevelUp?: boolean;
  inAppBadgeUnlocked?: boolean;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a notification in the database
   */
  async createNotification(dto: CreateNotificationDto) {
    try {
      // Check user preferences
      const preferences = await this.getUserPreferences(dto.userId);
      const prefKey = this.getPreferenceKey(dto.type, 'inApp');

      if (!(preferences as any)[prefKey]) {
        this.logger.log(`User ${dto.userId} has disabled in-app notifications for ${dto.type}`);
        return null;
      }

      return await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          type: dto.type,
          title: dto.title,
          message: dto.message,
          data: dto.data,
          link: dto.link,
        },
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to create notification: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Create multiple notifications (bulk)
   */
  async createBulkNotifications(notifications: CreateNotificationDto[]) {
    try {
      const validNotifications = [];

      for (const notification of notifications) {
        const preferences = await this.getUserPreferences(notification.userId);
        const prefKey = this.getPreferenceKey(notification.type, 'inApp');

        if ((preferences as any)[prefKey]) {
          validNotifications.push({
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            link: notification.link,
          });
        }
      }

      if (validNotifications.length === 0) {
        return [];
      }

      await this.prisma.notification.createMany({
        data: validNotifications,
      });

      return validNotifications;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to create bulk notifications: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(
    userId: string,
    options: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const { unreadOnly = false, limit = 20, offset = 0 } = options;

    const where: any = { userId };
    if (unreadOnly) {
      where.readAt = null;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, readAt: null },
      }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      unreadCount,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return await this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  /**
   * Get or create user notification preferences
   */
  async getUserPreferences(userId: string) {
    let preferences = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await this.prisma.notificationPreferences.create({
        data: { userId },
      });
    }

    return preferences;
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(userId: string, dto: NotificationPreferencesDto) {
    return await this.prisma.notificationPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...dto,
      },
      update: dto,
    });
  }

  /**
   * Check if user has email notifications enabled for a type
   */
  async shouldSendEmail(userId: string, type: NotificationType): Promise<boolean> {
    const preferences = await this.getUserPreferences(userId);
    const prefKey = this.getPreferenceKey(type, 'email');
    return (preferences as any)[prefKey] ?? true;
  }

  /**
   * Helper to get preference key from notification type
   */
  private getPreferenceKey(type: NotificationType, channel: 'email' | 'inApp'): string {
    const typeMap: Record<NotificationType, string> = {
      HACKATHON_REGISTRATION: 'HackathonRegistration',
      SUBMISSION_RECEIVED: 'SubmissionReceived',
      JUDGE_ASSIGNED: 'JudgeAssigned',
      MENTOR_ASSIGNED: 'MentorAssigned',
      JUDGING_COMPLETE: 'JudgingComplete',
      WINNER_ANNOUNCEMENT: 'WinnerAnnouncement',
      CHALLENGE_SUBMISSION: 'ChallengeSubmission',
      CHALLENGE_REVIEWED: 'ChallengeReviewed',
      CHALLENGE_ACCEPTED: 'ChallengeAccepted',
      CHALLENGE_WINNER: 'ChallengeWinner',
      TEAM_INVITATION: 'TeamInvitation',
      TEAM_INVITATION_ACCEPTED: 'TeamInvitationAccepted',
      TEAM_JOIN_REQUEST: 'TeamJoinRequest',
      TEAM_JOIN_REQUEST_ACCEPTED: 'TeamJoinRequestAccepted',
      LEVEL_UP: 'LevelUp',
      BADGE_UNLOCKED: 'BadgeUnlocked',
    };

    const prefix = channel === 'email' ? 'email' : 'inApp';
    return `${prefix}${typeMap[type]}`;
  }

  /**
   * Delete old read notifications (cleanup)
   */
  async cleanupOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.notification.deleteMany({
      where: {
        readAt: { not: null, lt: cutoffDate },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old notifications`);
    return result;
  }
}
