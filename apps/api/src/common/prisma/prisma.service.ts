import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@innovation-lab/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'pretty',
    });

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      // @ts-expect-error - Prisma event types
      this.$on('query' as any, (e: any) => {
        this.logger.debug(`Query: ${e.query} - Duration: ${e.duration}ms`);
      });
    }

    // @ts-expect-error - Prisma event types
    this.$on('error' as any, (e: any) => {
      this.logger.error(`Prisma error: ${e.message}`);
    });

    // @ts-expect-error - Prisma event types
    this.$on('warn' as any, (e: any) => {
      this.logger.warn(`Prisma warning: ${e.message}`);
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Successfully connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }

  /**
   * Clean database (for testing only)
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && !key.startsWith('_') && !key.startsWith('$')
    ) as string[];

    for (const model of models) {
      try {
        // @ts-expect-error - Dynamic model access
        await this[model].deleteMany();
      } catch (error) {
        this.logger.warn(`Could not clean ${model}: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Execute raw query with safety checks
   */
  async executeRaw(query: string, ...args: any[]) {
    if (process.env.NODE_ENV === 'production') {
      this.logger.warn('Executing raw query in production', { query });
    }
    return this.$executeRawUnsafe(query, ...args);
  }
}
