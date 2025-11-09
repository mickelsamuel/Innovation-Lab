'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocket } from '@/providers/websocket-provider';
import { Trophy, TrendingUp, Medal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

interface LeaderboardEntry {
  id: string;
  teamId: string;
  teamName: string;
  rank: number;
  scoreAggregate: number;
  members: Array<{
    user: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
  }>;
}

interface LiveLeaderboardProps {
  hackathonId: string;
  initialData: LeaderboardEntry[];
}

export function LiveLeaderboard({ hackathonId, initialData }: LiveLeaderboardProps) {
  const { socket, isConnected, joinHackathon, leaveHackathon } = useWebSocket();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialData);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (socket && hackathonId) {
      joinHackathon(hackathonId);
      setIsLive(true);

      return () => {
        leaveHackathon(hackathonId);
        setIsLive(false);
      };
    }
  }, [socket, hackathonId, joinHackathon, leaveHackathon]);

  useEffect(() => {
    if (!socket) return;

    const handleLeaderboardUpdate = (data: { leaderboard: LeaderboardEntry[] }) => {
      setLeaderboard(data.leaderboard);
    };

    const handleSubmissionScored = () => {
      // Trigger animation or update indicator
      setIsLive(true);
      setTimeout(() => setIsLive(false), 2000);
    };

    socket.on('leaderboard:update', handleLeaderboardUpdate);
    socket.on('submission:scored', handleSubmissionScored);

    return () => {
      socket.off('leaderboard:update', handleLeaderboardUpdate);
      socket.off('submission:scored', handleSubmissionScored);
    };
  }, [socket]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-700" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
      case 2:
        return 'from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 3:
        return 'from-amber-700/20 to-amber-800/20 border-amber-700/50';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          Live Leaderboard
        </h2>
        <div className="flex items-center gap-2">
          {isConnected && (
            <Badge variant="outline" className="gap-1">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </Badge>
          )}
          {isLive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                Updated
              </Badge>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {leaderboard.length === 0 ? (
          <Card className="p-8 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No submissions scored yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className={`p-4 bg-gradient-to-r ${getRankColor(entry.rank)} hover:shadow-lg transition-all`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(entry.rank)}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{entry.teamName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex -space-x-2">
                          {entry.members.slice(0, 3).map((member) => (
                            <Avatar
                              key={member.user.id}
                              className="h-6 w-6 border-2 border-background"
                            >
                              {member.user.avatarUrl ? (
                                <img
                                  src={member.user.avatarUrl}
                                  alt={member.user.name}
                                />
                              ) : (
                                <div className="h-full w-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-xs">
                                  {member.user.name[0]}
                                </div>
                              )}
                            </Avatar>
                          ))}
                          {entry.members.length > 3 && (
                            <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                              +{entry.members.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {entry.scoreAggregate?.toFixed(1) || '0.0'}
                      </div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
