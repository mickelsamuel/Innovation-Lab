'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TeamInvitation, InvitationStatus } from '@/types/invitation';
import { acceptInvitation, rejectInvitation, cancelInvitation } from '@/lib/invitations';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Clock, Users, Trophy } from 'lucide-react';

interface InvitationCardProps {
  invitation: TeamInvitation;
  variant?: 'user' | 'team';
  onUpdate?: () => void;
}

export function InvitationCard({ invitation, variant = 'user', onUpdate }: InvitationCardProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    if (!session?.accessToken) {
      toast({
        title: 'Error',
        description: 'You must be logged in',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await acceptInvitation(invitation.id, session.accessToken);
      toast({
        title: 'Success',
        description: `You have joined ${invitation.team?.name}!`,
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : String(error) || 'Failed to accept invitation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!session?.accessToken) {
      toast({
        title: 'Error',
        description: 'You must be logged in',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await rejectInvitation(invitation.id, session.accessToken);
      toast({
        title: 'Success',
        description: 'Invitation rejected',
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : String(error) || 'Failed to reject invitation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!session?.accessToken) {
      toast({
        title: 'Error',
        description: 'You must be logged in',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await cancelInvitation(invitation.id, session.accessToken);
      toast({
        title: 'Success',
        description: 'Invitation cancelled',
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : String(error) || 'Failed to cancel invitation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: InvitationStatus) => {
    const variants: Record<InvitationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> =
      {
        [InvitationStatus.PENDING]: 'default',
        [InvitationStatus.ACCEPTED]: 'secondary',
        [InvitationStatus.REJECTED]: 'destructive',
        [InvitationStatus.EXPIRED]: 'outline',
      };

    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const isExpired = invitation.expiresAt && new Date(invitation.expiresAt) < new Date();
  const isPending = invitation.status === InvitationStatus.PENDING && !isExpired;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={invitation.invitedBy.avatarUrl} />
              <AvatarFallback>
                {invitation.invitedBy.name?.charAt(0) || invitation.invitedBy.handle.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">
                {invitation.invitedBy.name || invitation.invitedBy.handle}
              </p>
              <p className="text-sm text-muted-foreground">@{invitation.invitedBy.handle}</p>
            </div>
          </div>
          {getStatusBadge(invitation.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {variant === 'user' && invitation.team && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{invitation.team.name}</span>
              <Badge variant="outline">{invitation.role}</Badge>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>{invitation.team.hackathon.title}</span>
            </div>

            {invitation.team._count && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {invitation.team._count.members} / {invitation.team.hackathon.maxTeamSize} members
                </span>
              </div>
            )}
          </>
        )}

        {variant === 'team' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Invitee:</span>
              <span className="font-medium">
                {invitation.invitee
                  ? `${invitation.invitee.name} (@${invitation.invitee.handle})`
                  : invitation.inviteeEmail}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Role:</span>
              <Badge variant="outline">{invitation.role}</Badge>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Sent {new Date(invitation.createdAt).toLocaleDateString()}</span>
          </div>
          {invitation.expiresAt && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Expires {new Date(invitation.expiresAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>

      {isPending && (
        <CardFooter className="gap-2">
          {variant === 'user' ? (
            <>
              <Button onClick={handleAccept} disabled={isLoading} className="flex-1">
                {isLoading ? 'Accepting...' : 'Accept'}
              </Button>
              <Button
                onClick={handleReject}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                {isLoading ? 'Rejecting...' : 'Reject'}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleCancel}
              disabled={isLoading}
              variant="destructive"
              className="w-full"
            >
              {isLoading ? 'Cancelling...' : 'Cancel Invitation'}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
