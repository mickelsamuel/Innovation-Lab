import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsUrl,
  MinLength,
} from 'class-validator';

export class SubmitSolutionDto {
  @ApiProperty({
    description: 'Solution title',
    example: 'Payment API Implementation',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @ApiProperty({
    description: 'Solution description/approach',
    example: 'Implemented a RESTful API using Express.js and Stripe...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  content: string;

  @ApiPropertyOptional({
    description: 'Repository URL (GitHub, GitLab, etc.)',
    example: 'https://github.com/username/payment-api',
  })
  @IsUrl()
  @IsOptional()
  repoUrl?: string;

  @ApiPropertyOptional({
    description: 'Team ID (if submitting as team)',
  })
  @IsUUID()
  @IsOptional()
  teamId?: string;
}
