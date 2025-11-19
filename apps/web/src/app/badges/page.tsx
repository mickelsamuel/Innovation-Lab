'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllBadges, getMyGamificationProfile } from '@/lib/gamification';
import { getAuthToken } from '@/lib/api';
import type { Badge as BadgeType } from '@/types/gamification';
import { Award, Trophy, Star, Crown, ArrowLeft, Sparkles, Lock } from 'lucide-react';

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [earnedBadgeSlugs, setEarnedBadgeSlugs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'EARNED' | 'LOCKED'>('ALL');

  useEffect(() => {
    fetchBadges();
  }, []);

  async function fetchBadges() {
    try {
      setIsLoading(true);
      const data = await getAllBadges();
      setBadges(data);

      // Fetch user's earned badges
      const token = getAuthToken();
      if (token) {
        try {
          const profile = await getMyGamificationProfile(token);
          setEarnedBadgeSlugs(profile.badges || []);
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          // Continue without earned badges (user might not be logged in)
        }
      }
    } catch (err) {
      setError('Failed to load badges');
    } finally {
      setIsLoading(false);
    }
  }

  const rarityOptions = ['ALL', 'COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];

  const filteredBadges = badges.filter(badge => {
    // Rarity filter
    if (selectedRarity !== 'ALL' && badge.rarity?.toUpperCase() !== selectedRarity) {
      return false;
    }

    // Earned/Locked filter
    const isEarned = earnedBadgeSlugs.includes(badge.slug);
    if (selectedFilter === 'EARNED' && !isEarned) return false;
    if (selectedFilter === 'LOCKED' && isEarned) return false;

    return true;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toUpperCase()) {
      case 'COMMON':
        return 'text-slate-600 dark:text-slate-300';
      case 'UNCOMMON':
        return 'text-green-600 dark:text-green-400';
      case 'RARE':
        return 'text-blue-600 dark:text-blue-400';
      case 'EPIC':
        return 'text-purple-600 dark:text-purple-400';
      case 'LEGENDARY':
        return 'text-accent';
      default:
        return 'text-slate-600 dark:text-slate-300';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity?.toUpperCase()) {
      case 'COMMON':
        return 'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700';
      case 'UNCOMMON':
        return 'from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30';
      case 'RARE':
        return 'from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30';
      case 'EPIC':
        return 'from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30';
      case 'LEGENDARY':
        return 'from-yellow-100 to-amber-200 dark:from-yellow-900/40 dark:to-amber-800/40';
      default:
        return 'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700';
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen hex-grid flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-20 h-20 text-primary mx-auto mb-4 animate-float" />
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-700 dark:text-slate-300 font-bold">Loading Trophy Vault...</p>
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
          <Link href="/dashboard">
            <button className="btn-game-secondary text-sm px-4 py-2 mb-6 inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Player Hub
            </button>
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <Award className="w-12 h-12 text-accent animate-wiggle" />
            <div>
              <h1 className="text-5xl md:text-7xl font-display font-black text-white drop-shadow-2xl">
                Trophy Vault
              </h1>
              <p className="text-xl font-bold text-white/95 flex items-center gap-2 mt-2">
                <Sparkles className="inline w-6 h-6 animate-sparkle" />
                {earnedBadgeSlugs.length > 0
                  ? `You've unlocked ${earnedBadgeSlugs.length} of ${badges.length} trophies!`
                  : `Unlock legendary achievements and show your dominance!`}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6">
            <div className="glass-game p-5 border-2 border-white/20">
              <Award className="w-7 h-7 text-white mb-2 animate-wiggle" />
              <p className="text-3xl font-black text-white stat-counter">{badges.length}</p>
              <p className="text-sm text-white/90 font-bold uppercase">Total</p>
            </div>
            <div className="glass-game p-5 border-2 border-white/20">
              <Star className="w-7 h-7 text-white mb-2 animate-sparkle" />
              <p className="text-3xl font-black text-white stat-counter">
                {badges.filter(b => b.rarity?.toUpperCase() === 'COMMON').length}
              </p>
              <p className="text-sm text-white/90 font-bold uppercase">Common</p>
            </div>
            <div className="glass-game p-5 border-2 border-white/20">
              <Star className="w-7 h-7 text-green-300 mb-2 animate-sparkle" />
              <p className="text-3xl font-black text-white stat-counter">
                {badges.filter(b => b.rarity?.toUpperCase() === 'UNCOMMON').length}
              </p>
              <p className="text-sm text-white/90 font-bold uppercase">Uncommon</p>
            </div>
            <div className="glass-game p-5 border-2 border-white/20">
              <Trophy className="w-7 h-7 text-blue-300 mb-2 animate-float" />
              <p className="text-3xl font-black text-white stat-counter">
                {badges.filter(b => b.rarity?.toUpperCase() === 'RARE').length}
              </p>
              <p className="text-sm text-white/90 font-bold uppercase">Rare</p>
            </div>
            <div className="glass-game p-5 border-2 border-white/20">
              <Trophy className="w-7 h-7 text-purple-300 mb-2 animate-float" />
              <p className="text-3xl font-black text-white stat-counter">
                {badges.filter(b => b.rarity?.toUpperCase() === 'EPIC').length}
              </p>
              <p className="text-sm text-white/90 font-bold uppercase">Epic</p>
            </div>
            <div className="glass-game p-5 border-2 border-white/20">
              <Crown className="w-7 h-7 text-yellow-300 mb-2 animate-bounce-subtle" />
              <p className="text-3xl font-black text-white stat-counter">
                {badges.filter(b => b.rarity?.toUpperCase() === 'LEGENDARY').length}
              </p>
              <p className="text-sm text-white/90 font-bold uppercase">Legendary</p>
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
          {/* Earned/Locked Filter */}
          <div>
            <label className="text-sm font-black text-slate-900 dark:text-slate-100 mb-2 block uppercase">
              Show
            </label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedFilter === 'ALL' ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2 font-bold hover:bg-primary hover:text-white transition-colors"
                onClick={() => setSelectedFilter('ALL')}
              >
                All Badges ({badges.length})
              </Badge>
              <Badge
                variant={selectedFilter === 'EARNED' ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2 font-bold hover:bg-primary hover:text-white transition-colors"
                onClick={() => setSelectedFilter('EARNED')}
              >
                ✓ Earned ({earnedBadgeSlugs.length})
              </Badge>
              <Badge
                variant={selectedFilter === 'LOCKED' ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2 font-bold hover:bg-primary hover:text-white transition-colors"
                onClick={() => setSelectedFilter('LOCKED')}
              >
                <Lock className="w-3 h-3 mr-1 inline" /> Locked ({badges.length - earnedBadgeSlugs.length})
              </Badge>
            </div>
          </div>

          {/* Rarity Filter */}
          <div>
            <label className="text-sm font-black text-slate-900 dark:text-slate-100 mb-2 block uppercase">
              Filter by Rarity
            </label>
            <div className="flex flex-wrap gap-2">
              {rarityOptions.map(rarity => (
                <Badge
                  key={rarity}
                  variant={selectedRarity === rarity ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2 font-bold hover:bg-primary hover:text-white transition-colors"
                  onClick={() => setSelectedRarity(rarity)}
                >
                  {rarity === 'ALL' ? 'All Rarities' : rarity}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        {filteredBadges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBadges.map(badge => {
              const isEarned = earnedBadgeSlugs.includes(badge.slug);
              return (
                <Card
                  key={badge.id}
                  className={`hover:shadow-lg transition-all duration-200 hover:scale-105 relative ${!isEarned ? 'opacity-60' : ''}`}
                >
                  {!isEarned && (
                    <div className="absolute top-4 right-4 z-10 bg-slate-900/80 rounded-full p-2">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <CardHeader
                    className={`bg-gradient-to-br ${getRarityBg(badge.rarity)} text-center pb-4 ${!isEarned ? 'grayscale' : ''}`}
                  >
                    <div className="text-6xl mb-3">{badge.icon}</div>
                    <Badge variant="secondary" className="mx-auto">
                      <span className={getRarityColor(badge.rarity)}>{badge.rarity?.toUpperCase()}</span>
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {isEarned && (
                      <div className="mb-2 text-center">
                        <Badge variant="default" className="bg-green-600 text-white font-bold">
                          ✓ UNLOCKED
                        </Badge>
                      </div>
                    )}
                    <h3 className="font-bold text-lg text-center mb-2 text-slate-900 dark:text-slate-100">{badge.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 text-center mb-4">{badge.description}</p>
                    {!isEarned && badge.xpRequired > 0 && (
                      <div className="text-xs text-center text-slate-600 dark:text-slate-400 font-semibold mb-2">
                        🔒 Requires {badge.xpRequired.toLocaleString()} XP
                      </div>
                    )}
                    <div className="text-xs text-center text-slate-600 dark:text-slate-300 font-semibold">
                      Unlocked by {badge._count?.userBadges || 0}{' '}
                      {badge._count?.userBadges === 1 ? 'warrior' : 'warriors'}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="game-card p-12 text-center">
            <Award className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4 animate-float" />
            <h3 className="text-2xl font-display font-black text-slate-900 dark:text-slate-100 mb-2">
              No Trophies Found
            </h3>
            <p className="text-slate-700 dark:text-slate-300 font-semibold">
              Try adjusting your filters or check back later for new legendary trophies!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
