import { PrismaClient } from '@innovation-lab/database';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

export const prismaMock = mockDeep<PrismaClient>();

export function resetPrismaMock() {
  mockReset(prismaMock);
}

export function createMockPrismaClient(): MockPrismaClient {
  return mockDeep<PrismaClient>();
}
