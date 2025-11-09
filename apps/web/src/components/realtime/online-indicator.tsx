'use client';

import React, { useEffect, useState } from 'react';
import { useWebSocket } from '@/providers/websocket-provider';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface OnlineIndicatorProps {
  userId?: string;
  showLabel?: boolean;
  className?: string;
}

export function OnlineIndicator({ userId, showLabel = true, className = '' }: OnlineIndicatorProps) {
  const { onlineUsers, isConnected } = useWebSocket();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (userId) {
      setIsOnline(onlineUsers.includes(userId));
    }
  }, [userId, onlineUsers]);

  if (!userId) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span
          className={`h-2 w-2 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`}
        />
        {showLabel && (
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex ${className}`}
    >
      {showLabel ? (
        <Badge
          variant={isOnline ? 'default' : 'secondary'}
          className={`gap-1 ${isOnline ? 'bg-green-500 hover:bg-green-600' : ''}`}
        >
          <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      ) : (
        <span
          className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </motion.div>
  );
}

interface OnlineUsersCountProps {
  className?: string;
}

export function OnlineUsersCount({ className = '' }: OnlineUsersCountProps) {
  const { onlineUsers, isConnected } = useWebSocket();

  return (
    <Badge variant="outline" className={`gap-2 ${className}`}>
      <span
        className={`h-2 w-2 rounded-full ${
          isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        }`}
      />
      <span className="font-semibold">{onlineUsers.length}</span>
      <span className="text-muted-foreground">online</span>
    </Badge>
  );
}
