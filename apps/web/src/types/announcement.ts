/**
 * Announcement-related TypeScript types
 */

export enum AnnouncementScope {
  GLOBAL = 'GLOBAL',
  HACKATHON = 'HACKATHON',
}

export interface Announcement {
  id: string;
  scope: AnnouncementScope;
  scopeId?: string;
  title: string;
  body: string;
  pinned: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  pinned?: boolean;
}
