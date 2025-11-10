# Innovation Lab - Frontend Application Map

## Project Overview

- **Framework**: Next.js 15 with App Router (React 18.3)
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI + custom components
- **Authentication**: NextAuth (beta)
- **State Management**: React Query (TanStack)
- **Icons**: Lucide React
- **Theme**: Gaming-themed platform for fintech competitions (NBC + Vaultix partnership)

---

## Application Structure

### Root Configuration

- **Layout**: `/src/app/layout.tsx` - Global layout with Header, Footer, Theme Provider, Toast Provider
- **Metadata**: Site-wide metadata (title template, description, OG tags, manifest)
- **Styling**: Hex grid background, game-themed CSS classes with animations
- **Fonts**: Inter (body) + Space Grotesk (display/gaming)

### Environment Configuration

- **Next Config**: `/next.config.js` - Security headers, CSP, image optimization, API rewrites
- **API Proxy**: Routes `/api/v1/*` to backend (NEXT_PUBLIC_API_URL env var)
- **Package**: Node 20+, pnpm workspaces, Turbo monorepo

---

## All Pages & Routes (35 Total Pages/Routes)

### 1. **Home Page**

- **Path**: `/` (`/page.tsx`)
- **Type**: Public landing page
- **Features**:
  - Hero section with animated background, stats display
  - Feature showcase (3 game modes: Hackathon Raids, Boss Challenges, Achievement System)
  - Call-to-action sections
  - Gaming-themed animations (particle effects, floating elements)
- **Key Links**: `/hackathons`, `/challenges`, `/auth/register`, `/leaderboard`

### 2. **Authentication Pages**

#### 2a. Login (Duplicate Routes)

- **Paths**:
  - `/auth/login` (`/auth/login/page.tsx`)
  - `/(auth)/login` (`/(auth)/login/page.tsx`) - Route group version
- **Type**: Public auth page
- **Features**: Email/password form, forgot password link, signup link
- **Redirects To**: `/dashboard` on success
- **API**: POST `/v1/auth/login` → stores token in localStorage

#### 2b. Registration/Signup (Multiple Routes)

- **Paths**:
  - `/auth/register` (`/auth/register/page.tsx`)
  - `/auth/signup` (`/auth/signup/page.tsx`)
  - `/(auth)/register` (`/(auth)/register/page.tsx`)
- **Type**: Public auth pages
- **Features**: User registration form with validation

#### 2c. Forgot Password

- **Path**: `/auth/forgot-password` (`/auth/forgot-password/page.tsx`)
- **Type**: Public password reset page
- **Features**: Email-based password recovery flow

#### 2d. NextAuth API Route

- **Path**: `/api/auth/[...nextauth]` (`/api/auth/[...nextauth]/route.ts`)
- **Type**: Auth provider route
- **Purpose**: Centralized authentication handling

### 3. **User Dashboard**

- **Path**: `/dashboard` (`/dashboard/page.tsx`)
- **Type**: Protected, client-side
- **Features**:
  - Player profile header (avatar, level badge, name, handle)
  - XP progress bar with level progression
  - Vault Keys display (premium currency)
  - Quick stats grid (4 items: Raids Joined, Guilds, Quests Done, Bosses Defeated)
  - "Active Raids" card - User's hackathon participation
  - "My Guilds" card - Team membership across hackathons
  - "Completed Quests" card - User submissions
  - "Trophy Case" sidebar - Badge collection display
  - "XP Log" activity feed - Recent achievements
  - Demo mode fallback data for non-authenticated users
- **API Calls**:
  - GET `/users/me` - Fetch user profile
  - GET `/gamification/profile` - Fetch XP, level, badges
  - TODO: `/hackathons/my`, `/teams/my`, `/submissions/my` endpoints not yet implemented
- **Auth**: Token-based, redirects to `/auth/login` if no token

### 4. **Hackathon System** (Primary Feature)

#### 4a. Hackathons List

