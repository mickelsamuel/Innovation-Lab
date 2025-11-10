'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Crown, Star, TrendingUp, Users, ArrowLeft, Sparkles } from 'lucide-react';
import type { Hackathon } from '@/types/hackathon';

interface Submission {
  id: string;
  title: string;
  abstract: string;
  scoreAggregate: number | null;
  rank: number | null;
  team: {
    id: string;
    name: string;
    logoUrl: string | null;
    members: Array<{
      userId: string;
      role: string;
      user: {
        id: string;
        name: string | null;
        avatarUrl: string | null;
        handle: string | null;
      };
    }>;
  };
  track: {
    id: string;
    title: string;
  } | null;
}

export default function HackathonLeaderboardPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [slug]);

  async function fetchData() {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch hackathon details
      const hackathonResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1'}/hackathons/slug/${slug}`
      );

      if (!hackathonResponse.ok) throw new Error('Hackathon not found');

      const hackathonData = await hackathonResponse.json();
      setHackathon(hackathonData);

      // Fetch ranked submissions
      const submissionsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1'}/hackathons/${hackathonData.id}/submissions?status=FINAL`
      );

      if (!submissionsResponse.ok) throw new Error('Failed to load submissions');

      const submissionsData = await submissionsResponse.json();

      // Filter and sort by rank
      const rankedSubmissions = submissionsData
        .filter((s: Submission) => s.scoreAggregate !== null && s.rank !== null)
        .sort((a: Submission, b: Submission) => (a.rank || 999) - (b.rank || 999));

      setSubmissions(rankedSubmissions);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  }

  // Filter submissions by track
  const filteredSubmissions =
    selectedTrack === 'all' ? submissions : submissions.filter(s => s.track?.id === selectedTrack);

  const topThree = filteredSubmissions.slice(0, 3);
  const restOfSubmissions = filteredSubmissions.slice(3);

  // Get unique tracks
  const tracks = hackathon?.tracks || [];

  // Medal colors
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-7 h-7 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getPodiumColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
      case 2:
        return 'from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 3:
        return 'from-amber-600/20 to-amber-700/20 border-amber-600/50';
      default:
        return 'from-slate-500/20 to-slate-600/20 border-slate-400/50';
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !hackathon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-900/50 border-red-500/20">
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
            <CardDescription className="text-slate-400">Failed to load leaderboard</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">{error || 'Hackathon not found'}</p>
            <Link href="/hackathons">
              <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hackathons
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-purple-900/30 border-b border-cyan-500/20">
        <div className="container mx-auto px-4 py-8">
          <Link href={`/hackathons/${slug}`}>
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hackathon
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <Trophy className="w-12 h-12 text-yellow-500" />
            <div>
              <h1 className="text-4xl font-display font-bold text-white mb-2">
                {hackathon.title} Leaderboard
              </h1>
              <p className="text-slate-400">
                {filteredSubmissions.length} ranked submission
                {filteredSubmissions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Track Filter */}
          {tracks.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              <Button
                size="sm"
                variant={selectedTrack === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedTrack('all')}
                className={
                  selectedTrack === 'all'
                    ? 'bg-cyan-600 hover:bg-cyan-700'
                    : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                }
              >
                All Tracks
              </Button>
              {tracks.map(track => (
                <Button
                  key={track.id}
                  size="sm"
                  variant={selectedTrack === track.id ? 'default' : 'outline'}
                  onClick={() => setSelectedTrack(track.id)}
                  className={
                    selectedTrack === track.id
                      ? 'bg-cyan-600 hover:bg-cyan-700'
                      : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                  }
                >
                  {track.title}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {filteredSubmissions.length === 0 ? (
          /* Empty State */
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-16 pb-16 text-center">
              <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No Rankings Yet</h3>
              <p className="text-slate-500">Rankings will appear here once judging is complete.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Podium - Top 3 */}
            {topThree.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Top Performers
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                  {topThree.map(submission => (
                    <Card
                      key={submission.id}
                      className={`bg-gradient-to-br ${getPodiumColor(submission.rank!)} border-2 overflow-hidden`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getMedalIcon(submission.rank!)}
                              <Badge
                                variant="outline"
                                className={`text-lg font-bold ${
                                  submission.rank === 1
                                    ? 'border-yellow-500 text-yellow-500'
                                    : submission.rank === 2
                                      ? 'border-gray-400 text-gray-400'
                                      : 'border-amber-600 text-amber-600'
                                }`}
                              >
                                #{submission.rank}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl text-white">{submission.title}</CardTitle>
                            <CardDescription className="text-slate-300 mt-2">
                              {submission.team.name}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-5 h-5 text-yellow-500" />
                            <span className="text-3xl font-bold text-white">
                              {submission.scoreAggregate?.toFixed(1)}
                            </span>
                            <span className="text-slate-400">/100</span>
                          </div>
                        </div>

                        {submission.track && (
                          <Badge variant="secondary" className="mb-3 bg-slate-800 text-cyan-400">
                            {submission.track.title}
                          </Badge>
                        )}

                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Users className="w-4 h-4" />
                          <span>
                            {submission.team.members.length} member
                            {submission.team.members.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <Link href={`/submissions/${submission.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-4 border-slate-700 hover:bg-slate-800"
                          >
                            View Submission
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Full Rankings Table */}
            {restOfSubmissions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Full Rankings
                </h2>

                <Card className="bg-slate-900/50 border-slate-700">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-800/50 border-b border-slate-700">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                              Rank
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                              Team
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                              Submission
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                              Track
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                              Score
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {restOfSubmissions.map(submission => (
                            <tr
                              key={submission.id}
                              className="hover:bg-slate-800/30 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <Badge
                                  variant="outline"
                                  className="border-slate-600 text-slate-300"
                                >
                                  #{submission.rank}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-10 h-10">
                                    {submission.team.logoUrl ? (
                                      <img
                                        src={submission.team.logoUrl}
                                        alt={submission.team.name}
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                        {submission.team.name[0].toUpperCase()}
                                      </div>
                                    )}
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-white">{submission.team.name}</p>
                                    <p className="text-sm text-slate-400">
                                      {submission.team.members.length} member
                                      {submission.team.members.length !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-medium text-white">{submission.title}</p>
                                <p className="text-sm text-slate-400 line-clamp-1">
                                  {submission.abstract}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                {submission.track ? (
                                  <Badge variant="secondary" className="bg-slate-800 text-cyan-400">
                                    {submission.track.title}
                                  </Badge>
                                ) : (
                                  <span className="text-slate-500">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span className="text-lg font-bold text-white">
                                    {submission.scoreAggregate?.toFixed(1)}
                                  </span>
                                  <span className="text-slate-500 text-sm">/100</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <Link href={`/submissions/${submission.id}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-slate-700 hover:bg-slate-800"
                                  >
                                    View
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
