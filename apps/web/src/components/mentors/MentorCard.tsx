'use client';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, ExternalLink } from 'lucide-react';
import type { Mentor } from '@/lib/mentors';

interface MentorCardProps {
  mentor: Mentor;
  onSchedule?: (mentor: Mentor) => void;
  showSessions?: boolean;
}

export function MentorCard({ mentor, onSchedule, showSessions = true }: MentorCardProps) {
  const upcomingSessions = mentor.sessions?.length || 0;

  return (
    <Card className="bg-slate-900/50 border-cyan-500/20 hover:border-cyan-500/40 transition-colors">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            {mentor.user.avatarUrl ? (
              <img src={mentor.user.avatarUrl} alt={mentor.user.name || 'Mentor'} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                {(mentor.user.name || mentor.user.email)[0].toUpperCase()}
              </div>
            )}
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{mentor.user.name || 'Unnamed Mentor'}</h3>
            {mentor.user.handle && (
              <p className="text-sm text-cyan-400">@{mentor.user.handle}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bio */}
        {(mentor.bio || mentor.user.bio) && (
          <p className="text-sm text-slate-300">{mentor.bio || mentor.user.bio}</p>
        )}

        {/* Expertise */}
        {mentor.expertise && mentor.expertise.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 mb-2">Expertise</p>
            <div className="flex flex-wrap gap-2">
              {mentor.expertise.map((skill, index) => (
                <Badge key={index} variant="outline" className="border-purple-500/50 text-purple-400">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sessions */}
        {showSessions && upcomingSessions > 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>{upcomingSessions} upcoming session{upcomingSessions !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {onSchedule && (
            <Button
              size="sm"
              onClick={() => onSchedule(mentor)}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Session
            </Button>
          )}
          {mentor.calendlyUrl && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(mentor.calendlyUrl!, '_blank')}
              className="border-slate-700 hover:bg-slate-800"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
