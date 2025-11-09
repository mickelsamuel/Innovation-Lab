import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RejectInvitationDto {
  @ApiProperty({ example: 'clxxx...', description: 'Invitation ID' })
  @IsString()
  invitationId: string;
}
