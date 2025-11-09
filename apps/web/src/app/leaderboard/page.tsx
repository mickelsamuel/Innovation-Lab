'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  getLeaderboard,
  getAllBadges,
  getLevelName,
  formatXp,
} from '@/lib/gamification';
import { getHackathons } from '@/lib/hackathons';
import { getChallenges } from '@/lib/challenges';
import type { LeaderboardEntry, Badge as BadgeType, LeaderboardScope, LeaderboardPeriod } from '@/types/gamification';
import type { Hackathon } from '@/types/hackathon';
import type { Challenge } from '@/types/challenge';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Crown,
  Star,
  Users,
  Sparkles,
  Flame,
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

const SCOPE_OPTIONS: { value: LeaderboardScope; label: string }[] = [
  { value: 'GLOBAL' as LeaderboardScope, label: 'Global' },
  { value: 'HACKATHON' as LeaderboardScope, label: 'Hackathon' },
  { value: 'CHALLENGE' as LeaderboardScope, label: 'Challenge' },
];

const PERIOD_OPTIONS: { value: LeaderboardPeriod; label: string }[] = [
  { value: 'ALLTIME' as LeaderboardPeriod, label: 'All Time' },
  { value: 'MONTH' as LeaderboardPeriod, label: 'This Month' },
  { value: 'WEEK' as LeaderboardPeriod, label: 'This Week' },
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedScope, setSelectedScope] = useState<LeaderboardScope>('GLOBAL' as LeaderboardScope);
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('ALLTIME' as LeaderboardPeriod);
  const [selectedScopeId, setSelectedScopeId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchLeaderboard();
    fetchBadges();
  }, [selectedScope, selectedPeriod, selectedScopeId]);

  useEffect(() => {
    fetchHackathons();
    fetchChallenges();
  }, []);

  async function fetchLeaderboard() {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getLeaderboard({
        scope: selectedScope,
        period: selectedPeriod,
        scopeId: selectedScopeId,
        limit: 100,
      });
      setLeaderboard(data);
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchBadges() {
    try {
      const data = await getAllBadges();
      setBadges(data);
    } catch (err: any) {
      console.error('Error fetching badges:', err);
    }
  }

  async function fetchHackathons() {
    try {
      const response = await getHackathons({ limit: 100 });
      setHackathons(response.data);
    } catch (err: any) {
      console.error('Error fetching hackathons:', err);
    }
  }

  async function fetchChallenges() {
    try {
      const data = await getChallenges({});
      setChallenges(data);
    } catch (err: any) {
      console.error('Error fetching challenges:', err);
    }
  }

  // Get badge info by slug
  const getBadgeInfo = (badgeSlug: string) => {
    return badges.find((b) => b.slug === badgeSlug);
  };

  // Get rank icon/color
  const getRankDisplay = (rank: number) => {
    if (rank === 1) {
      return {
        icon: <Crown className="w-6 h-6 text-accent" />,
        bgColor: 'bg-accent/10',
        borderColor: 'border-accent',
      };
    }
    if (rank === 2) {
      return {
        icon: <Medal className="w-6 h-6 text-slate-400" />,
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-300',
      };
    }
    if (rank === 3) {
      return {
        icon: <Award className="w-6 h-6 text-amber-600" />,
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
      };
    }
    return {
      icon: <span className="text-xl font-bold text-slate-600">#{rank}</span>,
      bgColor: 'bg-white',
      borderColor: 'border-slate-200',
    };
  };

  // Loading State
  if (isLoading && leaderboard.length === 0) {
    return (
      <div className="min-h-screen hex-grid flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-20 h-20 text-primary mx-auto mb-4 animate-float" />
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-700 font-bold">Loading Hall of Fame...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hex-grid">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary via-accent to-accent2 py-20 overflow-hidden">
        <div className="absolute inset-0 particle-bg opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <Trophy className="w-14 h-14 text-accent animate-float" />
            <div>
              <h1 className="text-6xl md:text-8xl font-display font-black text-white drop-shadow-2xl">
                Hall of Fame
              </h1>
              <p className="text-xl font-bold text-white/95 flex items-center gap-2 mt-2">
                <Flame className="inline w-6 h-6 animate-wiggle" />
                The most legendary warriors dominating the arena!
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="glass-game p-5 border-2 border-white/20">
              <Users className="w-7 h-7 text-white mb-2 animate-bounce-subtle" />
              <p className="text-3xl font-black text-white stat-counter">{leaderboard.length}</p>
              <p className="text-sm text-white/90 font-bold uppercase">Legendary Warriors</p>
            </div>
            <div className="glass-game p-5 border-2 border-white/20">
              <Trophy className="w-7 h-7 text-white mb-2 animate-wiggle" />
              <p className="text-3xl font-black text-white stat-counter">
                {leaderboard[0] ? formatXp(leaderboard[0].xp) : '-'}
              </p>
              <p className="text-sm text-white/90 font-bold uppercase">Top XP</p>
            </div>
            <div className="glass-game p-5 border-2 border-white/20">
              <TrendingUp className="w-7 h-7 text-white mb-2 animate-float" />
              <p className="text-3xl font-black text-white stat-counter">
                {leaderboard[0] ? leaderboard[0].level : '-'}
              </p>
              <p className="text-sm text-white/90 font-bold uppercase">Max Level</p>
            </div>
            <div className="glass-game p-5 border-2 border-white/20">
              <Star className="w-7 h-7 text-white mb-2 animate-sparkle" />
              <p className="text-3xl font-black text-white stat-counter">{badges.length}</p>
              <p className="text-sm text-white/90 font-bold uppercase">Total Trophies</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="game-card p-6 mb-6 border-red-300 bg-red-50">
            <p className="text-red-900 font-bold">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 space-y-6">
          {/* Scope Filter */}
          <div>
            <label className="text-sm font-black text-slate-900 mb-2 block uppercase">
              Leaderboard Scope
            </label>
            <div className="flex flex-wrap gap-2">
              {SCOPE_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={selectedScope === option.value ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2 font-bold hover:bg-primary hover:text-white transition-colors"
                  onClick={() => {
                    setSelectedScope(option.value);
                    setSelectedScopeId(undefined);
                  }}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Hackathon/Challenge Selector */}
          {selectedScope === 'HACKATHON' && hackathons.length > 0 && (
            <div>
              <label className="text-sm font-black text-slate-900 mb-2 block uppercase">
                Select Hackathon
              </label>
              <div className="flex flex-wrap gap-2">
                {hackathons.slice(0, 10).map((hackathon) => (
                  <Badge
                    key={hackathon.id}
                    variant={selectedScopeId === hackathon.id ? 'default' : 'outline'}
                    className="cursor-pointer px-4 py-2 font-bold hover:bg-primary hover:text-white transition-colors"
                    onClick={() => setSelectedScopeId(hackathon.id)}
                  >
                    {hackathon.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {selectedScope === 'CHALLENGE' && challenges.length > 0 && (
            <div>
              <label className="text-sm font-black text-slate-900 mb-2 block uppercase">
                Select Challenge
              </label>
              <div className="flex flex-wrap gap-2">
                {challenges.slice(0, 10).map((challenge) => (
                  <Badge
                    key={challenge.id}
                    variant={selectedScopeId === challenge.id ? 'default' : 'outline'}
                    className="cursor-pointer px-4 py-2 font-bold hover:bg-primary hover:text-white transition-colors"
                    onClick={() => setSelectedScopeId(challenge.id)}
                  >
                    {challenge.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Period Filter */}
          <div>
            <label className="text-sm font-black text-slate-900 mb-2 block uppercase">
              Battle Period
            </label>
            <div className="flex flex-wrap gap-2">
              {PERIOD_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={selectedPeriod === option.value ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2 font-bold hover:bg-primary hover:text-white transition-colors"
                  onClick={() => setSelectedPeriod(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 2nd Place */}
            <Card className="md:mt-8 border-slate-300 bg-slate-50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3">
                  <Medal className="w-12 h-12 text-slate-400" />
                </div>
                <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-slate-300">
                  {leaderboard[1].user.avatarUrl && (
                    <AvatarImage
                      src={leaderboard[1].user.avatarUrl}
                      alt={leaderboard[1].user.name}
                    />
                  )}
                  <AvatarFallback className="text-xl">
                    {getInitials(leaderboard[1].user.name)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{leaderboard[1].user.name}</CardTitle>
                <CardDescription>@{leaderboard[1].user.handle}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold text-primary mb-2">
                  {formatXp(leaderboard[1].xp)} XP
                </p>
                <p className="text-sm text-slate-600 mb-4">
                  Level {leaderboard[1].level} • {getLevelName(leaderboard[1].level)}
                </p>
                {leaderboard[1].badges.length > 0 && (
                  <div className="flex justify-center gap-1">
                    {leaderboard[1].badges.slice(0, 5).map((badgeSlug) => {
                      const badge = getBadgeInfo(badgeSlug);
                      return badge ? (
                        <span key={badge.slug} className="text-2xl" title={badge.name}>
                          {badge.icon}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 1st Place */}
            <Card className="border-accent bg-accent/5 ring-2 ring-accent">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3">
                  <Crown className="w-16 h-16 text-accent" />
                </div>
                <Avatar className="w-24 h-24 mx-auto mb-3 ring-4 ring-accent">
                  {leaderboard[0].user.avatarUrl && (
                    <AvatarImage
                      src={leaderboard[0].user.avatarUrl}
                      alt={leaderboard[0].user.name}
                    />
                  )}
                  <AvatarFallback className="text-2xl">
                    {getInitials(leaderboard[0].user.name)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{leaderboard[0].user.name}</CardTitle>
                <CardDescription>@{leaderboard[0].user.handle}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-4xl font-bold text-accent mb-2">
                  {formatXp(leaderboard[0].xp)} XP
                </p>
                <p className="text-sm text-slate-600 mb-4">
                  Level {leaderboard[0].level} • {getLevelName(leaderboard[0].level)}
                </p>
                {leaderboard[0].badges.length > 0 && (
                  <div className="flex justify-center gap-1">
                    {leaderboard[0].badges.slice(0, 5).map((badgeSlug) => {
                      const badge = getBadgeInfo(badgeSlug);
                      return badge ? (
                        <span key={badge.slug} className="text-3xl" title={badge.name}>
                          {badge.icon}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3rd Place */}
            <Card className="md:mt-8 border-amber-300 bg-amber-50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3">
                  <Award className="w-12 h-12 text-amber-600" />
                </div>
                <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-amber-300">
                  {leaderboard[2].user.avatarUrl && (
                    <AvatarImage
                      src={leaderboard[2].user.avatarUrl}
                      alt={leaderboard[2].user.name}
                    />
                  )}
                  <AvatarFallback className="text-xl">
                    {getInitials(leaderboard[2].user.name)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">{leaderboard[2].user.name}</CardTitle>
                <CardDescription>@{leaderboard[2].user.handle}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold text-primary mb-2">
                  {formatXp(leaderboard[2].xp)} XP
                </p>
                <p className="text-sm text-slate-600 mb-4">
                  Level {leaderboard[2].level} • {getLevelName(leaderboard[2].level)}
                </p>
                {leaderboard[2].badges.length > 0 && (
                  <div className="flex justify-center gap-1">
                    {leaderboard[2].badges.slice(0, 5).map((badgeSlug) => {
                      const badge = getBadgeInfo(badgeSlug);
                      return badge ? (
                        <span key={badge.slug} className="text-2xl" title={badge.name}>
                          {badge.icon}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="game-card p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-display font-black flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-primary animate-wiggle" />
              Complete Rankings
            </h2>
            <p className="text-slate-700 font-semibold">
              Showing {leaderboard.length} legendary warriors
            </p>
          </div>
          <div>
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-float" />
                <p className="text-slate-700 font-bold">No warriors in the Hall of Fame yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => {
                  const rankDisplay = getRankDisplay(entry.rank);

                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center gap-4 p-4 rounded-lg border ${rankDisplay.borderColor} ${rankDisplay.bgColor} hover:shadow-md transition-shadow`}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                        {rankDisplay.icon}
                      </div>

                      {/* User Info */}
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        {entry.user.avatarUrl && (
                          <AvatarImage src={entry.user.avatarUrl} alt={entry.user.name} />
                        )}
                        <AvatarFallback>{getInitials(entry.user.name)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">
                          {entry.user.name}
                        </p>
                        <p className="text-sm text-slate-700 font-semibold">@{entry.user.handle}</p>
                      </div>

                      {/* Badges */}
                      {entry.badges.length > 0 && (
                        <div className="hidden md:flex gap-1">
                          {entry.badges.slice(0, 3).map((badgeSlug) => {
                            const badge = getBadgeInfo(badgeSlug);
                            return badge ? (
                              <span
                                key={badge.slug}
                                className="text-xl"
                                title={badge.name}
                              >
                                {badge.icon}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}

                      {/* Level */}
                      <div className="text-right">
                        <p className="text-sm text-slate-700 font-bold">Level {entry.level}</p>
                        <p className="text-xs text-slate-600 font-semibold">
                          {getLevelName(entry.level)}
                        </p>
                      </div>

                      {/* XP */}
                      <div className="text-right min-w-[100px]">
                        <p className="text-lg font-black text-primary">
                          {formatXp(entry.xp)}
                        </p>
                        <p className="text-xs text-slate-600 font-bold">XP</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
