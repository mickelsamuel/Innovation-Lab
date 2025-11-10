import {
  Injectable,
  HttpException,
  HttpStatus,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { HackathonStatus } from '@innovation-lab/database';
import { createClient, RedisClientType } from 'redis';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  services: {
    database: 'up' | 'down';
    redis?: 'up' | 'down';
  };
  version: string;
  uptime: number;
}

@Injectable()
export class HealthService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClientType | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  async onModuleInit() {
    const redisUrl = this.config.get<string>('REDIS_URL');
    if (redisUrl) {
      try {
        this.redisClient = createClient({ url: redisUrl });
        this.redisClient.on('error', err => console.error('Redis Client Error', err));
        await this.redisClient.connect();
      } catch (error) {
        console.warn('Failed to connect to Redis:', error);
        this.redisClient = null;
      }
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  async check(): Promise<HealthCheckResult> {
    const checks = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
    };

    const isHealthy = Object.values(checks).every(status => status === 'up');

    const result: HealthCheckResult = {
      status: isHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      services: checks,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
    };

    if (!isHealthy) {
      throw new HttpException(result, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return result;
  }

  async checkReadiness(): Promise<{ status: string; ready: boolean }> {
    try {
      const dbCheck = await this.checkDatabase();
      const ready = dbCheck === 'up';

      if (!ready) {
        throw new HttpException(
          { status: 'not ready', ready: false },
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      return { status: 'ready', ready: true };
    } catch (error) {
      throw new HttpException(
        { status: 'not ready', ready: false, error: (error as Error).message },
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }

  private async checkDatabase(): Promise<'up' | 'down'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'up';
    } catch (error) {
      console.error('Database health check failed:', error);
      return 'down';
    }
  }

  private async checkRedis(): Promise<'up' | 'down'> {
    if (!this.redisClient) {
      // Redis is optional, return 'up' if not configured
      return 'up';
    }

    try {
      const result = await this.redisClient.ping();
      return result === 'PONG' ? 'up' : 'down';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return 'down';
    }
  }

  async getPlatformStats() {
    try {
      // Get active users (users who logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activePlayersCount = await this.prisma.user.count({
        where: {
          lastLoginAt: {
            gte: thirtyDaysAgo,
          },
        },
      });

      // Get total hackathons completed (status = CLOSED or JUDGING)
      const totalHackathonsCompleted = await this.prisma.hackathon.count({
        where: {
          status: {
            in: [HackathonStatus.CLOSED, HackathonStatus.JUDGING],
          },
        },
      });

      // Calculate total prize money from completed hackathons
      const hackathons = await this.prisma.hackathon.findMany({
        where: {
          status: {
            in: [HackathonStatus.CLOSED, HackathonStatus.JUDGING],
          },
        },
        select: {
          prizePool: true,
        },
      });

      const totalPrizeMoney = hackathons.reduce((sum, h) => {
        const poolAmount = typeof h.prizePool === 'number' ? h.prizePool : Number(h.prizePool || 0);
        return sum + poolAmount;
      }, 0);

      // Count unique partner organizations (from hackathon sponsors)
      // For now, we'll use a simple count - you can enhance this with sponsor data
      const partnerCount = await this.prisma.hackathon.count({
        where: {
          status: {
            in: [HackathonStatus.UPCOMING, HackathonStatus.LIVE, HackathonStatus.CLOSED],
          },
        },
      });

      return {
        activePlayersCount,
        totalPrizeMoney,
        totalHackathonsCompleted,
        partnerCount,
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      // Return default stats on error
      return {
        activePlayersCount: 0,
        totalPrizeMoney: 0,
        totalHackathonsCompleted: 0,
        partnerCount: 0,
      };
    }
  }
}
