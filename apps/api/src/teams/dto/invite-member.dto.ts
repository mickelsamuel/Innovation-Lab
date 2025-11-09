import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';
import { TeamMemberRole } from '@innovation-lab/database';

export class InviteMemberDto {
  @ApiProperty({ example: 'clxxx...', description: 'User ID to invite' })
  @IsString()
  userId: string;

  @ApiProperty({ enum: TeamMemberRole, default: TeamMemberRole.MEMBER })
  @IsEnum(TeamMemberRole)
  role: TeamMemberRole;
}
