'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getHackathonBySlug, getHackathonStats, registerForHackathon } from '@/lib/hackathons';
import { getHackathonAnnouncements } from '@/lib/announcements';
import type { Hackathon, HackathonStatus } from '@/types/hackathon';
import { HackathonLocation } from '@/types/hackathon';
import type { Announcement } from '@/types/announcement';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Clock,
  ExternalLink,
  Target,
  Award,
  ArrowLeft,
  UserPlus,
  FileText,
  Megaphone,
  Pin,
} from 'lucide-react';

function getStatusVariant(
  status: HackathonStatus
): 'draft' | 'upcoming' | 'live' | 'judging' | 'closed' {
  const variantMap: Record<HackathonStatus, 'draft' | 'upcoming' | 'live' | 'judging' | 'closed'> =
    {
      DRAFT: 'draft',
      UPCOMING: 'upcoming',
      LIVE: 'live',
      JUDGING: 'judging',
      CLOSED: 'closed',
    };
  return variantMap[status];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function HackathonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { toast } = useToast();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [_stats, setStats] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    fetchHackathonData();
  }, [slug]);

  useEffect(() => {
    if (!hackathon) return;

    // Update countdown every second if hackathon is live
    if (hackathon.status === 'LIVE') {
      const interval = setInterval(() => {
        updateTimeRemaining(hackathon.endsAt);
      }, 1000);

      return () => clearInterval(interval);
    } else if (hackathon.status === 'UPCOMING') {
      const interval = setInterval(() => {
        updateTimeRemaining(hackathon.startsAt);
      }, 1000);

      return () => clearInterval(interval);
    }

    return;
  }, [hackathon]);

  async function fetchHackathonData() {
    try {
      setIsLoading(true);
      setError(null);

      const [hackathonData, statsData] = await Promise.all([
        getHackathonBySlug(slug),
        getHackathonStats(slug).catch(() => null), // Stats might fail if endpoint expects ID
      ]);

      setHackathon(hackathonData);
      setStats(statsData);

      // Fetch announcements using hackathon ID
      if (hackathonData?.id) {
        try {
          const announcementsData = await getHackathonAnnouncements(hackathonData.id);
          setAnnouncements(announcementsData);
        } catch (err) {
          console.error('Failed to fetch announcements:', err);
          // Don't fail the whole page if announcements fail
        }
      }

      // Initial time remaining calculation
      if (hackathonData.status === 'LIVE') {
        updateTimeRemaining(hackathonData.endsAt);
      } else if (hackathonData.status === 'UPCOMING') {
        updateTimeRemaining(hackathonData.startsAt);
      }
    } catch (err: any) {
      console.error('Error fetching hackathon:', err);
      setError(err.message || 'Failed to fetch hackathon details');
    } finally {
      setIsLoading(false);
    }
  }

  function updateTimeRemaining(targetDate: string) {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();

    if (diff < 0) {
      setTimeRemaining('Event ended');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    } else if (hours > 0) {
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    } else if (minutes > 0) {
      setTimeRemaining(`${minutes}m ${seconds}s`);
    } else {
      setTimeRemaining(`${seconds}s`);
    }
  }

  async function handleRegister() {
    if (!hackathon) return;

    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to register for this hackathon.',
        variant: 'destructive',
      });
      router.push(`/auth/login?redirect=/hackathons/${slug}`);
      return;
    }

    setIsRegistering(true);
    try {
      await registerForHackathon(hackathon.id, token);

      toast({
        title: 'Registration Successful!',
        description: 'You have successfully registered for this hackathon.',
      });

      // Refresh hackathon data to update participant count
      await fetchHackathonData();
    } catch (err: any) {
      console.error('Registration error:', err);
      toast({
        title: 'Registration Failed',
        description: err.message || 'Failed to register for hackathon. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
    }
  }

  const isLive = hackathon?.status === 'LIVE';
  const isUpcoming = hackathon?.status === 'UPCOMING';
  const canRegister = isUpcoming || isLive;

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading hackathon details...</p>
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
            <CardDescription>Failed to load hackathon details</CardDescription>
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

  const locationLabel =
    hackathon.location === HackathonLocation.VIRTUAL
      ? 'Virtual Event'
      : hackathon.location === HackathonLocation.ONSITE
        ? `${hackathon.city || 'In Person'}, ${hackathon.country || ''}`
        : 'Hybrid Event';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Button */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/hackathons">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hackathons
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-primary to-accent py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={getStatusVariant(hackathon.status)} className="text-sm px-4 py-1">
                  {hackathon.status.replace('_', ' ')}
                </Badge>
                {(isLive || isUpcoming) && timeRemaining && (
                  <Badge
                    variant={isLive ? 'live' : 'upcoming'}
                    className="text-sm px-4 py-1 animate-pulse"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    {isLive ? 'Ends in' : 'Starts in'}: {timeRemaining}
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">
                {hackathon.title}
              </h1>

              {hackathon.subtitle && (
                <p className="text-xl text-white/90 mb-4">{hackathon.subtitle}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {formatShortDate(hackathon.startsAt)} - {formatShortDate(hackathon.endsAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{locationLabel}</span>
                </div>
                {hackathon._count && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{hackathon._count.teams} teams competing</span>
                  </div>
                )}
              </div>
            </div>

            {canRegister && (
              <div className="hidden lg:block">
                <Button
                  size="lg"
                  variant="secondary"
                  className="shadow-lg"
                  onClick={handleRegister}
                  disabled={isRegistering}
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  {isRegistering ? 'Registering...' : 'Register Now'}
                </Button>
              </div>
            )}
          </div>

          {hackathon.prizePool && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-sm text-white/80">Total Prize Pool</p>
                  <p className="text-3xl font-bold text-white">
                    ${hackathon.prizePool.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {hackathon.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Hackathon</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                    {hackathon.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Announcements */}
            {announcements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    Announcements
                  </CardTitle>
                  <CardDescription>Important updates from the organizers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {announcements
                      .sort((a, b) => {
                        // Pinned items first
                        if (a.pinned && !b.pinned) return -1;
                        if (!a.pinned && b.pinned) return 1;
                        // Then sort by creation date (newest first)
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                      })
                      .map(announcement => (
                        <div
                          key={announcement.id}
                          className={`border rounded-lg p-4 ${
                            announcement.pinned
                              ? 'border-primary bg-primary/5'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                              {announcement.pinned && <Pin className="w-4 h-4 text-primary" />}
                              {announcement.title}
                            </h3>
                            <span className="text-xs text-slate-500 whitespace-nowrap">
                              {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                            {announcement.body}
                          </p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tracks */}
            {hackathon.tracks && hackathon.tracks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-accent2" />
                    Challenge Tracks
                  </CardTitle>
                  <CardDescription>Choose a track that aligns with your interests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hackathon.tracks
                      .sort((a, b) => a.order - b.order)
                      .map(track => (
                        <div
                          key={track.id}
                          className="border border-slate-200 rounded-lg p-4 hover:border-primary transition-colors"
                        >
                          <h3 className="font-semibold text-lg mb-2">{track.title}</h3>
                          <p className="text-slate-600 text-sm">{track.description}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Judging Criteria */}
            {hackathon.criteria && hackathon.criteria.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-accent" />
                    Judging Criteria
                  </CardTitle>
                  <CardDescription>
                    Projects will be evaluated based on these criteria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hackathon.criteria
                      .sort((a, b) => a.order - b.order)
                      .map(criterion => (
                        <div
                          key={criterion.id}
                          className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 last:border-0"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{criterion.name}</h4>
                            <p className="text-sm text-slate-600">{criterion.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-primary">
                              {criterion.maxScore} pts
                            </div>
                            <div className="text-xs text-slate-500">
                              {(criterion.weight * 100).toFixed(0)}% weight
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Registration CTA */}
            {canRegister && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Ready to Participate?</CardTitle>
                  <CardDescription>Join the hackathon and start building!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleRegister}
                    disabled={isRegistering}
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    {isRegistering ? 'Registering...' : 'Register Now'}
                  </Button>
                  <p className="text-xs text-slate-500 text-center">
                    Team size: {hackathon.minTeamSize} - {hackathon.maxTeamSize} members
                    {hackathon.allowSoloTeams && ' (Solo allowed)'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Key Details */}
            <Card>
              <CardHeader>
                <CardTitle>Key Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Starts</p>
                  <p className="text-sm text-slate-600">{formatDate(hackathon.startsAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Ends</p>
                  <p className="text-sm text-slate-600">{formatDate(hackathon.endsAt)}</p>
                </div>
                {hackathon.registrationClosesAt && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Registration Closes</p>
                    <p className="text-sm text-slate-600">
                      {formatDate(hackathon.registrationClosesAt)}
                    </p>
                  </div>
                )}
                {hackathon.submissionClosesAt && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Submission Deadline</p>
                    <p className="text-sm text-slate-600">
                      {formatDate(hackathon.submissionClosesAt)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Team Size</p>
                  <p className="text-sm text-slate-600">
                    {hackathon.minTeamSize} - {hackathon.maxTeamSize} members
                    {hackathon.allowSoloTeams && ' (Solo teams allowed)'}
                  </p>
                </div>
                {hackathon.timezone && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Timezone</p>
                    <p className="text-sm text-slate-600">{hackathon.timezone}</p>
                  </div>
                )}
                {hackathon.virtualUrl && (
                  <div>
                    <a
                      href={hackathon.virtualUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Virtual Event Link
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            {hackathon._count && (
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Teams</span>
                    <span className="font-semibold">{hackathon._count.teams}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Submissions</span>
                    <span className="font-semibold">{hackathon._count.submissions}</span>
                  </div>
                  {hackathon._count.judges > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Judges</span>
                      <span className="font-semibold">{hackathon._count.judges}</span>
                    </div>
                  )}
                  {hackathon._count.mentors > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Mentors</span>
                      <span className="font-semibold">{hackathon._count.mentors}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    {hackathon._count.teams > 0 && (
                      <Link href={`/hackathons/${hackathon.slug}/teams`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <Users className="w-4 h-4 mr-2" />
                          View All Teams
                        </Button>
                      </Link>
                    )}
                    {hackathon._count.submissions > 0 && (
                      <Link href={`/hackathons/${hackathon.slug}/submissions`}>
                        <Button variant="outline" size="sm" className="w-full">
                          <FileText className="w-4 h-4 mr-2" />
                          View Submissions
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      {canRegister && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg">
          <Button className="w-full" size="lg" onClick={handleRegister} disabled={isRegistering}>
            <UserPlus className="w-5 h-5 mr-2" />
            {isRegistering ? 'Registering...' : 'Register Now'}
          </Button>
        </div>
      )}
    </div>
  );
}
