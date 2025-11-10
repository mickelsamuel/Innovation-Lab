'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Users } from 'lucide-react';
import { MentorCard } from '@/components/mentors/MentorCard';
import { OfficeHoursCalendar } from '@/components/mentors/OfficeHoursCalendar';
import { getMentors, getHackathonSessions } from '@/lib/mentors';
import type { Mentor, MentorSession } from '@/lib/mentors';

export default function HackathonMentorsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [_hackathonId, setHackathonId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [slug]);

  async function fetchData() {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch hackathon to get ID
      const hackathonResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1'}/hackathons/slug/${slug}`
      );

      if (!hackathonResponse.ok) throw new Error('Hackathon not found');

      const hackathonData = await hackathonResponse.json();
      setHackathonId(hackathonData.id);

      // Fetch mentors and sessions
      const [mentorsData, sessionsData] = await Promise.all([
        getMentors(hackathonData.id),
        getHackathonSessions(hackathonData.id),
      ]);

      setMentors(mentorsData);
      setSessions(sessionsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : String(err) || 'Failed to load mentors');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSchedule = (mentor: Mentor) => {
    if (mentor.calendlyUrl) {
      window.open(mentor.calendlyUrl, '_blank');
    }
  };

  const handleBookSession = (session: MentorSession) => {
    if (session.meetingUrl) {
      window.open(session.meetingUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading mentors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-900/50 border-red-500/20">
          <CardContent className="pt-6">
            <p className="text-red-400 mb-4">{error}</p>
            <Link href={`/hackathons/${slug}`}>
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hackathon
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <Link href={`/hackathons/${slug}`}>
          <Button variant="ghost" size="sm" className="mb-6 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hackathon
          </Button>
        </Link>

        <h1 className="text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
          <Users className="w-10 h-10 text-purple-500" />
          Mentors
        </h1>
        <p className="text-slate-400 mb-8">
          Connect with experienced mentors for guidance and support
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mentors List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">
              Available Mentors ({mentors.length})
            </h2>
            {mentors.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="pt-16 pb-16 text-center">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No mentors assigned to this hackathon yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {mentors.map(mentor => (
                  <MentorCard key={mentor.id} mentor={mentor} onSchedule={handleSchedule} />
                ))}
              </div>
            )}
          </div>

          {/* Office Hours */}
          <div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Office Hours</h2>
            <OfficeHoursCalendar sessions={sessions} onBookSession={handleBookSession} />
          </div>
        </div>
      </div>
    </div>
  );
}
