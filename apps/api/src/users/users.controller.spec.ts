import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    findOne: jest.fn(),
    findByHandle: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    getStats: jest.fn(),
    search: jest.fn(),
    getActivityFeed: jest.fn(),
    deleteAccount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const user = { id: 'user-1', name: 'Test User' };
      mockUsersService.findOne.mockResolvedValue(user);

      const result = await controller.findOne('user-1');

      expect(result).toEqual(user);
      expect(service.findOne).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findByHandle', () => {
    it('should return a user by handle', async () => {
      const user = { id: 'user-1', handle: 'testuser' };
      mockUsersService.findByHandle.mockResolvedValue(user);

      const result = await controller.findByHandle('testuser');

      expect(result).toEqual(user);
      expect(service.findByHandle).toHaveBeenCalledWith('testuser');
    });
  });

  describe('updateMe', () => {
    it('should update user profile', async () => {
      const updateDto = { name: 'Updated Name' };
      const updated = { id: 'user-1', ...updateDto };
      mockUsersService.updateProfile.mockResolvedValue(updated);

      const user = { id: 'user-1' };
      const result = await controller.updateMe(user as any, updateDto);

      expect(result).toEqual(updated);
      expect(service.updateProfile).toHaveBeenCalledWith('user-1', updateDto);
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      const changeDto = { currentPassword: 'old', newPassword: 'new' };
      const response = { success: true, message: 'Password changed' };
      mockUsersService.changePassword.mockResolvedValue(response);

      const user = { id: 'user-1' };
      const result = await controller.changePassword(user as any, changeDto);

      expect(result).toEqual(response);
      expect(service.changePassword).toHaveBeenCalledWith('user-1', changeDto);
    });
  });

  describe('getMe', () => {
    it('should return current user', async () => {
      const userData = { id: 'user-1', name: 'Test User' };
      mockUsersService.findOne.mockResolvedValue(userData);

      const user = { id: 'user-1' };
      const result = await controller.getMe(user as any);

      expect(result).toEqual(userData);
      expect(service.findOne).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getMyStats', () => {
    it('should return user statistics', async () => {
      const stats = { gamification: {}, teams: 5, submissions: 10 };
      mockUsersService.getStats.mockResolvedValue(stats);

      const user = { id: 'user-1' };
      const result = await controller.getMyStats(user as any);

      expect(result).toEqual(stats);
      expect(service.getStats).toHaveBeenCalledWith('user-1');
    });
  });

  describe('search', () => {
    it('should search users', async () => {
      const users = [{ id: 'u1', name: 'User 1' }];
      mockUsersService.search.mockResolvedValue(users);

      const result = await controller.search('test', undefined, 10);

      expect(result).toEqual(users);
      expect(service.search).toHaveBeenCalledWith('test', 10);
    });
  });

  describe('getMyActivity', () => {
    it('should return activity feed', async () => {
      const feed = [{ id: 'e1', eventType: 'SIGNUP' }];
      mockUsersService.getActivityFeed.mockResolvedValue(feed);

      const user = { id: 'user-1' };
      const result = await controller.getMyActivity(user as any, 20);

      expect(result).toEqual(feed);
      expect(service.getActivityFeed).toHaveBeenCalledWith('user-1', 20);
    });
  });

  describe('deleteMe', () => {
    it('should delete user account', async () => {
      const response = { success: true, message: 'Account deleted' };
      mockUsersService.deleteAccount.mockResolvedValue(response);

      const user = { id: 'user-1' };
      const result = await controller.deleteMe(user as any);

      expect(result).toEqual(response);
      expect(service.deleteAccount).toHaveBeenCalledWith('user-1');
    });
  });
});
