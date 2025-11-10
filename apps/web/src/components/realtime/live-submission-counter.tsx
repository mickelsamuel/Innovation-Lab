'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocket } from '@/providers/websocket-provider';
import { FileCheck, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveSubmissionCounterProps {
  hackathonId: string;
  initialCount: number;
}

export function LiveSubmissionCounter({ hackathonId, initialCount }: LiveSubmissionCounterProps) {
  const { socket, joinHackathon, leaveHackathon } = useWebSocket();
  const [count, setCount] = useState(initialCount);
  const [isIncreasing, setIsIncreasing] = useState(false);

  useEffect(() => {
    if (socket && hackathonId) {
      joinHackathon(hackathonId);

      return () => {
        leaveHackathon(hackathonId);
      };
    }
    return undefined;
  }, [socket, hackathonId, joinHackathon, leaveHackathon]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleNewSubmission = () => {
      setCount(prev => prev + 1);
      setIsIncreasing(true);
      setTimeout(() => setIsIncreasing(false), 2000);
    };

    socket.on('submission:new', handleNewSubmission);

    return () => {
      socket.off('submission:new', handleNewSubmission);
    };
  }, [socket]);

  return (
    <Card className="p-6 relative overflow-hidden">
      <AnimatePresence>
        {isIncreasing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 right-2"
          >
            <div className="flex items-center gap-1 text-green-500 text-sm font-semibold">
              <TrendingUp className="h-4 w-4" />
              <span>+1</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
          <FileCheck className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Submissions</p>
          <motion.p
            key={count}
            initial={{ scale: 1.2, color: '#22c55e' }}
            animate={{ scale: 1, color: 'inherit' }}
            className="text-3xl font-bold"
          >
            {count}
          </motion.p>
        </div>
      </div>
    </Card>
  );
}
