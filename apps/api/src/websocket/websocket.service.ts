import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);
  public server: Server;

  // Track online users: userId -> Set of socket IDs (for multiple connections)
  private onlineUsers = new Map<string, Set<string>>();

  /**
   * Add a user to the online users tracking
   */
  async addOnlineUser(userId: string, socketId: string): Promise<void> {
    if (!this.onlineUsers.has(userId)) {
      this.onlineUsers.set(userId, new Set());
    }
    this.onlineUsers.get(userId)!.add(socketId);
    this.logger.debug(`User ${userId} is online (socket: ${socketId})`);
  }

  /**
   * Remove a user from online users tracking
   */
  async removeOnlineUser(userId: string, socketId: string): Promise<void> {
    const userSockets = this.onlineUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socketId);
      if (userSockets.size === 0) {
        this.onlineUsers.delete(userId);
      }
      this.logger.debug(`User ${userId} removed socket ${socketId}`);
    }
  }

  /**
   * Check if a user is currently online
   */
  async isUserOnline(userId: string): Promise<boolean> {
    return this.onlineUsers.has(userId) && this.onlineUsers.get(userId)!.size > 0;
  }

  /**
   * Get all online user IDs
   */
  async getOnlineUsers(): Promise<string[]> {
    return Array.from(this.onlineUsers.keys());
  }

  /**
   * Get count of online users
   */
  async getOnlineUserCount(): Promise<number> {
    return this.onlineUsers.size;
  }

  /**
   * Broadcast event to all clients in a hackathon room
   */
  broadcastToHackathon(hackathonId: string, event: string, data: any): void {
    const room = `hackathon:${hackathonId}`;
    this.server.to(room).emit(event, data);
    this.logger.debug(`Broadcast to ${room}: ${event}`);
  }

  /**
   * Broadcast event to all clients in a team room
   */
  broadcastToTeam(teamId: string, event: string, data: any): void {
    const room = `team:${teamId}`;
    this.server.to(room).emit(event, data);
    this.logger.debug(`Broadcast to ${room}: ${event}`);
  }

  /**
   * Send event to a specific user
   */
  sendToUser(userId: string, event: string, data: any): void {
    const room = `user:${userId}`;
    this.server.to(room).emit(event, data);
    this.logger.debug(`Send to ${room}: ${event}`);
  }

  /**
   * Send event to multiple users
   */
  sendToUsers(userIds: string[], event: string, data: any): void {
    userIds.forEach((userId) => {
      this.sendToUser(userId, event, data);
    });
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcastToAll(event: string, data: any): void {
    this.server.emit(event, data);
    this.logger.debug(`Broadcast to all: ${event}`);
  }

  /**
   * Emit hackathon status update
   */
  emitHackathonUpdate(hackathonId: string, data: any): void {
    this.broadcastToHackathon(hackathonId, 'hackathon:update', {
      hackathonId,
      ...data,
      timestamp: new Date(),
    });
  }

  /**
   * Emit new submission notification
   */
  emitNewSubmission(hackathonId: string, submission: any): void {
    this.broadcastToHackathon(hackathonId, 'submission:new', {
      hackathonId,
      submission,
      timestamp: new Date(),
    });
  }

  /**
   * Emit submission score update
   */
  emitSubmissionScored(hackathonId: string, teamId: string, submission: any): void {
    // Notify hackathon room
    this.broadcastToHackathon(hackathonId, 'submission:scored', {
      hackathonId,
      submission,
      timestamp: new Date(),
    });

    // Notify team members
    this.broadcastToTeam(teamId, 'submission:scored', {
      submission,
      timestamp: new Date(),
    });
  }

  /**
   * Emit leaderboard update
   */
  emitLeaderboardUpdate(hackathonId: string, leaderboard: any[]): void {
    this.broadcastToHackathon(hackathonId, 'leaderboard:update', {
      hackathonId,
      leaderboard,
      timestamp: new Date(),
    });
  }

  /**
   * Emit team update
   */
  emitTeamUpdate(teamId: string, data: any): void {
    this.broadcastToTeam(teamId, 'team:update', {
      teamId,
      ...data,
      timestamp: new Date(),
    });
  }

  /**
   * Emit new team member
   */
  emitNewTeamMember(teamId: string, member: any): void {
    this.broadcastToTeam(teamId, 'team:member:new', {
      teamId,
      member,
      timestamp: new Date(),
    });
  }

  /**
   * Emit team member removed
   */
  emitTeamMemberRemoved(teamId: string, memberId: string): void {
    this.broadcastToTeam(teamId, 'team:member:removed', {
      teamId,
      memberId,
      timestamp: new Date(),
    });
  }

  /**
   * Emit notification to user
   */
  emitNotification(userId: string, notification: any): void {
    this.sendToUser(userId, 'notification:new', {
      notification,
      timestamp: new Date(),
    });
  }

  /**
   * Emit team invitation
   */
  emitTeamInvitation(userId: string, invitation: any): void {
    this.sendToUser(userId, 'invitation:new', {
      invitation,
      timestamp: new Date(),
    });
  }

  /**
   * Emit online users update for a hackathon
   */
  emitOnlineUsersUpdate(hackathonId: string): void {
    const onlineUserIds = Array.from(this.onlineUsers.keys());
    this.broadcastToHackathon(hackathonId, 'users:online', {
      userIds: onlineUserIds,
      count: onlineUserIds.length,
      timestamp: new Date(),
    });
  }
}
