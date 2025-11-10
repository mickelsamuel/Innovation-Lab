// Export all Prisma client types and classes
export * from '@prisma/client';

// Export Prisma Service for NestJS
export { PrismaService } from './prisma.service';

// Export Prisma client instance for Next.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