- **Path**: `/hackathons` (`/hackathons/page.tsx`)
- **Type**: Public, client-side
- **Features**:
  - "Raid Selection" themed header with stats
  - Search bar with debouncing
  - Filter by Status: ALL, UPCOMING, LIVE, JUDGING, CLOSED
  - Filter by Location: ALL, VIRTUAL, ONSITE, HYBRID
  - Pagination (9 items per page)
  - HackathonCard components in grid
  - Empty/error states
- **API**: GET `/hackathons` with pagination, search, filters
- **Response Model**: `HackathonsResponse` with data[] and meta

#### 4b. Hackathon Detail

- **Path**: `/hackathons/[slug]` (`/hackathons/[slug]/page.tsx`)
- **Type**: Dynamic public page
- **Features**: Individual hackathon details, status, timeline, description
- **Dynamic Segment**: `[slug]` - URL parameter for specific hackathon

#### 4c. Hackathon Submissions

- **Path**: `/hackathons/[slug]/submissions` (`/hackathons/[slug]/submissions/page.tsx`)
- **Type**: Dynamic page
- **Features**: View all submissions for a hackathon

#### 4d. Hackathon Submit

- **Path**: `/hackathons/[slug]/submit` (`/hackathons/[slug]/submit/page.tsx`)
- **Type**: Dynamic protected page
- **Features**: Create/edit quest submission for hackathon

#### 4e. Hackathon Teams

- **Path**: `/hackathons/[slug]/teams` (`/hackathons/[slug]/teams/page.tsx`)
- **Type**: Dynamic page
- **Features**: List all teams/guilds for hackathon

#### 4f. Create Team

- **Path**: `/hackathons/[slug]/teams/create` (`/hackathons/[slug]/teams/create/page.tsx`)
- **Type**: Dynamic protected page
- **Features**: Guild/team creation interface

### 5. **Challenge System** (Individual Contests)

#### 5a. Challenges List

- **Path**: `/challenges` (`/challenges/page.tsx`)
- **Type**: Public, client-side
- **Features**:
  - "Boss Challenges" themed header
  - Dynamic challenge stats (total bosses, active now, attempts, types)
  - Search by title, description, or skills
  - Filter by Status: ALL, OPEN, REVIEW, CLOSED
  - Dynamic category filters
  - Challenge cards with owner info, submission count, reward display
  - Sorting: OPEN challenges first, then by creation date
- **API**: GET `/challenges` with status filter
- **Models**: Challenge, ChallengeStatus, RewardType

#### 5b. Challenge Detail

- **Path**: `/challenges/[slug]` (`/challenges/[slug]/page.tsx`)
- **Type**: Dynamic public page
- **Features**: Full challenge description, criteria, skills required

#### 5c. My Solutions

- **Path**: `/challenges/my-solutions` (`/challenges/my-solutions/page.tsx`)
- **Type**: Protected page
- **Features**: User's submitted solutions to challenges

### 6. **Leaderboard & Gamification**

#### 6a. Leaderboard (Hall of Fame)

- **Path**: `/leaderboard` (`/leaderboard/page.tsx`)
- **Type**: Public, client-side
- **Features**:
  - Dynamic period filters: All Time, This Month, This Week
  - Stats display: Total warriors, top XP, max level, total trophies
  - Top 3 podium display (1st with crown, 2nd with silver medal, 3rd with bronze)
  - Full rankings table with:
    - Rank badge (icon, color-coded)
    - Avatar and name
    - Level and level name
    - XP count
    - Badge collection (first 3-5)
  - Responsive design: Podium hidden on small screens
- **API**: GET `/leaderboard` with scope and period parameters
- **Models**: LeaderboardEntry, Badge, LeaderboardScope, LeaderboardPeriod

#### 6b. Badges / Trophy Vault

- **Path**: `/badges` (`/badges/page.tsx`)
- **Type**: Public, client-side
- **Features**:
  - Trophy vault header with back button
  - Stats: Total trophies, count by rarity (Common, Rare, Epic, Legendary)
  - Filter by rarity
  - Badge cards with:
    - Emoji icon
    - Name, description
    - Rarity color-coding
    - Unlock count
  - 4-column responsive grid
- **API**: GET `/badges`
- **Models**: Badge with rarity (COMMON, RARE, EPIC, LEGENDARY)

### 7. **User Profile & Settings**

