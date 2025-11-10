'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Trophy,
  Users,
  FileText,
  Calendar,
  Award,
  Star,
  TrendingUp,
  Target,
  Zap,
  ChevronRight,
  Plus,
  Loader2,
} from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { getAuthToken, apiFetch, ApiError } from '@/lib/api';

interface User {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  organization: string | null;
  roles: string[];
}

interface GamificationProfile {
  userId: string;
  xp: number;
  level: number;
  streakDays: number;
  vaultKeys: number;
  badges: string[];
  xpToNextLevel: number;
  currentLevelXp: number;
  nextLevelXp: number;
  recentXpEvents: any[];
}

interface Hackathon {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: string;
  startsAt: string;
  endsAt: string;
}

interface Team {
  id: string;
  name: string;
  bio: string | null;
  role: string;
  hackathon: {
    id: string;
    title: string;
  };
  _count: {
    members: number;
  };
}

interface Submission {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  hackathon: {
    id: string;
    title: string;
  };
}

function _getXPForNextLevel(currentLevel: number): number {
  return currentLevel * 100;
}

function getProgressToNextLevel(
  currentXP: number,
  currentLevelXp: number,
  nextLevelXp: number
): number {
  if (nextLevelXp === currentLevelXp) return 0;
  return ((currentXP - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [gamification, setGamification] = useState<GamificationProfile | null>(null);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [challengesCompleted, setChallengesCompleted] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      const token = getAuthToken();

      if (!token) {
        // Redirect to login if not authenticated
        router.push('/auth/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const userData = await apiFetch<User>('/users/me', { token });
        setUser(userData);

        // Fetch gamification profile
        const gamificationData = await apiFetch<GamificationProfile>('/gamification/profile', {
          token,
        });
        setGamification(gamificationData);

        // Fetch user's hackathons
        const hackathonsData = await apiFetch<any[]>('/hackathons/my', { token });
        setHackathons(hackathonsData);

        // Fetch user's teams
        const teamsData = await apiFetch<any[]>('/teams/my', { token });
        setTeams(teamsData);

        // Fetch user's submissions
        const submissionsData = await apiFetch<any[]>('/submissions/my', { token });
        setSubmissions(submissionsData);

        // Fetch completed challenges count
        const completedData = await apiFetch<{ count: number }>('/challenges/my/completed', {
          token,
        });
        setChallengesCompleted(completedData.count);
      } catch (err) {
        console.error('Dashboard error:', err);
        if (err instanceof ApiError && err.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          router.push('/auth/login');
        } else {
          setError('Failed to load dashboard data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen hex-grid flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-bold text-slate-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !user || !gamification) {
    return (
      <div className="min-h-screen hex-grid flex items-center justify-center">
        <div className="game-card p-8 max-w-md text-center">
          <p className="text-red-600 font-bold mb-4">{error || 'Failed to load dashboard'}</p>
          <Button onClick={() => window.location.reload()} className="btn-game">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const progressPercent = getProgressToNextLevel(
    gamification.xp,
    gamification.currentLevelXp,
    gamification.nextLevelXp
  );
  const xpNeeded = gamification.nextLevelXp - gamification.xp;
  const isDemoMode = user.id === 'demo';

  const stats = {
    hackathonsParticipated: hackathons.length,
    teamsJoined: teams.length,
    submissionsMade: submissions.length,
    challengesCompleted: challengesCompleted, // Fetched from GET /challenges/my/completed
  };

  return (
    <div className="min-h-screen hex-grid relative">
      {/* Player Profile Header - Game HUD Style */}
      <div className="relative bg-gradient-to-r from-primary via-accent to-accent2 py-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 particle-bg opacity-30" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            {/* Player Avatar with Level Badge */}
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-accent shadow-glow-accent animate-float">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                <AvatarFallback className="text-3xl bg-white text-primary font-display">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              {/* Level Badge Overlay */}
              <div className="level-badge absolute -bottom-2 -right-2 w-12 h-12 text-sm animate-bounce-subtle">
                {gamification.level}
              </div>
            </div>

            {/* Player Info & XP Bar */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-display font-black text-white drop-shadow-lg">
                  {user.name.split(' ')[0]}
                </h1>
                <Star className="w-6 h-6 text-accent animate-sparkle" />
              </div>
              <p className="text-lg text-white/90 font-semibold mb-1">@{user.handle}</p>
              {user.organization && (
                <p className="text-sm text-white/80 font-medium">{user.organization}</p>
              )}

              {/* XP Progress Bar - Gaming Style */}
              <div className="mt-6 glass-game p-5 max-w-2xl border-2 border-accent/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent animate-wiggle" />
                    <span className="text-white font-black font-display text-lg">
                      LEVEL {gamification.level}
                    </span>
                  </div>
                  <span className="text-accent font-black text-lg">{gamification.xp} XP</span>
                </div>
                <div className="xp-bar">
                  <div className="xp-bar-fill" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="text-xs text-white/90 mt-2 font-bold">
                  <Target className="inline w-3 h-3 mr-1" />
                  {xpNeeded} XP until LEVEL {gamification.level + 1}
                </p>
              </div>
            </div>

            {/* Vault Keys - Loot Display */}
            <div className="hidden lg:block">
              <div className="game-card p-6 min-w-[180px] border-accent/50 shadow-glow-accent">
                <div className="flex flex-col items-center gap-3">
                  <Zap className="w-12 h-12 text-accent animate-bounce-subtle" />
                  <div className="text-center">
                    <p className="text-4xl font-black font-display gradient-text">
                      {gamification.vaultKeys}
                    </p>
                    <p className="text-sm font-bold text-slate-700 uppercase mt-1">Vault Keys</p>
                    <p className="text-xs text-slate-500 mt-1">Premium Currency</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Demo Mode Banner */}
        {user?.id === 'demo' && (
          <div className="mb-6 game-card bg-gradient-to-r from-accent/20 to-accent2/20 border-2 border-accent/50 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 p-3 rounded-full">
                  <Star className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-black text-slate-800">
                    You're viewing a Demo Dashboard
                  </h3>
                  <p className="text-sm text-slate-600 font-semibold">
                    Sign up to track your real progress, earn XP, and join hackathons!
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href="/auth/login">
                  <button className="btn-game-secondary px-6 py-2">Log In</button>
                </Link>
                <Link href="/auth/register">
                  <button className="btn-game px-6 py-2">Sign Up Free</button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats - Gaming Style */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: Trophy,
                  value: stats.hackathonsParticipated,
                  label: 'Raids Joined',
                  color: 'text-primary',
                  bg: 'bg-primary/10',
                },
                {
                  icon: Users,
                  value: stats.teamsJoined,
                  label: 'Guilds',
                  color: 'text-accent2',
                  bg: 'bg-accent2/10',
                },
                {
                  icon: FileText,
                  value: stats.submissionsMade,
                  label: 'Quests Done',
                  color: 'text-accent',
                  bg: 'bg-accent/10',
                },
                {
                  icon: Target,
                  value: stats.challengesCompleted,
                  label: 'Bosses Defeated',
                  color: 'text-green-500',
                  bg: 'bg-green-100',
                },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="game-card p-5 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-center">
                    <div
                      className={`${stat.bg} w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <stat.icon className={`w-7 h-7 ${stat.color} group-hover:animate-wiggle`} />
                    </div>
                    <p className="text-3xl font-black font-display stat-counter gradient-text">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-600 font-bold uppercase mt-1 tracking-wide">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* My Hackathons - "Active Raids" */}
            <div className="game-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-display font-black flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-primary animate-wiggle" />
                    Active Raids
                  </h3>
                  <p className="text-sm text-slate-600 font-semibold mt-1">Your ongoing missions</p>
                </div>

                <Link href="/hackathons">
                  <button className="btn-game-secondary text-sm px-4 py-2">
                    Find More
                    <ChevronRight className="w-4 h-4 inline ml-1" />
                  </button>
                </Link>
              </div>

              {hackathons.length > 0 ? (
                <div className="space-y-3">
                  {hackathons.map(hackathon => {
                    const content = (
                      <div
                        className={`quest-card-active p-4 group ${isDemoMode ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4
                              className={`font-bold text-lg mb-1 ${!isDemoMode && 'group-hover:text-primary'} transition-colors`}
                            >
                              {hackathon.title}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-semibold">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {hackathon.status === 'LIVE' || hackathon.status === 'ONGOING'
                                  ? `Ends ${new Date(hackathon.endsAt).toLocaleDateString()}`
                                  : `Starts ${new Date(hackathon.startsAt).toLocaleDateString()}`}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                hackathon.status === 'LIVE' || hackathon.status === 'ONGOING'
                                  ? 'live'
                                  : 'upcoming'
                              }
                              className={`text-xs font-bold ${hackathon.status === 'LIVE' || hackathon.status === 'ONGOING' ? 'animate-glow-pulse' : ''}`}
                            >
                              {hackathon.status}
                            </Badge>
                            {isDemoMode && (
                              <Badge variant="secondary" className="text-xs font-bold">
                                DEMO
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );

                    return isDemoMode ? (
                      <div key={hackathon.id}>{content}</div>
                    ) : (
                      <Link key={hackathon.id} href={`/hackathons/${hackathon.slug}`}>
                        {content}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-float" />
                  <p className="text-slate-600 font-bold mb-4">No active raids found</p>
                  <Link href="/hackathons">
                    <button className="btn-game">
                      <Plus className="w-4 h-4 inline mr-2" />
                      Join a Raid
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* My Teams - "My Guilds" */}
            <div className="game-card p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-display font-black flex items-center gap-2">
                  <Users className="w-6 h-6 text-accent2 animate-wiggle" />
                  My Guilds
                </h3>
                <p className="text-sm text-slate-600 font-semibold mt-1">Your party members</p>
              </div>
              <div>
                {teams.length > 0 ? (
                  <div className="space-y-3">
                    {teams.map(team => {
                      const content = (
                        <div
                          className={`quest-card p-4 group border-accent2/30 ${isDemoMode ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4
                                className={`font-bold text-lg mb-1 ${!isDemoMode && 'group-hover:text-accent2'} transition-colors`}
                              >
                                {team.name}
                              </h4>
                              <p className="text-sm text-slate-600 font-semibold">
                                {team.hackathon.title}
                              </p>
                              <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                                <Users className="w-3 h-3" />
                                <span className="font-bold">
                                  {team._count.members} party members
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Badge
                                variant={team.role === 'LEAD' ? 'default' : 'secondary'}
                                className="font-bold"
                              >
                                {team.role === 'LEAD' ? '⭐ GUILD LEADER' : 'MEMBER'}
                              </Badge>
                              {isDemoMode && (
                                <Badge variant="secondary" className="text-xs font-bold">
                                  DEMO
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );

                      return isDemoMode ? (
                        <div key={team.id}>{content}</div>
                      ) : (
                        <Link key={team.id} href={`/hackathons/${team.hackathon.id}/teams`}>
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-float" />
                    <p className="text-slate-600 font-bold mb-4">No guilds joined yet</p>
                    <Link href="/hackathons">
                      <button className="btn-game-secondary">Find a Guild</button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* My Submissions - "Completed Quests" */}
            <div className="game-card p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-display font-black flex items-center gap-2">
                  <FileText className="w-6 h-6 text-accent animate-wiggle" />
                  Completed Quests
                </h3>
                <p className="text-sm text-slate-600 font-semibold mt-1">Your submissions</p>
              </div>
              <div>
                {submissions.length > 0 ? (
                  <div className="space-y-3">
                    {submissions.map(submission => (
                      <div
                        key={submission.id}
                        className={isDemoMode ? 'cursor-not-allowed' : 'cursor-pointer'}
                      >
                        <div
                          className={`quest-card p-4 group border-accent/30 ${isDemoMode ? 'opacity-75' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4
                                className={`font-bold text-lg mb-1 ${!isDemoMode && 'group-hover:text-accent'} transition-colors`}
                              >
                                {submission.title}
                              </h4>
                              <p className="text-sm text-slate-600 font-semibold">
                                {submission.hackathon.title}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Badge
                                variant={
                                  submission.status === 'FINAL'
                                    ? 'live'
                                    : submission.status === 'DRAFT'
                                      ? 'draft'
                                      : 'warning'
                                }
                                className="font-bold"
                              >
                                {submission.status}
                              </Badge>
                              {isDemoMode && (
                                <Badge variant="secondary" className="text-xs font-bold">
                                  DEMO
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-float" />
                    <p className="text-slate-600 font-bold mb-4">No completed quests yet</p>
                    <Link href="/hackathons">
                      <button className="btn-game">Start a Quest</button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Right 1/3 */}
          <div className="space-y-6">
            {/* Badges - "Trophy Case" */}
            <div className="game-card p-6 shadow-glow-accent">
              <div className="mb-6">
                <h3 className="text-2xl font-display font-black flex items-center gap-2">
                  <Award className="w-6 h-6 text-accent animate-wiggle" />
                  Trophy Case
                </h3>
                <p className="text-sm text-slate-600 font-semibold mt-1">Legendary achievements</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {gamification.badges.slice(0, 6).map((badge, index) => (
                  <div
                    key={badge}
                    className={`aspect-square rounded-xl flex items-center justify-center group cursor-pointer ${
                      index === 0 ? 'badge-legendary' : index === 1 ? 'badge-epic' : 'badge-rare'
                    }`}
                    title={badge.replace(/_/g, ' ')}
                  >
                    <Award className="w-10 h-10 text-white group-hover:scale-125 transition-transform" />
                  </div>
                ))}
                {/* Empty slots */}
                {[...Array(Math.max(0, 6 - gamification.badges.length))].map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300"
                  >
                    <Award className="w-10 h-10 text-slate-300" />
                  </div>
                ))}
              </div>

              {isDemoMode ? (
                <Link href="/auth/register">
                  <button className="btn-game w-full">Sign Up to Collect Badges</button>
                </Link>
              ) : (
                <Link href="/badges">
                  <button className="btn-game w-full">View Full Collection</button>
                </Link>
              )}
            </div>

            {/* Recent Activity - "Activity Feed" */}
            <div className="game-card p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-display font-black flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-500 animate-wiggle" />
                  XP Log
                </h3>
                <p className="text-sm text-slate-600 font-semibold mt-1">Recent gains</p>
              </div>

              {gamification.recentXpEvents && gamification.recentXpEvents.length > 0 ? (
                <div className="space-y-4">
                  {gamification.recentXpEvents.map((activity: any) => (
                    <div
                      key={activity.id}
                      className="border-l-4 border-accent pl-4 group hover:border-primary transition-colors"
                    >
                      <p className="text-sm text-slate-700 font-semibold group-hover:text-primary transition-colors">
                        {activity.eventType.replace(/_/g, ' ')}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-black px-3 py-1 bg-green-100 text-green-700 rounded-full">
                          +{activity.points} XP
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 font-semibold">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
