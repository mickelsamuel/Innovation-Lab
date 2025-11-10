'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getHackathonById, calculateRankings, createAnnouncement, getAnnouncements, deleteAnnouncement } from '@/lib/hackathons';
import { getAuthToken } from '@/lib/api';
import type { Hackathon } from '@/types/hackathon';
import {
  ArrowLeft,
  Users,
  Gavel,
  MessageSquare,
  Settings,
  Trophy,
  Calculator,
  Megaphone,
  Edit2,
  Loader2,
  FileText,
  CheckCircle2,
  Trash2,
  GraduationCap,
} from 'lucide-react';

export default function ManageHackathonPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const hackathonId = params.id as string;

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isCalculating, setIsCalculating] = useState(false);

  // Announcement
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);

  useEffect(() => {
    fetchHackathon();
    fetchAnnouncements();
  }, [hackathonId]);

  async function fetchHackathon() {
    try {
      setIsLoading(true);
      const data = await getHackathonById(hackathonId);
      setHackathon(data);
    } catch (error: any) {
      console.error('Error fetching hackathon:', error);
      addToast({
        type: 'error',
        title: 'Failed to load hackathon',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCalculateRankings() {
    const token = getAuthToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      setIsCalculating(true);
      await calculateRankings(hackathonId, token);
      addToast({
        type: 'success',
        title: 'Rankings calculated',
        description: 'Submission rankings have been successfully calculated.',
      });
    } catch (error: any) {
      console.error('Error calculating rankings:', error);
      addToast({
        type: 'error',
        title: 'Failed to calculate rankings',
        description: error.message,
      });
    } finally {
      setIsCalculating(false);
    }
  }

  async function handleAnnounceWinners() {
    // Navigate to winner selection page
    router.push(`/admin/hackathons/${hackathonId}/winners`);
  }

  async function fetchAnnouncements() {
    try {
      setIsLoadingAnnouncements(true);
      const data = await getAnnouncements(hackathonId);
      setAnnouncements(data);
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
    } finally {
      setIsLoadingAnnouncements(false);
    }
  }

  async function handleCreateAnnouncement() {
    if (!announcementTitle || !announcementContent) {
      addToast({
        type: 'error',
        title: 'Missing information',
        description: 'Please fill in both title and content.',
      });
      return;
    }

    const token = getAuthToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      await createAnnouncement(
        hackathonId,
        { title: announcementTitle, body: announcementContent },
        token
      );

      addToast({
        type: 'success',
        title: 'Announcement posted',
        description: 'All participants have been notified.',
      });

      setAnnouncementTitle('');
      setAnnouncementContent('');
      await fetchAnnouncements();
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      addToast({
        type: 'error',
        title: 'Failed to post announcement',
        description: error.message,
      });
    }
  }

  async function handleDeleteAnnouncement(announcementId: string) {
    if (!confirm('Delete this announcement?')) return;

    const token = getAuthToken();
    if (!token) return;

    try {
      await deleteAnnouncement(hackathonId, announcementId, token);
      addToast({
        type: 'success',
        title: 'Announcement deleted',
      });
      await fetchAnnouncements();
    } catch (error: any) {
      console.error('Error deleting announcement:', error);
      addToast({
        type: 'error',
        title: 'Failed to delete announcement',
        description: error.message,
      });
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading hackathon...</p>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Failed to load hackathon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">Hackathon not found</p>
            <Link href="/admin/hackathons">
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin/hackathons">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hackathons
            </Button>
          </Link>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-accent py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                  {hackathon.title}
                </h1>
                <Badge className="bg-white/20 text-white border-white/30">
                  {hackathon.status}
                </Badge>
              </div>
              <p className="text-lg text-white/90">Manage hackathon settings and participants</p>
            </div>
            <Link href={`/admin/hackathons/${hackathonId}/edit`}>
              <Button className="btn-game">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Details
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="judges" className="flex items-center gap-2">
              <Gavel className="w-4 h-4" />
              Judges
            </TabsTrigger>
            <TabsTrigger value="mentors" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Mentors
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Announcements
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Statistics */}
              <Card className="game-card">
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                  <CardDescription>Current hackathon metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-sm text-slate-600">Teams</p>
                        <p className="text-2xl font-bold">{hackathon._count?.teams || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-sm text-slate-600">Submissions</p>
                        <p className="text-2xl font-bold">{hackathon._count?.submissions || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Gavel className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-sm text-slate-600">Judges</p>
                        <p className="text-2xl font-bold">{hackathon._count?.judges || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-8 h-8 text-primary" />
                      <div>
                        <p className="text-sm text-slate-600">Mentors</p>
                        <p className="text-2xl font-bold">{hackathon._count?.mentors || 0}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="game-card">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common management tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleCalculateRankings}
                    disabled={isCalculating || hackathon.status !== 'JUDGING'}
                    className="w-full btn-game"
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate Rankings
                      </>
                    )}
                  </Button>
                  {hackathon.status !== 'JUDGING' && (
                    <p className="text-xs text-slate-500 text-center">
                      Rankings can only be calculated during JUDGING phase
                    </p>
                  )}

                  <Button
                    onClick={handleAnnounceWinners}
                    disabled={hackathon.status !== 'JUDGING'}
                    variant="outline"
                    className="w-full"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Announce Winners
                  </Button>

                  <Link href={`/hackathons/${hackathon.slug}`} className="block">
                    <Button variant="outline" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      View Public Page
                    </Button>
                  </Link>

                  <Link href={`/admin/hackathons/${hackathonId}/edit`} className="block">
                    <Button variant="outline" className="w-full">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Dates Overview */}
              <Card className="game-card lg:col-span-2">
                <CardHeader>
                  <CardTitle>Important Dates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Hackathon Period</p>
                      <p className="font-medium">
                        {new Date(hackathon.startsAt).toLocaleDateString()} - {new Date(hackathon.endsAt).toLocaleDateString()}
                      </p>
                    </div>
                    {hackathon.registrationClosesAt && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">Registration Closes</p>
                        <p className="font-medium">{new Date(hackathon.registrationClosesAt).toLocaleDateString()}</p>
                      </div>
                    )}
                    {hackathon.submissionClosesAt && (
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600 mb-1">Submission Closes</p>
                        <p className="font-medium">{new Date(hackathon.submissionClosesAt).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Judges Tab */}
          <TabsContent value="judges">
            <Card className="game-card">
              <CardHeader>
                <CardTitle>Manage Judges</CardTitle>
                <CardDescription>Assign judges to evaluate submissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Link href={`/admin/hackathons/${hackathonId}/judges`} className="block">
                  <Button className="w-full btn-game">
                    <Gavel className="w-4 h-4 mr-2" />
                    Manage Judges
                  </Button>
                </Link>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Judge Management Ready</p>
                      <p className="text-sm text-slate-600 mt-1">
                        Add, remove, and view all judges assigned to this hackathon. Judges can score submissions based on your defined criteria.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mentors Tab */}
          <TabsContent value="mentors">
            <Card className="game-card">
              <CardHeader>
                <CardTitle>Manage Mentors</CardTitle>
                <CardDescription>Assign mentors to guide participants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Link href={`/admin/hackathons/${hackathonId}/mentors`} className="block">
                  <Button className="w-full btn-game">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Manage Mentors
                  </Button>
                </Link>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Mentor Management Ready</p>
                      <p className="text-sm text-slate-600 mt-1">
                        Add, remove, and view all mentors assigned to this hackathon. Mentors can guide participants and provide expertise throughout the event.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            <Card className="game-card">
              <CardHeader>
                <CardTitle>Create Announcement</CardTitle>
                <CardDescription>Send updates to all participants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="announcement-title">Title</Label>
                  <Input
                    id="announcement-title"
                    placeholder="e.g., Important Update"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="announcement-content">Message</Label>
                  <Textarea
                    id="announcement-content"
                    placeholder="Write your announcement message..."
                    rows={6}
                    value={announcementContent}
                    onChange={(e) => setAnnouncementContent(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <Button onClick={handleCreateAnnouncement} className="w-full btn-game">
                  <Megaphone className="w-4 h-4 mr-2" />
                  Post Announcement
                </Button>

                {/* Announcements List */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-3">Recent Announcements</h3>
                  {isLoadingAnnouncements ? (
                    <div className="text-center py-4 text-slate-500">Loading...</div>
                  ) : announcements.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                      <p>No announcements yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {announcements.map((announcement) => (
                        <div key={announcement.id} className="p-4 border rounded-lg bg-slate-50">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{announcement.title}</p>
                              <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">
                                {announcement.body}
                              </p>
                              <p className="text-xs text-slate-400 mt-2">
                                {new Date(announcement.publishedAt).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="game-card">
                <CardHeader>
                  <CardTitle>Hackathon Status</CardTitle>
                  <CardDescription>Current status and visibility</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Status</p>
                    <Badge className="text-base">{hackathon.status}</Badge>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Visibility</p>
                    <Badge className="text-base">
                      {hackathon.isPublished ? 'Published' : 'Unpublished'}
                    </Badge>
                  </div>
                  <Link href={`/admin/hackathons/${hackathonId}/edit`} className="block">
                    <Button variant="outline" className="w-full">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="game-card">
                <CardHeader>
                  <CardTitle>Tracks & Criteria</CardTitle>
                  <CardDescription>Judging configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Challenge Tracks</p>
                    <p className="text-2xl font-bold">{hackathon.tracks?.length || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Judging Criteria</p>
                    <p className="text-2xl font-bold">{hackathon.criteria?.length || 0}</p>
                  </div>
                  <Link href={`/admin/hackathons/${hackathonId}/edit`} className="block">
                    <Button variant="outline" className="w-full">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Tracks & Criteria
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
