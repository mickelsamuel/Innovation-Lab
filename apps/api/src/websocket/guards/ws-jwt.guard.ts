import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const userId = client.data?.userId;

    if (!userId) {
      this.logger.warn(`Unauthorized WebSocket request from ${client.id}`);
      throw new WsException('Unauthorized');
    }

    return true;
  }
}