#### 7a. User Profile

- **Path**: `/profile` (`/profile/page.tsx`)
- **Type**: Protected, client-side
- **Features**:
  - Avatar display (initials-based, custom uploads coming soon)
  - Editable form:
    - Full Name (required)
    - Email (read-only)
    - Username/Handle (alphanumeric + underscore only)
    - Organization (optional)
    - Bio (max 500 chars)
  - Account details section (User ID, Roles)
  - Success/error notifications
  - Back button to dashboard
- **API Calls**:
  - GET `/users/me` - Fetch current profile
  - PUT `/users/me` - Update profile
- **Auth**: Redirects to login if no token

### 8. **Team Management**

#### 8a. Team Detail

- **Path**: `/teams/[id]` (`/teams/[id]/page.tsx`)
- **Type**: Dynamic public page
- **Features**: Team/guild details, member list, stats

### 9. **Submission Management**

#### 9a. Submission Detail

- **Path**: `/submissions/[id]` (`/submissions/[id]/page.tsx`)
- **Type**: Dynamic public page
- **Features**: Individual submission review, status, scores

### 10. **Judge System** (Admin/Moderator Feature)

#### 10a. Judge Dashboard

- **Path**: `/judge` (`/judge/page.tsx`)
- **Type**: Protected, client-side (judges only)
- **Features**:
  - Header stats: Total hackathons, submissions, scored count, completion %
  - List of judge assignments by hackathon
  - For each hackathon:
    - Title, status badge
    - List of submissions with:
      - Title, abstract, team name, track
      - Scoring progress bar
      - Score/Review button
  - Empty state if no assignments
  - Help card with judging guidelines
- **API**: GET `/judge/assignments`
- **Models**: JudgeAssignment, Hackathon with criteria and submissions

#### 10b. Judge Scoring Interface

- **Path**: `/judge/score/[submissionId]` (`/judge/score/[submissionId]/page.tsx`)
- **Type**: Dynamic protected page
- **Features**: Detailed scoring interface for evaluating submissions against criteria

### 11. **Informational Pages**

#### 11a. About Page

- **Path**: `/about` (`/about/page.tsx`)
- **Type**: Static public page
- **Features**:
  - Mission statement ("Our Quest")
  - Values: Innovation First, Community Driven, Excellence
  - Partnership info (NBC & Vaultix)
  - CTA buttons to explore hackathons/challenges

#### 11b. FAQ / Battle Manual

- **Path**: `/faq` (`/faq/page.tsx`)
- **Type**: Static public page
- **Features**:
  - 6 FAQ categories with icons:
    1. Beginner's Quest (3 Q&As)
    2. Raid Mechanics (5 Q&As)
    3. Boss Fight Guide (3 Q&As)
    4. XP & Progression System (4 Q&As)
    5. Scoring & Victory (3 Q&As)
    6. Player Profile (3 Q&As)
  - Support CTA section linking to `/support`

#### 11c. Support Page

- **Path**: `/support` (`/support/page.tsx`)
- **Type**: Static public page
- **Features**: Contact information, support options

#### 11d. Blog

- **Path**: `/blog` (`/blog/page.tsx`)
- **Type**: Static/dynamic public page
- **Features**: Platform news and updates

#### 11e. Internships

- **Path**: `/internships` (`/internships/page.tsx`)
- **Type**: Static public page
- **Features**: Student internship opportunities at NBC

### 12. **Legal Pages**

#### 12a. Privacy Policy

- **Path**: `/legal/privacy` (`/legal/privacy/page.tsx`)
- **Type**: Static public page

#### 12b. Terms of Service

- **Path**: `/legal/terms` (`/legal/terms/page.tsx`)
- **Type**: Static public page

#### 12c. Code of Conduct

- **Path**: `/legal/code-of-conduct` (`/legal/code-of-conduct/page.tsx`)
- **Type**: Static public page

#### 12d. Cookie Policy

- **Path**: `/legal/cookies` (`/legal/cookies/page.tsx`)
- **Type**: Static public page

---

## Major Components (21 Files)

### Layout Components

