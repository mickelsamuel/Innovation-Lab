'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Target, Users, Gavel, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { apiFetch, getAuthToken } from '@/lib/api';

interface AdminDashboardStats {
  totalHackathons: number;
  hackathonsThisMonth: number;
  activeHackathons: number;
  totalChallenges: number;
  challengesThisWeek: number;
  activeChallenges: number;
  totalUsers: number;
  usersThisWeek: number;
  totalSubmissions: number;
  pendingReviews: number;
}

interface DashboardStats extends AdminDashboardStats {
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Fetch real admin stats from dedicated endpoint
      const adminStats = await apiFetch<AdminDashboardStats>('/analytics/admin/stats', { token });

      setStats({
        ...adminStats,
        recentActivity: [], // Enhancement: Activity feed endpoint could be added later (non-blocking)
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Hackathons',
      value: stats?.totalHackathons || 0,
      change: `+${stats?.hackathonsThisMonth || 0} this month`,
      icon: Trophy,
      color: 'text-primary',
      bg: 'bg-primary/10',
      href: '/admin/hackathons',
    },
    {
      title: 'Active Hackathons',
      value: stats?.activeHackathons || 0,
      change: 'Live now',
      icon: Trophy,
      color: 'text-accent',
      bg: 'bg-accent/10',
      href: '/admin/hackathons?status=LIVE',
    },
    {
      title: 'Total Challenges',
      value: stats?.totalChallenges || 0,
      change: `+${stats?.challengesThisWeek || 0} this week`,
      icon: Target,
      color: 'text-accent2',
      bg: 'bg-accent2/10',
      href: '/admin/challenges',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: `+${stats?.usersThisWeek || 0} this week`,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      href: '/admin/hackathons',
    },
    {
      title: 'Total Submissions',
      value: stats?.totalSubmissions || 0,
      change: 'All time',
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      href: '/admin/hackathons',
    },
    {
      title: 'Pending Reviews',
      value: stats?.pendingReviews || 0,
      change: 'Needs attention',
      icon: AlertCircle,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
      href: '/admin/challenges',
    },
  ];

  const quickActions = [
    {
      title: 'Create Hackathon',
      description: 'Start a new hackathon event',
      href: '/admin/hackathons/create',
      icon: Trophy,
      color: 'bg-primary',
    },
    {
      title: 'Post Challenge',
      description: 'Create a new challenge',
      href: '/admin/challenges/create',
      icon: Target,
      color: 'bg-accent',
    },
    {
      title: 'Manage Judges',
      description: 'Assign judges to events',
      href: '/admin/hackathons',
      icon: Gavel,
      color: 'bg-accent2',
    },
    {
      title: 'View Reports',
      description: 'Review flagged content',
      href: '/admin/challenges',
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Manage hackathons, challenges, users, and platform settings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map(stat => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="game-card p-6 hover:scale-105 transition-transform"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="game-card p-6 hover:scale-105 transition-transform group"
              >
                <div
                  className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1">{action.title}</h3>
                <p className="text-sm text-gray-400">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="game-card p-6">
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 pb-4 border-b border-[#1e2129] last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.description}</p>
                    <p className="text-gray-500 text-xs mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
