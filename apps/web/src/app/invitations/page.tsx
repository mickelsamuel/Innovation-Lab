'use client';

import { useEffect, useState } from 'react';
import { getUserInvitations } from '@/lib/invitations';
import { TeamInvitation } from '@/types/invitation';
import { InvitationList } from '@/components/invitations/InvitationList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Inbox } from 'lucide-react';
import Link from 'next/link';
import { getAuthToken } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default function InvitationsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchInvitations = async () => {
      if (!isMounted) return;

      const token = getAuthToken();
      if (!token) return;

      try {
        setIsLoading(true);
        const data = await getUserInvitations(token);
        setInvitations(data);
      } catch (err: any) {
        console.error('Failed to fetch invitations:', err);
        setError(err.message || 'Failed to load invitations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitations();
  }, [isMounted]);

  const handleUpdate = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const data = await getUserInvitations(token);
      setInvitations(data);
    } catch (err: any) {
      console.error('Failed to refresh invitations:', err);
    }
  };

  if (!isMounted || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading invitations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Inbox className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team Invitations</h1>
            <p className="text-muted-foreground">Manage your pending team invitations</p>
          </div>
        </div>

        {invitations.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              You have {invitations.length} pending{' '}
              {invitations.length === 1 ? 'invitation' : 'invitations'}
            </p>
          </div>
        )}
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">{error}</p>
        </div>
      ) : (
        <InvitationList
          invitations={invitations}
          variant="user"
          onUpdate={handleUpdate}
          emptyMessage="You don't have any pending team invitations. When someone invites you to join their team, it will appear here."
        />
      )}
    </div>
  );
}
