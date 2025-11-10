'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  joinHackathon: (hackathonId: string) => void;
  leaveHackathon: (hackathonId: string) => void;
  joinTeam: (teamId: string) => void;
  leaveTeam: (teamId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  joinHackathon: () => {},
  leaveHackathon: () => {},
  joinTeam: () => {},
  leaveTeam: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!session?.accessToken || socket?.connected) {
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

    console.log('Connecting to WebSocket...', wsUrl);

    const newSocket = io(`${wsUrl}/ws`, {
      auth: {
        token: session.accessToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected:', newSocket.id);
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    });

    newSocket.on('disconnect', reason => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);

      // Auto-reconnect on unexpected disconnection
      if (reason === 'io server disconnect') {
        // Server initiated disconnect - try to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            newSocket.connect();
          }, 2000 * reconnectAttemptsRef.current);
        }
      }
    });

    newSocket.on('connect_error', error => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Listen for online/offline user events
    newSocket.on('user:online', (data: { userId: string }) => {
      setOnlineUsers(prev => [...new Set([...prev, data.userId])]);
    });

    newSocket.on('user:offline', (data: { userId: string }) => {
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    });

    // Listen for online users update
    newSocket.on('users:online', (data: { userIds: string[] }) => {
      setOnlineUsers(data.userIds);
    });

    // Heartbeat ping/pong
    const heartbeat = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('ping');
      }
    }, 30000); // Every 30 seconds

    newSocket.on('pong', () => {
      // Connection is alive
    });

    setSocket(newSocket);

    return () => {
      clearInterval(heartbeat);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      newSocket.close();
    };
  }, [session?.accessToken, socket?.connected]);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      const cleanup = connect();
      return cleanup;
    } else if (status === 'unauthenticated' && socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
    return undefined;
  }, [status, session?.accessToken, connect, socket]);

  const joinHackathon = useCallback(
    (hackathonId: string) => {
      if (socket?.connected) {
        socket.emit('join:hackathon', { hackathonId });
      }
    },
    [socket]
  );

  const leaveHackathon = useCallback(
    (hackathonId: string) => {
      if (socket?.connected) {
        socket.emit('leave:hackathon', { hackathonId });
      }
    },
    [socket]
  );

  const joinTeam = useCallback(
    (teamId: string) => {
      if (socket?.connected) {
        socket.emit('join:team', { teamId });
      }
    },
    [socket]
  );

  const leaveTeam = useCallback(
    (teamId: string) => {
      if (socket?.connected) {
        socket.emit('leave:team', { teamId });
      }
    },
    [socket]
  );

  const value: WebSocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    joinHackathon,
    leaveHackathon,
    joinTeam,
    leaveTeam,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}
