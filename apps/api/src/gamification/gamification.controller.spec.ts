import { Test, TestingModule } from '@nestjs/testing';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';

describe('GamificationController', () => {
  let controller: GamificationController;
  let service: GamificationService;

  const mockGamificationService = {
    getUserProfile: jest.fn(),
    getLeaderboard: jest.fn(),
    getAllBadges: jest.fn(),
    createBadge: jest.fn(),
    getUserXpEvents: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamificationController],
      providers: [
        {
          provide: GamificationService,
          useValue: mockGamificationService,
        },
      ],
    }).compile();

    controller = module.get<GamificationController>(GamificationController);
    service = module.get<GamificationService>(GamificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyProfile', () => {
    it('should return user gamification profile', async () => {
      const profile = { userId: 'user-1', xp: 500, level: 5 };
      mockGamificationService.getUserProfile.mockResolvedValue(profile);

      const req = { user: { id: 'user-1' } };
      const result = await controller.getMyProfile(req as any);

      expect(result).toEqual(profile);
      expect(service.getUserProfile).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getUserProfile', () => {
    it('should return user gamification profile by ID', async () => {
      const profile = { userId: 'user-2', xp: 300, level: 3 };
      mockGamificationService.getUserProfile.mockResolvedValue(profile);

      const result = await controller.getUserProfile('user-2');

      expect(result).toEqual(profile);
      expect(service.getUserProfile).toHaveBeenCalledWith('user-2');
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard', async () => {
      const leaderboard = [{ userId: 'u1', xp: 1000, rank: 1 }];
      const query = { scope: 'GLOBAL', period: 'ALLTIME', scopeId: undefined, limit: 100 };
      mockGamificationService.getLeaderboard.mockResolvedValue(leaderboard);

      const result = await controller.getLeaderboard(query as any);

      expect(result).toEqual(leaderboard);
      expect(service.getLeaderboard).toHaveBeenCalledWith('GLOBAL', 'ALLTIME', undefined, 100);
    });

    it('should return leaderboard with defaults', async () => {
      const leaderboard = [{ userId: 'u1', xp: 1000, rank: 1 }];
      const query = {};
      mockGamificationService.getLeaderboard.mockResolvedValue(leaderboard);

      const result = await controller.getLeaderboard(query as any);

      expect(result).toEqual(leaderboard);
      expect(service.getLeaderboard).toHaveBeenCalledWith(undefined, undefined, undefined, undefined);
    });
  });

  describe('getAllBadges', () => {
    it('should return all badges', async () => {
      const badges = [{ id: 'b1', slug: 'badge-1', name: 'Badge 1' }];
      mockGamificationService.getAllBadges.mockResolvedValue(badges);

      const result = await controller.getAllBadges();

      expect(result).toEqual(badges);
      expect(service.getAllBadges).toHaveBeenCalled();
    });
  });

  describe('createBadge', () => {
    it('should create a badge', async () => {
      const createDto = { slug: 'new-badge', name: 'New Badge' } as any;
      const badge = { id: 'b1', ...createDto };
      mockGamificationService.createBadge.mockResolvedValue(badge);

      const result = await controller.createBadge(createDto);

      expect(result).toEqual(badge);
      expect(service.createBadge).toHaveBeenCalledWith(createDto);
    });
  });

  describe('getUserXpEvents', () => {
    it('should return user XP events', async () => {
      const events = [{ id: 'e1', eventType: 'SIGNUP', points: 50 }];
      mockGamificationService.getUserXpEvents.mockResolvedValue(events);

      const result = await controller.getUserXpEvents('user-1', 50);

      expect(result).toEqual(events);
      expect(service.getUserXpEvents).toHaveBeenCalledWith('user-1', 50);
    });

    it('should use default limit', async () => {
      const events = [{ id: 'e1', eventType: 'SIGNUP', points: 50 }];
      mockGamificationService.getUserXpEvents.mockResolvedValue(events);

      const result = await controller.getUserXpEvents('user-1', undefined);

      expect(result).toEqual(events);
      expect(service.getUserXpEvents).toHaveBeenCalledWith('user-1', 50);
    });
  });
});
