import { apiFetch } from './api';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  link?: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  unreadCount: number;
}

export interface NotificationPreferences {
  userId: string;
  // Email preferences
  emailHackathonRegistration: boolean;
  emailSubmissionReceived: boolean;
  emailJudgeAssigned: boolean;
  emailMentorAssigned: boolean;
  emailJudgingComplete: boolean;
  emailWinnerAnnouncement: boolean;
  emailChallengeSubmission: boolean;
  emailChallengeReviewed: boolean;
  emailChallengeAccepted: boolean;
  emailChallengeWinner: boolean;
  emailTeamInvitation: boolean;
  emailTeamInvitationAccepted: boolean;
  emailLevelUp: boolean;
  emailBadgeUnlocked: boolean;
  // In-app preferences
  inAppHackathonRegistration: boolean;
  inAppSubmissionReceived: boolean;
  inAppJudgeAssigned: boolean;
  inAppMentorAssigned: boolean;
  inAppJudgingComplete: boolean;
  inAppWinnerAnnouncement: boolean;
  inAppChallengeSubmission: boolean;
  inAppChallengeReviewed: boolean;
  inAppChallengeAccepted: boolean;
  inAppChallengeWinner: boolean;
  inAppTeamInvitation: boolean;
  inAppTeamInvitationAccepted: boolean;
  inAppLevelUp: boolean;
  inAppBadgeUnlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch user notifications
 */
export async function getNotifications(
  token: string,
  options: {
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  } = {}
): Promise<NotificationsResponse> {
  const params = new URLSearchParams();
  if (options.unreadOnly) params.append('unreadOnly', 'true');
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.offset) params.append('offset', options.offset.toString());

  const queryString = params.toString();
  const url = queryString ? `/notifications?${queryString}` : '/notifications';

  return apiFetch<NotificationsResponse>(url, { token });
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(token: string): Promise<number> {
  const response = await apiFetch<{ count: number }>('/notifications/unread-count', { token });
  return response.count;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string, token: string): Promise<Notification> {
  return apiFetch<Notification>(`/notifications/${notificationId}/read`, {
    method: 'POST',
    token,
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(token: string): Promise<void> {
  await apiFetch('/notifications/mark-all-read', {
    method: 'POST',
    token,
  });
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(token: string): Promise<NotificationPreferences> {
  return apiFetch<NotificationPreferences>('/notifications/preferences', { token });
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  token: string,
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  return apiFetch<NotificationPreferences>('/notifications/preferences', {
    method: 'PATCH',
    token,
    body: JSON.stringify(preferences),
  });
}
