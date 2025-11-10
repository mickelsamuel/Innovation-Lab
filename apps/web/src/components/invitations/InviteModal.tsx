'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sendInvitation } from '@/lib/invitations';
import { useToast } from '@/components/ui/use-toast';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  onSuccess?: () => void;
}

export function InviteModal({ isOpen, onClose, teamId, teamName, onSuccess }: InviteModalProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [inviteType, setInviteType] = useState<'email' | 'userId'>('email');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'LEAD'>('MEMBER');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.accessToken) {
      toast({
        title: 'Error',
        description: 'You must be logged in to send invitations',
        variant: 'destructive',
      });
      return;
    }

    if (inviteType === 'email' && !email) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    if (inviteType === 'userId' && !userId) {
      toast({
        title: 'Error',
        description: 'Please enter a user ID',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await sendInvitation(
        teamId,
        {
          inviteeEmail: inviteType === 'email' ? email : undefined,
          inviteeId: inviteType === 'userId' ? userId : undefined,
          role,
        },
        session.accessToken
      );

      toast({
        title: 'Success',
        description: `Invitation sent successfully to ${inviteType === 'email' ? email : 'user'}`,
      });

      setEmail('');
      setUserId('');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : String(error) || 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Member to {teamName}</DialogTitle>
          <DialogDescription>
            Send an invitation to join your team. They will receive an email notification.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Invite By</Label>
              <Select
                value={inviteType}
                onValueChange={value => setInviteType(value as 'email' | 'userId')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select invite method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email Address</SelectItem>
                  <SelectItem value="userId">User ID</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {inviteType === 'email' ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="clxxx..."
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={value => setRole(value as 'MEMBER' | 'LEAD')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="LEAD">Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
