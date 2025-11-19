'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Submission, SubmissionStatus } from '@/types/submission';
import { Github, Globe, Video, Users, Trophy, Medal } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface SubmissionCardProps {
  submission: Submission;
}

function getStatusVariant(status: SubmissionStatus): 'draft' | 'warning' | 'live' | 'secondary' {
  const variantMap: Record<SubmissionStatus, 'draft' | 'warning' | 'live' | 'secondary'> = {
    DRAFT: 'draft',
    SUBMITTED: 'warning',
    FINAL: 'live',
    DISQUALIFIED: 'secondary',
  };
  return variantMap[status];
}

function getRankBadge(rank?: number) {
  if (!rank) return null;

  if (rank === 1) {
    return (
      <Badge variant="default" className="bg-accent text-white">
        <Trophy className="w-3 h-3 mr-1" />
        1st Place
      </Badge>
    );
  } else if (rank === 2) {
    return (
      <Badge variant="secondary" className="bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
        <Medal className="w-3 h-3 mr-1" />
        2nd Place
      </Badge>
    );
  } else if (rank === 3) {
    return (
      <Badge variant="secondary" className="bg-amber-600 text-white">
        <Medal className="w-3 h-3 mr-1" />
        3rd Place
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-xs">
      Rank #{rank}
    </Badge>
  );
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const hasLinks = submission.repoUrl || submission.demoUrl || submission.videoUrl;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant={getStatusVariant(submission.status)} className="text-xs">
            {submission.status}
          </Badge>
          {getRankBadge(submission.rank)}
        </div>

        <CardTitle className="text-xl font-display line-clamp-2">{submission.title}</CardTitle>

        {submission.team && (
          <CardDescription className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{submission.team.name}</span>
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Track */}
        {submission.track && (
          <div>
            <Badge variant="info" className="text-xs">
              {submission.track.title}
            </Badge>
          </div>
        )}

        {/* Abstract Preview */}
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{submission.abstract}</p>

        {/* Score */}
        {submission.scoreAggregate !== null && submission.scoreAggregate !== undefined && (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">Overall Score</p>
            <p className="text-2xl font-bold text-primary">
              {submission.scoreAggregate.toFixed(1)}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-300">/100</span>
            </p>
          </div>
        )}

        {/* Team Members */}
        {submission.team && submission.team.members && (
          <div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Team Members</p>
            <div className="flex items-center -space-x-2">
              {submission.team.members.slice(0, 4).map(member => (
                <Avatar
                  key={member.id}
                  className="w-8 h-8 border-2 border-white dark:border-card"
                  title={`${member.user.name} (@${member.user.handle})`}
                >
                  {member.user.avatarUrl && (
                    <AvatarImage src={member.user.avatarUrl} alt={member.user.name} />
                  )}
                  <AvatarFallback className="text-xs">
                    {getInitials(member.user.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {submission.team.members.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-card flex items-center justify-center">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    +{submission.team.members.length - 4}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Links */}
        {hasLinks && (
          <div className="flex flex-wrap gap-2">
            {submission.repoUrl && (
              <a
                href={submission.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-600 dark:text-slate-300 hover:text-primary flex items-center gap-1"
              >
                <Github className="w-3 h-3" />
                Code
              </a>
            )}
            {submission.demoUrl && (
              <a
                href={submission.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-600 dark:text-slate-300 hover:text-primary flex items-center gap-1"
              >
                <Globe className="w-3 h-3" />
                Demo
              </a>
            )}
            {submission.videoUrl && (
              <a
                href={submission.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-600 dark:text-slate-300 hover:text-primary flex items-center gap-1"
              >
                <Video className="w-3 h-3" />
                Video
              </a>
            )}
          </div>
        )}

        {/* View Details Button */}
        <div className="pt-2">
          <Link href={`/submissions/${submission.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
