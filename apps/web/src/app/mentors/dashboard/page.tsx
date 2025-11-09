'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, TrendingUp, Award } from 'lucide-react';
import { SessionBooking } from '@/components/mentors/SessionBooking';
import { getMentorAssignments } from '@/lib/mentors';
import { getAuthToken } from '@/lib/api';
import type { MentorAssignment } from '@/lib/mentors';

export default function MentorDashboardPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<MentorAssignment[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    try {
      setIsLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const data = await getMentorAssignments(token);
      setAssignments(data);
    } catch (err: any) {
      console.error('Error fetching assignments:', err);
      setError(err.message || 'Failed to fetch assignments');
    } finally {
      setIsLoading(false);
    }
  }

  const totalHackathons = assignments.length;
  const totalSessions = assignments.reduce((sum, a) => a._count.sessions, 0);
  const upcomingSessions = assignments.reduce((sum, a) => a.sessions.length, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-900/30 border-b border-purple-500/20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-10 h-10 text-purple-500" />
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Mentor Dashboard
              </h1>
              <p className="text-lg text-white/90">Guide and support participants</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Award className="w-6 h-6 text-white mb-2" />
              <p className="text-2xl font-bold text-white">{totalHackathons}</p>
              <p className="text-sm text-white/80">Hackathons</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Calendar className="w-6 h-6 text-white mb-2" />
              <p className="text-2xl font-bold text-white">{upcomingSessions}</p>
              <p className="text-sm text-white/80">Upcoming Sessions</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <TrendingUp className="w-6 h-6 text-white mb-2" />
              <p className="text-2xl font-bold text-white">{totalSessions}</p>
              <p className="text-sm text-white/80">Total Sessions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {assignments.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="pt-16 pb-16 text-center">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No Mentor Assignments Yet</h3>
              <p className="text-slate-500">You haven't been assigned to mentor any hackathons yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Assignments */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-cyan-400">Your Hackathons</h2>
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="bg-slate-900/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-white">{assignment.hackathon.title}</CardTitle>
                        <p className="text-sm text-slate-400 mt-2">
                          {assignment._count.sessions} total session{assignment._count.sessions !== 1 ? 's' : ''} •{' '}
                          {assignment.sessions.length} upcoming
                        </p>
                      </div>
                      <Badge
                        variant={assignment.hackathon.status === 'LIVE' ? 'default' : 'secondary'}
                        className={assignment.hackathon.status === 'LIVE' ? 'bg-green-600' : ''}
                      >
                        {assignment.hackathon.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedMentorId(assignment.id)}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Office Hours
                      </Button>
                      <Link href={`/hackathons/${assignment.hackathon.slug}`}>
                        <Button size="sm" variant="outline" className="border-slate-700 hover:bg-slate-800">
                          View Hackathon
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Schedule Session */}
            <div>
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">Schedule Session</h2>
              {selectedMentorId ? (
                <SessionBooking
                  mentorId={selectedMentorId}
                  onSuccess={() => {
                    setSelectedMentorId(null);
                    fetchAssignments();
                  }}
                />
              ) : (
                <Card className="bg-slate-900/50 border-slate-700">
                  <CardContent className="pt-6 text-center">
                    <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">
                      Select a hackathon to schedule office hours
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
