import { Module, forwardRef } from '@nestjs/common';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { AuthModule } from '../auth/auth.module';
import { GamificationModule } from '../gamification/gamification.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [AuthModule, GamificationModule, forwardRef(() => WebSocketModule)],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
