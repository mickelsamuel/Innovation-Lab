'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Trophy,
  Code,
  Users,
  Zap,
  Sparkles,
  Rocket,
  Target,
  Flame,
} from 'lucide-react';
import { getAuthToken } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

interface PlatformStats {
  activePlayersCount: number;
  totalPrizeMoney: number;
  totalHackathonsCompleted: number;
  partnerCount: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function formatMoney(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stats, setStats] = useState<PlatformStats>({
    activePlayersCount: 0,
    totalPrizeMoney: 0,
    totalHackathonsCompleted: 0,
    partnerCount: 0,
  });

  useEffect(() => {
    // Check if user is logged in
    const token = getAuthToken();
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`${API_URL}/health/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch platform stats:', error);
      }
    }

    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="min-h-screen hex-grid">
      {/* Hero Section */}
      <section className="relative particle-bg py-20 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: '1s' }}
          />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent2/10 rounded-full blur-3xl animate-levitate" />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-game border-2 border-primary/30 text-primary text-sm font-bold shadow-glow animate-bounce-subtle">
              <Flame className="w-5 h-5 animate-wiggle" />
              <span className="neon-text">LIVE NOW: Vaultix Winter Sprint 2025</span>
              <Sparkles className="w-4 h-4 animate-sparkle" />
            </div>

            <h1 className="text-6xl md:text-8xl font-display font-black tracking-tight animate-slide-up-fade">
              <span className="inline-block hover:animate-wiggle">Build.</span>{' '}
              <span
                className="inline-block hover:animate-wiggle"
                style={{ animationDelay: '0.1s' }}
              >
                Compete.
              </span>{' '}
              <span
                className="inline-block gradient-text drop-shadow-2xl hover:animate-wiggle"
                style={{ animationDelay: '0.2s' }}
              >
                Dominate.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 font-semibold max-w-3xl mx-auto leading-relaxed animate-fade-in">
              <Rocket className="inline w-6 h-6 mr-2 animate-float" />
              National Bank of Canada's{' '}
              <span className="text-primary font-bold">innovation hub</span> for{' '}
              <span className="text-accent2 font-bold">all departments</span>.
              <br />
              Solve challenges in Finance, HR, Security, Tech, Marketing & beyond.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
              <Link href="/hackathons" className="btn-game group">
                <Trophy className="w-5 h-5 inline mr-2 group-hover:animate-wiggle" />
                Start Your Quest
                <ArrowRight className="w-5 h-5 inline ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link href="/challenges" className="btn-game-secondary group">
                <Target className="w-5 h-5 inline mr-2 group-hover:animate-wiggle" />
                Browse Challenges
              </Link>
            </div>
          </div>

          {/* Stats - Gaming Style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24">
            {[
              {
                label: 'Active Players',
                value: formatNumber(stats.activePlayersCount) + '+',
                icon: Users,
                color: 'text-accent2',
              },
              {
                label: 'Total Loot',
                value: formatMoney(stats.totalPrizeMoney) + '+',
                icon: Trophy,
                color: 'text-accent',
              },
              {
                label: 'Quests Completed',
                value: formatNumber(stats.totalHackathonsCompleted) + '+',
                icon: Target,
                color: 'text-green-500',
              },
              {
                label: 'Guild Partners',
                value: formatNumber(stats.partnerCount) + '+',
                icon: Sparkles,
                color: 'text-purple-500',
              },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="game-card p-6 text-center group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <stat.icon
                  className={`w-8 h-8 ${stat.color} mx-auto mb-3 group-hover:animate-bounce-subtle`}
                />
                <div className="text-4xl md:text-5xl font-display font-black stat-counter gradient-text">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-2 uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full font-bold text-sm mb-6 animate-bounce-subtle">
              <Zap className="inline w-4 h-4 mr-1 animate-sparkle" />
              YOUR POWER-UPS
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-black mb-6">
              Choose Your <span className="gradient-text">Battle Arena</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 font-semibold max-w-2xl mx-auto">
              Three epic game modes. Endless opportunities to prove your skills.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Trophy,
                title: 'Hackathon Raids',
                description:
                  'Team up for epic innovation sprints. Solve problems from any department - Finance, HR, IT, Operations, Marketing & more!',
                color: 'text-primary',
                badge: 'MULTIPLAYER',
                badgeColor: 'bg-primary/10 text-primary',
              },
              {
                icon: Code,
                title: 'Boss Challenges',
                description:
                  'Take on epic quests from Finance, HR, Security, Marketing & all departments. Solo or team up for legendary rewards!',
                color: 'text-accent',
                badge: 'ALL DEPARTMENTS',
                badgeColor: 'bg-accent/10 text-accent',
              },
              {
                icon: Users,
                title: 'Achievement System',
                description:
                  'Grind XP, unlock legendary badges, hoard Vault Keys, and dominate the global leaderboards!',
                color: 'text-accent2',
                badge: 'PROGRESSION',
                badgeColor: 'bg-accent2/10 text-accent2',
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="quest-card group"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-4 rounded-xl ${feature.badgeColor} group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon
                      className={`w-10 h-10 ${feature.color} group-hover:animate-wiggle`}
                    />
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${feature.badgeColor}`}
                  >
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-2xl font-display font-bold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-accent2 opacity-95" />
        <div className="absolute inset-0 particle-bg" />

        <div className="container mx-auto max-w-4xl text-center text-white relative z-10">
          <div className="inline-block mb-6">
            <Sparkles className="w-16 h-16 mx-auto animate-float text-accent" />
          </div>
          <h2 className="text-5xl md:text-7xl font-display font-black mb-8 drop-shadow-2xl">
            Ready to Enter the Arena?
          </h2>
          <p className="text-2xl mb-12 font-bold drop-shadow-lg">
            Join{' '}
            <span className="text-yellow-300 font-black animate-pulse">
              {formatNumber(stats.activePlayersCount)}+ players
            </span>{' '}
            already grinding XP and claiming loot!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={isLoggedIn ? '/hackathons' : '/auth/register'}
              className="inline-flex items-center gap-3 px-10 py-5 bg-white dark:bg-card text-primary rounded-xl font-black text-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-110 shadow-3d-lg group"
            >
              <Rocket className="w-6 h-6 group-hover:animate-wiggle" />
              {isLoggedIn ? 'Explore Hackathons' : 'Start Your Journey'}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white/20 text-white border-3 border-white rounded-xl font-black text-lg hover:bg-white hover:text-primary transition-all hover:scale-105 backdrop-blur-sm shadow-glow-white"
            >
              <Trophy className="w-6 h-6" />
              View Leaderboard
            </Link>
          </div>
          <p className="mt-8 text-white/80 font-semibold">
            No credit card required. Start earning XP in under 60 seconds.
          </p>
        </div>
      </section>
    </div>
  );
}
