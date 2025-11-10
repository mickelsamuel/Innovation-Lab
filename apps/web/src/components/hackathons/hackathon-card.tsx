'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Hackathon, HackathonStatus } from '@/types/hackathon';
import { Calendar, MapPin, Users, Trophy, Clock } from 'lucide-react';

interface HackathonCardProps {
  hackathon: Hackathon;
}

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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getTimeRemaining(endDate: string): string {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();

  if (diff < 0) return 'Ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} left`;
  }
  return `${hours} hour${hours > 1 ? 's' : ''} left`;
}

export function HackathonCard({ hackathon }: HackathonCardProps) {
  const isLive = hackathon.status === 'LIVE';
  const locationLabel =
    hackathon.location === 'VIRTUAL'
      ? 'Virtual'
      : hackathon.location === 'IN_PERSON'
        ? hackathon.city || 'In Person'
        : 'Hybrid';

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-slate-200 hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant={getStatusVariant(hackathon.status)}>
            {hackathon.status.replace('_', ' ')}
          </Badge>
          {isLive && (
            <Badge variant="live" className="animate-pulse">
              <Clock className="w-3 h-3 mr-1" />
              {getTimeRemaining(hackathon.endsAt)}
            </Badge>
          )}
        </div>

        <CardTitle className="text-xl font-display line-clamp-2">{hackathon.title}</CardTitle>

        {hackathon.subtitle && (
          <CardDescription className="line-clamp-1">{hackathon.subtitle}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {hackathon.description && (
          <p className="text-sm text-slate-600 line-clamp-3">{hackathon.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDate(hackathon.startsAt)} - {formatDate(hackathon.endsAt)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4" />
            <span>{locationLabel}</span>
          </div>

          {hackathon._count && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users className="w-4 h-4" />
              <span>
                {hackathon._count.teams} team{hackathon._count.teams !== 1 ? 's' : ''},{' '}
                {hackathon._count.submissions} submission
                {hackathon._count.submissions !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {hackathon.prizePool && (
            <div className="flex items-center gap-2 text-sm text-accent font-semibold">
              <Trophy className="w-4 h-4" />
              <span>${hackathon.prizePool.toLocaleString()} Prize Pool</span>
            </div>
          )}
        </div>

        {hackathon.tracks && hackathon.tracks.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hackathon.tracks.slice(0, 3).map(track => (
              <Badge key={track.id} variant="secondary" className="text-xs">
                {track.title}
              </Badge>
            ))}
            {hackathon.tracks.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{hackathon.tracks.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="pt-2">
          <Link href={`/hackathons/${hackathon.slug}`} className="w-full">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
