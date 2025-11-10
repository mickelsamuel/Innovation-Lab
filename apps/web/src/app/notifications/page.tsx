'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Check, Settings } from 'lucide-react';
import { getAuthToken } from '@/lib/api';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
  type Notification,
  type NotificationPreferences,
} from '@/lib/notifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchData(token);
  }, [router]);

  async function fetchData(token: string) {
    try {
      const [notifData, prefs] = await Promise.all([
        getNotifications(token, { limit: 50 }),
        getNotificationPreferences(token),
      ]);

      setNotifications(notifData.notifications);
      setUnreadCount(notifData.unreadCount);
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    const token = getAuthToken();
    if (!token) return;

    try {
      await markAsRead(notificationId, token);
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async function handleMarkAllAsRead() {
    const token = getAuthToken();
    if (!token) return;

    try {
      await markAllAsRead(token);
      setNotifications(notifications.map(n => ({ ...n, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  async function handlePreferenceChange(key: keyof NotificationPreferences, value: boolean) {
    const token = getAuthToken();
    if (!token || !preferences) return;

    try {
      const updated = await updateNotificationPreferences(token, { [key]: value });
      setPreferences(updated);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  }

  function getNotificationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      HACKATHON_REGISTRATION: '🎉',
      SUBMISSION_RECEIVED: '🎯',
      JUDGE_ASSIGNED: '⚖️',
      MENTOR_ASSIGNED: '🎓',
      JUDGING_COMPLETE: '📊',
      WINNER_ANNOUNCEMENT: '🏆',
      CHALLENGE_SUBMISSION: '✅',
      CHALLENGE_REVIEWED: '📝',
      CHALLENGE_ACCEPTED: '✅',
      CHALLENGE_WINNER: '🎉',
      TEAM_INVITATION: '👥',
      TEAM_INVITATION_ACCEPTED: '✅',
      LEVEL_UP: '⬆️',
      BADGE_UNLOCKED: '🏅',
    };
    return iconMap[type] || '🔔';
  }

  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(n => !n.readAt)
    : notifications;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 animate-pulse text-slate-400" />
            <p className="text-slate-500">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-slate-600">Stay updated with your hackathons, challenges, and achievements</p>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="all">
                All
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {activeTab !== 'settings' && unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <Check className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>

          <TabsContent value="all" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-slate-500">You're all caught up!</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={cn(
                    "transition-colors hover:bg-slate-50 cursor-pointer",
                    !notification.readAt && "border-l-4 border-l-primary bg-primary/5"
                  )}
                  onClick={() => {
                    if (!notification.readAt) {
                      handleMarkAsRead(notification.id);
                    }
                    if (notification.link) {
                      router.push(notification.link);
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-semibold text-lg">{notification.title}</h3>
                          {!notification.readAt && (
                            <Badge variant="default" className="flex-shrink-0">New</Badge>
                          )}
                        </div>
                        <p className="text-slate-600 mb-2">{notification.message}</p>
                        <p className="text-sm text-slate-400">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Check className="h-16 w-16 mx-auto mb-4 opacity-20 text-green-500" />
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-slate-500">You have no unread notifications</p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className="border-l-4 border-l-primary bg-primary/5 transition-colors hover:bg-slate-50 cursor-pointer"
                  onClick={() => {
                    handleMarkAsRead(notification.id);
                    if (notification.link) {
                      router.push(notification.link);
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-semibold text-lg">{notification.title}</h3>
                          <Badge variant="default" className="flex-shrink-0">New</Badge>
                        </div>
                        <p className="text-slate-600 mb-2">{notification.message}</p>
                        <p className="text-sm text-slate-400">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="settings">
            {preferences && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose what notifications you want to receive via email and in-app
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Hackathon Notifications */}
                  <div>
                    <h3 className="font-semibold mb-4">Hackathon Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-registration">Hackathon Registration</Label>
                          <p className="text-sm text-slate-500">When you register for a hackathon</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="email-registration-email" className="text-sm">Email</Label>
                            <Switch
                              id="email-registration-email"
                              checked={preferences.emailHackathonRegistration}
                              onCheckedChange={(checked) => handlePreferenceChange('emailHackathonRegistration', checked)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="email-registration-app" className="text-sm">In-App</Label>
                            <Switch
                              id="email-registration-app"
                              checked={preferences.inAppHackathonRegistration}
                              onCheckedChange={(checked) => handlePreferenceChange('inAppHackathonRegistration', checked)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="submission">Submission Received</Label>
                          <p className="text-sm text-slate-500">When your submission is received</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="submission-email" className="text-sm">Email</Label>
                            <Switch
                              id="submission-email"
                              checked={preferences.emailSubmissionReceived}
                              onCheckedChange={(checked) => handlePreferenceChange('emailSubmissionReceived', checked)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="submission-app" className="text-sm">In-App</Label>
                            <Switch
                              id="submission-app"
                              checked={preferences.inAppSubmissionReceived}
                              onCheckedChange={(checked) => handlePreferenceChange('inAppSubmissionReceived', checked)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="judging">Judging Complete</Label>
                          <p className="text-sm text-slate-500">When judges finish evaluating</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="judging-email" className="text-sm">Email</Label>
                            <Switch
                              id="judging-email"
                              checked={preferences.emailJudgingComplete}
                              onCheckedChange={(checked) => handlePreferenceChange('emailJudgingComplete', checked)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="judging-app" className="text-sm">In-App</Label>
                            <Switch
                              id="judging-app"
                              checked={preferences.inAppJudgingComplete}
                              onCheckedChange={(checked) => handlePreferenceChange('inAppJudgingComplete', checked)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="winner">Winner Announcement</Label>
                          <p className="text-sm text-slate-500">When winners are announced</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="winner-email" className="text-sm">Email</Label>
                            <Switch
                              id="winner-email"
                              checked={preferences.emailWinnerAnnouncement}
                              onCheckedChange={(checked) => handlePreferenceChange('emailWinnerAnnouncement', checked)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="winner-app" className="text-sm">In-App</Label>
                            <Switch
                              id="winner-app"
                              checked={preferences.inAppWinnerAnnouncement}
                              onCheckedChange={(checked) => handlePreferenceChange('inAppWinnerAnnouncement', checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Challenge Notifications */}
                  <div>
                    <h3 className="font-semibold mb-4">Challenge Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="challenge-reviewed">Challenge Reviewed</Label>
                          <p className="text-sm text-slate-500">When your challenge solution is reviewed</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="challenge-reviewed-email" className="text-sm">Email</Label>
                            <Switch
                              id="challenge-reviewed-email"
                              checked={preferences.emailChallengeReviewed}
                              onCheckedChange={(checked) => handlePreferenceChange('emailChallengeReviewed', checked)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="challenge-reviewed-app" className="text-sm">In-App</Label>
                            <Switch
                              id="challenge-reviewed-app"
                              checked={preferences.inAppChallengeReviewed}
                              onCheckedChange={(checked) => handlePreferenceChange('inAppChallengeReviewed', checked)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="challenge-accepted">Challenge Accepted</Label>
                          <p className="text-sm text-slate-500">When your solution is accepted</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="challenge-accepted-email" className="text-sm">Email</Label>
                            <Switch
                              id="challenge-accepted-email"
                              checked={preferences.emailChallengeAccepted}
                              onCheckedChange={(checked) => handlePreferenceChange('emailChallengeAccepted', checked)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="challenge-accepted-app" className="text-sm">In-App</Label>
                            <Switch
                              id="challenge-accepted-app"
                              checked={preferences.inAppChallengeAccepted}
                              onCheckedChange={(checked) => handlePreferenceChange('inAppChallengeAccepted', checked)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="challenge-winner">Challenge Winner</Label>
                          <p className="text-sm text-slate-500">When you win a challenge</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="challenge-winner-email" className="text-sm">Email</Label>
                            <Switch
                              id="challenge-winner-email"
                              checked={preferences.emailChallengeWinner}
                              onCheckedChange={(checked) => handlePreferenceChange('emailChallengeWinner', checked)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="challenge-winner-app" className="text-sm">In-App</Label>
                            <Switch
                              id="challenge-winner-app"
                              checked={preferences.inAppChallengeWinner}
                              onCheckedChange={(checked) => handlePreferenceChange('inAppChallengeWinner', checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Team & Gamification */}
                  <div>
                    <h3 className="font-semibold mb-4">Team & Achievements</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="team-invitation">Team Invitations</Label>
                          <p className="text-sm text-slate-500">When you're invited to join a team</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="team-invitation-email" className="text-sm">Email</Label>
                            <Switch
                              id="team-invitation-email"
                              checked={preferences.emailTeamInvitation}
                              onCheckedChange={(checked) => handlePreferenceChange('emailTeamInvitation', checked)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="team-invitation-app" className="text-sm">In-App</Label>
                            <Switch
                              id="team-invitation-app"
                              checked={preferences.inAppTeamInvitation}
                              onCheckedChange={(checked) => handlePreferenceChange('inAppTeamInvitation', checked)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="level-up">Level Up</Label>
                          <p className="text-sm text-slate-500">When you reach a new level</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="level-up-email" className="text-sm">Email</Label>
                            <Switch
                              id="level-up-email"
                              checked={preferences.emailLevelUp}
                              onCheckedChange={(checked) => handlePreferenceChange('emailLevelUp', checked)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="level-up-app" className="text-sm">In-App</Label>
                            <Switch
                              id="level-up-app"
                              checked={preferences.inAppLevelUp}
                              onCheckedChange={(checked) => handlePreferenceChange('inAppLevelUp', checked)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="badge">Badge Unlocked</Label>
                          <p className="text-sm text-slate-500">When you unlock a new badge</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor="badge-email" className="text-sm">Email</Label>
                            <Switch
                              id="badge-email"
                              checked={preferences.emailBadgeUnlocked}
                              onCheckedChange={(checked) => handlePreferenceChange('emailBadgeUnlocked', checked)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor="badge-app" className="text-sm">In-App</Label>
                            <Switch
                              id="badge-app"
                              checked={preferences.inAppBadgeUnlocked}
                              onCheckedChange={(checked) => handlePreferenceChange('inAppBadgeUnlocked', checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
