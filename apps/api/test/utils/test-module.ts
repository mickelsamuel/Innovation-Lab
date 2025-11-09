import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/common/prisma/prisma.service';
import { prismaMock } from './prisma-mock';

/**
 * Create a testing module with common mocks
 */
export async function createTestingModule(
  providers: any[],
  imports: any[] = []
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
  providers: any[],
  imports: any[] = [],
  prismaOverride: any = prismaMock
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
