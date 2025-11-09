import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional, IsUrl } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ example: 'clxxx...', description: 'Hackathon ID' })
  @IsString()
  hackathonId: string;

  @ApiProperty({ example: 'Team Innovators' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Building the future of fintech', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({ example: 'https://api.dicebear.com/7.x/shapes/svg?seed=Team', required: false })
  @IsOptional()
  @IsString()
  @IsUrl()
  logoUrl?: string;

  @ApiProperty({ example: 'https://github.com/team/project', required: false })
  @IsOptional()
  @IsString()
  @IsUrl()
  repoUrl?: string;

  @ApiProperty({ example: 'https://demo.team.com', required: false })
  @IsOptional()
  @IsString()
  @IsUrl()
  demoUrl?: string;
}
