import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { prismaMock, resetPrismaMock } from '../../test/utils/prisma-mock';
import { TestDataFactory } from '../../test/utils/test-data-factory';
import * as bcrypt from 'bcryptjs';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    resetPrismaMock();
    TestDataFactory.resetCounters();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'john@test.com',
        name: 'John Doe',
        handle: 'johndoe',
        avatarUrl: null,
        bio: 'Test bio',
        organization: 'Test Org',
        roles: ['PARTICIPANT'],
        createdAt: new Date(),
        lastLoginAt: new Date(),
        gamificationProfile: {
          xp: 100,
          level: 2,
          streakDays: 5,
          vaultKeys: 3,
          badges: [],
        },
        _count: {
          teamMemberships: 2,
          challengeSubmissions: 5,
          mentorProfiles: 0,
          judgeAssignments: 0,
        },
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await service.findOne('user-1');

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent')).rejects.toThrow('User not found');
    });
  });

  describe('findByHandle', () => {
    it('should return a user by handle', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'John Doe',
        handle: 'johndoe',
        avatarUrl: null,
        bio: 'Test bio',
        organization: 'Test Org',
        roles: ['PARTICIPANT'],
        createdAt: new Date(),
        gamificationProfile: {
          xp: 100,
          level: 2,
          badges: [],
        },
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await service.findByHandle('johndoe');

      expect(result).toEqual(mockUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { handle: 'johndoe' },
        select: expect.any(Object),
      });
    });

    it('should handle handle case-insensitively', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'John Doe',
        handle: 'johndoe',
        avatarUrl: null,
        bio: null,
        organization: null,
        roles: ['PARTICIPANT'],
        createdAt: new Date(),
        gamificationProfile: {
          xp: 100,
          level: 2,
          badges: [],
        },
      };

      prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

      await service.findByHandle('JohnDoe');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { handle: 'johndoe' },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.findByHandle('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findByHandle('nonexistent')).rejects.toThrow('User not found');
    });
  });

  describe('updateProfile', () => {
    const updateDto = {
      name: 'John Updated',
      bio: 'Updated bio',
      organization: 'New Org',
    };

    it('should successfully update user profile', async () => {
      const existingUser = TestDataFactory.createUser({ id: 'user-1' });
      const updatedUser = { ...existingUser, ...updateDto };

      prismaMock.user.update.mockResolvedValue(updatedUser as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const result = await service.updateProfile('user-1', updateDto);

      expect(result).toEqual(updatedUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          name: updateDto.name,
          bio: updateDto.bio,
          organization: updateDto.organization,
        }),
        select: expect.any(Object),
      });
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should update handle and check for conflicts', async () => {
      const updateWithHandle = { ...updateDto, handle: 'newhandle' };

      prismaMock.user.findUnique.mockResolvedValue(null); // No conflict
      prismaMock.user.update.mockResolvedValue({
        id: 'user-1',
        ...updateWithHandle,
      } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      await service.updateProfile('user-1', updateWithHandle);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { handle: 'newhandle' },
      });
    });

    it('should throw ConflictException if handle already taken', async () => {
      const updateWithHandle = { ...updateDto, handle: 'existinghandle' };
      const conflictingUser = TestDataFactory.createUser({
        id: 'user-2',
        handle: 'existinghandle',
      });

      prismaMock.user.findUnique.mockResolvedValue(conflictingUser as any);

      await expect(service.updateProfile('user-1', updateWithHandle)).rejects.toThrow(
        ConflictException
      );
      await expect(service.updateProfile('user-1', updateWithHandle)).rejects.toThrow(
        'Handle already taken'
      );

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
    };

    it('should successfully change password', async () => {
      const hashedOldPassword = bcrypt.hashSync(changePasswordDto.currentPassword, 10);
      const user = {
        password: hashedOldPassword,
      };

      prismaMock.user.findUnique.mockResolvedValue(user as any);
      prismaMock.user.update.mockResolvedValue({ password: 'new-hash' } as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const result = await service.changePassword('user-1', changePasswordDto);

      expect(result).toEqual({ success: true, message: 'Password changed successfully' });

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { password: true },
      });

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          password: expect.any(String),
        },
      });

      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if current password is incorrect', async () => {
      const hashedPassword = bcrypt.hashSync('DifferentPassword123!', 10);
      const user = {
        password: hashedPassword,
      };

      prismaMock.user.findUnique.mockResolvedValue(user as any);

      await expect(service.changePassword('user-1', changePasswordDto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.changePassword('user-1', changePasswordDto)).rejects.toThrow(
        'Current password is incorrect'
      );

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if user not found or has no password', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.changePassword('non-existent', changePasswordDto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.changePassword('non-existent', changePasswordDto)).rejects.toThrow(
        'Invalid operation'
      );

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if user has no password (OAuth)', async () => {
      const user = {
        password: null,
      };

      prismaMock.user.findUnique.mockResolvedValue(user as any);

      await expect(service.changePassword('user-1', changePasswordDto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.changePassword('user-1', changePasswordDto)).rejects.toThrow(
        'Invalid operation'
      );

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return user statistics', async () => {
      const mockProfile = {
        xp: 500,
        level: 5,
        streakDays: 10,
        vaultKeys: 5,
        badges: [],
      };

      prismaMock.gamificationProfile.findUnique.mockResolvedValue(mockProfile as any);
      prismaMock.teamMember.count.mockResolvedValue(3);
      prismaMock.submission.count.mockResolvedValue(8);
      prismaMock.challengeSubmission.count.mockResolvedValue(12);

      const result = await service.getStats('user-1');

      expect(result).toEqual({
        gamification: mockProfile,
        teams: 3,
        submissions: 8,
        challenges: 12,
      });
    });

    it('should return default gamification stats if profile not found', async () => {
      prismaMock.gamificationProfile.findUnique.mockResolvedValue(null);
      prismaMock.teamMember.count.mockResolvedValue(0);
      prismaMock.submission.count.mockResolvedValue(0);
      prismaMock.challengeSubmission.count.mockResolvedValue(0);

      const result = await service.getStats('user-1');

      expect(result.gamification).toEqual({
        xp: 0,
        level: 1,
        streakDays: 0,
        vaultKeys: 0,
        badges: [],
      });
    });
  });

  describe('search', () => {
    it('should search users by query', async () => {
      const mockUsers = [
        TestDataFactory.createUser({ name: 'John Doe', handle: 'johndoe' }),
        TestDataFactory.createUser({ name: 'Jane Doe', handle: 'janedoe' }),
      ];

      prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

      const result = await service.search('doe', 10);

      expect(result).toEqual(mockUsers);
      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'doe', mode: 'insensitive' } },
            { handle: { contains: 'doe', mode: 'insensitive' } },
            { email: { contains: 'doe', mode: 'insensitive' } },
          ],
          isActive: true,
          isBanned: false,
        },
        select: expect.any(Object),
        take: 10,
      });
    });

    it('should respect limit parameter', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      await service.search('test', 5);

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
    });

    it('should return empty array if no users found', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);

      const result = await service.search('nonexistent', 10);

      expect(result).toEqual([]);
    });
  });

  describe('getActivityFeed', () => {
    it('should return user activity feed', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          eventType: 'SIGNUP',
          points: 50,
          refType: 'USER',
          refId: 'user-1',
          createdAt: new Date(),
        },
        {
          id: 'event-2',
          eventType: 'DAILY_LOGIN',
          points: 5,
          refType: null,
          refId: null,
          createdAt: new Date(),
        },
      ];

      prismaMock.xpEvent.findMany.mockResolvedValue(mockEvents as any);

      const result = await service.getActivityFeed('user-1', 20);

      expect(result).toEqual(mockEvents);
      expect(prismaMock.xpEvent.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: expect.any(Object),
      });
    });

    it('should respect limit parameter', async () => {
      prismaMock.xpEvent.findMany.mockResolvedValue([]);

      await service.getActivityFeed('user-1', 50);

      expect(prismaMock.xpEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        })
      );
    });
  });

  describe('deleteAccount', () => {
    it('should successfully delete user account (soft delete)', async () => {
      prismaMock.user.update.mockResolvedValue({} as any);
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const result = await service.deleteAccount('user-1');

      expect(result).toEqual({ success: true, message: 'Account deleted successfully' });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          isActive: false,
          email: 'deleted_user-1@deleted.com',
          handle: 'deleted_user-1',
        },
      });
      expect(prismaMock.auditLog.create).toHaveBeenCalled();
    });
  });
});
