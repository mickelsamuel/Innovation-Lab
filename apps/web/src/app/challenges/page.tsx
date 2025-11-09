'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  getChallenges,
  getStatusVariant,
  getRewardTypeLabel,
  formatDeadline,
  isAcceptingSubmissions,
} from '@/lib/challenges';
import type { Challenge, ChallengeStatus } from '@/types/challenge';
import {
  Search,
  Trophy,
  Clock,
  Users,
  Code,
  Tag,
  ArrowRight,
  Filter,
  Calendar,
  Target,
  Flame,
  Swords,
  Skull,
  Zap,
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

const STATUS_OPTIONS: { value: ChallengeStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Bosses' },
  { value: 'OPEN', label: '🎯 Open' },
  { value: 'REVIEW', label: 'Judging' },
  { value: 'CLOSED', label: 'Defeated' },
];

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ChallengeStatus | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    fetchChallenges();
  }, [selectedStatus]);

  async function fetchChallenges() {
    try {
      setIsLoading(true);
      setError(null);

      const filters: any = {};
      if (selectedStatus !== 'ALL') {
        filters.status = selectedStatus;
      }

      const data = await getChallenges(filters);
      setChallenges(data);
    } catch (err: any) {
      console.error('Error fetching challenges:', err);
      setError(err.message || 'Failed to load challenges');
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }

  // Get all unique categories
  const allCategories = Array.from(
    new Set(challenges.flatMap((c) => c.categories))
  ).sort();

  // Filter challenges
  const filteredChallenges = challenges.filter((challenge) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesTitle = challenge.title.toLowerCase().includes(searchLower);
      const matchesDescription = challenge.problemStatement
        .toLowerCase()
        .includes(searchLower);
      const matchesSkills = challenge.skills.some((s) =>
        s.toLowerCase().includes(searchLower)
      );

      if (!matchesTitle && !matchesDescription && !matchesSkills) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      if (!challenge.categories.includes(selectedCategory)) {
        return false;
      }
    }

    return true;
  });

  // Sort: OPEN first, then by creation date
  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    if (a.status === 'OPEN' && b.status !== 'OPEN') return -1;
    if (a.status !== 'OPEN' && b.status === 'OPEN') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Initial Loading State
  if (isInitialLoad && isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading challenges...</p>
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
            <Skull className="w-14 h-14 text-accent animate-wiggle" />
            <div>
              <h1 className="text-5xl md:text-7xl font-display font-black text-white drop-shadow-2xl">
                Boss Challenges
              </h1>
              <p className="text-xl font-bold text-white/95 mt-2">
                <Flame className="inline w-6 h-6 mr-2 animate-wiggle" />
                Defeat epic challenges from all departments and claim legendary loot!
              </p>
            </div>
          </div>

          {/* Stats - Gaming Style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="glass-game p-5 border-2">
              <Skull className="w-7 h-7 text-accent mb-2 animate-bounce-subtle" />
              <p className="text-3xl font-black stat-counter">{challenges.length}</p>
              <p className="text-sm font-bold uppercase">Total Bosses</p>
            </div>
            <div className="glass-game p-5 border-2">
              <Flame className="w-7 h-7 mb-2 animate-wiggle" />
              <p className="text-3xl font-black stat-counter">
                {challenges.filter((c) => c.status === 'OPEN').length}
              </p>
              <p className="text-sm font-bold uppercase">Active Now</p>
            </div>
            <div className="glass-game p-5 border-2">
              <Swords className="w-7 h-7 mb-2 animate-float" />
              <p className="text-3xl font-black stat-counter">
                {challenges.reduce((sum, c) => sum + (c._count?.submissions || 0), 0)}
              </p>
              <p className="text-sm font-bold uppercase">Attempts</p>
            </div>
            <div className="glass-game p-5 border-2">
              <Target className="w-7 h-7 mb-2 animate-sparkle" />
              <p className="text-3xl font-black stat-counter">{allCategories.length}</p>
              <p className="text-sm font-bold uppercase">Boss Types</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-900">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search challenges by title, description, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={selectedStatus === option.value ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2 transition-all hover:scale-105"
                  onClick={() => setSelectedStatus(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          {allCategories.length > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2 transition-all hover:scale-105"
                  onClick={() => setSelectedCategory('ALL')}
                >
                  All Categories
                </Badge>
                {allCategories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    className="cursor-pointer px-4 py-2 transition-all hover:scale-105"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-slate-600">
          {sortedChallenges.length === 0 ? (
            'No challenges found'
          ) : (
            <>
              Showing {sortedChallenges.length} challenge
              {sortedChallenges.length !== 1 ? 's' : ''}
              {searchTerm || selectedStatus !== 'ALL' || selectedCategory !== 'ALL' ? (
                <> of {challenges.length} total</>
              ) : null}
            </>
          )}
        </div>

        {/* Challenges Grid */}
        {sortedChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedChallenges.map((challenge) => {
              const isOpen = isAcceptingSubmissions(challenge);

              return (
                <Card
                  key={challenge.id}
                  className="h-full hover:shadow-lg transition-shadow duration-200 flex flex-col"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant={getStatusVariant(challenge.status)} className="text-xs">
                        {challenge.status}
                      </Badge>
                      {isOpen && (
                        <Badge variant="success" className="text-xs">
                          Accepting Submissions
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="text-xl font-display line-clamp-2">
                      {challenge.title}
                    </CardTitle>

                    <CardDescription className="line-clamp-3">
                      {challenge.problemStatement}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    {/* Reward */}
                    {challenge.rewardType && (
                      <div className="flex items-center gap-2 text-sm">
                        <Trophy className="w-4 h-4 text-accent" />
                        <span className="font-medium text-slate-700">
                          {getRewardTypeLabel(challenge.rewardType)}
                          {challenge.rewardValue && `: ${challenge.rewardValue}`}
                        </span>
                      </div>
                    )}

                    {/* Deadline */}
                    {challenge.deadlineAt && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        {formatDeadline(challenge.deadlineAt)}
                      </div>
                    )}

                    {/* Categories */}
                    {challenge.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {challenge.categories.slice(0, 3).map((category) => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                        {challenge.categories.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{challenge.categories.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Skills */}
                    {challenge.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {challenge.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {challenge.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{challenge.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Owner & Submissions */}
                    <div className="flex items-center justify-between text-sm text-slate-600 mt-auto pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          {challenge.owner.avatarUrl && (
                            <AvatarImage
                              src={challenge.owner.avatarUrl}
                              alt={challenge.owner.name}
                            />
                          )}
                          <AvatarFallback className="text-xs">
                            {getInitials(challenge.owner.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{challenge.owner.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Users className="w-3 h-3" />
                        {challenge._count?.submissions || 0} submissions
                      </div>
                    </div>

                    {/* View Button */}
                    <Link href={`/challenges/${challenge.slug}`} className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        View Challenge
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <Code className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {searchTerm || selectedStatus !== 'ALL' || selectedCategory !== 'ALL'
                ? 'No challenges match your filters'
                : 'No challenges yet'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || selectedStatus !== 'ALL' || selectedCategory !== 'ALL'
                ? 'Try adjusting your filters or search term'
                : 'Check back soon for new coding challenges!'}
            </p>
            {(searchTerm || selectedStatus !== 'ALL' || selectedCategory !== 'ALL') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('ALL');
                  setSelectedCategory('ALL');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
