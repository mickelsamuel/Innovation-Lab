import { PrismaClient, Role, HackathonStatus, HackathonLocation, ChallengeStatus, RewardType } from '../generated/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.score.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.criteria.deleteMany();
  await prisma.judge.deleteMany();
  await prisma.mentorSession.deleteMany();
  await prisma.mentor.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.track.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.challengeSubmission.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.commentThread.deleteMany();
  await prisma.xpEvent.deleteMany();
  await prisma.gamificationProfile.deleteMany();
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

  // Create demo users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const bankAdmin = await prisma.user.create({
    data: {
      email: 'admin@nbc.com',
      name: 'Sarah Johnson',
      handle: 'sarah_nbc',
      password: passwordHash,
      roles: [Role.BANK_ADMIN, Role.MODERATOR],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      bio: 'Innovation Lab Administrator at National Bank of Canada',
      organization: 'National Bank of Canada',
      emailVerified: new Date(),
    },
  });

  const organizer = await prisma.user.create({
    data: {
      email: 'organizer@nbc.com',
      name: 'Michael Chen',
      handle: 'michael_organizer',
      password: passwordHash,
      roles: [Role.ORGANIZER, Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
      bio: 'Event Organizer & Tech Evangelist',
      organization: 'National Bank of Canada',
      emailVerified: new Date(),
    },
  });

  const mentor = await prisma.user.create({
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
    },
  });

  const judge = await prisma.user.create({
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
    },
  });

  const participant1 = await prisma.user.create({
    data: {
      email: 'participant1@example.com',
      name: 'Alex Thompson',
      handle: 'alex_dev',
      password: passwordHash,
      roles: [Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      bio: 'Full-stack developer passionate about fintech innovation',
      organization: 'Freelance',
      emailVerified: new Date(),
    },
  });

  const participant2 = await prisma.user.create({
    data: {
      email: 'participant2@example.com',
      name: 'Maria Garcia',
      handle: 'maria_designer',
      password: passwordHash,
      roles: [Role.PARTICIPANT],
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      bio: 'UX/UI Designer | Design Systems Advocate',
      organization: 'DesignStudio',
      emailVerified: new Date(),
    },
  });

  const projectOwner = await prisma.user.create({
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
    },
  });

  console.log('✅ Created demo users');

  // Create gamification profiles
  await prisma.gamificationProfile.create({
    data: {
      userId: participant1.id,
      xp: 1250,
      level: 5,
      streakDays: 7,
      vaultKeys: 15,
      badges: ['first-project', 'first-team', 'streak-7', 'xp-1k', 'level-5'],
    },
  });

  await prisma.gamificationProfile.create({
    data: {
      userId: participant2.id,
      xp: 850,
      level: 4,
      streakDays: 3,
      vaultKeys: 10,
      badges: ['first-project', 'first-team'],
    },
  });

  console.log('✅ Created gamification profiles');

  // Create badges
  const badges = [
    // First Actions
    {
      slug: 'first-project',
      name: 'First Steps',
      description: 'Submitted your first hackathon project',
      icon: '🚀',
      xpRequired: 0,
      rarity: 'common',
    },
    {
      slug: 'first-challenge',
      name: 'Challenge Accepted',
      description: 'Completed your first coding challenge',
      icon: '💻',
      xpRequired: 0,
      rarity: 'common',
    },
    {
      slug: 'first-team',
      name: 'Team Player',
      description: 'Created or joined your first team',
      icon: '👥',
      xpRequired: 0,
      rarity: 'common',
    },

    // Level Milestones
    {
      slug: 'level-5',
      name: 'Rising Star',
      description: 'Reached level 5',
      icon: '⭐',
      xpRequired: 1000,
      rarity: 'uncommon',
    },
    {
      slug: 'level-10',
      name: 'Expert Developer',
      description: 'Reached level 10',
      icon: '🌟',
      xpRequired: 11000,
      rarity: 'rare',
    },
    {
      slug: 'level-15',
      name: 'Master Coder',
      description: 'Reached level 15',
      icon: '💎',
      xpRequired: 41000,
      rarity: 'epic',
    },
    {
      slug: 'level-20',
      name: 'Legend',
      description: 'Reached level 20',
      icon: '👑',
      xpRequired: 100000,
      rarity: 'legendary',
    },

    // Streaks
    {
      slug: 'streak-7',
      name: 'Week Warrior',
      description: 'Maintained a 7-day login streak',
      icon: '🔥',
      xpRequired: 0,
      rarity: 'uncommon',
    },
    {
      slug: 'streak-30',
      name: 'Monthly Master',
      description: 'Maintained a 30-day login streak',
      icon: '🔥🔥',
      xpRequired: 0,
      rarity: 'rare',
    },

    // Hackathon Achievements
    {
      slug: 'first-win',
      name: 'Victory!',
      description: 'Won your first hackathon',
      icon: '🏆',
      xpRequired: 0,
      rarity: 'rare',
    },
    {
      slug: 'triple-threat',
      name: 'Triple Threat',
      description: 'Won three hackathons',
      icon: '🥇',
      xpRequired: 0,
      rarity: 'epic',
    },
    {
      slug: 'hackathon-legend',
      name: 'Hackathon Legend',
      description: 'Won ten hackathons',
      icon: '👑🏆',
      xpRequired: 0,
      rarity: 'legendary',
    },

    // Challenge Achievements
    {
      slug: 'challenge-champion',
      name: 'Challenge Champion',
      description: 'Won 5 coding challenges',
      icon: '🥊',
      xpRequired: 0,
      rarity: 'rare',
    },
    {
      slug: 'challenge-master',
      name: 'Challenge Master',
      description: 'Won 20 coding challenges',
      icon: '🎯',
      xpRequired: 0,
      rarity: 'epic',
    },
    {
      slug: 'perfect-score',
      name: 'Perfect Score',
      description: 'Received a perfect 100/100 score on a challenge',
      icon: '💯',
      xpRequired: 0,
      rarity: 'rare',
    },

    // Team Achievements
    {
      slug: 'team-leader',
      name: 'Natural Leader',
      description: 'Led 5 different teams',
      icon: '🎖️',
      xpRequired: 0,
      rarity: 'uncommon',
    },
    {
      slug: 'solo-hero',
      name: 'Solo Hero',
      description: 'Won a hackathon as a one-person team',
      icon: '🦸',
      xpRequired: 0,
      rarity: 'epic',
    },

    // XP Milestones
    {
      slug: 'xp-1k',
      name: 'Thousand Club',
      description: 'Earned 1,000 total XP',
      icon: '💪',
      xpRequired: 1000,
      rarity: 'uncommon',
    },
    {
      slug: 'xp-5k',
      name: 'Five Thousand',
      description: 'Earned 5,000 total XP',
      icon: '💪💪',
      xpRequired: 5000,
      rarity: 'rare',
    },
    {
      slug: 'xp-10k',
      name: 'Ten Thousand Strong',
      description: 'Earned 10,000 total XP',
      icon: '⚡',
      xpRequired: 10000,
      rarity: 'epic',
    },
    {
      slug: 'xp-50k',
      name: 'Unstoppable Force',
      description: 'Earned 50,000 total XP',
      icon: '⚡⚡',
      xpRequired: 50000,
      rarity: 'legendary',
    },

    // Special Achievements
    {
      slug: 'early-bird',
      name: 'Early Bird',
      description: 'One of the first 100 users on the platform',
      icon: '🐦',
      xpRequired: 0,
      rarity: 'rare',
    },
    {
      slug: 'mentor',
      name: 'Mentor',
      description: 'Helped judge 10 hackathon submissions',
      icon: '🎓',
      xpRequired: 0,
      rarity: 'uncommon',
    },
    {
      slug: 'contributor',
      name: 'Contributor',
      description: 'Submitted solutions to 20 challenges',
      icon: '📝',
      xpRequired: 0,
      rarity: 'uncommon',
    },
    {
      slug: 'innovator',
      name: 'Innovator',
      description: 'Created a challenge that received 50+ submissions',
      icon: '💡',
      xpRequired: 0,
      rarity: 'epic',
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: badge,
      create: badge,
    });
  }

  console.log(`✅ Created ${badges.length} badges`);

  // Create hackathon
  const hackathon = await prisma.hackathon.create({
    data: {
      slug: 'vaultix-winter-sprint-2025',
      title: 'Vaultix Winter Sprint 2025',
      description: `Join us for an exciting 48-hour virtual hackathon focused on building innovative fintech solutions!

This event brings together developers, designers, and entrepreneurs to solve real-world banking challenges.

🎯 Focus Areas:
- Digital Banking Innovation
- AI-Powered Financial Services
- Security & Privacy Solutions
- Accessibility in Fintech

💰 Prize Pool: $25,000 CAD
🏆 Multiple tracks with dedicated prizes
🎓 Expert mentorship from NBC engineers
`,
      coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200',
      status: HackathonStatus.UPCOMING,
      location: HackathonLocation.VIRTUAL,
      registrationOpensAt: new Date('2025-01-15T00:00:00Z'),
      registrationClosesAt: new Date('2025-02-01T23:59:59Z'),
      startsAt: new Date('2025-02-15T18:00:00Z'),
      endsAt: new Date('2025-02-17T18:00:00Z'),
      judgingEndsAt: new Date('2025-02-20T18:00:00Z'),
      prizePool: 25000,
      maxTeamSize: 5,
      allowSoloTeams: true,
      rules: `# Hackathon Rules

## Eligibility
- Open to all participants 18+ years old
- Teams of 1-5 members allowed
- No prior work - projects must be built during the hackathon

## Judging Criteria
- Innovation & Creativity (25%)
- Technical Implementation (25%)
- User Experience (20%)
- Impact & Feasibility (20%)
- Presentation (10%)

## Code of Conduct
- Respect all participants
- No harassment or discrimination
- Original work only
- Have fun and learn!
`,
    },
  });

  // Create tracks
  const webTrack = await prisma.track.create({
    data: {
      hackathonId: hackathon.id,
      title: 'Web & Mobile Applications',
      description: 'Build innovative web or mobile applications for digital banking',
      order: 1,
    },
  });

  const aiTrack = await prisma.track.create({
    data: {
      hackathonId: hackathon.id,
      title: 'AI & Machine Learning',
      description: 'Leverage AI/ML to enhance financial services',
      order: 2,
    },
  });

  const securityTrack = await prisma.track.create({
    data: {
      hackathonId: hackathon.id,
      title: 'Security & Privacy',
      description: 'Build solutions focused on security, privacy, and trust',
      order: 3,
    },
  });

  console.log('✅ Created hackathon with tracks');

  // Create judging criteria
  await prisma.criteria.createMany({
    data: [
      {
        hackathonId: hackathon.id,
        name: 'Innovation',
        description: 'Originality and creativity of the solution',
        maxScore: 10,
        weight: 0.25,
        order: 1,
      },
      {
        hackathonId: hackathon.id,
        name: 'Technical',
        description: 'Code quality and technical implementation',
        maxScore: 10,
        weight: 0.25,
        order: 2,
      },
      {
        hackathonId: hackathon.id,
        name: 'UX/UI',
        description: 'User experience and interface design',
        maxScore: 10,
        weight: 0.20,
        order: 3,
      },
      {
        hackathonId: hackathon.id,
        name: 'Impact',
        description: 'Real-world impact and feasibility',
        maxScore: 10,
        weight: 0.20,
        order: 4,
      },
      {
        hackathonId: hackathon.id,
        name: 'Presentation',
        description: 'Quality of demo and pitch',
        maxScore: 10,
        weight: 0.10,
        order: 5,
      },
    ],
  });

  console.log('✅ Created judging criteria');

  // Create mentor
  await prisma.mentor.create({
    data: {
      userId: mentor.id,
      hackathonId: hackathon.id,
      bio: 'Cloud architecture expert with 15+ years experience. Happy to help with system design, scalability, and AI integration.',
      calendlyUrl: 'https://calendly.com/emily-mentor',
      expertise: ['Cloud Architecture', 'AI/ML', 'System Design', 'Scalability'],
    },
  });

  console.log('✅ Created mentor');

  // Create judge
  await prisma.judge.create({
    data: {
      userId: judge.id,
      hackathonId: hackathon.id,
      bio: 'Innovation lead with deep expertise in fintech solutions',
    },
  });

  console.log('✅ Created judge');

  // Create demo team
  const team = await prisma.team.create({
    data: {
      hackathonId: hackathon.id,
      name: 'Team Innovators',
      bio: 'A passionate team building the future of fintech',
      logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=TeamInnovators',
      repoUrl: 'https://github.com/example/project',
      demoUrl: 'https://demo.example.com',
    },
  });

  await prisma.teamMember.createMany({
    data: [
      {
        teamId: team.id,
        userId: participant1.id,
        role: 'LEAD',
      },
      {
        teamId: team.id,
        userId: participant2.id,
        role: 'MEMBER',
      },
    ],
  });

  console.log('✅ Created demo team');

  // Create announcement
  await prisma.announcement.create({
    data: {
      scope: 'HACKATHON',
      scopeId: hackathon.id,
      title: 'Welcome to Vaultix Winter Sprint 2025!',
      body: `We're excited to have you join us for this amazing hackathon!

Registration is now open. Form your teams, explore the tracks, and get ready to build something amazing.

Check out the mentor office hours and don't hesitate to ask questions in the discussion forums.

Good luck! 🚀`,
      pinned: true,
      publishedAt: new Date(),
    },
  });

  console.log('✅ Created announcement');

  // Create challenges across departments
  await prisma.challenge.create({
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

## What You'll Get
- Access to anonymized call center data
- API documentation
- Direct feedback from call center managers
`,
      ownerId: projectOwner.id,
      ownerOrg: 'National Bank of Canada - Customer Experience',
      rewardType: RewardType.CASH,
      rewardValue: '$5,000 CAD',
      categories: ['Customer Experience', 'IT', 'Operations'],
      skills: ['Python', 'NLP', 'Data Analysis', 'UI/UX'],
      status: ChallengeStatus.OPEN,
      deadlineAt: new Date('2025-03-31T23:59:59Z'),
    },
  });

  await prisma.challenge.create({
    data: {
      slug: 'fraud-detection-system',
      title: 'Fraud Detection System',
      problemStatement: `## Boss Challenge: Fraud Detection

Build a real-time fraud detection system to protect customers and reduce financial losses.

## Your Quest
- Detect fraudulent credit card transactions
- Minimize false positives
- Operate in real-time (sub-100ms)
- Provide explainability for decisions

## Loot
$8,000 CAD + Epic Badge`,
      ownerId: projectOwner.id,
      ownerOrg: 'Risk Management',
      rewardType: RewardType.CASH,
      rewardValue: '$8,000 CAD',
      categories: ['Finance', 'Security', 'Risk Management'],
      skills: ['Machine Learning', 'Python', 'Statistics'],
      status: ChallengeStatus.OPEN,
      deadlineAt: new Date('2025-04-15T23:59:59Z'),
    },
  });

  await prisma.challenge.create({
    data: {
      slug: 'employee-engagement-platform',
      title: 'Employee Engagement Platform',
      problemStatement: `## Boss Challenge: Engagement Boost

Design a platform to improve employee engagement and workplace culture.

## Your Quest
- Track employee sentiment
- Enable peer recognition
- Facilitate feedback collection
- Gamify positive behaviors

## Loot
$6,000 CAD + Legendary Badge`,
      ownerId: projectOwner.id,
      ownerOrg: 'Human Resources',
      rewardType: RewardType.CASH,
      rewardValue: '$6,000 CAD',
      categories: ['HR', 'People & Culture', 'Employee Experience'],
      skills: ['UX Design', 'Mobile Development', 'Gamification'],
      status: ChallengeStatus.OPEN,
      deadlineAt: new Date('2025-05-01T23:59:59Z'),
    },
  });

  await prisma.challenge.create({
    data: {
      slug: 'social-media-sentiment-tool',
      title: 'Social Media Sentiment Analysis',
      problemStatement: `## Boss Challenge: Brand Guardian

Monitor and analyze customer sentiment across social media platforms.

## Your Quest
- Track brand mentions across platforms
- Perform sentiment analysis
- Alert team to PR issues in real-time
- Provide competitive intelligence

## Loot
$4,500 CAD + Rare Badge`,
      ownerId: projectOwner.id,
      ownerOrg: 'Marketing & Communications',
      rewardType: RewardType.CASH,
      rewardValue: '$4,500 CAD',
      categories: ['Marketing', 'Communications', 'Brand Management'],
      skills: ['NLP', 'API Integration', 'Data Visualization'],
      status: ChallengeStatus.OPEN,
      deadlineAt: new Date('2025-04-20T23:59:59Z'),
    },
  });

  await prisma.challenge.create({
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
$7,000 CAD + Epic Badge`,
      ownerId: projectOwner.id,
      ownerOrg: 'Legal & Compliance',
      rewardType: RewardType.CASH,
      rewardValue: '$7,000 CAD',
      categories: ['Legal', 'Compliance', 'Regulatory', 'Finance'],
      skills: ['Regulatory Knowledge', 'Automation', 'Python'],
      status: ChallengeStatus.OPEN,
      deadlineAt: new Date('2025-05-15T23:59:59Z'),
    },
  });

  await prisma.challenge.create({
    data: {
      slug: 'branch-operations-optimizer',
      title: 'Branch Operations Optimizer',
      problemStatement: `## Boss Challenge: Efficiency Master

Optimize branch operations to reduce wait times and improve productivity.

## Your Quest
- Predict customer traffic patterns
- Optimize staff scheduling
- Track service times
- Identify bottlenecks in real-time

## Loot
$5,500 CAD + Rare Badge`,
      ownerId: projectOwner.id,
      ownerOrg: 'Branch Operations',
      rewardType: RewardType.CASH,
      rewardValue: '$5,500 CAD',
      categories: ['Operations', 'Business Intelligence', 'Process Improvement'],
      skills: ['Data Analysis', 'Forecasting', 'Optimization'],
      status: ChallengeStatus.OPEN,
      deadlineAt: new Date('2025-04-30T23:59:59Z'),
    },
  });

  console.log('✅ Created 6 challenges across Finance, HR, Security, Marketing, Legal, Operations');

  // Create XP events
  await prisma.xpEvent.createMany({
    data: [
      {
        userId: participant1.id,
        eventType: 'PROFILE_COMPLETE',
        points: 50,
        refType: 'USER',
        refId: participant1.id,
      },
      {
        userId: participant1.id,
        eventType: 'TEAM_JOIN',
        points: 100,
        refType: 'TEAM',
        refId: team.id,
      },
      {
        userId: participant1.id,
        eventType: 'HACKATHON_REGISTER',
        points: 200,
        refType: 'HACKATHON',
        refId: hackathon.id,
      },
    ],
  });

  console.log('✅ Created XP events');

  console.log('');
  console.log('🎉 Seeding completed successfully!');
  console.log('');
  console.log('📋 Demo Accounts:');
  console.log('');
  console.log('Bank Admin:     admin@nbc.com / Password123!');
  console.log('Organizer:      organizer@nbc.com / Password123!');
  console.log('Mentor:         mentor@vaultix.com / Password123!');
  console.log('Judge:          judge@nbc.com / Password123!');
  console.log('Participant 1:  participant1@example.com / Password123!');
  console.log('Participant 2:  participant2@example.com / Password123!');
  console.log('Project Owner:  projects@nbc.com / Password123!');
  console.log('');
}

main()
  .catch(e => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
