import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthService } from './health.service';
import { PrismaService } from '../prisma/prisma.service';
import { HackathonStatus } from '@innovation-lab/database';

describe('HealthService', () => {
  let service: HealthService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
    user: {
      count: jest.fn(),
    },
    hackathon: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('should return healthy status when all services are up', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ 1: 1 }]);

      const result = await service.check();

      expect(result.status).toBe('ok');
      expect(result.services.database).toBe('up');
      expect(result.services.redis).toBe('up');
      expect(result.version).toBeDefined();
      expect(result.uptime).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should throw error when database is down', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('DB connection failed'));

      await expect(service.check()).rejects.toThrow(HttpException);
    });

    it('should include error status when services are down', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('DB connection failed'));

      try {
        await service.check();
      } catch (error) {
        const err = error as HttpException;
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
        const response = err.getResponse();
        expect(response.status).toBe('error');
        expect(response.services.database).toBe('down');
      }
    });
  });

  describe('checkReadiness', () => {
    it('should return ready when database is up', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ 1: 1 }]);

      const result = await service.checkReadiness();

      expect(result.status).toBe('ready');
      expect(result.ready).toBe(true);
    });

    it('should throw error when database is down', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('DB connection failed'));

      await expect(service.checkReadiness()).rejects.toThrow(HttpException);
    });

    it('should include error message in response', async () => {
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('Connection timeout'));

      try {
        await service.checkReadiness();
      } catch (error) {
        const err = error as HttpException;
        expect(err).toBeInstanceOf(HttpException);
        const response = err.getResponse();
        expect(response.status).toBe('not ready');
        expect(response.ready).toBe(false);
        expect(response.error).toBeDefined();
      }
    });
  });

  describe('getPlatformStats', () => {
    it('should return platform statistics', async () => {
      // Mock active users count
      mockPrismaService.user.count.mockResolvedValue(150);

      // Mock completed hackathons count
      mockPrismaService.hackathon.count
        .mockResolvedValueOnce(25) // First call for completed hackathons
        .mockResolvedValueOnce(10); // Second call for partner count

      // Mock hackathons with prize pools
      mockPrismaService.hackathon.findMany.mockResolvedValue([
        { prizePool: 10000 },
        { prizePool: 5000 },
        { prizePool: 15000 },
      ]);

      const result = await service.getPlatformStats();

      expect(result.activePlayersCount).toBe(150);
      expect(result.totalHackathonsCompleted).toBe(25);
      expect(result.totalPrizeMoney).toBe(30000);
      expect(result.partnerCount).toBe(10);
    });

    it('should handle string prize pool values', async () => {
      mockPrismaService.user.count.mockResolvedValue(100);
      mockPrismaService.hackathon.count.mockResolvedValue(10);
      mockPrismaService.hackathon.findMany.mockResolvedValue([
        { prizePool: '5000' }, // String value
        { prizePool: 3000 }, // Number value
      ]);

      const result = await service.getPlatformStats();

      expect(result.totalPrizeMoney).toBe(8000);
    });

    it('should handle null prize pool values', async () => {
      mockPrismaService.user.count.mockResolvedValue(50);
      mockPrismaService.hackathon.count.mockResolvedValue(5);
      mockPrismaService.hackathon.findMany.mockResolvedValue([
        { prizePool: null },
        { prizePool: 2000 },
      ]);

      const result = await service.getPlatformStats();

      expect(result.totalPrizeMoney).toBe(2000);
    });

    it('should return default stats on error', async () => {
      mockPrismaService.user.count.mockRejectedValue(new Error('Database error'));

      const result = await service.getPlatformStats();

      expect(result.activePlayersCount).toBe(0);
      expect(result.totalPrizeMoney).toBe(0);
      expect(result.totalHackathonsCompleted).toBe(0);
      expect(result.partnerCount).toBe(0);
    });

    it('should query users with correct date filter', async () => {
      mockPrismaService.user.count.mockResolvedValue(100);
      mockPrismaService.hackathon.count.mockResolvedValue(5);
      mockPrismaService.hackathon.findMany.mockResolvedValue([]);

      await service.getPlatformStats();

      expect(mockPrismaService.user.count).toHaveBeenCalledWith({
        where: {
          lastLoginAt: {
            gte: expect.any(Date),
          },
        },
      });
    });

    it('should query hackathons with correct status filters', async () => {
      mockPrismaService.user.count.mockResolvedValue(100);
      mockPrismaService.hackathon.count.mockResolvedValue(5);
      mockPrismaService.hackathon.findMany.mockResolvedValue([]);

      await service.getPlatformStats();

      expect(mockPrismaService.hackathon.findMany).toHaveBeenCalledWith({
        where: {
          status: {
            in: [HackathonStatus.CLOSED, HackathonStatus.JUDGING],
          },
        },
        select: {
          prizePool: true,
        },
      });
    });
  });

  describe('checkDatabase', () => {
    it('should return up when database query succeeds', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ 1: 1 }]);

      const result = await service.check();

      expect(result.services.database).toBe('up');
    });

    it('should return down when database query fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockPrismaService.$queryRaw.mockRejectedValue(new Error('Connection failed'));

      try {
        await service.check();
      } catch (error) {
        const response = (error as HttpException).getResponse();
        expect(response.services.database).toBe('down');
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Database health check failed:',
          expect.any(Error)
        );
      }

      consoleErrorSpy.mockRestore();
    });
  });

  describe('checkRedis', () => {
    it('should return up for redis check', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ 1: 1 }]);

      const result = await service.check();

      expect(result.services.redis).toBe('up');
    });
  });
});
