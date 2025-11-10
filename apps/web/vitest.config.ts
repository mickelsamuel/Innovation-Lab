import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()] as any,
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/',
        '.next/',
        '**/app/**', // Next.js pages - tested via E2E
        'src/lib/api.ts', // API wrapper - integration tested
        'src/lib/auth.ts', // Auth API - integration tested
        'src/lib/challenges.ts', // Challenges API - integration tested
        'src/lib/hackathons.ts', // Hackathons API - integration tested
        'src/lib/teams.ts', // Teams API - integration tested
        'src/lib/submissions.ts', // Submissions API - integration tested
        'src/lib/judging.ts', // Judging API - integration tested
        'src/lib/gamification.ts', // Gamification API - integration tested
        '**/types/**', // Type definitions only
        'src/components/ui/index.ts', // Re-export only
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.next', 'e2e'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
