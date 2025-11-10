# Testing Guide

Comprehensive testing documentation for Innovation Lab covering unit tests, integration tests, and end-to-end tests.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Test Architecture](#test-architecture)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Coverage Goals](#coverage-goals)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Run All Tests

```bash
# Run all tests (backend + frontend + E2E)
pnpm test:all

# Run with coverage
pnpm test:cov
```

### Individual Test Suites

```bash
# Backend only
pnpm --filter @innovation-lab/api test

# Frontend only
pnpm --filter @innovation-lab/web test

# E2E only
pnpm --filter @innovation-lab/web test:e2e
```

---

## Test Architecture

### Testing Stack

**Backend (NestJS)**:

- **Framework**: Jest
- **Coverage**: 80%+ target
- **Files**: 32+ test files
- **Location**: `apps/api/src/**/*.spec.ts`

**Frontend (Next.js)**:

- **Framework**: Vitest + React Testing Library
- **Coverage**: 85%+ target
- **Files**: 25+ test files
- **Location**: `apps/web/src/**/*.test.tsx`

**E2E (Full Stack)**:

- **Framework**: Playwright
- **Coverage**: 90%+ user flow coverage
- **Files**: 5+ test files
- **Location**: `apps/web/e2e/*.spec.ts`

### Test Statistics

- **Total Test Files**: 62+
- **Test Cases**: 500+
- **E2E Scenarios**: 67+
- **Backend Tests**: 250+ cases
- **Frontend Tests**: 250+ cases

---

## Running Tests

### Backend Tests

```bash
# Run all backend tests
pnpm --filter @innovation-lab/api test

# Run with coverage
pnpm --filter @innovation-lab/api test:cov

# Watch mode (auto-rerun on changes)
pnpm --filter @innovation-lab/api test:watch

# Run specific module
pnpm --filter @innovation-lab/api test notifications.service.spec

# Debug tests
pnpm --filter @innovation-lab/api test:debug
```

### Frontend Tests

```bash
# Run all frontend tests
pnpm --filter @innovation-lab/web test

# Run with coverage
pnpm --filter @innovation-lab/web test:cov

# Watch mode
pnpm --filter @innovation-lab/web test:watch

# UI mode (Vitest UI)
pnpm --filter @innovation-lab/web test:ui

# Run specific component
pnpm --filter @innovation-lab/web test InviteModal
```

### E2E Tests

```bash
# Run all E2E tests
pnpm --filter @innovation-lab/web test:e2e

# Run with Playwright UI
pnpm --filter @innovation-lab/web test:e2e:ui

# Debug mode
pnpm --filter @innovation-lab/web test:e2e:debug

# Run specific test file
pnpm --filter @innovation-lab/web test:e2e admin-flows.spec

# Run headed (see browser)
pnpm --filter @innovation-lab/web test:e2e --headed
```

---

## Writing Tests

### Backend Unit Tests (Jest)

**Location**: `apps/api/src/**/*.spec.ts`

**Example**:

```typescript
// apps/api/src/notifications/notifications.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: {
            notification: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create a notification', async () => {
      const notification = {
        userId: 'user-123',
        type: 'HACKATHON_REGISTRATION',
        title: 'Test',
        message: 'Test message',
      };

      jest.spyOn(prisma.notification, 'create').mockResolvedValue({
        id: 'notif-123',
        ...notification,
        link: null,
        readAt: null,
        createdAt: new Date(),
      });

      const result = await service.createNotification(notification);

      expect(result).toBeDefined();
      expect(result.id).toBe('notif-123');
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: notification,
      });
    });
  });

  describe('getUserNotifications', () => {
    it('should return paginated notifications', async () => {
      const userId = 'user-123';
      const mockNotifications = [
        {
          id: 'notif-1',
          userId,
          type: 'HACKATHON_REGISTRATION',
          title: 'Test 1',
          message: 'Message 1',
          link: null,
          readAt: null,
          createdAt: new Date(),
        },
      ];

      jest.spyOn(prisma.notification, 'findMany').mockResolvedValue(mockNotifications);
      jest.spyOn(prisma.notification, 'count').mockResolvedValue(1);

      const result = await service.getUserNotifications(userId);

      expect(result.notifications).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });
});
```

### Frontend Component Tests (Vitest)

**Location**: `apps/web/src/**/*.test.tsx`

**Example**:

```typescript
// apps/web/src/components/layout/NotificationBell.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationBell } from './NotificationBell';
import * as notificationsLib from '@/lib/notifications';

vi.mock('@/lib/notifications');

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render bell icon', () => {
    vi.spyOn(notificationsLib, 'getUnreadCount').mockResolvedValue({ count: 0 });
    vi.spyOn(notificationsLib, 'getNotifications').mockResolvedValue({
      notifications: [],
      pagination: { total: 0, limit: 10, offset: 0, hasMore: false },
      unreadCount: 0,
    });

    render(<NotificationBell />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should display unread count badge', async () => {
    vi.spyOn(notificationsLib, 'getUnreadCount').mockResolvedValue({ count: 5 });
    vi.spyOn(notificationsLib, 'getNotifications').mockResolvedValue({
      notifications: [],
      pagination: { total: 0, limit: 10, offset: 0, hasMore: false },
      unreadCount: 5,
    });

    render(<NotificationBell />);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('should open dropdown on click', async () => {
    const user = userEvent.setup();

    vi.spyOn(notificationsLib, 'getUnreadCount').mockResolvedValue({ count: 0 });
    vi.spyOn(notificationsLib, 'getNotifications').mockResolvedValue({
      notifications: [
        {
          id: 'notif-1',
          type: 'HACKATHON_REGISTRATION',
          title: 'Test Notification',
          message: 'Test message',
          link: '/dashboard',
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: { total: 1, limit: 10, offset: 0, hasMore: false },
      unreadCount: 1,
    });

    render(<NotificationBell />);

    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
    });
  });

  it('should mark notification as read', async () => {
    const user = userEvent.setup();
    const markAsReadSpy = vi.spyOn(notificationsLib, 'markAsRead').mockResolvedValue();

    vi.spyOn(notificationsLib, 'getUnreadCount').mockResolvedValue({ count: 1 });
    vi.spyOn(notificationsLib, 'getNotifications').mockResolvedValue({
      notifications: [
        {
          id: 'notif-1',
          type: 'HACKATHON_REGISTRATION',
          title: 'Test Notification',
          message: 'Test message',
          link: '/dashboard',
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: { total: 1, limit: 10, offset: 0, hasMore: false },
      unreadCount: 1,
    });

    render(<NotificationBell />);

    await user.click(screen.getByRole('button'));

    const notification = await screen.findByText('Test Notification');
    await user.click(notification);

    expect(markAsReadSpy).toHaveBeenCalledWith('notif-1');
  });
});
```

### E2E Tests (Playwright)

**Location**: `apps/web/e2e/*.spec.ts`

**Example**:

```typescript
// apps/web/e2e/notifications.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Notifications', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as test user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display notification bell', async ({ page }) => {
    const bell = page.locator('[aria-label="Notifications"]');
    await expect(bell).toBeVisible();
  });

  test('should show unread count badge', async ({ page }) => {
    // Create a test notification via API
    // ...

    await page.reload();

    const badge = page.locator('[data-testid="unread-badge"]');
    await expect(badge).toHaveText('1');
  });

  test('should open notifications dropdown', async ({ page }) => {
    const bell = page.locator('[aria-label="Notifications"]');
    await bell.click();

    const dropdown = page.locator('[role="menu"]');
    await expect(dropdown).toBeVisible();
  });

  test('should navigate to notifications page', async ({ page }) => {
    const bell = page.locator('[aria-label="Notifications"]');
    await bell.click();

    const viewAllLink = page.locator('text=View all notifications');
    await viewAllLink.click();

    await expect(page).toHaveURL('/notifications');
  });

  test('should mark notification as read', async ({ page }) => {
    await page.goto('/notifications');

    const notification = page.locator('[data-testid="notification-item"]').first();
    await notification.click();

    // Verify notification is marked as read (no longer has unread styling)
    await expect(notification).not.toHaveClass(/unread/);
  });

  test('should update preferences', async ({ page }) => {
    await page.goto('/notifications');

    // Click Settings tab
    await page.click('text=Settings');

    // Toggle email preference
    const emailToggle = page.locator('[data-testid="email-hackathon-registration"]');
    await emailToggle.click();

    // Verify success message
    await expect(page.locator('text=Preferences updated')).toBeVisible();
  });
});
```

---

## Coverage Goals

### Backend Coverage

**Target**: 80%+ statement coverage on critical paths

**Critical Modules**:

- Authentication: 90%+
- Authorization: 90%+
- Notifications: 85%+
- Gamification: 85%+
- Judging: 80%+
- Submissions: 80%+
- Teams: 80%+

**View Coverage Report**:

```bash
pnpm --filter @innovation-lab/api test:cov
open apps/api/coverage/lcov-report/index.html
```

### Frontend Coverage

**Target**: 85%+ component coverage

**Critical Components**:

- NotificationBell: 90%+
- InviteModal: 85%+
- JudgeAssignment: 85%+
- Auth components: 90%+
- Form components: 85%+

**View Coverage Report**:

```bash
pnpm --filter @innovation-lab/web test:cov
open apps/web/coverage/index.html
```

### E2E Coverage

**Target**: 90%+ user flow coverage

**Critical Flows**:

- Authentication flow: 100%
- Hackathon registration: 95%+
- Team creation/invitation: 90%+
- Submission flow: 90%+
- Judge scoring flow: 90%+
- Admin operations: 85%+

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Run backend tests
        run: pnpm --filter @innovation-lab/api test:cov

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./apps/api/coverage/lcov.info
          flags: backend

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Run frontend tests
        run: pnpm --filter @innovation-lab/web test:cov

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./apps/web/coverage/lcov.info
          flags: frontend

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        run: npm install -g pnpm

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Start services
        run: docker-compose up -d

      - name: Run E2E tests
        run: pnpm --filter @innovation-lab/web test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/web/playwright-report/
```

### Pre-commit Hooks

Install Husky for pre-commit testing:

```bash
# Install Husky
pnpm add -D husky

# Initialize Husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "pnpm test:quick"
```

Create `test:quick` script in `package.json`:

```json
{
  "scripts": {
    "test:quick": "pnpm --filter @innovation-lab/api test --passWithNoTests && pnpm --filter @innovation-lab/web test --passWithNoTests"
  }
}
```

---

## Troubleshooting

### Tests Failing

**Problem**: Tests failing unexpectedly

**Solutions**:

1. Ensure all dependencies installed:

   ```bash
   pnpm install
   ```

2. Clear test cache:

   ```bash
   # Jest
   pnpm jest --clearCache

   # Vitest
   pnpm vitest --run --clearCache
   ```

3. Check for stale mocks:
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks(); // Vitest
     jest.clearAllMocks(); // Jest
   });
   ```

### Coverage Too Low

**Problem**: Coverage not meeting targets

**Solutions**:

1. Generate coverage report:

   ```bash
   pnpm test:cov
   ```

2. Review uncovered lines in HTML report

3. Add tests for uncovered code paths

4. Focus on critical paths first

### E2E Tests Timing Out

**Problem**: E2E tests timing out

**Solutions**:

1. Increase timeout in `playwright.config.ts`:

   ```typescript
   export default defineConfig({
     timeout: 60000, // 60 seconds
   });
   ```

2. Ensure services are running:

   ```bash
   docker-compose up -d
   curl http://localhost:4000/health
   ```

3. Use debug mode:
   ```bash
   pnpm test:e2e:debug
   ```

### Database Issues in Tests

**Problem**: Database connection errors

**Solutions**:

1. Use test database:

   ```bash
   DATABASE_URL="postgresql://test:test@localhost:5432/test_db" pnpm test
   ```

2. Run migrations:

   ```bash
   cd packages/database
   DATABASE_URL="..." npx prisma db push
   ```

3. Seed test data:
   ```bash
   DATABASE_URL="..." npx prisma db seed
   ```

---

## Best Practices

### General

1. **Write Tests First**: TDD approach when possible
2. **Keep Tests Simple**: One assertion per test when practical
3. **Use Descriptive Names**: `it('should create notification when user registers')`
4. **Mock External Dependencies**: Don't test third-party code
5. **Clean Up**: Reset state between tests

### Backend

1. **Mock Prisma**: Use mock PrismaService
2. **Test Services**: Focus on business logic
3. **Test Controllers**: Verify request/response handling
4. **Test Guards**: Ensure authorization works
5. **Test DTOs**: Validate input validation

### Frontend

1. **Test User Interactions**: Click, type, navigate
2. **Test Rendering**: Verify UI elements appear
3. **Test Props**: Test component variations
4. **Mock API Calls**: Don't make real HTTP requests
5. **Test Accessibility**: Use screen reader queries

### E2E

1. **Test Happy Paths**: Core user journeys
2. **Test Error Cases**: Invalid inputs, network errors
3. **Use Page Objects**: Organize selectors
4. **Minimize Waits**: Use `waitFor` instead of fixed delays
5. **Clean Up Data**: Reset database between tests

---

## Tools & Commands Reference

### Backend Testing

| Command                                        | Description           |
| ---------------------------------------------- | --------------------- |
| `pnpm --filter @innovation-lab/api test`       | Run all backend tests |
| `pnpm --filter @innovation-lab/api test:cov`   | Run with coverage     |
| `pnpm --filter @innovation-lab/api test:watch` | Watch mode            |
| `pnpm --filter @innovation-lab/api test:debug` | Debug mode            |
| `pnpm jest --clearCache`                       | Clear Jest cache      |

### Frontend Testing

| Command                                        | Description            |
| ---------------------------------------------- | ---------------------- |
| `pnpm --filter @innovation-lab/web test`       | Run all frontend tests |
| `pnpm --filter @innovation-lab/web test:cov`   | Run with coverage      |
| `pnpm --filter @innovation-lab/web test:watch` | Watch mode             |
| `pnpm --filter @innovation-lab/web test:ui`    | Vitest UI              |
| `pnpm vitest --run --clearCache`               | Clear Vitest cache     |

### E2E Testing

| Command                                               | Description       |
| ----------------------------------------------------- | ----------------- |
| `pnpm --filter @innovation-lab/web test:e2e`          | Run all E2E tests |
| `pnpm --filter @innovation-lab/web test:e2e:ui`       | Playwright UI     |
| `pnpm --filter @innovation-lab/web test:e2e:debug`    | Debug mode        |
| `pnpm --filter @innovation-lab/web test:e2e --headed` | Show browser      |
| `npx playwright codegen`                              | Generate tests    |

---

**Last Updated**: November 2025