1. **Header** (`/components/layout/header.tsx`)
   - Sticky navigation bar
   - Logo with brand name
   - Desktop navigation links (Home, Dashboard, Hackathons, Challenges, Leaderboard)
   - Mobile menu toggle
   - User dropdown menu (when authenticated) with:
     - User profile display (avatar, name)
     - Level & XP display
     - Vault Keys display
     - Profile link, Logout
   - Auth state detection and logout handling

2. **Footer** (`/components/layout/footer.tsx`)
   - Site-wide footer with links, copyright, etc.

### Feature-Specific Components

3. **HackathonCard** (`/components/hackathons/hackathon-card.tsx`)
   - Reusable card for displaying hackathon in grid
   - Shows title, status badge, dates, description
   - Used in: `/hackathons` list page

4. **TeamCard** (`/components/teams/team-card.tsx`)
   - Team/Guild display component
   - Shows team name, member count, bio

5. **SubmissionCard** (`/components/submissions/submission-card.tsx`)
   - Submission display card
   - Shows project title, team, status

### File Management

6. **FileUpload** (`/components/files/file-upload.tsx`)
   - Drag-and-drop file upload component
   - Used in submission and team creation forms

7. **FileList** (`/components/files/file-list.tsx`)
   - Display uploaded files
   - Delete capability

### UI/Design System Components (Radix UI Based)

8. **Card** (`/components/ui/card.tsx`)
   - Container component with header, content, footer
   - Used extensively across app

9. **Button** (`/components/ui/button.tsx`)
   - Primary, secondary, outline variants
   - Gaming-themed styles

10. **Badge** (`/components/ui/badge.tsx`)
    - Status, filter, tag display
    - Multiple variants (default, outline, secondary, success, warning, etc.)

11. **Avatar** (`/components/ui/avatar.tsx`)
    - User profile pictures
    - Fallback initials display

12. **Input** (`/components/ui/input.tsx`)
    - Text input field
    - Search, email, password variants

13. **Textarea** (`/components/ui/textarea.tsx`)
    - Multi-line text input
    - Used for bio, descriptions

14. **Label** (`/components/ui/label.tsx`)
    - Form field labels

15. **Dialog** (`/components/ui/dialog.tsx`)
    - Modal component
    - Confirm actions, show details

16. **Dropdown Menu** (`/components/ui/dropdown-menu.tsx`)
    - User menu, action menus
    - In header for user options

17. **Select** (`/components/ui/select.tsx`)
    - Dropdown select input
    - Filter and form selection

18. **Progress** (`/components/ui/progress.tsx`)
    - XP progress bar
    - Scoring progress in judge interface

19. **Toast** (`/components/ui/toast.tsx`)
    - Notifications and alerts
    - Success, error, info messages

20. **Examples** (`/components/ui/examples.tsx`)
    - UI component showcase/documentation

21. **Index** (`/components/ui/index.ts`)
    - Barrel export for all UI components

---

## Routing Structure & Organization

### Route Groups (Parentheses)

- `(auth)` - Route group for authentication pages
  - `/login`, `/register` - Grouped auth routes
  - Applied for shared layout/styling without affecting URL

### Dynamic Routes (Square Brackets)

- `[slug]` - Hackathon identifier (URL-friendly slug)
  - `/hackathons/[slug]`
  - `/hackathons/[slug]/teams`
  - `/hackathons/[slug]/submit`
  - `/hackathons/[slug]/submissions`
  - `/hackathons/[slug]/teams/create`
  - `/challenges/[slug]`

- `[id]` - Record identifier (UUID or numeric ID)
  - `/teams/[id]`
  - `/submissions/[id]`
  - `/judge/score/[submissionId]`

### Nested Structures

- **Hackathon Sub-Routes**: Everything under `/hackathons/[slug]/*` is hackathon-specific
- **Judge Routes**: All under `/judge/*` for judging functionality
- **Legal Routes**: All under `/legal/*` for compliance pages
- **Auth Routes**: All under `/auth/*` or `(auth)/*` for authentication

---

## Data Models & Types

### User

```typescript
{
  id: string;
  name: string;
  email: string;
  handle: string;
  avatarUrl: string | null;
  bio: string | null;
  organization: string | null;
  roles: string[]; // ['PARTICIPANT', 'JUDGE', 'ADMIN']
}
```

