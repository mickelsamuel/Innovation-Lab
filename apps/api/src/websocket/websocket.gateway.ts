import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WebSocketService } from './websocket.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/ws',
  transports: ['websocket', 'polling'],
})
export class WebSocketGatewayClass
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGatewayClass.name);

  constructor(
    private readonly webSocketService: WebSocketService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.webSocketService.server = server;
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        this.logger.warn(`Connection rejected - no token provided`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (!payload || !payload.sub) {
        this.logger.warn(`Connection rejected - invalid token`);
        client.disconnect();
        return;
      }

      // Store user info in socket data
      client.data.userId = payload.sub;
      client.data.email = payload.email;
      client.data.role = payload.role;

      // Track online user
      await this.webSocketService.addOnlineUser(payload.sub, client.id);

      this.logger.log(`Client connected: ${client.id} (User: ${payload.sub})`);

      // Join user's personal room
      client.join(`user:${payload.sub}`);

      // Emit online status update
      this.server.emit('user:online', {
        userId: payload.sub,
        timestamp: new Date(),
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Connection error: ${err.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId) {
      await this.webSocketService.removeOnlineUser(userId, client.id);

      this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);

      // Emit offline status update
      const isStillOnline = await this.webSocketService.isUserOnline(userId);
      if (!isStillOnline) {
        this.server.emit('user:offline', {
          userId,
          timestamp: new Date(),
        });
      }
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join:hackathon')
  async handleJoinHackathon(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { hackathonId: string }
  ) {
    const room = `hackathon:${data.hackathonId}`;
    client.join(room);
    this.logger.log(`User ${client.data.userId} joined ${room}`);
    return { event: 'joined', room };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave:hackathon')
  async handleLeaveHackathon(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { hackathonId: string }
  ) {
    const room = `hackathon:${data.hackathonId}`;
    client.leave(room);
    this.logger.log(`User ${client.data.userId} left ${room}`);
    return { event: 'left', room };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join:team')
  async handleJoinTeam(@ConnectedSocket() client: Socket, @MessageBody() data: { teamId: string }) {
    const room = `team:${data.teamId}`;
    client.join(room);
    this.logger.log(`User ${client.data.userId} joined ${room}`);
    return { event: 'joined', room };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave:team')
  async handleLeaveTeam(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { teamId: string }
  ) {
    const room = `team:${data.teamId}`;
    client.leave(room);
    this.logger.log(`User ${client.data.userId} left ${room}`);
    return { event: 'left', room };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('ping')
  handlePing() {
    return { event: 'pong', timestamp: new Date() };
  }

  private extractTokenFromHandshake(client: Socket): string | undefined {
    // Try to get token from auth header
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try to get token from query parameter
    const token = client.handshake.auth?.token || client.handshake.query?.token;
    return token as string | undefined;
  }
}
