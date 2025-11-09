'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAuthToken } from '@/lib/api';
import { getMentors, assignMentor, removeMentor } from '@/lib/mentoring';
import { apiFetch } from '@/lib/api';
import type { Hackathon } from '@/types/hackathon';
import { ArrowLeft, UserPlus, Trash2, GraduationCap, Loader2 } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface Mentor {
  id: string;
  userId: string;
  hackathonId: string;
  bio?: string;
  calendlyUrl?: string;
  expertise: string[];
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    handle?: string;
  };
}

export default function ManageMentorsPage() {
  const params = useParams();
  const hackathonId = params.id as string;

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMentorEmail, setNewMentorEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [hackathonId]);

  async function fetchData() {
    try {
      setIsLoading(true);
      setError(null);
      const token = getAuthToken();

      const [hackathonData, mentorsData] = await Promise.all([
        apiFetch<Hackathon>(`/hackathons/${hackathonId}`, { token }),
        getMentors(hackathonId),
      ]);

      setHackathon(hackathonData);
      setMentors(mentorsData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load mentors');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddMentor() {
    if (!newMentorEmail.trim()) return;

    try {
      setIsAdding(true);
      setError(null);
      const token = getAuthToken();
      if (!token) {
        setError('Please log in');
        return;
      }

      const response = await apiFetch<any[]>(
        `/users/search?email=${encodeURIComponent(newMentorEmail)}`,
        { token }
      );

      if (!response || response.length === 0) {
        setError('User not found with that email');
        return;
      }

      const user = response[0];
      await assignMentor(hackathonId, user.id, token);
      setNewMentorEmail('');
      await fetchData();
    } catch (err: any) {
      console.error('Error adding mentor:', err);
      setError(err.message || 'Failed to add mentor');
    } finally {
      setIsAdding(false);
    }
  }

  async function handleRemoveMentor(mentor: Mentor) {
    if (!confirm(`Remove ${mentor.user.name} as mentor?`)) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      await removeMentor(hackathonId, mentor.userId, token);
      await fetchData();
    } catch (err: any) {
      console.error('Error removing mentor:', err);
      setError(err.message || 'Failed to remove mentor');
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/admin/hackathons/${hackathonId}/manage`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Manage Hackathon
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary" />
                Manage Mentors
              </CardTitle>
              <CardDescription>
                Assign mentors to guide participants in {hackathon?.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="Enter user email to add as mentor..."
                  value={newMentorEmail}
                  onChange={(e) => setNewMentorEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddMentor();
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddMentor}
                  disabled={isAdding || !newMentorEmail.trim()}
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  Add Mentor
                </Button>
              </div>

              <div className="space-y-3">
                {mentors.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">
                    No mentors assigned yet. Add mentors using their email address.
                  </p>
                ) : (
                  mentors.map((mentor) => (
                    <div
                      key={mentor.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={mentor.user.avatarUrl} />
                          <AvatarFallback>{getInitials(mentor.user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{mentor.user.name}</p>
                          <p className="text-sm text-slate-600">{mentor.user.email}</p>
                          {mentor.expertise && mentor.expertise.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {mentor.expertise.map((skill, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMentor(mentor)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
