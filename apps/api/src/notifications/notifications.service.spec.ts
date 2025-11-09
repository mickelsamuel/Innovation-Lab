import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockPrismaService = {
    notification: {
      create: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
    notificationPreferences: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
  };

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    const createDto = {
      userId: 'user-1',
      type: NotificationType.HACKATHON_REGISTRATION,
      title: 'Test Notification',
      message: 'Test message',
      data: { key: 'value' },
      link: '/test',
    };

    const mockPreferences = {
      id: 'pref-1',
      userId: 'user-1',
      emailHackathonRegistration: true,
      inAppHackathonRegistration: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a notification successfully', async () => {
      const mockNotification = {
        id: 'notif-1',
        ...createDto,
        readAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.notificationPreferences.findUnique.mockResolvedValue(mockPreferences);
      mockPrismaService.notification.create.mockResolvedValue(mockNotification);

      const result = await service.createNotification(createDto);

      expect(result).toEqual(mockNotification);
      expect(mockPrismaService.notificationPreferences.findUnique).toHaveBeenCalledWith({
        where: { userId: createDto.userId },
      });
      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: {
          userId: createDto.userId,
          type: createDto.type,
          title: createDto.title,
          message: createDto.message,
          data: createDto.data,
          link: createDto.link,
        },
      });
    });

    it('should return null if user has disabled in-app notifications for the type', async () => {
      const disabledPreferences = {
        ...mockPreferences,
        inAppHackathonRegistration: false,
      };

      mockPrismaService.notificationPreferences.findUnique.mockResolvedValue(disabledPreferences);

      const result = await service.createNotification(createDto);

      expect(result).toBeNull();
      expect(mockPrismaService.notification.create).not.toHaveBeenCalled();
    });

    it('should create preferences if they do not exist', async () => {
      mockPrismaService.notificationPreferences.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.notificationPreferences.create.mockResolvedValue(mockPreferences);
      mockPrismaService.notification.create.mockResolvedValue({
        id: 'notif-1',
        ...createDto,
        readAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.createNotification(createDto);

      expect(mockPrismaService.notificationPreferences.create).toHaveBeenCalledWith({
        data: { userId: createDto.userId },
      });
    });

    it('should throw error if creation fails', async () => {
      mockPrismaService.notificationPreferences.findUnique.mockResolvedValue(mockPreferences);
      mockPrismaService.notification.create.mockRejectedValue(new Error('Database error'));

      await expect(service.createNotification(createDto)).rejects.toThrow('Database error');
    });
  });

  describe('createBulkNotifications', () => {
    const notifications = [
      {
        userId: 'user-1',
        type: NotificationType.HACKATHON_REGISTRATION,
        title: 'Notification 1',
        message: 'Message 1',
      },
      {
        userId: 'user-2',
        type: NotificationType.TEAM_INVITATION,
        title: 'Notification 2',
        message: 'Message 2',
      },
    ];

    it('should create multiple notifications', async () => {
      const mockPreferences = {
        id: 'pref-1',
        userId: 'user-1',
        inAppHackathonRegistration: true,
        inAppTeamInvitation: true,
      };

      mockPrismaService.notificationPreferences.findUnique.mockResolvedValue(mockPreferences);
      mockPrismaService.notification.createMany.mockResolvedValue({ count: 2 });

      const result = await service.createBulkNotifications(notifications);

      expect(result).toHaveLength(2);
      expect(mockPrismaService.notification.createMany).toHaveBeenCalled();
    });

    it('should filter out notifications for disabled preferences', async () => {
      const preferences1 = {
        id: 'pref-1',
        userId: 'user-1',
        inAppHackathonRegistration: true,
        inAppTeamInvitation: true,
      };

      const preferences2 = {
        id: 'pref-2',
        userId: 'user-2',
        inAppHackathonRegistration: false,
        inAppTeamInvitation: false,
      };

      mockPrismaService.notificationPreferences.findUnique
        .mockResolvedValueOnce(preferences1)
        .mockResolvedValueOnce(preferences2);
      mockPrismaService.notification.createMany.mockResolvedValue({ count: 1 });

      const result = await service.createBulkNotifications(notifications);

      expect(result).toHaveLength(1);
    });

    it('should return empty array if no valid notifications', async () => {
      const preferences = {
        id: 'pref-1',
        userId: 'user-1',
        inAppHackathonRegistration: false,
        inAppTeamInvitation: false,
      };

      mockPrismaService.notificationPreferences.findUnique.mockResolvedValue(preferences);

      const result = await service.createBulkNotifications(notifications);

      expect(result).toEqual([]);
      expect(mockPrismaService.notification.createMany).not.toHaveBeenCalled();
    });
  });

  describe('getUserNotifications', () => {
    const userId = 'user-1';
    const mockNotifications = [
      {
        id: 'notif-1',
        userId,
        type: NotificationType.HACKATHON_REGISTRATION,
        title: 'Notification 1',
        message: 'Message 1',
        readAt: null,
        createdAt: new Date(),
      },
      {
        id: 'notif-2',
        userId,
        type: NotificationType.TEAM_INVITATION,
        title: 'Notification 2',
        message: 'Message 2',
        readAt: new Date(),
        createdAt: new Date(),
      },
    ];

    it('should get user notifications with default pagination', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue(mockNotifications);
      mockPrismaService.notification.count.mockResolvedValueOnce(2).mockResolvedValueOnce(1);

      const result = await service.getUserNotifications(userId);

      expect(result.notifications).toEqual(mockNotifications);
      expect(result.pagination).toEqual({
        total: 2,
        limit: 20,
        offset: 0,
        hasMore: false,
      });
      expect(result.unreadCount).toBe(1);
    });

    it('should filter unread notifications only', async () => {
      const unreadNotifications = [mockNotifications[0]];

      mockPrismaService.notification.findMany.mockResolvedValue(unreadNotifications);
      mockPrismaService.notification.count.mockResolvedValueOnce(1).mockResolvedValueOnce(1);

      const result = await service.getUserNotifications(userId, { unreadOnly: true });

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith({
        where: { userId, readAt: null },
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0,
      });
      expect(result.notifications).toEqual(unreadNotifications);
    });

    it('should handle custom pagination', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue(mockNotifications);
      mockPrismaService.notification.count.mockResolvedValueOnce(100).mockResolvedValueOnce(1);

      const result = await service.getUserNotifications(userId, {
        limit: 10,
        offset: 20,
      });

      expect(result.pagination).toEqual({
        total: 100,
        limit: 10,
        offset: 20,
        hasMore: true,
      });
    });
  });

  describe('markAsRead', () => {
    const notificationId = 'notif-1';
    const userId = 'user-1';

    it('should mark notification as read', async () => {
      const mockNotification = {
        id: notificationId,
        userId,
        type: NotificationType.HACKATHON_REGISTRATION,
        title: 'Test',
        message: 'Test',
        readAt: null,
        createdAt: new Date(),
      };

      const updatedNotification = {
        ...mockNotification,
        readAt: new Date(),
      };

      mockPrismaService.notification.findFirst.mockResolvedValue(mockNotification);
      mockPrismaService.notification.update.mockResolvedValue(updatedNotification);

      const result = await service.markAsRead(notificationId, userId);

      expect(result.readAt).toBeDefined();
      expect(mockPrismaService.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: { readAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException if notification not found', async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(null);

      await expect(service.markAsRead(notificationId, userId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.notification.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if notification belongs to different user', async () => {
      mockPrismaService.notification.findFirst.mockResolvedValue(null);

      await expect(service.markAsRead(notificationId, 'different-user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAllAsRead', () => {
    const userId = 'user-1';

    it('should mark all unread notifications as read', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead(userId);

      expect(result.count).toBe(5);
      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { userId, readAt: null },
        data: { readAt: expect.any(Date) },
      });
    });

    it('should return 0 count if no unread notifications', async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.markAllAsRead(userId);

      expect(result.count).toBe(0);
    });
  });

  describe('getUnreadCount', () => {
    const userId = 'user-1';

    it('should return unread notification count', async () => {
      mockPrismaService.notification.count.mockResolvedValue(3);

      const result = await service.getUnreadCount(userId);

      expect(result).toBe(3);
      expect(mockPrismaService.notification.count).toHaveBeenCalledWith({
        where: { userId, readAt: null },
      });
    });

    it('should return 0 if no unread notifications', async () => {
      mockPrismaService.notification.count.mockResolvedValue(0);

      const result = await service.getUnreadCount(userId);

      expect(result).toBe(0);
    });
  });

  describe('getUserPreferences', () => {
    const userId = 'user-1';

    it('should return existing preferences', async () => {
      const mockPreferences = {
        id: 'pref-1',
        userId,
        emailHackathonRegistration: true,
        inAppHackathonRegistration: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.notificationPreferences.findUnique.mockResolvedValue(mockPreferences);

      const result = await service.getUserPreferences(userId);

      expect(result).toEqual(mockPreferences);
    });

    it('should create and return preferences if they do not exist', async () => {
      const newPreferences = {
        id: 'pref-1',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.notificationPreferences.findUnique.mockResolvedValue(null);
      mockPrismaService.notificationPreferences.create.mockResolvedValue(newPreferences);

      const result = await service.getUserPreferences(userId);

      expect(result).toEqual(newPreferences);
      expect(mockPrismaService.notificationPreferences.create).toHaveBeenCalledWith({
        data: { userId },
      });
    });
  });

  describe('updatePreferences', () => {
    const userId = 'user-1';
    const updateDto = {
      emailHackathonRegistration: false,
      inAppTeamInvitation: true,
    };

    it('should update existing preferences', async () => {
      const updatedPreferences = {
        id: 'pref-1',
        userId,
        ...updateDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.notificationPreferences.upsert.mockResolvedValue(updatedPreferences);

      const result = await service.updatePreferences(userId, updateDto);

      expect(result).toEqual(updatedPreferences);
      expect(mockPrismaService.notificationPreferences.upsert).toHaveBeenCalledWith({
        where: { userId },
        create: {
          userId,
          ...updateDto,
        },
        update: updateDto,
      });
    });

    it('should create preferences if they do not exist', async () => {
      const newPreferences = {
        id: 'pref-1',
        userId,
        ...updateDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.notificationPreferences.upsert.mockResolvedValue(newPreferences);

      const result = await service.updatePreferences(userId, updateDto);

      expect(result).toEqual(newPreferences);
    });
  });

  describe('shouldSendEmail', () => {
    const userId = 'user-1';

    it('should return true if email notifications are enabled', async () => {
      const preferences = {
        id: 'pref-1',
        userId,
        emailHackathonRegistration: true,
      };

      mockPrismaService.notificationPreferences.findUnique.mockResolvedValue(preferences);

      const result = await service.shouldSendEmail(userId, NotificationType.HACKATHON_REGISTRATION);

      expect(result).toBe(true);
    });

    it('should return false if email notifications are disabled', async () => {
      const preferences = {
        id: 'pref-1',
        userId,
        emailHackathonRegistration: false,
      };

      mockPrismaService.notificationPreferences.findUnique.mockResolvedValue(preferences);

      const result = await service.shouldSendEmail(userId, NotificationType.HACKATHON_REGISTRATION);

      expect(result).toBe(false);
    });

    it('should return true by default if preference is undefined', async () => {
      const preferences = {
        id: 'pref-1',
        userId,
      };

      mockPrismaService.notificationPreferences.findUnique.mockResolvedValue(preferences);

      const result = await service.shouldSendEmail(userId, NotificationType.HACKATHON_REGISTRATION);

      expect(result).toBe(true);
    });
  });

  describe('cleanupOldNotifications', () => {
    it('should delete old read notifications', async () => {
      mockPrismaService.notification.deleteMany.mockResolvedValue({ count: 10 });

      const result = await service.cleanupOldNotifications(30);

      expect(result.count).toBe(10);
      expect(mockPrismaService.notification.deleteMany).toHaveBeenCalledWith({
        where: {
          readAt: {
            not: null,
            lt: expect.any(Date),
          },
        },
      });
    });

    it('should use default days if not specified', async () => {
      mockPrismaService.notification.deleteMany.mockResolvedValue({ count: 5 });

      await service.cleanupOldNotifications();

      expect(mockPrismaService.notification.deleteMany).toHaveBeenCalled();
    });

    it('should return 0 count if no old notifications', async () => {
      mockPrismaService.notification.deleteMany.mockResolvedValue({ count: 0 });

      const result = await service.cleanupOldNotifications(30);

      expect(result.count).toBe(0);
    });
  });
});
