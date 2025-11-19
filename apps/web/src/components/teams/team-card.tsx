'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Team } from '@/types/team';
import { Users, UserPlus, Crown } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface TeamCardProps {
  team: Team;
  onJoinRequest?: (teamId: string) => void;
}

export function TeamCard({ team, onJoinRequest }: TeamCardProps) {
  const maxSize = team.hackathon?.maxTeamSize || 4;
  const currentSize = team.members.length;
  const spotsLeft = maxSize - currentSize;
  const isFull = currentSize >= maxSize;
  const isLookingForMembers = team.lookingForMembers && !isFull;

  const teamLead = team.members.find(m => m.role === 'LEAD');

  return (
    <Card
      className={cn(
        'h-full hover:shadow-lg transition-shadow duration-200',
        isLookingForMembers && 'border-accent2'
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-500 dark:text-slate-300" />
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {currentSize}/{maxSize} members
            </span>
          </div>
          {isLookingForMembers && (
            <Badge variant="info" className="text-xs">
              <UserPlus className="w-3 h-3 mr-1" />
              {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
            </Badge>
          )}
          {isFull && (
            <Badge variant="secondary" className="text-xs">
              Full
            </Badge>
          )}
        </div>

        <CardTitle className="text-xl font-display line-clamp-1">{team.name}</CardTitle>

        {teamLead && (
          <CardDescription className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-accent" />
            <span>Led by @{teamLead.user.handle}</span>
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {team.bio && <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{team.bio}</p>}

        {/* Team Members Preview */}
        <div>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Team Members</p>
          <div className="flex items-center -space-x-2">
            {team.members.slice(0, 5).map(member => (
              <Avatar
                key={member.id}
                className="w-8 h-8 border-2 border-white dark:border-card"
                title={`${member.user.name} (@${member.user.handle})`}
              >
                {member.user.avatarUrl && (
                  <AvatarImage src={member.user.avatarUrl} alt={member.user.name} />
                )}
                <AvatarFallback className="text-xs">{getInitials(member.user.name)}</AvatarFallback>
              </Avatar>
            ))}
            {team.members.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-card flex items-center justify-center">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  +{team.members.length - 5}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link href={`/teams/${team.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              View Team
            </Button>
          </Link>
          {isLookingForMembers && onJoinRequest && (
            <Button size="sm" className="flex-1" onClick={() => onJoinRequest(team.id)}>
              <UserPlus className="w-4 h-4 mr-1" />
              Request to Join
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
