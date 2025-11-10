import { Test, TestingModule } from '@nestjs/testing';
import { Type, DynamicModule } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { prismaMock } from './prisma-mock';

/**
 * Create a testing module with common mocks
 */
export async function createTestingModule(
  providers: (Type<unknown> | Record<string, unknown>)[],
  imports: (Type<unknown> | DynamicModule)[] = []
): Promise<TestingModule> {
  return Test.createTestingModule({
    imports,
    providers: [
      ...providers,
      {
        provide: PrismaService,
        useValue: prismaMock,
      },
    ],
  }).compile();
}

/**
 * Create a testing module with PrismaService override
 */
export async function createTestingModuleWithPrisma(
  providers: (Type<unknown> | Record<string, unknown>)[],
  imports: (Type<unknown> | DynamicModule)[] = [],
  prismaOverride: Record<string, unknown> = prismaMock
): Promise<TestingModule> {
  return Test.createTestingModule({
    imports,
    providers: [
      ...providers,
      {
        provide: PrismaService,
        useValue: prismaOverride,
      },
    ],
  }).compile();
}
