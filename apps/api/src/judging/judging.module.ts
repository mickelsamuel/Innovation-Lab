import { Module, forwardRef } from '@nestjs/common';
import { JudgingController } from './judging.controller';
import { JudgingService } from './judging.service';
import { AuthModule } from '../auth/auth.module';
import { GamificationModule } from '../gamification/gamification.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [AuthModule, GamificationModule, forwardRef(() => WebSocketModule)],
  controllers: [JudgingController],
  providers: [JudgingService],
  exports: [JudgingService],
})
export class JudgingModule {}
