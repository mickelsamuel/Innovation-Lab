'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocket } from '@/providers/websocket-provider';
import { Users, UserPlus, UserMinus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { OnlineIndicator } from './online-indicator';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
  };
}

interface LiveTeamMembersProps {
  teamId: string;
  initialMembers: TeamMember[];
}

export function LiveTeamMembers({ teamId, initialMembers }: LiveTeamMembersProps) {
  const { socket, joinTeam, leaveTeam } = useWebSocket();
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [recentUpdate, setRecentUpdate] = useState<'added' | 'removed' | null>(null);

  useEffect(() => {
    if (socket && teamId) {
      joinTeam(teamId);

      return () => {
        leaveTeam(teamId);
      };
    }
  }, [socket, teamId, joinTeam, leaveTeam]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMember = (data: { member: TeamMember }) => {
      setMembers(prev => [...prev, data.member]);
      setRecentUpdate('added');
      setTimeout(() => setRecentUpdate(null), 3000);
    };

    const handleMemberRemoved = (data: { memberId: string }) => {
      setMembers(prev => prev.filter(m => m.id !== data.memberId));
      setRecentUpdate('removed');
      setTimeout(() => setRecentUpdate(null), 3000);
    };

    const handleTeamUpdate = (data: { members?: TeamMember[] }) => {
      if (data.members) {
        setMembers(data.members);
      }
    };

    socket.on('team:member:new', handleNewMember);
    socket.on('team:member:removed', handleMemberRemoved);
    socket.on('team:update', handleTeamUpdate);

    return () => {
      socket.off('team:member:new', handleNewMember);
      socket.off('team:member:removed', handleMemberRemoved);
      socket.off('team:update', handleTeamUpdate);
    };
  }, [socket]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Members
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{members.length} members</Badge>
          <AnimatePresence>
            {recentUpdate === 'added' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Badge variant="default" className="gap-1 bg-green-500">
                  <UserPlus className="h-3 w-3" />
                  New member
                </Badge>
              </motion.div>
            )}
            {recentUpdate === 'removed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Badge variant="destructive" className="gap-1">
                  <UserMinus className="h-3 w-3" />
                  Member left
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {members.map(member => (
            <motion.div
              key={member.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
            >
              <Avatar className="h-10 w-10 border-2 border-background">
                {member.user.avatarUrl ? (
                  <img src={member.user.avatarUrl} alt={member.user.name} />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {member.user.name[0]}
                  </div>
                )}
              </Avatar>

              <div className="flex-1">
                <p className="font-semibold">{member.user.name}</p>
                <p className="text-sm text-muted-foreground">@{member.user.handle}</p>
              </div>

              <div className="flex items-center gap-2">
                {member.role === 'LEAD' && (
                  <Badge
                    variant="default"
                    className="bg-gradient-to-r from-yellow-500 to-orange-500"
                  >
                    Team Lead
                  </Badge>
                )}
                <OnlineIndicator userId={member.userId} showLabel={false} />
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </Card>
  );
}
