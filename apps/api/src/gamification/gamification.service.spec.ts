import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { prismaMock, resetPrismaMock } from '../../test/utils/prisma-mock';

describe('GamificationService', () => {
  let service: GamificationService;

  beforeEach(async () => {
    resetPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return existing gamification profile with progress', async () => {
      const mockProfile = {
        userId: 'user-1',
        xp: 500,
        level: 5,
        streakDays: 10,
        lastActivityAt: new Date(),
        vaultKeys: 5,
        badges: ['badge-1', 'badge-2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockEvents = [
        {
          id: 'event-1',
          eventType: 'SIGNUP',
          points: 50,
          refType: 'USER',
          refId: 'user-1',
          metadata: null,
          createdAt: new Date(),
        },
      ];

      prismaMock.gamificationProfile.findUnique.mockResolvedValue(mockProfile);
      prismaMock.xpEvent.findMany.mockResolvedValue(mockEvents);

      const result = await service.getUserProfile('user-1');

      expect(result).toHaveProperty('userId', 'user-1');
      expect(result).toHaveProperty('xp', 500);
      expect(result).toHaveProperty('level', 5);
      expect(result).toHaveProperty('xpToNextLevel');
      expect(result).toHaveProperty('currentLevelXp');
      expect(result).toHaveProperty('nextLevelXp');
      expect(result).toHaveProperty('recentXpEvents');
      expect(result.recentXpEvents).toHaveLength(1);
    });

    it('should create profile if not exists', async () => {
      const newProfile = {
        userId: 'user-1',
        xp: 0,
        level: 1,
        streakDays: 0,
        lastActivityAt: null,
        vaultKeys: 0,
        badges: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.gamificationProfile.findUnique.mockResolvedValue(null);
      prismaMock.gamificationProfile.create.mockResolvedValue(newProfile);
      prismaMock.xpEvent.findMany.mockResolvedValue([]);

      const result = await service.getUserProfile('user-1');

      expect(result.userId).toBe('user-1');
      expect(result.xp).toBe(0);
      expect(result.level).toBe(1);
      expect(prismaMock.gamificationProfile.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          xp: 0,
          level: 1,
          streakDays: 0,
          vaultKeys: 0,
          badges: [],
        },
      });
    });
  });

  describe('awardXp', () => {
    it('should award XP and update level', async () => {
      const profile = {
        userId: 'user-1',
        xp: 450,
        level: 4,
        streakDays: 0,
        lastActivityAt: null,
        vaultKeys: 0,
        badges: [],
      };

      prismaMock.xpEvent.create.mockResolvedValue({});
      prismaMock.gamificationProfile.findUnique.mockResolvedValue(profile);
      prismaMock.gamificationProfile.update.mockResolvedValue({});

      await service.awardXp('user-1', 'CHALLENGE_COMPLETE', 100, 'CHALLENGE', 'challenge-1');

      expect(prismaMock.xpEvent.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          eventType: 'CHALLENGE_COMPLETE',
          points: 100,
          refType: 'CHALLENGE',
          refId: 'challenge-1',
          metadata: undefined,
        },
      });

      expect(prismaMock.gamificationProfile.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          xp: 550, // 450 + 100
          level: 4, // Level 5 requires 1000 XP, so at 550 still level 4
          lastActivityAt: expect.any(Date),
        },
      });
    });

    it('should not level up if XP threshold not reached', async () => {
      const profile = {
        userId: 'user-1',
        xp: 300,
        level: 3,
        streakDays: 0,
        lastActivityAt: null,
        vaultKeys: 0,
        badges: [],
      };

      prismaMock.xpEvent.create.mockResolvedValue({});
      prismaMock.gamificationProfile.findUnique.mockResolvedValue(profile);
      prismaMock.gamificationProfile.update.mockResolvedValue({});

      await service.awardXp('user-1', 'DAILY_LOGIN', 50);

      expect(prismaMock.gamificationProfile.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          xp: 350,
          level: 3, // Should stay at level 3
          lastActivityAt: expect.any(Date),
        },
      });
    });

    it('should create profile if not exists before awarding XP', async () => {
      const newProfile = {
        userId: 'user-1',
        xp: 0,
        level: 1,
        streakDays: 0,
        lastActivityAt: null,
        vaultKeys: 0,
        badges: [],
      };

      prismaMock.xpEvent.create.mockResolvedValue({});
      prismaMock.gamificationProfile.findUnique.mockResolvedValue(null);
      prismaMock.gamificationProfile.create.mockResolvedValue(newProfile);
      prismaMock.gamificationProfile.update.mockResolvedValue({});

      await service.awardXp('user-1', 'TEST', 100);

      expect(prismaMock.gamificationProfile.create).toHaveBeenCalled();
      expect(prismaMock.gamificationProfile.update).toHaveBeenCalled();
    });
  });

  describe('awardBadge', () => {
    it('should award badge to user', async () => {
      const profile = {
        userId: 'user-1',
        xp: 100,
        level: 2,
        streakDays: 0,
        lastActivityAt: null,
        vaultKeys: 0,
        badges: ['existing-badge'],
      };

      prismaMock.gamificationProfile.findUnique.mockResolvedValue(profile);
      prismaMock.gamificationProfile.update.mockResolvedValue({});

      await service.awardBadge('user-1', 'new-badge');

      expect(prismaMock.gamificationProfile.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          badges: {
            push: 'new-badge',
          },
        },
      });
    });

    it('should not award duplicate badge', async () => {
      const profile = {
        userId: 'user-1',
        xp: 100,
        level: 2,
        streakDays: 0,
        lastActivityAt: null,
        vaultKeys: 0,
        badges: ['badge-1', 'existing-badge'],
      };

      prismaMock.gamificationProfile.findUnique.mockResolvedValue(profile);

      await service.awardBadge('user-1', 'existing-badge');

      expect(prismaMock.gamificationProfile.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if profile not found', async () => {
      prismaMock.gamificationProfile.findUnique.mockResolvedValue(null);

      await expect(service.awardBadge('non-existent', 'badge-1')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard sorted by XP', async () => {
      const profiles = [
        {
          userId: 'user-1',
          xp: 1000,
          level: 10,
          badges: [],
          user: { id: 'user-1', name: 'User 1', handle: 'user1', avatarUrl: null },
        },
        {
          userId: 'user-2',
          xp: 800,
          level: 8,
          badges: [],
          user: { id: 'user-2', name: 'User 2', handle: 'user2', avatarUrl: null },
        },
        {
          userId: 'user-3',
          xp: 600,
          level: 6,
          badges: [],
          user: { id: 'user-3', name: 'User 3', handle: 'user3', avatarUrl: null },
        },
      ];

      prismaMock.gamificationProfile.findMany.mockResolvedValue(profiles);

      const result = await service.getLeaderboard('GLOBAL', 'ALLTIME', undefined, 100);

      expect(result).toHaveLength(3);
      expect(result[0].xp).toBe(1000);
      expect(result[0].rank).toBe(1);
      expect(result[1].xp).toBe(800);
      expect(result[1].rank).toBe(2);
      expect(result[2].xp).toBe(600);
      expect(result[2].rank).toBe(3);
    });

    it('should respect limit parameter', async () => {
      prismaMock.gamificationProfile.findMany.mockResolvedValue([]);

      await service.getLeaderboard('GLOBAL', 'ALLTIME', undefined, 50);

      expect(prismaMock.gamificationProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        })
      );
    });
  });

  describe('getAllBadges', () => {
    it('should return all badges sorted by XP and name', async () => {
      const badges = [
        { id: 'badge-1', slug: 'badge-1', name: 'Badge 1', xpRequired: 100 },
        { id: 'badge-2', slug: 'badge-2', name: 'Badge 2', xpRequired: 200 },
      ];

      prismaMock.badge.findMany.mockResolvedValue(badges);

      const result = await service.getAllBadges();

      expect(result).toEqual(badges);
      expect(prismaMock.badge.findMany).toHaveBeenCalledWith({
        orderBy: [{ xpRequired: 'asc' }, { name: 'asc' }],
      });
    });
  });

  describe('createBadge', () => {
    it('should create new badge', async () => {
      const badgeData = {
        slug: 'test-badge',
        name: 'Test Badge',
        description: 'Test description',
        icon: 'icon-url',
        xpRequired: 500,
        rarity: 'rare',
      };

      const createdBadge = { id: 'badge-1', ...badgeData };

      prismaMock.badge.create.mockResolvedValue(createdBadge);

      const result = await service.createBadge(badgeData);

      expect(result).toEqual(createdBadge);
      expect(prismaMock.badge.create).toHaveBeenCalledWith({
        data: badgeData,
      });
    });
  });

  describe('getUserXpEvents', () => {
    it('should return user XP events history', async () => {
      const events = [
        {
          id: 'event-1',
          userId: 'user-1',
          eventType: 'SIGNUP',
          points: 50,
          createdAt: new Date(),
        },
        {
          id: 'event-2',
          userId: 'user-1',
          eventType: 'DAILY_LOGIN',
          points: 5,
          createdAt: new Date(),
        },
      ];

      prismaMock.xpEvent.findMany.mockResolvedValue(events);

      const result = await service.getUserXpEvents('user-1', 50);

      expect(result).toEqual(events);
      expect(prismaMock.xpEvent.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });
  });

  describe('updateDailyStreak', () => {
    it('should initialize streak for first activity', async () => {
      const profile = {
        userId: 'user-1',
        xp: 100,
        level: 2,
        streakDays: 0,
        lastActivityAt: null,
        vaultKeys: 0,
        badges: [],
      };

      prismaMock.gamificationProfile.findUnique.mockResolvedValue(profile);
      prismaMock.gamificationProfile.update.mockResolvedValue({});
      prismaMock.xpEvent.create.mockResolvedValue({});

      await service.updateDailyStreak('user-1');

      expect(prismaMock.gamificationProfile.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          streakDays: 1,
          lastActivityAt: expect.any(Date),
        },
      });
    });

    it('should increment streak for consecutive day', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const profile = {
        userId: 'user-1',
        xp: 100,
        level: 2,
        streakDays: 5,
        lastActivityAt: yesterday,
        vaultKeys: 0,
        badges: [],
      };

      prismaMock.gamificationProfile.findUnique.mockResolvedValue(profile);
      prismaMock.gamificationProfile.update.mockResolvedValue({});
      prismaMock.xpEvent.create.mockResolvedValue({});

      await service.updateDailyStreak('user-1');

      expect(prismaMock.gamificationProfile.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          streakDays: 6,
          lastActivityAt: expect.any(Date),
        },
      });
    });

    it('should reset streak if more than one day passed', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const profile = {
        userId: 'user-1',
        xp: 100,
        level: 2,
        streakDays: 10,
        lastActivityAt: threeDaysAgo,
        vaultKeys: 0,
        badges: [],
      };

      prismaMock.gamificationProfile.findUnique.mockResolvedValue(profile);
      prismaMock.gamificationProfile.update.mockResolvedValue({});
      prismaMock.xpEvent.create.mockResolvedValue({});

      await service.updateDailyStreak('user-1');

      expect(prismaMock.gamificationProfile.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          streakDays: 1,
          lastActivityAt: expect.any(Date),
        },
      });
    });

    it('should not update if already logged in today', async () => {
      const now = new Date();

      const profile = {
        userId: 'user-1',
        xp: 100,
        level: 2,
        streakDays: 5,
        lastActivityAt: now,
        vaultKeys: 0,
        badges: [],
      };

      prismaMock.gamificationProfile.findUnique.mockResolvedValue(profile);

      await service.updateDailyStreak('user-1');

      expect(prismaMock.gamificationProfile.update).not.toHaveBeenCalled();
    });

    it('should award streak bonus badges at milestones', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const profile = {
        userId: 'user-1',
        xp: 100,
        level: 2,
        streakDays: 6, // Will become 7
        lastActivityAt: yesterday,
        vaultKeys: 0,
        badges: [],
      };

      prismaMock.gamificationProfile.findUnique.mockResolvedValue(profile);
      prismaMock.gamificationProfile.update.mockResolvedValue({});
      prismaMock.xpEvent.create.mockResolvedValue({});

      await service.updateDailyStreak('user-1');

      // Should award streak bonus
      expect(prismaMock.xpEvent.create).toHaveBeenCalledTimes(2); // DAILY_LOGIN + STREAK_BONUS_7DAYS
    });
  });
});
