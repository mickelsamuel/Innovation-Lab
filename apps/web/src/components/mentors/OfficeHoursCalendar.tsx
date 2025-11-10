'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Video } from 'lucide-react';
import type { MentorSession } from '@/lib/mentors';

interface OfficeHoursCalendarProps {
  sessions: MentorSession[];
  onBookSession?: (session: MentorSession) => void;
}

export function OfficeHoursCalendar({ sessions, onBookSession }: OfficeHoursCalendarProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Group sessions by date
  const sessionsByDate = sessions.reduce(
    (acc, session) => {
      const date = formatDate(session.startsAt);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(session);
      return acc;
    },
    {} as Record<string, MentorSession[]>
  );

  return (
    <div className="space-y-6">
      {Object.keys(sessionsByDate).length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="pt-16 pb-16 text-center">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No upcoming office hours scheduled</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(sessionsByDate).map(([date, dateSessions]) => (
          <div key={date}>
            <h3 className="text-lg font-bold text-cyan-400 mb-3">{date}</h3>
            <div className="space-y-3">
              {dateSessions.map(session => {
                const availableSpots = session.capacity - session.booked;
                const isFull = availableSpots <= 0;

                return (
                  <Card key={session.id} className="bg-slate-900/50 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          {session.title && (
                            <h4 className="font-semibold text-white mb-2">{session.title}</h4>
                          )}
                          <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(session.startsAt)} - {formatTime(session.endsAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {session.booked}/{session.capacity} participants
                            </div>
                          </div>
                          {session.mentor && (
                            <p className="text-sm text-slate-500 mt-2">
                              with {session.mentor.user.name}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {isFull ? (
                            <Badge variant="destructive">Full</Badge>
                          ) : (
                            <Badge variant="outline" className="border-green-500/50 text-green-400">
                              {availableSpots} spot{availableSpots !== 1 ? 's' : ''} left
                            </Badge>
                          )}
                          {onBookSession && (
                            <Button
                              size="sm"
                              onClick={() => onBookSession(session)}
                              disabled={isFull}
                              className="bg-cyan-600 hover:bg-cyan-700"
                            >
                              {session.meetingUrl ? (
                                <>
                                  <Video className="w-4 h-4 mr-1" />
                                  Join
                                </>
                              ) : (
                                'Book'
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
