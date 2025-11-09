import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsEmail, ValidateIf } from 'class-validator';
import { TeamMemberRole } from '@innovation-lab/database';

export class SendInvitationDto {
  @ApiPropertyOptional({ example: 'clxxx...', description: 'User ID to invite (if existing user)' })
  @IsOptional()
  @IsString()
  inviteeId?: string;

  @ApiPropertyOptional({ example: 'user@example.com', description: 'Email to invite (if non-existing user)' })
  @IsOptional()
  @IsEmail()
  @ValidateIf((o) => !o.inviteeId)
  inviteeEmail?: string;

  @ApiProperty({ enum: TeamMemberRole, default: TeamMemberRole.MEMBER })
  @IsEnum(TeamMemberRole)
  role: TeamMemberRole;
}
