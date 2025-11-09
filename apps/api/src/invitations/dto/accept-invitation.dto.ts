import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty({ example: 'clxxx...', description: 'Invitation ID' })
  @IsString()
  invitationId: string;
}
