import { chromium, Browser, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots');

// Test user credentials
const TEST_USERS = {
  ADMIN: {
    email: 'admin@bank.com',
    password: 'password',
    name: 'Admin User',
  },
  JUDGE: {
    email: 'judge@bank.com',
    password: 'password',
    name: 'Judge User',
  },
  MENTOR: {
    email: 'mentor@bank.com',
    password: 'password',
    name: 'Mentor User',
  },
  PARTICIPANT: {
    email: 'participant@bank.com',
    password: 'password',
    name: 'Regular User',
  },
};

// Organized by unique views, not redundant roles
const SCREENSHOT_GROUPS = {
  // Public pages - same for everyone
  public: {
    dir: '01-public',
    description: 'Public pages (accessible to everyone, logged in or not)',
    needsAuth: false,
    routes: [
      { path: '/', name: 'home' },
      { path: '/about', name: 'about' },
      { path: '/blog', name: 'blog' },
      { path: '/faq', name: 'faq' },
      { path: '/support', name: 'support' },
    ],
  },

  // Auth pages - same for everyone
  auth: {
    dir: '02-auth',
    description: 'Authentication pages (login, register, etc.)',
    needsAuth: false,
    routes: [
      { path: '/auth/login', name: 'login' },
      { path: '/auth/register', name: 'register' },
      { path: '/auth/signup', name: 'signup' },
      { path: '/auth/forgot-password', name: 'forgot-password' },
    ],
  },

  // Legal pages - same for everyone
  legal: {
    dir: '03-legal',
    description: 'Legal pages (terms, privacy, etc.)',
    needsAuth: false,
    routes: [
      { path: '/legal/code-of-conduct', name: 'code-of-conduct' },
      { path: '/legal/cookies', name: 'cookies' },
      { path: '/legal/privacy', name: 'privacy' },
      { path: '/legal/terms', name: 'terms' },
    ],
  },

  // User dashboard & profile - same for all authenticated users
  user: {
    dir: '04-user-dashboard',
    description: 'User dashboard and profile pages (same for all authenticated users)',
    needsAuth: true,
    user: 'PARTICIPANT',
    routes: [
      { path: '/dashboard', name: 'dashboard' },
      { path: '/profile', name: 'profile' },
      { path: '/profile/security', name: 'profile-security' },
      { path: '/activity', name: 'activity' },
      { path: '/notifications', name: 'notifications' },
      { path: '/badges', name: 'badges' },
      { path: '/leaderboard', name: 'leaderboard' },
    ],
  },

  // Hackathons - same for all authenticated users
  hackathons: {
    dir: '05-hackathons',
    description: 'Hackathon pages (browsing and viewing)',
    needsAuth: true,
    user: 'PARTICIPANT',
    routes: [
      { path: '/hackathons', name: 'hackathons-list' },
    ],
  },

  // Challenges - same for all authenticated users
  challenges: {
    dir: '06-challenges',
    description: 'Challenge pages (browsing and solving)',
    needsAuth: true,
    user: 'PARTICIPANT',
    routes: [
      { path: '/challenges', name: 'challenges-list' },
      { path: '/challenges/my-solutions', name: 'my-solutions' },
    ],
  },

  // Teams - same for all authenticated users
  teams: {
    dir: '07-teams',
    description: 'Team and invitation pages',
    needsAuth: true,
    user: 'PARTICIPANT',
    routes: [
      { path: '/invitations', name: 'invitations' },
    ],
  },

  // Internships - same for all authenticated users
  internships: {
    dir: '08-internships',
    description: 'Internship listings',
    needsAuth: true,
    user: 'PARTICIPANT',
    routes: [
      { path: '/internships', name: 'internships-list' },
    ],
  },

  // Judge-specific pages
  judge: {
    dir: '09-judge-only',
    description: 'Judge-specific pages (only accessible to JUDGE role)',
    needsAuth: true,
    user: 'JUDGE',
    routes: [
      { path: '/judge', name: 'judge-dashboard' },
    ],
  },

  // Mentor-specific pages
  mentor: {
    dir: '10-mentor-only',
    description: 'Mentor-specific pages (only accessible to MENTOR role)',
    needsAuth: true,
    user: 'MENTOR',
    routes: [
      { path: '/mentors/dashboard', name: 'mentor-dashboard' },
    ],
  },

  // Admin-specific pages
  admin: {
    dir: '11-admin-only',
    description: 'Admin pages (BANK_ADMIN, ORGANIZER, MODERATOR only)',
    needsAuth: true,
    user: 'ADMIN',
    routes: [
      { path: '/admin', name: 'admin-dashboard' },
      { path: '/admin/analytics', name: 'admin-analytics' },
      { path: '/admin/gamification', name: 'admin-gamification' },
      { path: '/admin/hackathons', name: 'admin-hackathons-list' },
      { path: '/admin/hackathons/create', name: 'admin-hackathons-create' },
      { path: '/admin/challenges', name: 'admin-challenges-list' },
      { path: '/admin/challenges/create', name: 'admin-challenges-create' },
    ],
  },
};

async function login(page: Page, email: string, password: string) {
  console.log(`  → Logging in as ${email}...`);
  await page.goto(`${BASE_URL}/auth/login`);
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  await page.waitForURL(/\/(dashboard|)/, { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  console.log(`  ✓ Logged in successfully`);
}

async function takeScreenshot(page: Page, filepath: string, description: string) {
  try {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: filepath,
      fullPage: true,
    });

    console.log(`  ✓ ${description}`);
  } catch (error) {
    console.log(`  ✗ Failed: ${description} - ${error}`);
  }
}

async function captureGroup(browser: Browser, groupKey: string, group: any) {
  const groupDir = path.join(SCREENSHOTS_DIR, group.dir);

  if (!fs.existsSync(groupDir)) {
    fs.mkdirSync(groupDir, { recursive: true });
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📸 ${group.dir.toUpperCase()}`);
  console.log(`📄 ${group.description}`);
  console.log(`${'='.repeat(60)}`);

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  // Login if needed
  if (group.needsAuth && group.user) {
    const user = TEST_USERS[group.user as keyof typeof TEST_USERS];
    try {
      await login(page, user.email, user.password);
    } catch (error) {
      console.log(`  ✗ Login failed for ${user.email}`);
      console.log(`  → Skipping this group`);
      await context.close();
      return;
    }
  }

  // Capture screenshots for each route
  for (const route of group.routes) {
    try {
      await page.goto(`${BASE_URL}${route.path}`, { timeout: 30000 });
      await takeScreenshot(
        page,
        path.join(groupDir, `${route.name}.png`),
        `${route.path}`
      );
    } catch (error) {
      console.log(`  ✗ Failed to capture ${route.path}: ${error}`);
    }
  }

  // Logout if logged in
  if (group.needsAuth) {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    console.log(`  → Logged out`);
  }

  await context.close();
}

function generateDocumentation(): string {
  let content = `# Innovation Lab - Complete Screenshot Documentation\n\n`;
  content += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  content += `This directory contains organized screenshots of all pages in the Innovation Lab application.\n`;
  content += `Screenshots are organized by **unique views** rather than redundant role-based copies.\n\n`;

  content += `## 📁 Directory Structure\n\n`;

  for (const [key, group] of Object.entries(SCREENSHOT_GROUPS)) {
    content += `### ${group.dir}/\n`;
    content += `**${group.description}**\n\n`;
    content += `**Authentication Required:** ${group.needsAuth ? 'Yes' : 'No'}\n`;
    if (group.user) {
      content += `**Captured as:** ${TEST_USERS[group.user as keyof typeof TEST_USERS].name}\n`;
    }
    content += `**Pages:**\n`;
    for (const route of group.routes) {
      content += `- \`${route.name}.png\` - ${route.path}\n`;
    }
    content += `\n`;
  }

  content += `## 🔐 Access Control Reference\n\n`;

  content += `### Public Pages (No Login Required)\n`;
  content += `- Home, About, Blog, FAQ, Support\n`;
  content += `- Auth pages (Login, Register, etc.)\n`;
  content += `- Legal pages (Terms, Privacy, etc.)\n`;
  content += `**Who can access:** Everyone (including guests)\n\n`;

  content += `### User Dashboard & Profile\n`;
  content += `- Dashboard, Profile, Activity, Notifications, Badges, Leaderboard\n`;
  content += `**Who can access:** All authenticated users (VIEWER, PARTICIPANT, JUDGE, MENTOR, ORGANIZER, BANK_ADMIN)\n\n`;

  content += `### Hackathons, Challenges, Teams, Internships\n`;
  content += `- Browse hackathons, challenges, teams, and internships\n`;
  content += `**Who can access:** All authenticated users\n\n`;

  content += `### Judge Dashboard\n`;
  content += `- Judge-specific dashboard and scoring pages\n`;
  content += `**Who can access:** Users with JUDGE role only\n\n`;

  content += `### Mentor Dashboard\n`;
  content += `- Mentor-specific dashboard and mentorship pages\n`;
  content += `**Who can access:** Users with MENTOR role only\n\n`;

  content += `### Admin Panel\n`;
  content += `- Create/manage hackathons, challenges, analytics, gamification\n`;
  content += `**Who can access:** BANK_ADMIN, ORGANIZER, or MODERATOR roles only\n\n`;

  content += `## 📊 Complete Role Access Matrix\n\n`;
  content += `| Page Category | GUEST | VIEWER | PARTICIPANT | JUDGE | MENTOR | ORGANIZER | BANK_ADMIN |\n`;
  content += `|---------------|-------|--------|-------------|-------|--------|-----------|------------|\n`;
  content += `| Public Pages | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |\n`;
  content += `| Auth Pages | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |\n`;
  content += `| Legal Pages | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |\n`;
  content += `| User Dashboard | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |\n`;
  content += `| Hackathons | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |\n`;
  content += `| Challenges | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |\n`;
  content += `| Teams | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |\n`;
  content += `| Internships | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |\n`;
  content += `| Judge Dashboard | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅* |\n`;
  content += `| Mentor Dashboard | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅* |\n`;
  content += `| Admin Panel | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |\n\n`;
  content += `*BANK_ADMIN has access to all features\n\n`;

  content += `## 📝 Notes\n\n`;
  content += `- Screenshots are full-page captures at 1920x1080 resolution\n`;
  content += `- Pages that look identical across roles are captured only once\n`;
  content += `- Dynamic pages (individual hackathons, teams, etc.) show the list view\n`;
  content += `- Some admin pages may show empty states if no data exists yet\n`;
  content += `- To update screenshots, run: \`pnpm screenshots\` (from apps/web directory)\n`;

  return content;
}

async function main() {
  console.log('🚀 Starting optimized screenshot capture...\n');
  console.log('📋 Capturing only unique views (no redundant role screenshots)\n');

  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    // Capture each group
    for (const [key, group] of Object.entries(SCREENSHOT_GROUPS)) {
      await captureGroup(browser, key, group);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ Screenshot capture complete!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log(`${'='.repeat(60)}\n`);

    // Create documentation
    const docsPath = path.join(SCREENSHOTS_DIR, 'README.md');
    const docsContent = generateDocumentation();
    fs.writeFileSync(docsPath, docsContent);
    console.log(`📄 Documentation created: ${docsPath}\n`);

    // Count screenshots
    let totalScreenshots = 0;
    for (const group of Object.values(SCREENSHOT_GROUPS)) {
      totalScreenshots += group.routes.length;
    }
    console.log(`📊 Total screenshots captured: ${totalScreenshots}`);
    console.log(`📂 Organized into ${Object.keys(SCREENSHOT_GROUPS).length} categories\n`);

  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
