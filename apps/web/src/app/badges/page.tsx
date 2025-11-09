'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllBadges } from '@/lib/gamification';
import type { Badge as BadgeType } from '@/types/gamification';
import { Award, Trophy, Star, Crown, ArrowLeft, Sparkles } from 'lucide-react';

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');

  useEffect(() => {
    fetchBadges();
  }, []);

  async function fetchBadges() {
    try {
      setIsLoading(true);
      const data = await getAllBadges();
      setBadges(data);
    } catch (err: any) {
      setError('Failed to load badges');
    } finally {
      setIsLoading(false);
    }
  }

  const rarityOptions = ['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY'];

  const filteredBadges = selectedRarity === 'ALL'
    ? badges
    : badges.filter((badge) => badge.rarity === selectedRarity);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'text-slate-600';
      case 'RARE': return 'text-blue-600';
      case 'EPIC': return 'text-purple-600';
      case 'LEGENDARY': return 'text-accent';
      default: return 'text-slate-600';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'from-slate-100 to-slate-200';
      case 'RARE': return 'from-blue-100 to-blue-200';
      case 'EPIC': return 'from-purple-100 to-purple-200';
      case 'LEGENDARY': return 'from-accent/20 to-primary/20';
      default: return 'from-slate-100 to-slate-200';
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen hex-grid flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-20 h-20 text-primary mx-auto mb-4 animate-float" />
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-700 font-bold">Loading Trophy Vault...</p>
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
            <button className="btn-game-secondary text-sm px-4 py-2 mb-6">
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
                Unlock legendary achievements and show your dominance!
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="glass-game p-5 border-2 border-white/20">
              <Award className="w-7 h-7 text-white mb-2 animate-wiggle" />
              <p className="text-3xl font-black text-white stat-counter">{badges.length}</p>
              <p className="text-sm text-white/90 font-bold uppercase">Total Trophies</p>
            </div>
            <div className="glass-game p-5 border-2 border-white/20">
              <Star className="w-7 h-7 text-white mb-2 animate-sparkle" />
              <p className="text-3xl font-black text-white stat-counter">
                {badges.filter((b) => b.rarity === 'COMMON').length}
              </p>
              <p className="text-sm text-white/90 font-bold uppercase">Common</p>
            </div>
            <div className="glass-game p-5 border-2 border-white/20">
              <Trophy className="w-7 h-7 text-white mb-2 animate-float" />
              <p className="text-3xl font-black text-white stat-counter">
                {badges.filter((b) => b.rarity === 'EPIC').length}
              </p>
              <p className="text-sm text-white/90 font-bold uppercase">Epic</p>
            </div>
            <div className="glass-game p-5 border-2 border-white/20">
              <Crown className="w-7 h-7 text-white mb-2 animate-bounce-subtle" />
              <p className="text-3xl font-black text-white stat-counter">
                {badges.filter((b) => b.rarity === 'LEGENDARY').length}
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
        <div className="mb-8">
          <label className="text-sm font-black text-slate-900 mb-2 block uppercase">Filter by Rarity</label>
          <div className="flex flex-wrap gap-2">
            {rarityOptions.map((rarity) => (
              <Badge
                key={rarity}
                variant={selectedRarity === rarity ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2 font-bold hover:bg-primary hover:text-white transition-colors"
                onClick={() => setSelectedRarity(rarity)}
              >
                {rarity === 'ALL' ? 'All Trophies' : rarity}
              </Badge>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        {filteredBadges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBadges.map((badge) => (
              <Card
                key={badge.id}
                className="hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <CardHeader className={`bg-gradient-to-br ${getRarityBg(badge.rarity)} text-center pb-4`}>
                  <div className="text-6xl mb-3">{badge.icon}</div>
                  <Badge variant="secondary" className="mx-auto">
                    <span className={getRarityColor(badge.rarity)}>{badge.rarity}</span>
                  </Badge>
                </CardHeader>
                <CardContent className="pt-4">
                  <h3 className="font-bold text-lg text-center mb-2">{badge.name}</h3>
                  <p className="text-sm text-slate-600 text-center mb-4">
                    {badge.description}
                  </p>
                  <div className="text-xs text-center text-slate-600 font-semibold">
                    Unlocked by {badge._count?.userBadges || 0} {badge._count?.userBadges === 1 ? 'warrior' : 'warriors'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="game-card p-12 text-center">
            <Award className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-float" />
            <h3 className="text-2xl font-display font-black text-slate-900 mb-2">
              No Trophies Found
            </h3>
            <p className="text-slate-700 font-semibold">
              Try adjusting your filters or check back later for new legendary trophies!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
