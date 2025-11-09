import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [AuthModule, EmailModule, GamificationModule],
  controllers: [InvitationsController],
  providers: [InvitationsService],
  exports: [InvitationsService],
})
export class InvitationsModule {}
