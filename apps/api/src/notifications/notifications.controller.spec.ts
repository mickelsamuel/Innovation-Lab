import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockNotificationsService = {
    getUserNotifications: jest.fn(),
    getUnreadCount: jest.fn(),
    getUserPreferences: jest.fn(),
    updatePreferences: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNotifications', () => {
    const userId = 'user-1';
    const mockNotifications = [
      {
        id: 'notif-1',
        userId,
        type: NotificationType.HACKATHON_REGISTRATION,
        title: 'Test Notification',
        message: 'Test message',
        readAt: null,
        createdAt: new Date(),
      },
    ];

    const mockResponse = {
      notifications: mockNotifications,
      pagination: {
        total: 1,
        limit: 20,
        offset: 0,
        hasMore: false,
      },
      unreadCount: 1,
    };

    it('should get notifications with default pagination', async () => {
      mockNotificationsService.getUserNotifications.mockResolvedValue(mockResponse);

      const result = await controller.getNotifications(userId);

      expect(result).toEqual(mockResponse);
      expect(mockNotificationsService.getUserNotifications).toHaveBeenCalledWith(userId, {
        unreadOnly: false,
        limit: 20,
        offset: 0,
      });
    });

    it('should get notifications with unreadOnly filter', async () => {
      const unreadResponse = {
        ...mockResponse,
        notifications: [mockNotifications[0]],
      };

      mockNotificationsService.getUserNotifications.mockResolvedValue(unreadResponse);

      const result = await controller.getNotifications(userId, 'true');

      expect(result).toEqual(unreadResponse);
      expect(mockNotificationsService.getUserNotifications).toHaveBeenCalledWith(userId, {
        unreadOnly: true,
        limit: 20,
        offset: 0,
      });
    });

    it('should get notifications with custom pagination', async () => {
      mockNotificationsService.getUserNotifications.mockResolvedValue(mockResponse);

      await controller.getNotifications(userId, undefined, '10', '5');

      expect(mockNotificationsService.getUserNotifications).toHaveBeenCalledWith(userId, {
        unreadOnly: false,
        limit: 10,
        offset: 5,
      });
    });

    it('should handle string to boolean conversion for unreadOnly', async () => {
      mockNotificationsService.getUserNotifications.mockResolvedValue(mockResponse);

      await controller.getNotifications(userId, 'false');

      expect(mockNotificationsService.getUserNotifications).toHaveBeenCalledWith(userId, {
        unreadOnly: false,
        limit: 20,
        offset: 0,
      });
    });

    it('should handle invalid limit gracefully', async () => {
      mockNotificationsService.getUserNotifications.mockResolvedValue(mockResponse);

      await controller.getNotifications(userId, undefined, 'invalid');

      expect(mockNotificationsService.getUserNotifications).toHaveBeenCalledWith(userId, {
        unreadOnly: false,
        limit: NaN, // parseInt returns NaN for invalid strings
        offset: 0,
      });
    });
  });

  describe('getUnreadCount', () => {
    const userId = 'user-1';

    it('should return unread count', async () => {
      mockNotificationsService.getUnreadCount.mockResolvedValue(5);

      const result = await controller.getUnreadCount(userId);

      expect(result).toEqual({ count: 5 });
      expect(mockNotificationsService.getUnreadCount).toHaveBeenCalledWith(userId);
    });

    it('should return 0 if no unread notifications', async () => {
      mockNotificationsService.getUnreadCount.mockResolvedValue(0);

      const result = await controller.getUnreadCount(userId);

      expect(result).toEqual({ count: 0 });
    });
  });

  describe('getPreferences', () => {
    const userId = 'user-1';
    const mockPreferences = {
      id: 'pref-1',
      userId,
      emailHackathonRegistration: true,
      emailSubmissionReceived: true,
      inAppHackathonRegistration: true,
      inAppSubmissionReceived: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user preferences', async () => {
      mockNotificationsService.getUserPreferences.mockResolvedValue(mockPreferences);

      const result = await controller.getPreferences(userId);

      expect(result).toEqual(mockPreferences);
      expect(mockNotificationsService.getUserPreferences).toHaveBeenCalledWith(userId);
    });

    it('should return newly created preferences if they do not exist', async () => {
      const newPreferences = {
        id: 'pref-1',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockNotificationsService.getUserPreferences.mockResolvedValue(newPreferences);

      const result = await controller.getPreferences(userId);

      expect(result).toEqual(newPreferences);
    });
  });

  describe('updatePreferences', () => {
    const userId = 'user-1';
    const updateDto = {
      emailHackathonRegistration: false,
      emailSubmissionReceived: true,
      inAppHackathonRegistration: true,
      inAppSubmissionReceived: false,
    };

    it('should update user preferences', async () => {
      const updatedPreferences = {
        id: 'pref-1',
        userId,
        ...updateDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockNotificationsService.updatePreferences.mockResolvedValue(updatedPreferences);

      const result = await controller.updatePreferences(userId, updateDto);

      expect(result).toEqual(updatedPreferences);
      expect(mockNotificationsService.updatePreferences).toHaveBeenCalledWith(userId, updateDto);
    });

    it('should handle partial updates', async () => {
      const partialDto = {
        emailHackathonRegistration: false,
      };

      const updatedPreferences = {
        id: 'pref-1',
        userId,
        emailHackathonRegistration: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockNotificationsService.updatePreferences.mockResolvedValue(updatedPreferences);

      const result = await controller.updatePreferences(userId, partialDto);

      expect(result).toEqual(updatedPreferences);
      expect(mockNotificationsService.updatePreferences).toHaveBeenCalledWith(userId, partialDto);
    });
  });

  describe('markAsRead', () => {
    const userId = 'user-1';
    const notificationId = 'notif-1';

    it('should mark notification as read', async () => {
      const updatedNotification = {
        id: notificationId,
        userId,
        type: NotificationType.HACKATHON_REGISTRATION,
        title: 'Test',
        message: 'Test',
        readAt: new Date(),
        createdAt: new Date(),
      };

      mockNotificationsService.markAsRead.mockResolvedValue(updatedNotification);

      const result = await controller.markAsRead(userId, notificationId);

      expect(result).toEqual(updatedNotification);
      expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith(notificationId, userId);
    });

    it('should throw NotFoundException if notification not found', async () => {
      mockNotificationsService.markAsRead.mockRejectedValue(
        new NotFoundException('Notification not found')
      );

      await expect(controller.markAsRead(userId, notificationId)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw NotFoundException if notification belongs to different user', async () => {
      mockNotificationsService.markAsRead.mockRejectedValue(
        new NotFoundException('Notification not found')
      );

      await expect(controller.markAsRead(userId, 'different-notif')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('markAllAsRead', () => {
    const userId = 'user-1';

    it('should mark all notifications as read', async () => {
      mockNotificationsService.markAllAsRead.mockResolvedValue({ count: 5 });

      const result = await controller.markAllAsRead(userId);

      expect(result).toEqual({ success: true });
      expect(mockNotificationsService.markAllAsRead).toHaveBeenCalledWith(userId);
    });

    it('should return success even if no notifications were updated', async () => {
      mockNotificationsService.markAllAsRead.mockResolvedValue({ count: 0 });

      const result = await controller.markAllAsRead(userId);

      expect(result).toEqual({ success: true });
    });

    it('should handle errors from service', async () => {
      mockNotificationsService.markAllAsRead.mockRejectedValue(new Error('Database error'));

      await expect(controller.markAllAsRead(userId)).rejects.toThrow('Database error');
    });
  });

  describe('Authentication', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', NotificationsController);
      expect(guards).toBeDefined();
      expect(guards.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    const userId = 'user-1';

    it('should handle very large pagination limits', async () => {
      const mockResponse = {
        notifications: [],
        pagination: {
          total: 0,
          limit: 1000,
          offset: 0,
          hasMore: false,
        },
        unreadCount: 0,
      };

      mockNotificationsService.getUserNotifications.mockResolvedValue(mockResponse);

      await controller.getNotifications(userId, undefined, '1000');

      expect(mockNotificationsService.getUserNotifications).toHaveBeenCalledWith(userId, {
        unreadOnly: false,
        limit: 1000,
        offset: 0,
      });
    });

    it('should handle negative offset values', async () => {
      const mockResponse = {
        notifications: [],
        pagination: {
          total: 0,
          limit: 20,
          offset: -10,
          hasMore: false,
        },
        unreadCount: 0,
      };

      mockNotificationsService.getUserNotifications.mockResolvedValue(mockResponse);

      await controller.getNotifications(userId, undefined, undefined, '-10');

      expect(mockNotificationsService.getUserNotifications).toHaveBeenCalledWith(userId, {
        unreadOnly: false,
        limit: 20,
        offset: -10,
      });
    });

    it('should handle concurrent mark as read requests', async () => {
      const notifications = ['notif-1', 'notif-2', 'notif-3'];
      const mockNotification = {
        id: 'notif-1',
        userId,
        type: NotificationType.HACKATHON_REGISTRATION,
        title: 'Test',
        message: 'Test',
        readAt: new Date(),
        createdAt: new Date(),
      };

      mockNotificationsService.markAsRead.mockResolvedValue(mockNotification);

      const promises = notifications.map(notifId => controller.markAsRead(userId, notifId));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(mockNotificationsService.markAsRead).toHaveBeenCalledTimes(3);
    });
  });
});
