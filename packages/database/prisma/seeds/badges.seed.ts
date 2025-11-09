/**
 * Badge Seeding Script
 * Run this to populate initial badges in the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

async function seedBadges() {
  console.log('🎖️  Seeding badges...');

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: badge,
      create: badge,
    });
    console.log(`  ✅ ${badge.icon} ${badge.name} (${badge.rarity})`);
  }

  console.log(`\n✨ Successfully seeded ${badges.length} badges!`);
}

seedBadges()
  .catch((error) => {
    console.error('Error seeding badges:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
