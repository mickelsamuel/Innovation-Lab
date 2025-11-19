'use client';

import { useState, useEffect } from 'react';
import { HackathonCard } from '@/components/hackathons/hackathon-card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getHackathons } from '@/lib/hackathons';
import type { Hackathon, HackathonsResponse } from '@/types/hackathon';
import { HackathonStatus, HackathonLocation } from '@/types/hackathon';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Swords,
  Flame,
  Trophy,
  Clock,
  Target,
} from 'lucide-react';

const STATUS_OPTIONS: { value: HackathonStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Raids' },
  { value: HackathonStatus.UPCOMING, label: 'Soon™' },
  { value: HackathonStatus.LIVE, label: '🔥 Live Now' },
  { value: HackathonStatus.JUDGING, label: 'Scoring' },
  { value: HackathonStatus.CLOSED, label: 'Completed' },
];

const LOCATION_OPTIONS: {
  value: HackathonLocation | 'ALL';
  label: 'All Locations' | 'Virtual' | 'In Person' | 'Hybrid';
}[] = [
  { value: 'ALL', label: 'All Locations' },
  { value: HackathonLocation.VIRTUAL, label: 'Virtual' },
  { value: HackathonLocation.ONSITE, label: 'In Person' },
  { value: HackathonLocation.HYBRID, label: 'Hybrid' },
];

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<HackathonStatus | 'ALL'>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<HackathonLocation | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 9; // Items per page

  useEffect(() => {
    fetchHackathons();
  }, [searchTerm, selectedStatus, selectedLocation, currentPage]);

  async function fetchHackathons() {
    try {
      setIsLoading(true);
      setError(null);

      const filters: Record<string, unknown> = {
        page: currentPage,
        limit,
      };

      if (searchTerm) {
        filters.search = searchTerm;
      }

      if (selectedStatus !== 'ALL') {
        filters.status = selectedStatus;
      }

      if (selectedLocation !== 'ALL') {
        filters.location = selectedLocation;
      }

      const response: HackathonsResponse = await getHackathons(filters);

      setHackathons(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (err) {
      console.error('Error fetching hackathons:', err);
      setError(err instanceof Error ? err.message : String(err) || 'Failed to fetch hackathons');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearchChange(value: string) {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  }

  function handleStatusChange(status: HackathonStatus | 'ALL') {
    setSelectedStatus(status);
    setCurrentPage(1);
  }

  function handleLocationChange(location: HackathonLocation | 'ALL') {
    setSelectedLocation(location);
    setCurrentPage(1);
  }

  function handlePageChange(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <div className="min-h-screen hex-grid">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary via-accent to-accent2 py-20 overflow-hidden">
        <div className="absolute inset-0 particle-bg opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Swords className="w-12 h-12 text-accent animate-wiggle" />
            <h1 className="text-5xl md:text-7xl font-display font-black text-white drop-shadow-2xl">
              Raid Selection
            </h1>
            <Trophy className="w-10 h-10 text-accent animate-float" />
          </div>
          <p className="text-xl font-bold text-white/95 max-w-3xl">
            <Flame className="inline w-6 h-6 mr-2 animate-wiggle" />
            Choose your next epic coding raid! Team up with legendary developers and compete for
            massive loot.
          </p>
          <div className="mt-6 flex items-center gap-4 text-white/90 font-semibold">
            <div className="flex items-center gap-2 px-4 py-2 glass-game rounded-lg">
              <Target className="w-5 h-5 animate-sparkle" />
              <span>{total} Active Raids</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters - Game Style */}
        <div className="game-card p-6 mb-8">
          <h3 className="text-lg font-display font-black mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary animate-wiggle" />
            RAID FILTERS
          </h3>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent w-5 h-5" />
            <Input
              type="text"
              placeholder="Search raids by name, description..."
              value={searchTerm}
              onChange={e => handleSearchChange(e.target.value)}
              className="pl-12 h-14 text-base font-semibold border-2 focus:border-primary"
            />
          </div>

          {/* Status and Location Filters */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 mb-3 block uppercase tracking-wide">
                <Clock className="inline w-4 h-4 mr-1" />
                Raid Status
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(option => (
                  <Badge
                    key={option.value}
                    variant={selectedStatus === option.value ? 'default' : 'outline'}
                    className={`cursor-pointer px-4 py-2 font-bold transition-all hover:scale-105 ${
                      selectedStatus === option.value ? 'shadow-glow' : ''
                    }`}
                    onClick={() => handleStatusChange(option.value as HackathonStatus | 'ALL')}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <label className="text-sm font-black text-slate-700 dark:text-slate-300 mb-3 block uppercase tracking-wide">
                <Target className="inline w-4 h-4 mr-1" />
                Location Type
              </label>
              <div className="flex flex-wrap gap-2">
                {LOCATION_OPTIONS.map(option => (
                  <Badge
                    key={option.value}
                    variant={selectedLocation === option.value ? 'default' : 'outline'}
                    className={`cursor-pointer px-4 py-2 font-bold transition-all hover:scale-105 ${
                      selectedLocation === option.value ? 'shadow-glow' : ''
                    }`}
                    onClick={() => handleLocationChange(option.value as HackathonLocation | 'ALL')}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-6 text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            {total === 0 ? (
              '⚠️ No raids found'
            ) : (
              <>
                <Trophy className="inline w-4 h-4 mr-1 text-accent" />
                Showing {(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, total)} of{' '}
                {total} raid{total !== 1 ? 's' : ''}
              </>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
            <p className="font-medium">Error loading hackathons</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Hackathons Grid */}
        {!isLoading && !error && hackathons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map(hackathon => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && hackathons.length === 0 && (
          <div className="text-center py-20">
            <div className="game-card p-12 max-w-lg mx-auto">
              <Swords className="w-20 h-20 text-slate-300 mx-auto mb-6 animate-float" />
              <h3 className="text-2xl font-display font-black text-slate-700 dark:text-slate-300 mb-3">
                No Raids Found
              </h3>
              <p className="text-slate-600 dark:text-slate-300 font-semibold mb-8">
                Try adjusting your filters or search to find more epic raids!
              </p>
              <button
                className="btn-game"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('ALL');
                  setSelectedLocation('ALL');
                  setCurrentPage(1);
                }}
              >
                <Target className="w-5 h-5 inline mr-2" />
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              className={`btn-game-secondary px-4 py-2 text-sm ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 inline mr-1" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      className={`w-12 h-12 rounded-lg font-black transition-all ${
                        page === currentPage
                          ? 'bg-gradient-to-br from-primary to-accent text-white shadow-glow'
                          : 'bg-white dark:bg-card border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-primary hover:scale-105'
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="text-slate-400 font-bold">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              className={`btn-game-secondary px-4 py-2 text-sm ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 inline ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
