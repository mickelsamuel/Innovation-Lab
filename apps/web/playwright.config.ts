import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';

/**
 * Read environment variables from .env.e2e file for E2E tests
 */
dotenv.config({ path: path.resolve(__dirname, '../../.env.e2e') });

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const API_PORT = process.env.API_PORT || 4001; // Use different port to avoid conflicts with API E2E tests
const API_URL = process.env.API_URL || `http://localhost:${API_PORT}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Use multiple workers on CI for parallel execution */
  workers: process.env.CI ? 4 : undefined,
  /* Global timeout for each test */
  timeout: 60000, // 60 seconds per test
  /* Global timeout for expect() assertions */
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: BASE_URL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: process.env.CI
    ? [
        // Only test on Chromium in CI for speed
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
      ]
    : [
        // Test on all browsers locally
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },

        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },

        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },

        /* Test against mobile viewports. */
        {
          name: 'Mobile Chrome',
          use: { ...devices['Pixel 5'] },
        },
        {
          name: 'Mobile Safari',
          use: { ...devices['iPhone 12'] },
        },
      ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'pnpm --filter web dev',
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        NEXT_PUBLIC_API_URL: `${API_URL}/v1`,
      },
    },
    {
      command: 'pnpm --filter api dev',
      url: `${API_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        API_PORT: String(API_PORT),
      },
    },
  ],
});
