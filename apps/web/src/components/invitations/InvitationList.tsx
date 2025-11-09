'use client';

import { TeamInvitation } from '@/types/invitation';
import { InvitationCard } from './InvitationCard';

interface InvitationListProps {
  invitations: TeamInvitation[];
  variant?: 'user' | 'team';
  onUpdate?: () => void;
  emptyMessage?: string;
}

export function InvitationList({
  invitations,
  variant = 'user',
  onUpdate,
  emptyMessage = 'No invitations found',
}: InvitationListProps) {
  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No Invitations</h3>
        <p className="text-muted-foreground max-w-md">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {invitations.map((invitation) => (
        <InvitationCard
          key={invitation.id}
          invitation={invitation}
          variant={variant}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