### Gamification Profile

```typescript
{
  userId: string;
  xp: number;
  level: number;
  streakDays: number;
  vaultKeys: number;
  badges: string[]; // Badge slugs
  xpToNextLevel: number;
  currentLevelXp: number;
  nextLevelXp: number;
  recentXpEvents: XpEvent[];
}
```

### Hackathon

```typescript
{
  id: string;
  slug: string;
  title: string;
  description: string;
  status: 'UPCOMING' | 'LIVE' | 'JUDGING' | 'CLOSED';
  location: 'VIRTUAL' | 'ONSITE' | 'HYBRID';
  startsAt: string;
  endsAt: string;
  submissions: Submission[];
  criteria: JudgingCriteria[];
}
```

### Challenge

```typescript
{
  id: string;
  slug: string;
  title: string;
  problemStatement: string;
  status: 'OPEN' | 'REVIEW' | 'CLOSED';
  categories: string[];
  skills: string[];
  owner: User;
  rewardType: 'XP' | 'CASH' | 'BADGE' | null;
  rewardValue: string | null;
  deadlineAt: string | null;
  _count: {
    submissions: number;
  };
}
```

### Badge

```typescript
{
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // Emoji
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  _count: {
    userBadges: number;
  }
}
```

### Leaderboard Entry

```typescript
{
  rank: number;
  userId: string;
  user: User;
  xp: number;
  level: number;
  badges: string[]; // Badge slugs
}
```

### Team/Guild

```typescript
{
  id: string;
  name: string;
  bio: string | null;
  role: 'LEAD' | 'MEMBER';
  hackathon: {
    id: string;
    title: string;
  }
  _count: {
    members: number;
  }
}
```

### Submission

```typescript
{
  id: string;
  title: string;
  description: string | null;
  abstract: string;
  status: 'DRAFT' | 'FINAL';
  team: Team;
  hackathon: Hackathon;
  track: Track | null;
  _count: {
    scores: number;
  }
}
```

---

## Key Libraries & Dependencies

### Core

- `next@15.0.3` - React framework with App Router
- `react@18.3.1` - React library
- `react-dom@18.3.1` - DOM rendering

### UI & Styling

- `tailwindcss@3.4.1` - Utility-first CSS framework
- `@radix-ui/*` - Headless UI components (13 packages)
- `class-variance-authority@0.7.0` - Component variant system
- `clsx@2.1.0` & `tailwind-merge@2.2.0` - Class name utilities
- `lucide-react@0.309.0` - Icon library
- `@next/font` - Google fonts (Inter, Space Grotesk)

### State & Data

- `@tanstack/react-query@5.17.19` - Server state management
- `@tanstack/react-query-devtools@5.17.19` - Query debugging
- `react-hook-form@7.49.3` - Form state management
- `@hookform/resolvers@3.3.4` - Form validation resolvers
- `zod@3.22.4` - TypeScript-first schema validation

### Authentication & Theming

- `next-auth@5.0.0-beta.4` - Authentication library
- `next-themes@0.4.0` - Theme management (dark/light mode)

### Animation & Visual Effects

- `framer-motion@11.0.3` - Animation library
- `canvas-confetti@1.9.2` - Confetti animation effects
- `tailwindcss-animate@1.0.7` - Tailwind animation utilities

### Utilities

- `@innovation-lab/database` - Workspace package (database/types)

### Development

- `typescript@5.3.3` - TypeScript compiler
- `eslint@8.56.0` & `eslint-config-next@15.0.3` - Linting
- `vitest@1.2.0` - Test framework
- `@testing-library/*` - Testing utilities

---

## Authentication & API Integration

### Authentication Flow

1. User submits credentials on `/auth/login`
2. API POST to `${NEXT_PUBLIC_API_URL}/v1/auth/login`
3. Token returned and stored in `localStorage` as `auth_token`
4. Header component checks for token and fetches user data
5. Protected routes check `getAuthToken()` and redirect to login if missing
6. Logout clears localStorage and resets state

### API Integration Patterns

