'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SubmissionCard } from '@/components/submissions/submission-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getHackathonBySlug } from '@/lib/hackathons';
import { getSubmissions } from '@/lib/submissions';
import type { Hackathon } from '@/types/hackathon';
import type { Submission, SubmissionStatus } from '@/types/submission';
import { Search, FileText, ArrowLeft, Trophy, Upload, Plus } from 'lucide-react';

const STATUS_OPTIONS: { value: SubmissionStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'FINAL', label: 'Final' },
];

export default function HackathonSubmissionsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatus | 'ALL'>('ALL');
  const [selectedTrack, setSelectedTrack] = useState<string>('ALL');

  useEffect(() => {
    fetchData();
  }, [slug, selectedStatus]);

  async function fetchData() {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch hackathon
      const hackathonData = await getHackathonBySlug(slug);
      setHackathon(hackathonData);

      // Fetch submissions
      const filters: any = { hackathonId: hackathonData.id };
      if (selectedStatus !== 'ALL') {
        filters.status = selectedStatus;
      }

      const submissionsData = await getSubmissions(filters);
      setSubmissions(submissionsData);
    } catch (err: any) {
      console.error('Error fetching submissions:', err);
      setError(err.message || 'Failed to fetch submissions');
    } finally {
      setIsLoading(false);
    }
  }

  // Filter submissions based on search and track
  const filteredSubmissions = submissions.filter((submission) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesTitle = submission.title.toLowerCase().includes(searchLower);
      const matchesAbstract = submission.abstract.toLowerCase().includes(searchLower);
      const matchesTeam = submission.team?.name.toLowerCase().includes(searchLower);

      if (!matchesTitle && !matchesAbstract && !matchesTeam) {
        return false;
      }
    }

    // Track filter
    if (selectedTrack !== 'ALL') {
      if (submission.trackId !== selectedTrack) {
        return false;
      }
    }

    return true;
  });

  // Sort by rank (if available), then score, then submission date
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.scoreAggregate !== null && b.scoreAggregate !== null) {
      return b.scoreAggregate - a.scoreAggregate;
    }
    if (a.submittedAt && b.submittedAt) {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    }
    return 0;
  });

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Loading submissions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !hackathon) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Failed to load submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">{error || 'Hackathon not found'}</p>
            <Link href="/hackathons">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hackathons
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const finalSubmissions = submissions.filter((s) => s.status === 'FINAL').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/hackathons/${slug}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {hackathon.title}
            </Button>
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-accent py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                Project Submissions
              </h1>
              <p className="text-lg text-white/90">{hackathon.title}</p>
            </div>
            <Link href={`/hackathons/${slug}/submit`}>
              <Button size="lg" variant="secondary" className="hidden md:flex">
                <Plus className="w-5 h-5 mr-2" />
                Submit Project
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6 text-white/90">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>{submissions.length} total</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <span>{finalSubmissions} finalized</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by project title, description, or team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={selectedStatus === option.value ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2 hover:bg-primary hover:text-white transition-colors"
                  onClick={() => setSelectedStatus(option.value as SubmissionStatus | 'ALL')}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Track Filter */}
          {hackathon.tracks && hackathon.tracks.length > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Track</label>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedTrack === 'ALL' ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2 hover:bg-primary hover:text-white transition-colors"
                  onClick={() => setSelectedTrack('ALL')}
                >
                  All Tracks
                </Badge>
                {hackathon.tracks.map((track) => (
                  <Badge
                    key={track.id}
                    variant={selectedTrack === track.id ? 'default' : 'outline'}
                    className="cursor-pointer px-4 py-2 hover:bg-primary hover:text-white transition-colors"
                    onClick={() => setSelectedTrack(track.id)}
                  >
                    {track.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Submit Button */}
        <div className="md:hidden mb-6">
          <Link href={`/hackathons/${slug}/submit`} className="block">
            <Button size="lg" className="w-full">
              <Plus className="w-5 h-5 mr-2" />
              Submit Project
            </Button>
          </Link>
        </div>

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-4 text-sm text-slate-600">
            {sortedSubmissions.length === 0 ? (
              'No submissions found'
            ) : (
              <>
                Showing {sortedSubmissions.length} submission{sortedSubmissions.length !== 1 ? 's' : ''}
                {searchTerm || selectedStatus !== 'ALL' || selectedTrack !== 'ALL' ? (
                  <> of {submissions.length} total</>
                ) : null}
              </>
            )}
          </div>
        )}

        {/* Submissions Grid */}
        {sortedSubmissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedSubmissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <Upload className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {searchTerm || selectedStatus !== 'ALL' || selectedTrack !== 'ALL'
                ? 'No submissions match your filters'
                : 'No submissions yet'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || selectedStatus !== 'ALL' || selectedTrack !== 'ALL'
                ? 'Try adjusting your filters or search term'
                : 'Be the first to submit a project for this hackathon!'}
            </p>
            {searchTerm || selectedStatus !== 'ALL' || selectedTrack !== 'ALL' ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('ALL');
                  setSelectedTrack('ALL');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Link href={`/hackathons/${slug}/submit`}>
                <Button>
                  <Plus className="w-5 h-5 mr-2" />
                  Submit Project
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
