import {
  PrismaClient,
  Role,
  HackathonStatus,
  HackathonLocation,
  ChallengeStatus,
  RewardType,
  SubmissionStatus,
  NotificationType,
  ReportStatus,
  ReportType,
  AnnouncementScope,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with comprehensive data...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.score.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.criteria.deleteMany();
  await prisma.judge.deleteMany();
  await prisma.mentorSession.deleteMany();
  await prisma.mentor.deleteMany();
  await prisma.teamInvitation.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.track.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.challengeSubmission.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.commentThread.deleteMany();
  await prisma.xpEvent.deleteMany();
  await prisma.leaderboardSnapshot.deleteMany();
  await prisma.gamificationProfile.deleteMany();
  await prisma.notificationPreferences.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.file.deleteMany();
  await prisma.hackathon.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.badge.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // ============================================
  // CREATE USERS (25 users across all roles)
  // ============================================
  console.log('👥 Creating users...');

  const bankAdmin = await prisma.user.create({
    data: {
      email: 'admin@nbc.com',
      name: 'Sarah Johnson',
      handle: 'sarah_admin',
      password: passwordHash,
      roles: [Role.BANK_ADMIN, Role.MODERATOR],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      bio: 'Innovation Lab Administrator at National Bank of Canada. Leading digital transformation initiatives.',
      organization: 'National Bank of Canada',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000), // Within last week
    },
  });

  const organizer1 = await prisma.user.create({
    data: {
      email: 'organizer@nbc.com',
      name: 'Michael Chen',
      handle: 'michael_organizer',
      password: passwordHash,
      roles: [Role.ORGANIZER, Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      bio: 'Event Organizer & Tech Evangelist. Passionate about building developer communities.',
      organization: 'National Bank of Canada',
      emailVerified: new Date(),
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      email: 'lisa.organizer@nbc.com',
      name: 'Lisa Wang',
      handle: 'lisa_events',
      password: passwordHash,
      roles: [Role.ORGANIZER, Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
      bio: 'Senior Event Coordinator specializing in hackathons and innovation challenges.',
      organization: 'National Bank of Canada',
      emailVerified: new Date(),
    },
  });

  const mentor1 = await prisma.user.create({
    data: {
      email: 'mentor@vaultix.com',
      name: 'Dr. Emily Rodriguez',
      handle: 'emily_mentor',
      password: passwordHash,
      roles: [Role.MENTOR, Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      bio: 'Senior Software Architect | Cloud & AI Specialist | Mentor',
      organization: 'Vaultix Technologies',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000),
    },
  });

  const mentor2 = await prisma.user.create({
    data: {
      email: 'marcus.mentor@nbc.com',
      name: 'Marcus Thompson',
      handle: 'marcus_tech',
      password: passwordHash,
      roles: [Role.MENTOR, Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
      bio: 'Full-stack expert with 10+ years building fintech solutions.',
      organization: 'National Bank of Canada',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000),
    },
  });

  const judge1 = await prisma.user.create({
    data: {
      email: 'judge@nbc.com',
      name: 'James Patterson',
      handle: 'james_judge',
      password: passwordHash,
      roles: [Role.JUDGE, Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
      bio: 'Principal Engineer | Innovation Lead',
      organization: 'National Bank of Canada',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
    },
  });

  const judge2 = await prisma.user.create({
    data: {
      email: 'sophia.judge@vaultix.com',
      name: 'Sophia Martinez',
      handle: 'sophia_security',
      password: passwordHash,
      roles: [Role.JUDGE, Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
      bio: 'Security Architect specializing in fintech security solutions.',
      organization: 'Vaultix Technologies',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 12) * 24 * 60 * 60 * 1000),
    },
  });

  const judge3 = await prisma.user.create({
    data: {
      email: 'robert.judge@nbc.com',
      name: 'Robert Lee',
      handle: 'robert_ai',
      password: passwordHash,
      roles: [Role.JUDGE, Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
      bio: 'AI Research Lead with expertise in machine learning and NLP.',
      organization: 'National Bank of Canada',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 8) * 24 * 60 * 60 * 1000),
    },
  });

  const projectOwner1 = await prisma.user.create({
    data: {
      email: 'projects@nbc.com',
      name: 'David Kim',
      handle: 'david_projects',
      password: passwordHash,
      roles: [Role.PROJECT_OWNER, Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      bio: 'Product Manager | Innovation Projects Lead',
      organization: 'National Bank of Canada',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 18) * 24 * 60 * 60 * 1000),
    },
  });

  const projectOwner2 = await prisma.user.create({
    data: {
      email: 'jennifer.projects@nbc.com',
      name: 'Jennifer Brown',
      handle: 'jennifer_pm',
      password: passwordHash,
      roles: [Role.PROJECT_OWNER, Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
      bio: 'Senior Product Manager for Digital Banking Initiatives',
      organization: 'National Bank of Canada',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 25) * 24 * 60 * 60 * 1000),
    },
  });

  // Create 15 participants
  const alex = await prisma.user.create({
    data: {
      email: 'alex@example.com',
      name: 'Alex Thompson',
      handle: 'alex_dev',
      password: passwordHash,
      roles: [Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      bio: 'Full-stack developer passionate about fintech innovation',
      organization: 'Freelance',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000),
    },
  });

  const maria = await prisma.user.create({
    data: {
      email: 'maria@example.com',
      name: 'Maria Garcia',
      handle: 'maria_designer',
      password: passwordHash,
      roles: [Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      bio: 'UX/UI Designer | Design Systems Advocate',
      organization: 'DesignStudio',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000),
    },
  });

  const ryan = await prisma.user.create({
    data: {
      email: 'ryan@example.com',
      name: 'Ryan Cooper',
      handle: 'ryan_backend',
      password: passwordHash,
      roles: [Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan',
      bio: 'Backend engineer specializing in scalable systems',
      organization: 'TechCorp',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000),
    },
  });

  const nina = await prisma.user.create({
    data: {
      email: 'nina@example.com',
      name: 'Nina Patel',
      handle: 'nina_frontend',
      password: passwordHash,
      roles: [Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina',
      bio: 'Frontend developer with React/Next.js expertise',
      organization: 'StartupXYZ',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000),
    },
  });

  const carlos = await prisma.user.create({
    data: {
      email: 'carlos@example.com',
      name: 'Carlos Santos',
      handle: 'carlos_ml',
      password: passwordHash,
      roles: [Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      bio: 'Machine Learning Engineer | AI enthusiast',
      organization: 'AI Labs',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 6) * 24 * 60 * 60 * 1000),
    },
  });

  const olivia = await prisma.user.create({
    data: {
      email: 'olivia@example.com',
      name: 'Olivia Chen',
      handle: 'olivia_security',
      password: passwordHash,
      roles: [Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia',
      bio: 'Security researcher focused on web application security',
      organization: 'SecureNet',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 12) * 24 * 60 * 60 * 1000),
    },
  });

  const ethan = await prisma.user.create({
    data: {
      email: 'ethan@example.com',
      name: 'Ethan Williams',
      handle: 'ethan_mobile',
      password: passwordHash,
      roles: [Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ethan',
      bio: 'Mobile app developer (iOS & Android)',
      organization: 'Mobile First Inc',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000),
    },
  });

  const zara = await prisma.user.create({
    data: {
      email: 'zara@example.com',
      name: 'Zara Ahmed',
      handle: 'zara_data',
      password: passwordHash,
      roles: [Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zara',
      bio: 'Data scientist and analytics expert',
      organization: 'DataDriven Co',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 8) * 24 * 60 * 60 * 1000),
    },
  });

  const liam = await prisma.user.create({
    data: {
      email: 'liam@example.com',
      name: 'Liam Murphy',
      handle: 'liam_devops',
      password: passwordHash,
      roles: [Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam',
      bio: 'DevOps engineer | Cloud infrastructure specialist',
      organization: 'CloudOps',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 11) * 24 * 60 * 60 * 1000),
    },
  });

  const isabella = await prisma.user.create({
    data: {
      email: 'isabella@example.com',
      name: 'Isabella Romano',
      handle: 'isabella_pm',
      password: passwordHash,
      roles: [Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella',
      bio: 'Product manager transitioning to software engineering',
      organization: 'ProductHub',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 17) * 24 * 60 * 60 * 1000),
    },
  });

  const jacob = await prisma.user.create({
    data: {
      email: 'jacob@example.com',
      name: 'Jacob Anderson',
      handle: 'jacob_blockchain',
      password: passwordHash,
      roles: [Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jacob',
      bio: 'Blockchain developer | Web3 enthusiast',
      organization: 'DeFi Solutions',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000),
    },
  });

  const emma = await prisma.user.create({
    data: {
      email: 'emma@example.com',
      name: 'Emma Taylor',
      handle: 'emma_qa',
      password: passwordHash,
      roles: [Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      bio: 'QA Engineer | Test automation specialist',
      organization: 'QualityFirst',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 9) * 24 * 60 * 60 * 1000),
    },
  });

  const noah = await prisma.user.create({
    data: {
      email: 'noah@example.com',
      name: 'Noah Jackson',
      handle: 'noah_game',
      password: passwordHash,
      roles: [Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah',
      bio: 'Game developer exploring fintech gamification',
      organization: 'GameDev Studio',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 4) * 24 * 60 * 60 * 1000),
    },
  });

  const ava = await prisma.user.create({
    data: {
      email: 'ava@example.com',
      name: 'Ava Mitchell',
      handle: 'ava_ux',
      password: passwordHash,
      roles: [Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ava',
      bio: 'UX Researcher | Human-centered design advocate',
      organization: 'UX Research Lab',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 13) * 24 * 60 * 60 * 1000),
    },
  });

  const mason = await prisma.user.create({
    data: {
      email: 'mason@example.com',
      name: 'Mason Clark',
      handle: 'mason_solo',
      password: passwordHash,
      roles: [Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mason',
      bio: 'Solo developer | Building the future one project at a time',
      organization: 'Independent',
      emailVerified: new Date(),
      lastLoginAt: new Date(Date.now() - Math.floor(Math.random() * 22) * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Created 25 users');

  // ============================================
  // CREATE BADGES
  // ============================================
  console.log('🏅 Creating badges...');

  const badges = [
    // First Actions
    { slug: 'first-project', name: 'First Steps', description: 'Submitted your first hackathon project', icon: '🚀', xpRequired: 0, rarity: 'common' },
    { slug: 'first-challenge', name: 'Challenge Accepted', description: 'Completed your first coding challenge', icon: '💻', xpRequired: 0, rarity: 'common' },
    { slug: 'first-team', name: 'Team Player', description: 'Created or joined your first team', icon: '👥', xpRequired: 0, rarity: 'common' },

    // Level Milestones
    { slug: 'level-5', name: 'Rising Star', description: 'Reached level 5', icon: '⭐', xpRequired: 1000, rarity: 'uncommon' },
    { slug: 'level-10', name: 'Expert Developer', description: 'Reached level 10', icon: '🌟', xpRequired: 11000, rarity: 'rare' },
    { slug: 'level-15', name: 'Master Coder', description: 'Reached level 15', icon: '💎', xpRequired: 41000, rarity: 'epic' },
    { slug: 'level-20', name: 'Legend', description: 'Reached level 20', icon: '👑', xpRequired: 100000, rarity: 'legendary' },

    // Streaks
    { slug: 'streak-7', name: 'Week Warrior', description: 'Maintained a 7-day login streak', icon: '🔥', xpRequired: 0, rarity: 'uncommon' },
    { slug: 'streak-30', name: 'Monthly Master', description: 'Maintained a 30-day login streak', icon: '🔥🔥', xpRequired: 0, rarity: 'rare' },

    // Hackathon Achievements
    { slug: 'first-win', name: 'Victory!', description: 'Won your first hackathon', icon: '🏆', xpRequired: 0, rarity: 'rare' },
    { slug: 'triple-threat', name: 'Triple Threat', description: 'Won three hackathons', icon: '🥇', xpRequired: 0, rarity: 'epic' },
    { slug: 'hackathon-legend', name: 'Hackathon Legend', description: 'Won ten hackathons', icon: '👑🏆', xpRequired: 0, rarity: 'legendary' },

    // Challenge Achievements
    { slug: 'challenge-champion', name: 'Challenge Champion', description: 'Won 5 coding challenges', icon: '🥊', xpRequired: 0, rarity: 'rare' },
    { slug: 'challenge-master', name: 'Challenge Master', description: 'Won 20 coding challenges', icon: '🎯', xpRequired: 0, rarity: 'epic' },
    { slug: 'perfect-score', name: 'Perfect Score', description: 'Received a perfect 100/100 score', icon: '💯', xpRequired: 0, rarity: 'rare' },

    // Team Achievements
    { slug: 'team-leader', name: 'Natural Leader', description: 'Led 5 different teams', icon: '🎖️', xpRequired: 0, rarity: 'uncommon' },
    { slug: 'solo-hero', name: 'Solo Hero', description: 'Won a hackathon as a one-person team', icon: '🦸', xpRequired: 0, rarity: 'epic' },

    // XP Milestones
    { slug: 'xp-1k', name: 'Thousand Club', description: 'Earned 1,000 total XP', icon: '💪', xpRequired: 1000, rarity: 'uncommon' },
    { slug: 'xp-5k', name: 'Five Thousand', description: 'Earned 5,000 total XP', icon: '💪💪', xpRequired: 5000, rarity: 'rare' },
    { slug: 'xp-10k', name: 'Ten Thousand Strong', description: 'Earned 10,000 total XP', icon: '⚡', xpRequired: 10000, rarity: 'epic' },

    // Special Achievements
    { slug: 'early-bird', name: 'Early Bird', description: 'One of the first 100 users', icon: '🐦', xpRequired: 0, rarity: 'rare' },
    { slug: 'mentor', name: 'Mentor', description: 'Helped judge 10 submissions', icon: '🎓', xpRequired: 0, rarity: 'uncommon' },
    { slug: 'contributor', name: 'Contributor', description: 'Submitted 20 challenge solutions', icon: '📝', xpRequired: 0, rarity: 'uncommon' },
    { slug: 'innovator', name: 'Innovator', description: 'Created a challenge with 50+ submissions', icon: '💡', xpRequired: 0, rarity: 'epic' },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: badge,
      create: badge,
    });
  }

  console.log(`✅ Created ${badges.length} badges`);

  // ============================================
  // CREATE GAMIFICATION PROFILES
  // ============================================
  console.log('🎮 Creating gamification profiles...');

  await prisma.gamificationProfile.create({
    data: {
      userId: alex.id,
      xp: 3450,
      level: 8,
      streakDays: 15,
      vaultKeys: 35,
      badges: ['first-project', 'first-team', 'first-challenge', 'streak-7', 'xp-1k', 'level-5', 'early-bird'],
    },
  });

  await prisma.gamificationProfile.create({
    data: {
      userId: maria.id,
      xp: 2100,
      level: 6,
      streakDays: 8,
      vaultKeys: 22,
      badges: ['first-project', 'first-team', 'streak-7', 'xp-1k', 'level-5'],
    },
  });

  await prisma.gamificationProfile.create({
    data: {
      userId: ryan.id,
      xp: 5600,
      level: 10,
      streakDays: 25,
      vaultKeys: 58,
      badges: ['first-project', 'first-team', 'first-challenge', 'streak-7', 'xp-1k', 'xp-5k', 'level-5', 'level-10', 'first-win'],
    },
  });

  await prisma.gamificationProfile.create({
    data: {
      userId: nina.id,
      xp: 1800,
      level: 5,
      streakDays: 5,
      vaultKeys: 18,
      badges: ['first-project', 'first-team', 'xp-1k', 'level-5'],
    },
  });

  await prisma.gamificationProfile.create({
    data: {
      userId: carlos.id,
      xp: 4200,
      level: 9,
      streakDays: 12,
      vaultKeys: 42,
      badges: ['first-project', 'first-team', 'first-challenge', 'streak-7', 'xp-1k', 'level-5', 'challenge-champion'],
    },
  });

  await prisma.gamificationProfile.create({
    data: {
      userId: olivia.id,
      xp: 2850,
      level: 7,
      streakDays: 10,
      vaultKeys: 28,
      badges: ['first-project', 'first-team', 'streak-7', 'xp-1k', 'level-5'],
    },
  });

  await prisma.gamificationProfile.create({
    data: {
      userId: ethan.id,
      xp: 1500,
      level: 5,
      streakDays: 3,
      vaultKeys: 15,
      badges: ['first-project', 'first-team', 'xp-1k', 'level-5'],
    },
  });

  await prisma.gamificationProfile.create({
    data: {
      userId: zara.id,
      xp: 3100,
      level: 7,
      streakDays: 14,
      vaultKeys: 31,
      badges: ['first-project', 'first-team', 'streak-7', 'xp-1k', 'level-5'],
    },
  });

  await prisma.gamificationProfile.create({
    data: {
      userId: liam.id,
      xp: 2400,
      level: 6,
      streakDays: 7,
      vaultKeys: 24,
      badges: ['first-project', 'first-team', 'streak-7', 'xp-1k', 'level-5'],
    },
  });

  await prisma.gamificationProfile.create({
    data: {
      userId: isabella.id,
      xp: 1200,
      level: 4,
      streakDays: 4,
      vaultKeys: 12,
      badges: ['first-project', 'first-team', 'xp-1k'],
    },
  });

  await prisma.gamificationProfile.create({
    data: {
      userId: jacob.id,
      xp: 2700,
      level: 7,
      streakDays: 9,
      vaultKeys: 27,
      badges: ['first-project', 'first-team', 'streak-7', 'xp-1k', 'level-5'],
    },
  });

  await prisma.gamificationProfile.create({
    data: {
      userId: emma.id,
      xp: 1900,
      level: 5,
      streakDays: 6,
      vaultKeys: 19,
      badges: ['first-project', 'first-team', 'xp-1k', 'level-5'],
    },
  });

  await prisma.gamificationProfile.create({
    data: {
      userId: noah.id,
      xp: 3800,
      level: 8,
      streakDays: 11,
      vaultKeys: 38,
      badges: ['first-project', 'first-team', 'streak-7', 'xp-1k', 'level-5'],
    },
  });

  await prisma.gamificationProfile.create({
    data: {
      userId: ava.id,
      xp: 2200,
      level: 6,
      streakDays: 8,
      vaultKeys: 22,
      badges: ['first-project', 'first-team', 'streak-7', 'xp-1k', 'level-5'],
    },
  });

  await prisma.gamificationProfile.create({
    data: {
      userId: mason.id,
      xp: 1600,
      level: 5,
      streakDays: 5,
      vaultKeys: 16,
      badges: ['first-project', 'xp-1k', 'level-5', 'solo-hero'],
    },
  });

  console.log('✅ Created gamification profiles');

  // ============================================
  // CREATE HACKATHON 1: COMPLETED (Winter Sprint 2024)
  // ============================================
  console.log('🏆 Creating completed hackathon...');

  const completedHackathon = await prisma.hackathon.create({
    data: {
      slug: 'winter-sprint-2024',
      title: 'Winter Sprint 2024',
      description: `The first-ever Vaultix Innovation Lab hackathon! Over 50 participants competed in building cutting-edge fintech solutions.

🎯 Focus Areas:
- Digital Banking Innovation
- AI-Powered Financial Services
- Security & Privacy Solutions

💰 Prize Pool: $20,000 CAD
🏆 Winners announced!`,
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
      status: HackathonStatus.CLOSED,
      location: HackathonLocation.VIRTUAL,
      registrationOpensAt: new Date('2024-12-01T00:00:00Z'),
      registrationClosesAt: new Date('2024-12-20T23:59:59Z'),
      startsAt: new Date('2024-12-28T18:00:00Z'),
      endsAt: new Date('2024-12-30T18:00:00Z'),
      judgingEndsAt: new Date('2025-01-05T18:00:00Z'),
      prizePool: 20000,
      maxTeamSize: 5,
      allowSoloTeams: true,
      rules: `# Hackathon Rules

## Eligibility
- Open to all participants 18+ years old
- Teams of 1-5 members allowed
- No prior work - projects must be built during the hackathon

## Judging Criteria
- Innovation & Creativity (30%)
- Technical Implementation (30%)
- User Experience (20%)
- Impact & Feasibility (20%)`,
    },
  });

  // Tracks for completed hackathon
  const track1 = await prisma.track.create({
    data: {
      hackathonId: completedHackathon.id,
      title: 'Web & Mobile',
      description: 'Build innovative web or mobile applications',
      order: 1,
    },
  });

  const track2 = await prisma.track.create({
    data: {
      hackathonId: completedHackathon.id,
      title: 'AI & Machine Learning',
      description: 'Leverage AI/ML to enhance financial services',
      order: 2,
    },
  });

  // Judging criteria
  const criteriaInnovation1 = await prisma.criteria.create({
    data: { hackathonId: completedHackathon.id, name: 'Innovation', description: 'Originality and creativity', maxScore: 10, weight: 0.3, order: 1 },
  });
  const criteriaTechnical1 = await prisma.criteria.create({
    data: { hackathonId: completedHackathon.id, name: 'Technical', description: 'Code quality and implementation', maxScore: 10, weight: 0.3, order: 2 },
  });
  const criteriaUX1 = await prisma.criteria.create({
    data: { hackathonId: completedHackathon.id, name: 'UX/UI', description: 'User experience design', maxScore: 10, weight: 0.2, order: 3 },
  });
  const criteriaImpact1 = await prisma.criteria.create({
    data: { hackathonId: completedHackathon.id, name: 'Impact', description: 'Real-world impact', maxScore: 10, weight: 0.2, order: 4 },
  });

  // Judges for completed hackathon
  const judgeRecord1 = await prisma.judge.create({
    data: { userId: judge1.id, hackathonId: completedHackathon.id, bio: 'Principal Engineer with 15 years experience' },
  });
  const judgeRecord2 = await prisma.judge.create({
    data: { userId: judge2.id, hackathonId: completedHackathon.id, bio: 'Security Architect specializing in fintech' },
  });

  // Mentors for completed hackathon
  await prisma.mentor.createMany({
    data: [
      { userId: mentor1.id, hackathonId: completedHackathon.id, bio: 'Cloud & AI expert', calendlyUrl: 'https://calendly.com/emily', expertise: ['Cloud', 'AI/ML'] },
      { userId: mentor2.id, hackathonId: completedHackathon.id, bio: 'Full-stack fintech specialist', calendlyUrl: 'https://calendly.com/marcus', expertise: ['Full-stack', 'Fintech'] },
    ],
  });

  // Winning team
  const winningTeam = await prisma.team.create({
    data: {
      hackathonId: completedHackathon.id,
      name: 'Team Phoenix',
      bio: 'Building the future of digital banking',
      logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Phoenix',
      repoUrl: 'https://github.com/team-phoenix/smartbank',
      demoUrl: 'https://smartbank-demo.vercel.app',
    },
  });

  await prisma.teamMember.createMany({
    data: [
      { teamId: winningTeam.id, userId: ryan.id, role: 'LEAD' },
      { teamId: winningTeam.id, userId: nina.id, role: 'MEMBER' },
      { teamId: winningTeam.id, userId: liam.id, role: 'MEMBER' },
    ],
  });

  // Winning submission
  const winningSubmission = await prisma.submission.create({
    data: {
      hackathonId: completedHackathon.id,
      teamId: winningTeam.id,
      trackId: track1.id,
      title: 'SmartBank AI Assistant',
      abstract: `An AI-powered banking assistant that helps users manage their finances intelligently.

Features:
- Natural language queries
- Spending insights and predictions
- Personalized financial advice
- Budget optimization suggestions

Tech Stack: Next.js, Python, TensorFlow, PostgreSQL`,
      repoUrl: 'https://github.com/team-phoenix/smartbank',
      demoUrl: 'https://smartbank-demo.vercel.app',
      videoUrl: 'https://youtube.com/watch?v=demo',
      status: SubmissionStatus.SUBMITTED,
    },
  });

  // Scores for winning submission
  await prisma.score.createMany({
    data: [
      { submissionId: winningSubmission.id, judgeId: judgeRecord1.id, criterionId: criteriaInnovation1.id, score: 10 },
      { submissionId: winningSubmission.id, judgeId: judgeRecord1.id, criterionId: criteriaTechnical1.id, score: 9 },
      { submissionId: winningSubmission.id, judgeId: judgeRecord1.id, criterionId: criteriaUX1.id, score: 9 },
      { submissionId: winningSubmission.id, judgeId: judgeRecord1.id, criterionId: criteriaImpact1.id, score: 9 },
      { submissionId: winningSubmission.id, judgeId: judgeRecord2.id, criterionId: criteriaInnovation1.id, score: 9 },
      { submissionId: winningSubmission.id, judgeId: judgeRecord2.id, criterionId: criteriaTechnical1.id, score: 10 },
      { submissionId: winningSubmission.id, judgeId: judgeRecord2.id, criterionId: criteriaUX1.id, score: 8 },
      { submissionId: winningSubmission.id, judgeId: judgeRecord2.id, criterionId: criteriaImpact1.id, score: 10 },
    ],
  });

  // Second place team
  const secondTeam = await prisma.team.create({
    data: {
      hackathonId: completedHackathon.id,
      name: 'Code Crusaders',
      bio: 'Making finance accessible to everyone',
      logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Crusaders',
      repoUrl: 'https://github.com/code-crusaders/finease',
      demoUrl: 'https://finease.netlify.app',
    },
  });

  await prisma.teamMember.createMany({
    data: [
      { teamId: secondTeam.id, userId: carlos.id, role: 'LEAD' },
      { teamId: secondTeam.id, userId: zara.id, role: 'MEMBER' },
    ],
  });

  const secondSubmission = await prisma.submission.create({
    data: {
      hackathonId: completedHackathon.id,
      teamId: secondTeam.id,
      trackId: track2.id,
      title: 'FinEase - Financial Literacy Platform',
      abstract: `Gamified financial literacy platform for young adults.

Features:
- Interactive lessons
- Real-world simulations
- Achievement system
- Community challenges`,
      repoUrl: 'https://github.com/code-crusaders/finease',
      demoUrl: 'https://finease.netlify.app',
      status: SubmissionStatus.SUBMITTED,
    },
  });

  await prisma.score.createMany({
    data: [
      { submissionId: secondSubmission.id, judgeId: judgeRecord1.id, criterionId: criteriaInnovation1.id, score: 9 },
      { submissionId: secondSubmission.id, judgeId: judgeRecord1.id, criterionId: criteriaTechnical1.id, score: 8 },
      { submissionId: secondSubmission.id, judgeId: judgeRecord1.id, criterionId: criteriaUX1.id, score: 9 },
      { submissionId: secondSubmission.id, judgeId: judgeRecord1.id, criterionId: criteriaImpact1.id, score: 9 },
      { submissionId: secondSubmission.id, judgeId: judgeRecord2.id, criterionId: criteriaInnovation1.id, score: 8 },
      { submissionId: secondSubmission.id, judgeId: judgeRecord2.id, criterionId: criteriaTechnical1.id, score: 9 },
      { submissionId: secondSubmission.id, judgeId: judgeRecord2.id, criterionId: criteriaUX1.id, score: 10 },
      { submissionId: secondSubmission.id, judgeId: judgeRecord2.id, criterionId: criteriaImpact1.id, score: 8 },
    ],
  });

  // Solo hero
  const soloTeam = await prisma.team.create({
    data: {
      hackathonId: completedHackathon.id,
      name: 'Mason Solo',
      bio: 'One person, infinite possibilities',
      logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Mason',
      repoUrl: 'https://github.com/mason/cryptovault',
    },
  });

  await prisma.teamMember.create({
    data: { teamId: soloTeam.id, userId: mason.id, role: 'LEAD' },
  });

  const soloSubmission = await prisma.submission.create({
    data: {
      hackathonId: completedHackathon.id,
      teamId: soloTeam.id,
      trackId: track1.id,
      title: 'CryptoVault - Secure Wallet',
      abstract: 'Hardware-backed cryptocurrency wallet with biometric security',
      repoUrl: 'https://github.com/mason/cryptovault',
      status: SubmissionStatus.SUBMITTED,
    },
  });

  await prisma.score.createMany({
    data: [
      { submissionId: soloSubmission.id, judgeId: judgeRecord1.id, criterionId: criteriaInnovation1.id, score: 8 },
      { submissionId: soloSubmission.id, judgeId: judgeRecord1.id, criterionId: criteriaTechnical1.id, score: 9 },
      { submissionId: soloSubmission.id, judgeId: judgeRecord1.id, criterionId: criteriaUX1.id, score: 7 },
      { submissionId: soloSubmission.id, judgeId: judgeRecord1.id, criterionId: criteriaImpact1.id, score: 8 },
    ],
  });

  console.log('✅ Created completed hackathon with winners');

  // ============================================
  // CREATE HACKATHON 2: ACTIVE (Vaultix Spring Challenge 2025)
  // ============================================
  console.log('🔥 Creating active hackathon...');

  const activeHackathon = await prisma.hackathon.create({
    data: {
      slug: 'spring-challenge-2025',
      title: 'Vaultix Spring Challenge 2025',
      description: `Join us NOW for our biggest hackathon yet!

🎯 Focus Areas:
- AI-Powered Banking
- Blockchain & DeFi
- Mobile-First Solutions
- Accessibility & Inclusion

💰 Prize Pool: $30,000 CAD
🏆 Multiple categories
🎓 24/7 mentor support
🔴 LIVE NOW - Submit before deadline!`,
      coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200',
      status: HackathonStatus.LIVE,
      location: HackathonLocation.VIRTUAL,
      registrationOpensAt: new Date('2025-01-10T00:00:00Z'),
      registrationClosesAt: new Date('2025-01-20T23:59:59Z'),
      startsAt: new Date('2025-01-18T18:00:00Z'),
      endsAt: new Date('2025-01-21T18:00:00Z'),
      judgingEndsAt: new Date('2025-01-25T18:00:00Z'),
      prizePool: 30000,
      maxTeamSize: 5,
      allowSoloTeams: true,
      rules: `# Spring Challenge Rules

## Important Dates
- Registration Closes: Jan 20, 2025
- Submission Deadline: Jan 21, 2025 6:00 PM EST
- Winners Announced: Jan 26, 2025

## Judging Criteria
- Innovation (25%)
- Technical Complexity (25%)
- Design & UX (20%)
- Business Value (20%)
- Presentation (10%)`,
    },
  });

  // Tracks
  const aiTrack = await prisma.track.create({
    data: {
      hackathonId: activeHackathon.id,
      title: 'AI & Machine Learning',
      description: 'Build AI-powered financial solutions',
      order: 1,
    },
  });

  const blockchainTrack = await prisma.track.create({
    data: {
      hackathonId: activeHackathon.id,
      title: 'Blockchain & DeFi',
      description: 'Decentralized finance solutions',
      order: 2,
    },
  });

  const mobileTrack = await prisma.track.create({
    data: {
      hackathonId: activeHackathon.id,
      title: 'Mobile-First',
      description: 'Revolutionary mobile banking apps',
      order: 3,
    },
  });

  // Criteria
  const criteriaInnovation2 = await prisma.criteria.create({
    data: { hackathonId: activeHackathon.id, name: 'Innovation', description: 'Novel approach to problem', maxScore: 10, weight: 0.25, order: 1 },
  });
  const criteriaTechnical2 = await prisma.criteria.create({
    data: { hackathonId: activeHackathon.id, name: 'Technical', description: 'Technical complexity and quality', maxScore: 10, weight: 0.25, order: 2 },
  });
  const criteriaDesign2 = await prisma.criteria.create({
    data: { hackathonId: activeHackathon.id, name: 'Design', description: 'UI/UX design quality', maxScore: 10, weight: 0.2, order: 3 },
  });
  const criteriaBusiness2 = await prisma.criteria.create({
    data: { hackathonId: activeHackathon.id, name: 'Business Value', description: 'Commercial viability', maxScore: 10, weight: 0.2, order: 4 },
  });
  const criteriaPresentation2 = await prisma.criteria.create({
    data: { hackathonId: activeHackathon.id, name: 'Presentation', description: 'Quality of pitch', maxScore: 10, weight: 0.1, order: 5 },
  });

  // Judges
  const judgeRecordActive1 = await prisma.judge.create({
    data: { userId: judge1.id, hackathonId: activeHackathon.id, bio: 'Principal Engineer' },
  });
  const judgeRecordActive2 = await prisma.judge.create({
    data: { userId: judge2.id, hackathonId: activeHackathon.id, bio: 'Security Architect' },
  });
  await prisma.judge.create({
    data: { userId: judge3.id, hackathonId: activeHackathon.id, bio: 'AI Research Lead' },
  });

  // Mentors
  await prisma.mentor.createMany({
    data: [
      { userId: mentor1.id, hackathonId: activeHackathon.id, bio: 'Cloud & AI expert', calendlyUrl: 'https://calendly.com/emily', expertise: ['Cloud', 'AI/ML', 'System Design'] },
      { userId: mentor2.id, hackathonId: activeHackathon.id, bio: 'Full-stack specialist', calendlyUrl: 'https://calendly.com/marcus', expertise: ['Full-stack', 'React', 'Node.js'] },
    ],
  });

  // Team 1 (with submission)
  const activeTeam1 = await prisma.team.create({
    data: {
      hackathonId: activeHackathon.id,
      name: 'AI Innovators',
      bio: 'Leveraging AI for financial inclusion',
      logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=AIInnovators',
      repoUrl: 'https://github.com/ai-innovators/project',
    },
  });

  await prisma.teamMember.createMany({
    data: [
      { teamId: activeTeam1.id, userId: alex.id, role: 'LEAD' },
      { teamId: activeTeam1.id, userId: maria.id, role: 'MEMBER' },
      { teamId: activeTeam1.id, userId: ethan.id, role: 'MEMBER' },
    ],
  });

  const activeSubmission1 = await prisma.submission.create({
    data: {
      hackathonId: activeHackathon.id,
      teamId: activeTeam1.id,
      trackId: aiTrack.id,
      title: 'AI Credit Advisor',
      abstract: `ML-powered credit advisory system that provides personalized financial recommendations.

Tech Stack: Python, TensorFlow, FastAPI, React`,
      repoUrl: 'https://github.com/ai-innovators/credit-advisor',
      demoUrl: 'https://credit-advisor.vercel.app',
      status: SubmissionStatus.SUBMITTED,
    },
  });

  // Partial judging
  await prisma.score.createMany({
    data: [
      { submissionId: activeSubmission1.id, judgeId: judgeRecordActive1.id, criterionId: criteriaInnovation2.id, score: 9 },
      { submissionId: activeSubmission1.id, judgeId: judgeRecordActive1.id, criterionId: criteriaTechnical2.id, score: 9 },
      { submissionId: activeSubmission1.id, judgeId: judgeRecordActive2.id, criterionId: criteriaInnovation2.id, score: 9 },
    ],
  });

  // Team 2 (with submission)
  const activeTeam2 = await prisma.team.create({
    data: {
      hackathonId: activeHackathon.id,
      name: 'Blockchain Brigade',
      bio: 'Bringing DeFi to traditional banking',
      logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=BlockchainBrigade',
      repoUrl: 'https://github.com/blockchain-brigade/defibank',
    },
  });

  await prisma.teamMember.createMany({
    data: [
      { teamId: activeTeam2.id, userId: jacob.id, role: 'LEAD' },
      { teamId: activeTeam2.id, userId: olivia.id, role: 'MEMBER' },
    ],
  });

  await prisma.submission.create({
    data: {
      hackathonId: activeHackathon.id,
      teamId: activeTeam2.id,
      trackId: blockchainTrack.id,
      title: 'DeFi Bridge',
      abstract: 'Connecting traditional banking with DeFi protocols',
      repoUrl: 'https://github.com/blockchain-brigade/defibank',
      status: SubmissionStatus.SUBMITTED,
    },
  });

  // Team 3 (no submission yet - working on it)
  const activeTeam3 = await prisma.team.create({
    data: {
      hackathonId: activeHackathon.id,
      name: 'Mobile Masters',
      bio: 'Crafting the best mobile banking experience',
      logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=MobileMasters',
    },
  });

  await prisma.teamMember.createMany({
    data: [
      { teamId: activeTeam3.id, userId: noah.id, role: 'LEAD' },
      { teamId: activeTeam3.id, userId: ava.id, role: 'MEMBER' },
      { teamId: activeTeam3.id, userId: emma.id, role: 'MEMBER' },
    ],
  });

  // Team 4 (solo, with submission)
  const activeTeam4 = await prisma.team.create({
    data: {
      hackathonId: activeHackathon.id,
      name: 'Isabella Solo',
      bio: 'Product-focused innovation',
      logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Isabella',
    },
  });

  await prisma.teamMember.create({
    data: { teamId: activeTeam4.id, userId: isabella.id, role: 'LEAD' },
  });

  await prisma.submission.create({
    data: {
      hackathonId: activeHackathon.id,
      teamId: activeTeam4.id,
      trackId: mobileTrack.id,
      title: 'FinFit - Financial Wellness Tracker',
      abstract: 'Mobile app for tracking and improving financial health',
      repoUrl: 'https://github.com/isabella/finfit',
      status: SubmissionStatus.SUBMITTED,
    },
  });

  // Pending team invitation
  await prisma.teamInvitation.create({
    data: {
      teamId: activeTeam3.id,
      invitedById: noah.id,
      inviteeId: liam.id,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Announcements
  await prisma.announcement.create({
    data: {
      scope: 'HACKATHON',
      scopeId: activeHackathon.id,
      title: '🔥 Hackathon is LIVE!',
      body: `The Spring Challenge is officially underway!

⏰ Deadline: Jan 21, 2025 at 6:00 PM EST
📝 Don't forget to submit your project
💬 Join our Discord for real-time support
🎯 Check out the judging criteria

Good luck teams! 🚀`,
      pinned: true,
      publishedAt: new Date(),
    },
  });

  await prisma.announcement.create({
    data: {
      scope: 'HACKATHON',
      scopeId: activeHackathon.id,
      title: 'Mentor Office Hours Extended',
      body: 'Due to popular demand, mentors are now available 24/7 during the hackathon. Book your slots!',
      pinned: false,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Created active hackathon with teams and submissions');

  // ============================================
  // CREATE HACKATHON 3: UPCOMING (Summer Innovation Fest)
  // ============================================
  console.log('📅 Creating upcoming hackathon...');

  const upcomingHackathon = await prisma.hackathon.create({
    data: {
      slug: 'summer-innovation-fest-2025',
      title: 'Summer Innovation Fest 2025',
      description: `Get ready for the biggest fintech hackathon of the summer!

🎯 Theme: "Banking for the Next Generation"

Focus Areas:
- Gen Z Banking Solutions
- Social Finance
- Gamified Savings
- Sustainability in Finance

💰 Prize Pool: $40,000 CAD
🏖️ Summer swag for all participants
🎓 Workshops from industry leaders
📍 Hybrid: Virtual + In-person (Toronto & Montreal)`,
      coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
      status: HackathonStatus.UPCOMING,
      location: HackathonLocation.HYBRID,
      registrationOpensAt: new Date('2025-02-01T00:00:00Z'),
      registrationClosesAt: new Date('2025-02-28T23:59:59Z'),
      startsAt: new Date('2025-03-15T18:00:00Z'),
      endsAt: new Date('2025-03-17T18:00:00Z'),
      judgingEndsAt: new Date('2025-03-22T18:00:00Z'),
      prizePool: 40000,
      maxTeamSize: 6,
      allowSoloTeams: true,
      rules: `# Summer Innovation Fest Rules

## Event Format
- 48-hour hackathon
- Hybrid: Virtual + In-person hubs
- Workshops on Day 1
- Demos on Day 3

## Registration
- Opens Feb 1, 2025
- Early bird perks for first 100 registrants
- Team formation opens Feb 15

## Prizes
- 🥇 1st Place: $15,000
- 🥈 2nd Place: $10,000
- 🥉 3rd Place: $5,000
- 🎯 Category Winners: $2,500 each`,
    },
  });

  await prisma.track.createMany({
    data: [
      { hackathonId: upcomingHackathon.id, title: 'Gen Z Banking', description: 'Solutions for young adults', order: 1 },
      { hackathonId: upcomingHackathon.id, title: 'Social Finance', description: 'Community-driven finance', order: 2 },
      { hackathonId: upcomingHackathon.id, title: 'Sustainable Finance', description: 'ESG and green banking', order: 3 },
    ],
  });

  await prisma.announcement.create({
    data: {
      scope: 'HACKATHON',
      scopeId: upcomingHackathon.id,
      title: 'Registration Opens Feb 1st!',
      body: `Mark your calendars! Registration for Summer Innovation Fest opens February 1st.

🎁 Early Bird Perks:
- Exclusive swag package
- Priority mentor booking
- VIP Discord role
- Featured on our homepage

Set a reminder and don't miss out! 🚀`,
      pinned: true,
      publishedAt: new Date(),
    },
  });

  console.log('✅ Created upcoming hackathon');

  // ============================================
  // CREATE HACKATHON 4: DRAFT (Fall Security Sprint)
  // ============================================
  const draftHackathon = await prisma.hackathon.create({
    data: {
      slug: 'fall-security-sprint-2025',
      title: 'Fall Security Sprint 2025',
      description: 'Focused on cybersecurity and fraud prevention (In Planning)',
      coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200',
      status: HackathonStatus.DRAFT,
      location: HackathonLocation.VIRTUAL,
      registrationOpensAt: new Date('2025-06-01T00:00:00Z'),
      registrationClosesAt: new Date('2025-06-30T23:59:59Z'),
      startsAt: new Date('2025-07-15T18:00:00Z'),
      endsAt: new Date('2025-07-17T18:00:00Z'),
      judgingEndsAt: new Date('2025-07-22T18:00:00Z'),
      prizePool: 25000,
      maxTeamSize: 4,
      allowSoloTeams: false,
      rules: 'TBD - Coming soon!',
    },
  });

  console.log('✅ Created draft hackathon');

  // ============================================
  // CREATE CHALLENGES
  // ============================================
  console.log('💡 Creating challenges...');

  const challenge1 = await prisma.challenge.create({
    data: {
      slug: 'call-center-efficiency',
      title: 'Call Center Efficiency Challenge',
      problemStatement: `## The Problem

Our call centers handle thousands of customer inquiries daily. We need innovative solutions to:
- Reduce average handling time
- Improve first-call resolution rates
- Enhance customer satisfaction
- Support agents with better tools

## Your Mission

Design and build a solution that leverages modern technology (AI, automation, analytics) to make our call centers more efficient while maintaining high-quality customer service.

## Success Metrics
- Measurable improvement in handling time
- Improved customer satisfaction scores
- Agent productivity enhancement
- Scalable solution

## Rewards
💰 $5,000 CAD
🏆 Challenge Champion Badge
⚡ 500 XP`,
      ownerId: projectOwner1.id,
      ownerOrg: 'Customer Experience Department',
      rewardType: RewardType.CASH,
      rewardValue: '$5,000 CAD',
      categories: ['Customer Experience', 'IT', 'Operations'],
      skills: ['Python', 'NLP', 'Data Analysis', 'UI/UX'],
      status: ChallengeStatus.OPEN,
      deadlineAt: new Date('2025-03-31T23:59:59Z'),
    },
  });

  const challenge2 = await prisma.challenge.create({
    data: {
      slug: 'fraud-detection-system',
      title: 'Real-Time Fraud Detection System',
      problemStatement: `## Boss Challenge: Fraud Guardian

Build a real-time fraud detection system to protect customers and reduce financial losses.

## Your Quest
- Detect fraudulent credit card transactions
- Minimize false positives (< 5%)
- Operate in real-time (sub-100ms)
- Provide explainability for decisions

## Loot
💰 $8,000 CAD
🏆 Epic Badge
⚡ 800 XP`,
      ownerId: projectOwner1.id,
      ownerOrg: 'Risk Management',
      rewardType: RewardType.CASH,
      rewardValue: '$8,000 CAD',
      categories: ['Finance', 'Security', 'Risk Management'],
      skills: ['Machine Learning', 'Python', 'Statistics', 'Real-time Systems'],
      status: ChallengeStatus.OPEN,
      deadlineAt: new Date('2025-04-15T23:59:59Z'),
    },
  });

  const challenge3 = await prisma.challenge.create({
    data: {
      slug: 'employee-engagement-platform',
      title: 'Employee Engagement Platform',
      problemStatement: `## Boss Challenge: Culture Boost

Design a platform to improve employee engagement and workplace culture.

## Your Quest
- Track employee sentiment
- Enable peer recognition
- Facilitate anonymous feedback
- Gamify positive behaviors

## Loot
💰 $6,000 CAD
🏆 Legendary Badge
⚡ 600 XP`,
      ownerId: projectOwner2.id,
      ownerOrg: 'Human Resources',
      rewardType: RewardType.CASH,
      rewardValue: '$6,000 CAD',
      categories: ['HR', 'People & Culture', 'Employee Experience'],
      skills: ['UX Design', 'Mobile Development', 'Gamification', 'Analytics'],
      status: ChallengeStatus.OPEN,
      deadlineAt: new Date('2025-05-01T23:59:59Z'),
    },
  });

  const challenge4 = await prisma.challenge.create({
    data: {
      slug: 'social-media-sentiment-tool',
      title: 'Social Media Sentiment Analysis',
      problemStatement: `## Boss Challenge: Brand Guardian

Monitor and analyze customer sentiment across social media platforms.

## Your Quest
- Track brand mentions across platforms
- Perform real-time sentiment analysis
- Alert team to PR issues instantly
- Provide competitive intelligence

## Loot
💰 $4,500 CAD
🏆 Rare Badge
⚡ 450 XP`,
      ownerId: projectOwner2.id,
      ownerOrg: 'Marketing & Communications',
      rewardType: RewardType.CASH,
      rewardValue: '$4,500 CAD',
      categories: ['Marketing', 'Communications', 'Brand Management'],
      skills: ['NLP', 'API Integration', 'Data Visualization', 'Python'],
      status: ChallengeStatus.OPEN,
      deadlineAt: new Date('2025-04-20T23:59:59Z'),
    },
  });

  const challenge5 = await prisma.challenge.create({
    data: {
      slug: 'compliance-automation',
      title: 'Automated Compliance Monitoring',
      problemStatement: `## Boss Challenge: Compliance Guardian

Automate transaction monitoring for regulatory compliance.

## Your Quest
- Monitor for regulatory red flags
- Apply FINTRAC/OSFI rules automatically
- Generate compliance reports
- Reduce false positives by 50%

## Loot
💰 $7,000 CAD
🏆 Epic Badge
⚡ 700 XP`,
      ownerId: projectOwner1.id,
      ownerOrg: 'Legal & Compliance',
      rewardType: RewardType.CASH,
      rewardValue: '$7,000 CAD',
      categories: ['Legal', 'Compliance', 'Regulatory', 'Finance'],
      skills: ['Regulatory Knowledge', 'Automation', 'Python', 'Rule Engines'],
      status: ChallengeStatus.OPEN,
      deadlineAt: new Date('2025-05-15T23:59:59Z'),
    },
  });

  const challenge6 = await prisma.challenge.create({
    data: {
      slug: 'branch-operations-optimizer',
      title: 'Branch Operations Optimizer',
      problemStatement: `## Boss Challenge: Efficiency Master

Optimize branch operations to reduce wait times and improve productivity.

## Your Quest
- Predict customer traffic patterns
- Optimize staff scheduling
- Track service times in real-time
- Identify bottlenecks automatically

## Loot
💰 $5,500 CAD
🏆 Rare Badge
⚡ 550 XP`,
      ownerId: projectOwner2.id,
      ownerOrg: 'Branch Operations',
      rewardType: RewardType.CASH,
      rewardValue: '$5,500 CAD',
      categories: ['Operations', 'Business Intelligence', 'Process Improvement'],
      skills: ['Data Analysis', 'Forecasting', 'Optimization', 'Dashboard Design'],
      status: ChallengeStatus.OPEN,
      deadlineAt: new Date('2025-04-30T23:59:59Z'),
    },
  });

  // Closed challenge (completed)
  const challenge7 = await prisma.challenge.create({
    data: {
      slug: 'mobile-banking-redesign',
      title: 'Mobile Banking App Redesign',
      problemStatement: 'Redesign our mobile banking app for better UX (COMPLETED)',
      ownerId: projectOwner1.id,
      ownerOrg: 'Digital Banking',
      rewardType: RewardType.CASH,
      rewardValue: '$3,000 CAD',
      categories: ['Design', 'Mobile', 'UX'],
      skills: ['UI/UX Design', 'Figma', 'Mobile Development'],
      status: ChallengeStatus.CLOSED,
      deadlineAt: new Date('2024-12-31T23:59:59Z'),
    },
  });

  console.log('✅ Created 7 challenges');

  // Challenge submissions
  await prisma.challengeSubmission.create({
    data: {
      challengeId: challenge1.id,
      userId: alex.id,
      title: 'AI Call Routing System',
      content: 'ML-based intelligent call routing that reduces wait times by 40%',
      repoUrl: 'https://github.com/alex/call-routing',
      status: 'UNDER_REVIEW',
    },
  });

  await prisma.challengeSubmission.create({
    data: {
      challengeId: challenge2.id,
      userId: carlos.id,
      title: 'FraudWatch ML',
      content: 'Real-time fraud detection using ensemble learning. Demo: https://fraudwatch-demo.herokuapp.com',
      repoUrl: 'https://github.com/carlos/fraudwatch',
      status: 'ACCEPTED',
    },
  });

  await prisma.challengeSubmission.create({
    data: {
      challengeId: challenge4.id,
      userId: zara.id,
      title: 'SentimentScope',
      content: 'Multi-platform social media sentiment tracker',
      repoUrl: 'https://github.com/zara/sentimentscope',
      status: 'UNDER_REVIEW',
    },
  });

  await prisma.challengeSubmission.create({
    data: {
      challengeId: challenge7.id,
      userId: maria.id,
      title: 'BankUI Redesign',
      content: 'Complete mobile banking app redesign with accessibility focus. Figma: https://www.figma.com/maria-bankui',
      repoUrl: 'https://github.com/maria/bankui',
      status: 'WINNER',
    },
  });

  console.log('✅ Created challenge submissions');

  // ============================================
  // CREATE NOTIFICATIONS
  // ============================================
  console.log('🔔 Creating notifications...');

  await prisma.notification.createMany({
    data: [
      {
        userId: alex.id,
        type: NotificationType.TEAM_INVITATION,
        title: 'Team Invitation',
        message: 'You have been invited to join AI Innovators',
        link: '/teams/invite-123',
      },
      {
        userId: alex.id,
        type: NotificationType.HACKATHON_REGISTRATION,
        title: 'Hackathon Starting Soon!',
        message: 'Spring Challenge 2025 starts in 2 hours',
        readAt: new Date(),
        link: '/hackathons/spring-challenge-2025',
      },
      {
        userId: maria.id,
        type: NotificationType.JUDGING_COMPLETE,
        title: 'Your Submission Was Scored',
        message: 'Judges have scored your BankUI Redesign submission',
        link: '/challenges/mobile-banking-redesign/submissions',
      },
      {
        userId: ryan.id,
        type: NotificationType.WINNER_ANNOUNCEMENT,
        title: '🎉 Congratulations! You Won!',
        message: 'Team Phoenix won 1st place in Winter Sprint 2024!',
        link: '/hackathons/winter-sprint-2024',
      },
      {
        userId: carlos.id,
        type: NotificationType.CHALLENGE_ACCEPTED,
        title: 'Challenge Submission Approved',
        message: 'Your FraudWatch ML solution has been approved!',
        link: '/challenges/fraud-detection-system',
      },
      {
        userId: nina.id,
        type: NotificationType.TEAM_INVITATION,
        title: 'Team Invitation',
        message: 'Mobile Masters invited you to join their team',
        link: '/teams/mobile-masters',
      },
      {
        userId: jacob.id,
        type: NotificationType.BADGE_UNLOCKED,
        title: 'New Badge Unlocked!',
        message: 'You earned the "Team Player" badge',
        readAt: new Date(),
        link: '/profile',
      },
      {
        userId: olivia.id,
        type: NotificationType.LEVEL_UP,
        title: 'Level Up!',
        message: 'Congratulations! You reached Level 7',
        readAt: new Date(),
        link: '/dashboard',
      },
      {
        userId: liam.id,
        type: NotificationType.TEAM_INVITATION,
        title: 'Team Invitation Pending',
        message: 'Noah invited you to join Mobile Masters',
        link: '/teams/invitations',
      },
      {
        userId: zara.id,
        type: NotificationType.CHALLENGE_SUBMISSION,
        title: 'Challenge Deadline Approaching',
        message: 'Social Media Sentiment Analysis challenge ends in 3 days',
        link: '/challenges/social-media-sentiment-tool',
      },
    ],
  });

  console.log('✅ Created notifications');

  // ============================================
  // CREATE COMMENT THREADS & COMMENTS
  // ============================================
  console.log('💬 Creating comments...');

  const thread1 = await prisma.commentThread.create({
    data: {
      entityType: 'SUBMISSION',
      entityId: winningSubmission.id,
    },
  });

  await prisma.comment.createMany({
    data: [
      {
        threadId: thread1.id,
        authorId: judge1.id,
        body: 'Impressive work! The AI model is really well-trained. How did you handle the edge cases?',
      },
      {
        threadId: thread1.id,
        authorId: ryan.id,
        body: 'Thanks! We used a combination of rule-based fallbacks and confidence thresholds to handle uncertain predictions.',
      },
      {
        threadId: thread1.id,
        authorId: mentor1.id,
        body: 'Great approach. Have you considered implementing A/B testing for the recommendation algorithm?',
      },
    ],
  });

  const thread2 = await prisma.commentThread.create({
    data: {
      entityType: 'CHALLENGE',
      entityId: challenge2.id,
    },
  });

  await prisma.comment.createMany({
    data: [
      {
        threadId: thread2.id,
        authorId: carlos.id,
        body: 'Is there a dataset available for training, or should we use synthetic data?',
      },
      {
        threadId: thread2.id,
        authorId: projectOwner1.id,
        body: 'We provide a sanitized dataset with anonymized transaction data. Check the challenge resources section.',
      },
      {
        threadId: thread2.id,
        authorId: olivia.id,
        body: 'What are the privacy requirements for storing transaction data during processing?',
      },
    ],
  });

  console.log('✅ Created comment threads and comments');

  // ============================================
  // CREATE XP EVENTS
  // ============================================
  console.log('⚡ Creating XP events...');

  const xpEvents = [];

  // Alex's XP history
  xpEvents.push(
    { userId: alex.id, eventType: 'PROFILE_COMPLETE', points: 50, refType: 'USER', refId: alex.id },
    { userId: alex.id, eventType: 'TEAM_JOIN', points: 100, refType: 'TEAM', refId: activeTeam1.id },
    { userId: alex.id, eventType: 'HACKATHON_REGISTER', points: 200, refType: 'HACKATHON', refId: activeHackathon.id },
    { userId: alex.id, eventType: 'PROJECT_SUBMIT', points: 500, refType: 'SUBMISSION', refId: activeSubmission1.id },
    { userId: alex.id, eventType: 'DAILY_LOGIN', points: 10, refType: 'USER', refId: alex.id },
    { userId: alex.id, eventType: 'DAILY_LOGIN', points: 10, refType: 'USER', refId: alex.id },
  );

  // Ryan's XP history (winner)
  xpEvents.push(
    { userId: ryan.id, eventType: 'PROFILE_COMPLETE', points: 50, refType: 'USER', refId: ryan.id },
    { userId: ryan.id, eventType: 'TEAM_CREATE', points: 150, refType: 'TEAM', refId: winningTeam.id },
    { userId: ryan.id, eventType: 'HACKATHON_REGISTER', points: 200, refType: 'HACKATHON', refId: completedHackathon.id },
    { userId: ryan.id, eventType: 'PROJECT_SUBMIT', points: 500, refType: 'SUBMISSION', refId: winningSubmission.id },
    { userId: ryan.id, eventType: 'HACKATHON_WIN', points: 2000, refType: 'HACKATHON', refId: completedHackathon.id },
    { userId: ryan.id, eventType: 'DAILY_LOGIN', points: 10, refType: 'USER', refId: ryan.id },
  );

  // Carlos's XP history
  xpEvents.push(
    { userId: carlos.id, eventType: 'PROFILE_COMPLETE', points: 50, refType: 'USER', refId: carlos.id },
    { userId: carlos.id, eventType: 'CHALLENGE_SUBMIT', points: 300, refType: 'CHALLENGE', refId: challenge2.id },
    { userId: carlos.id, eventType: 'CHALLENGE_WIN', points: 800, refType: 'CHALLENGE', refId: challenge2.id },
    { userId: carlos.id, eventType: 'DAILY_LOGIN', points: 10, refType: 'USER', refId: carlos.id },
  );

  await prisma.xpEvent.createMany({ data: xpEvents });

  console.log('✅ Created XP events');

  // ============================================
  // CREATE REPORTS (Content Moderation)
  // ============================================
  console.log('🚨 Creating comprehensive moderation reports...');

  await prisma.report.createMany({
    data: [
      // OPEN Reports (Pending)
      {
        reporterId: alex.id,
        entityType: 'COMMENT',
        entityId: 'comment-123',
        reason: 'This comment is promotional spam unrelated to the discussion',
        status: ReportStatus.OPEN,
      },
      {
        reporterId: maria.id,
        entityType: 'SUBMISSION',
        entityId: winningSubmission.id,
        reason: 'This project appears to contain plagiarized code from GitHub',
        status: ReportStatus.OPEN,
      },
      {
        reporterId: ryan.id,
        entityType: 'USER',
        entityId: alex.id,
        reason: 'User is spamming multiple teams with recruitment messages',
        status: ReportStatus.OPEN,
      },
      {
        reporterId: nina.id,
        entityType: 'COMMENT',
        entityId: 'comment-789',
        reason: 'Offensive language and harassment in comment thread',
        status: ReportStatus.OPEN,
      },
      {
        reporterId: carlos.id,
        entityType: 'SUBMISSION',
        entityId: secondSubmission.id,
        reason: 'Submission violates hackathon rules - uses prohibited libraries',
        status: ReportStatus.OPEN,
      },
      // INVESTIGATING Reports (Under Review)
      {
        reporterId: maria.id,
        entityType: 'USER',
        entityId: ryan.id,
        reason: 'Suspected bot account based on activity patterns',
        status: ReportStatus.INVESTIGATING,
      },
      {
        reporterId: alex.id,
        entityType: 'COMMENT',
        entityId: 'comment-456',
        reason: 'Sharing of potential security vulnerabilities in public comments',
        status: ReportStatus.INVESTIGATING,
      },
      {
        reporterId: olivia.id,
        entityType: 'SUBMISSION',
        entityId: activeSubmission1.id,
        reason: 'Project description contains misleading information about capabilities',
        status: ReportStatus.INVESTIGATING,
      },
      {
        reporterId: ethan.id,
        entityType: 'USER',
        entityId: nina.id,
        reason: 'Multiple accounts from same IP address',
        status: ReportStatus.INVESTIGATING,
      },
      // RESOLVED Reports
      {
        reporterId: zara.id,
        entityType: 'COMMENT',
        entityId: 'comment-321',
        reason: 'Inappropriate language in comments',
        status: ReportStatus.RESOLVED,
        resolution: 'Comment removed and user warned. User acknowledged and agreed to follow community guidelines.',
      },
      {
        reporterId: alex.id,
        entityType: 'SUBMISSION',
        entityId: soloSubmission.id,
        reason: 'Submission did not meet minimum requirements',
        status: ReportStatus.RESOLVED,
        resolution: 'Reviewed submission with team. Requirements were met. Report was based on misunderstanding.',
      },
      {
        reporterId: maria.id,
        entityType: 'USER',
        entityId: liam.id,
        reason: 'Suspected coordinated voting with other accounts',
        status: ReportStatus.RESOLVED,
        resolution: 'Investigation completed. No evidence of vote manipulation found. Normal collaborative behavior.',
      },
      {
        reporterId: isabella.id,
        entityType: 'COMMENT',
        entityId: 'comment-654',
        reason: 'Copyright violation - sharing proprietary code',
        status: ReportStatus.RESOLVED,
        resolution: 'Code was open-source with proper attribution. User provided license documentation.',
      },
      {
        reporterId: jacob.id,
        entityType: 'SUBMISSION',
        entityId: winningSubmission.id,
        reason: 'Team member impersonation',
        status: ReportStatus.RESOLVED,
        resolution: 'Verified all team members. No impersonation occurred. Added verification process.',
      },
      // DISMISSED Reports
      {
        reporterId: emma.id,
        entityType: 'USER',
        entityId: maria.id,
        reason: 'User seems to be winning too many challenges',
        status: ReportStatus.DISMISSED,
        resolution: 'Reviewed user activity. All wins were legitimate based on submission quality.',
      },
      {
        reporterId: alex.id,
        entityType: 'COMMENT',
        entityId: 'comment-987',
        reason: 'Comment disagrees with my solution',
        status: ReportStatus.DISMISSED,
        resolution: 'Constructive criticism and technical discussion. Not a violation of community guidelines.',
      },
      {
        reporterId: noah.id,
        entityType: 'SUBMISSION',
        entityId: secondSubmission.id,
        reason: 'Project is too advanced to be created during hackathon',
        status: ReportStatus.DISMISSED,
        resolution: 'Team provided development timeline and git history. Project was built during event.',
      },
      {
        reporterId: maria.id,
        entityType: 'USER',
        entityId: ava.id,
        reason: 'User avatar is offensive',
        status: ReportStatus.DISMISSED,
        resolution: 'Avatar reviewed. Generic avatar from approved avatar service. No policy violation.',
      },
    ],
  });

  console.log('✅ Created 19 comprehensive moderation reports across all statuses');

  // ============================================
  // CREATE PLATFORM-WIDE ANNOUNCEMENTS
  // ============================================
  console.log('📢 Creating platform announcements...');

  await prisma.announcement.createMany({
    data: [
      {
        scope: AnnouncementScope.GLOBAL,
        title: '🎉 Welcome to Innovation Lab!',
        body: `We're thrilled to have you here!

Innovation Lab is your platform to:
- Compete in exciting hackathons
- Solve real-world challenges
- Earn XP and unlock achievements
- Connect with fellow innovators
- Win amazing prizes

Start by exploring active hackathons or browse challenges that match your skills.

Let's build the future of fintech together! 🚀`,
        pinned: true,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        scope: AnnouncementScope.GLOBAL,
        title: 'New Feature: Real-Time Collaboration',
        body: `We've just launched real-time team collaboration tools!

✨ New Features:
- Live team chat
- Shared task boards
- File sharing
- Code snippet sharing
- @mentions

Check it out in your team dashboard!`,
        pinned: false,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        scope: AnnouncementScope.GLOBAL,
        title: '📊 January Stats Are In!',
        body: `What a month! Here's what our community achieved:

📈 Platform Stats:
- 500+ Active Users
- 120+ Teams Formed
- 85 Projects Submitted
- 45 Challenges Completed
- $100,000+ in Prizes Awarded

Keep up the amazing work! 🔥`,
        pinned: false,
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Created platform announcements');

  // ============================================
  // CREATE LEADERBOARD SNAPSHOT
  // ============================================
  console.log('🏆 Creating leaderboard snapshot...');

  await prisma.leaderboardSnapshot.create({
    data: {
      scope: 'GLOBAL',
      period: 'ALLTIME',
      data: {
        leaderboard: [
          {
            userId: ryan.id,
            rank: 1,
            xp: 5600,
            hackathonsWon: 1,
            challengesWon: 0,
          },
          {
            userId: carlos.id,
            rank: 2,
            xp: 4200,
            hackathonsWon: 0,
            challengesWon: 1,
          },
          {
            userId: noah.id,
            rank: 3,
            xp: 3800,
            hackathonsWon: 0,
            challengesWon: 0,
          },
          {
            userId: alex.id,
            rank: 4,
            xp: 3450,
            hackathonsWon: 0,
            challengesWon: 0,
          },
          {
            userId: zara.id,
            rank: 5,
            xp: 3100,
            hackathonsWon: 0,
            challengesWon: 0,
          },
        ],
      },
    },
  });

  console.log('✅ Created leaderboard snapshot');

  // ============================================
  // FINAL SUMMARY
  // ============================================
  console.log('');
  console.log('🎉🎉🎉 DATABASE SEEDING COMPLETED! 🎉🎉🎉');
  console.log('');
  console.log('📊 SEED SUMMARY:');
  console.log('================');
  console.log('✅ 25 Users (Admins, Organizers, Judges, Mentors, Participants)');
  console.log('✅ 24 Badges (Common to Legendary)');
  console.log('✅ 15 Gamification Profiles with XP and badges');
  console.log('✅ 4 Hackathons (Completed, Active, Upcoming, Draft)');
  console.log('✅ 10+ Teams across hackathons');
  console.log('✅ 7 Submissions with judging scores');
  console.log('✅ 7 Challenges across departments');
  console.log('✅ 4 Challenge Submissions');
  console.log('✅ 10+ Notifications');
  console.log('✅ 2 Comment Threads with discussions');
  console.log('✅ Multiple XP Events');
  console.log('✅ 2 Content Reports');
  console.log('✅ Platform & Hackathon Announcements');
  console.log('✅ Leaderboard Snapshot');
  console.log('');
  console.log('🔐 All accounts use password: Password123!');
  console.log('');
  console.log('📋 See USER_CREDENTIALS.md for login details');
  console.log('');
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
