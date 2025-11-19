import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
// import { BullModule } from '@nestjs/bullmq'; // Temporarily disabled
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';

import { validate } from './common/config/env.validation';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './common/health/health.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HackathonsModule } from './hackathons/hackathons.module';
import { TeamsModule } from './teams/teams.module';
import { InvitationsModule } from './invitations/invitations.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { JudgingModule } from './judging/judging.module';
import { ModerationModule } from './moderation/moderation.module';
import { ChallengesModule } from './challenges/challenges.module';
import { GamificationModule } from './gamification/gamification.module';
import { FilesModule } from './files/files.module';
import { MentorsModule } from './mentors/mentors.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WebSocketModule } from './websocket/websocket.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['../../.env.e2e', '../../.env.local', '../../.env'],
      validate,
    }),

    // Logging - pino-pretty transport disabled (uses worker threads that cause issues)
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get('LOG_LEVEL', 'info'),
          // transport:
          //   config.get('NODE_ENV') === 'development'
          //     ? {
          //         target: 'pino-pretty',
          //         options: {
          //           colorize: true,
          //           translateTime: 'HH:MM:ss Z',
          //           ignore: 'pid,hostname',
          //         },
          //       }
          //     : undefined,
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              '*.password',
              '*.secret',
              '*.token',
            ],
            remove: true,
          },
        },
      }),
    }),

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('RATE_LIMIT_TTL', 60) * 1000,
          limit: config.get<number>('RATE_LIMIT_MAX', 100),
        },
      ],
    }),

    // Task Scheduling
    ScheduleModule.forRoot(),

    // Background Jobs (BullMQ) - Temporarily disabled due to worker.js issues
    // BullModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     connection: {
    //       host: config.get('REDIS_HOST', 'localhost'),
    //       port: config.get<number>('REDIS_PORT', 6379),
    //       password: config.get('REDIS_PASSWORD'),
    //     },
    //   }),
    // }),

    // Core modules
    PrismaModule,
    HealthModule,

    // Feature modules
    AuthModule,
    UsersModule,
    HackathonsModule,
    TeamsModule,
    InvitationsModule,
    SubmissionsModule,
    JudgingModule,
    ModerationModule,
    ChallengesModule,
    GamificationModule,
    FilesModule,
    MentorsModule,
    NotificationsModule,
    WebSocketModule,
    AnalyticsModule,
  ],
  providers: [
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
