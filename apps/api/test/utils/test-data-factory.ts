import { Role, HackathonStatus, SubmissionStatus, ChallengeStatus } from '@innovation-lab/database';
import * as bcrypt from 'bcryptjs';

/**
 * Test data factory for creating mock data
 */

let userIdCounter = 1;
let hackathonIdCounter = 1;
let teamIdCounter = 1;
let submissionIdCounter = 1;
let challengeIdCounter = 1;

export class TestDataFactory {
  static resetCounters() {
    userIdCounter = 1;
    hackathonIdCounter = 1;
    teamIdCounter = 1;
    submissionIdCounter = 1;
    challengeIdCounter = 1;
  }

  static createUser(overrides: any = {}) {
    const id = `user-${userIdCounter++}`;
    return {
      id,
      email: `user${userIdCounter}@test.com`,
      name: `Test User ${userIdCounter}`,
      handle: `user${userIdCounter}`,
      password: bcrypt.hashSync('Password123!', 10),
      roles: [Role.PARTICIPANT],
      isEmailVerified: true,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      avatarUrl: null,
      bio: null,
      organization: 'Test Organization',
      acceptedTermsAt: new Date(),
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createAdmin(overrides: any = {}) {
    return this.createUser({
      roles: [Role.BANK_ADMIN],
      ...overrides,
    });
  }

  static createOrganizer(overrides: any = {}) {
    return this.createUser({
      roles: [Role.ORGANIZER],
      ...overrides,
    });
  }

  static createJudge(overrides: any = {}) {
    return this.createUser({
      roles: [Role.JUDGE],
      ...overrides,
    });
  }

  static createMentor(overrides: any = {}) {
    return this.createUser({
      roles: [Role.MENTOR],
      ...overrides,
    });
  }

  static createGamificationProfile(userId: string, overrides: any = {}) {
    return {
      id: `gam-${userId}`,
      userId,
      xp: 50,
      level: 1,
      streakDays: 0,
      lastStreakDate: null,
      vaultKeys: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createHackathon(overrides: any = {}) {
    const id = `hack-${hackathonIdCounter++}`;
    return {
      id,
      title: `Test Hackathon ${hackathonIdCounter}`,
      slug: `test-hackathon-${hackathonIdCounter}`,
      description: 'A test hackathon for testing purposes',
      coverImageUrl: null,
      status: HackathonStatus.DRAFT,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      maxTeamSize: 5,
      minTeamSize: 1,
      prizePool: 10000,
      rules: 'Test rules',
      requiresApproval: false,
      createdById: 'admin-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createTeam(hackathonId: string, leaderId: string, overrides: any = {}) {
    const id = `team-${teamIdCounter++}`;
    return {
      id,
      name: `Test Team ${teamIdCounter}`,
      slug: `test-team-${teamIdCounter}`,
      description: 'A test team',
      hackathonId,
      leaderId,
      avatarUrl: null,
      isLookingForMembers: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createTeamMember(teamId: string, userId: string, isLead: boolean = false) {
    return {
      id: `tm-${teamId}-${userId}`,
      teamId,
      userId,
      role: isLead ? 'LEAD' : 'MEMBER',
      joinedAt: new Date(),
    };
  }

  static createSubmission(teamId: string, hackathonId: string, overrides: any = {}) {
    const id = `sub-${submissionIdCounter++}`;
    return {
      id,
      title: `Test Submission ${submissionIdCounter}`,
      description: 'A test submission',
      teamId,
      hackathonId,
      trackId: null,
      repositoryUrl: 'https://github.com/test/repo',
      demoUrl: 'https://demo.test.com',
      videoUrl: null,
      status: SubmissionStatus.DRAFT,
      submittedAt: null,
      finalScore: null,
      rank: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createChallenge(overrides: any = {}) {
    const id = `chal-${challengeIdCounter++}`;
    return {
      id,
      title: `Test Challenge ${challengeIdCounter}`,
      slug: `test-challenge-${challengeIdCounter}`,
      description: 'A test challenge',
      difficulty: 'MEDIUM',
      status: ChallengeStatus.OPEN,
      points: 100,
      vaultKeyReward: 1,
      createdById: 'admin-1',
      category: 'TECHNICAL',
      tags: ['test', 'challenge'],
      startDate: null,
      endDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createBadge(overrides: any = {}) {
    return {
      id: `badge-${Date.now()}`,
      name: 'Test Badge',
      slug: 'test-badge',
      description: 'A test badge',
      iconUrl: null,
      rarity: 'COMMON',
      category: 'ACHIEVEMENT',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createXpEvent(userId: string, overrides: any = {}) {
    return {
      id: `xp-${Date.now()}`,
      userId,
      amount: 50,
      reason: 'TEST_EVENT',
      entityType: null,
      entityId: null,
      createdAt: new Date(),
      ...overrides,
    };
  }

  static createHackathonJudge(userId: string, hackathonId: string, overrides: any = {}) {
    return {
      id: `judge-${userId}-${hackathonId}`,
      userId,
      hackathonId,
      trackId: null,
      assignedAt: new Date(),
      ...overrides,
    };
  }

  static createCriteria(hackathonId: string, overrides: any = {}) {
    return {
      id: `criteria-${Date.now()}`,
      hackathonId,
      name: 'Innovation',
      description: 'How innovative is the solution',
      weight: 25,
      maxScore: 10,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static createScore(submissionId: string, judgeId: string, criteriaId: string, overrides: any = {}) {
    return {
      id: `score-${Date.now()}`,
      submissionId,
      judgeId,
      criteriaId,
      score: 8,
      feedback: 'Good work',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }
}