- Custom `apiFetch()` utility in `/lib/api.ts`
- Supports authentication with bearer token
- Error handling with `ApiError` class
- Automatic 401 redirect on expired tokens
- Demo mode data fallback in dashboard for unauthenticated users

### API Base URL

- Environment: `NEXT_PUBLIC_API_URL`
- Default: `http://localhost:3001` or `http://localhost:4000`
- Configured in next.config.js with rewrites

---

## Key Features & User Journeys

### 1. User Registration & Onboarding

- Sign up at `/auth/signup` or `/auth/register`
- Login at `/auth/login`
- Redirect to `/dashboard` on success
- View demo dashboard if not authenticated

### 2. Participate in Hackathon Raid

- Browse hackathons at `/hackathons`
- Filter by status, location, search
- Click hackathon to view details at `/hackathons/[slug]`
- Create or join guild at `/hackathons/[slug]/teams/create`
- Submit project at `/hackathons/[slug]/submit`
- View submissions at `/hackathons/[slug]/submissions`

### 3. Defeat Boss Challenge

- Browse challenges at `/challenges`
- Search by skill, filter by status
- Click challenge for details at `/challenges/[slug]`
- Submit solution
- View existing solutions at `/challenges/my-solutions`

### 4. Track Progress & Gamification

- View personal dashboard at `/dashboard`
- Check XP, level, and vault keys
- Browse leaderboard at `/leaderboard`
- View badges in trophy vault at `/badges`
- Update profile at `/profile`

### 5. Judge Submissions (Admin)

- Access judge dashboard at `/judge`
- View assigned hackathons and submissions
- Click submission to open scoring interface at `/judge/score/[submissionId]`
- Score based on criteria
- View completion progress

---

## Security & Best Practices

### Headers

- X-DNS-Prefetch-Control: on
- Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
- X-Frame-Options: DENY (clickjacking protection)
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

### Protected Routes

- `/dashboard` - Requires authentication
- `/profile` - Requires authentication
- `/judge/*` - Requires judge role
- `/(auth)/*` - Hidden header on auth pages

### Form Validation

- React Hook Form with Zod schema validation
- Email format, password strength, handle constraints
- Character limits (bio: 500 chars)

---

## Styling System

### Design Tokens

- **Primary Color**: Used for main CTAs, active states
- **Accent Color**: Used for highlights, secondary actions
- **Accent2 Color**: Third accent for variety
- **Slate Palette**: Neutral grays for text and backgrounds

### Custom CSS Classes

- `.hex-grid` - Background pattern
- `.game-card` - Card container with gaming styling
- `.btn-game` - Primary button
- `.btn-game-secondary` - Secondary button
- `.glass-game` - Glassmorphism effect
- `.level-badge` - Level display badge
- `.quest-card` - Quest/submission card
- `.gradient-text` - Multi-color text
- `.neon-text` - Glowing text effect
- `.shadow-glow` - Glow shadow effect
- `.stat-counter` - Number animation class

### Animations

- `.animate-float` - Floating motion
- `.animate-wiggle` - Wiggle effect
- `.animate-levitate` - Levitation
- `.animate-sparkle` - Sparkle/twinkle
- `.animate-bounce-subtle` - Subtle bounce
- `.animate-slide-up-fade` - Slide up with fade
- `.animate-fade-in` - Fade in effect
- `.animate-glow-pulse` - Glowing pulse

---

## File Organization

