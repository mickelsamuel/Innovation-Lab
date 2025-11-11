// Jest setup file for E2E tests
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-e2e-testing-only';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key-for-e2e-testing-only';
// Use DATABASE_URL from environment if available (CI), otherwise use local test credentials
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://test:test@localhost:5432/innovationlab_e2e?schema=public';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379/1';

// Increase timeout for E2E tests
jest.setTimeout(30000);
