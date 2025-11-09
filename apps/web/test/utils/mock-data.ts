/**
 * Mock data for frontend testing
 */

export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  handle: 'testuser',
  avatarUrl: null,
  bio: 'Test bio',
  organization: 'Test Org',
  roles: ['PARTICIPANT'],
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
};

export const mockGamificationProfile = {
  xp: 150,
  level: 2,
  streakDays: 5,
  vaultKeys: 3,
  badges: [
    {
      id: 'badge-1',
      name: 'Early Adopter',
      slug: 'early-adopter',
      description: 'Joined the platform',
      iconUrl: null,
      rarity: 'COMMON',
      category: 'ACHIEVEMENT',
    },
  ],
};

export const mockHackathon = {
  id: 'hack-1',
  title: 'Test Hackathon 2025',
  slug: 'test-hackathon-2025',
  description: 'A test hackathon for testing purposes',
  coverImageUrl: null,
  status: 'UPCOMING',
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  maxTeamSize: 5,
  minTeamSize: 1,
  prizePool: 10000,
  rules: 'Test rules',
  requiresApproval: false,
  _count: {
    teams: 10,
    submissions: 15,
  },
};

export const mockTeam = {
  id: 'team-1',
  name: 'Test Team',
  slug: 'test-team',
  description: 'A test team',
  hackathonId: 'hack-1',
  leaderId: 'user-1',
  avatarUrl: null,
  isLookingForMembers: true,
  _count: {
    members: 3,
  },
  members: [
    {
      id: 'tm-1',
      userId: 'user-1',
      role: 'LEAD',
      user: mockUser,
    },
  ],
};

export const mockSubmission = {
  id: 'sub-1',
  title: 'Test Submission',
  description: 'A test submission',
  teamId: 'team-1',
  hackathonId: 'hack-1',
  trackId: null,
  repositoryUrl: 'https://github.com/test/repo',
  demoUrl: 'https://demo.test.com',
  videoUrl: null,
  status: 'SUBMITTED',
  submittedAt: new Date().toISOString(),
  finalScore: 85,
  rank: 1,
  team: mockTeam,
};

export const mockChallenge = {
  id: 'chal-1',
  title: 'Test Challenge',
  slug: 'test-challenge',
  description: 'A test challenge',
  difficulty: 'MEDIUM',
  status: 'PUBLISHED',
  points: 100,
  vaultKeyReward: 1,
  category: 'TECHNICAL',
  tags: ['test', 'challenge'],
  _count: {
    submissions: 5,
  },
};

export const mockLeaderboardEntry = {
  userId: 'user-1',
  rank: 1,
  xp: 1500,
  level: 5,
  user: mockUser,
};

export const mockBadge = {
  id: 'badge-1',
  name: 'Test Badge',
  slug: 'test-badge',
  description: 'A test badge',
  iconUrl: null,
  rarity: 'RARE',
  category: 'ACHIEVEMENT',
};

export const mockSession = {
  user: {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    roles: ['PARTICIPANT'],
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const mockAdminSession = {
  user: {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin User',
    roles: ['BANK_ADMIN'],
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};