```
/apps/web/src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Route group for auth pages
│   │   ├── login/
│   │   └── register/
│   ├── api/                     # API routes
│   │   └── auth/[...nextauth]/
│   ├── auth/                    # Alternative auth routes
│   │   ├── login/
│   │   ├── register/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── hackathons/              # Hackathon routes
│   │   ├── [slug]/
│   │   │   ├── submissions/
│   │   │   ├── submit/
│   │   │   ├── teams/
│   │   │   │   └── create/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── challenges/              # Challenge routes
│   │   ├── [slug]/
│   │   ├── my-solutions/
│   │   └── page.tsx
│   ├── dashboard/
│   ├── profile/
│   ├── leaderboard/
│   ├── badges/
│   ├── judge/                   # Judge routes
│   │   ├── score/[submissionId]/
│   │   └── page.tsx
│   ├── teams/[id]/
│   ├── submissions/[id]/
│   ├── legal/
│   │   ├── privacy/
│   │   ├── terms/
│   │   ├── code-of-conduct/
│   │   └── cookies/
│   ├── about/
│   ├── faq/
│   ├── support/
│   ├── blog/
│   ├── careers/
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home
│   └── globals.css              # Global styles
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   └── footer.tsx
│   ├── hackathons/
│   │   └── hackathon-card.tsx
│   ├── teams/
│   │   └── team-card.tsx
│   ├── submissions/
│   │   └── submission-card.tsx
│   ├── files/
│   │   ├── file-upload.tsx
│   │   └── file-list.tsx
│   └── ui/                      # Design system
│       ├── card.tsx
│       ├── button.tsx
│       ├── badge.tsx
│       ├── avatar.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       ├── label.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── select.tsx
│       ├── progress.tsx
│       ├── toast.tsx
│       ├── examples.tsx
│       └── index.ts
├── lib/                         # Utility functions
│   ├── api.ts                   # API client
│   ├── hackathons.ts            # Hackathon utilities
│   ├── challenges.ts            # Challenge utilities
│   ├── gamification.ts          # Gamification helpers
│   ├── judging.ts               # Judge helpers
│   └── utils.ts                 # General utilities
└── types/                       # TypeScript types
    ├── hackathon.ts
    ├── challenge.ts
    ├── gamification.ts
    └── judging.ts
```

---

## Testing Strategy

### Test Framework

- Vitest for unit testing
- React Testing Library for component testing
- Available commands:
  - `npm test` - Run tests
  - `npm run test:ui` - Interactive test UI

### Coverage Areas (To Be Implemented)

- Component rendering
- User interactions (clicks, form submissions)
- API integration mocking
- Route navigation
- Authentication flows
- Data filtering and sorting

---

## Future Enhancement Opportunities

1. **Backend Integration** (Marked TODOs)
   - GET `/hackathons/my` - User's joined hackathons
   - GET `/teams/my` - User's teams
   - GET `/submissions/my` - User's submissions
   - GET `/challenges/my` - User's challenge attempts

2. **Features Not Yet Implemented**
   - Custom avatar uploads (coming soon)
   - Email notifications
   - Real-time notifications/websockets
   - Team invitation system
   - Advanced submission analytics
   - Judge feedback system

3. **UI/UX Improvements**
   - Accessibility audit (WCAG 2.1)
   - Performance optimization
   - Mobile optimization refinement
   - Dark mode implementation
   - Search autocomplete

4. **Data Features**
   - User activity timeline
   - Team collaboration features
   - Advanced leaderboard filtering
   - Submission comments/discussions

---

## Performance Considerations

### Optimization Done

- Next.js 15 with App Router
- Image optimization configured
- Font optimization (Google Fonts)
- Static generation where applicable

### Potential Optimizations

- Implement ISR (Incremental Static Regeneration) for frequently accessed pages
- Code splitting and lazy loading components
- Image lazy loading
- Database query optimization
- Caching strategies

---

## Accessibility Notes

### Current Implementation

- Semantic HTML structure
- ARIA labels on interactive elements
- Form labels with `<label>` tags
- Focus management in modals and dropdowns
- Color contrast ratios follow gaming aesthetic

### Areas for Improvement

- WCAG 2.1 AA compliance audit
- Screen reader testing
- Keyboard navigation testing
- Focus indicators enhancement

---

## Summary Statistics

- **Total Routes**: 35 public/protected pages
- **Components**: 21 total components (7 layout/feature + 14 UI)
- **UI Components**: 14 Radix UI-based design system components
- **Dynamic Routes**: 4 types ([slug], [id], [submissionId])
- **Protected Routes**: 6+ (dashboard, profile, judge, submissions)
- **API Integrations**: 10+ endpoints
- **Third-party Libraries**: 40+ npm packages
- **Code Files**: ~9,250 lines across 35 page files
- **Custom CSS Classes**: 15+ gaming-themed classes
- **Animations**: 8+ custom animations
