import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebSocketGatewayClass } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRY', '15m'),
        },
      }),
    }),
  ],
  providers: [WebSocketGatewayClass, WebSocketService, WsJwtGuard],
  exports: [WebSocketService],
})
export class WebSocketModule {}
