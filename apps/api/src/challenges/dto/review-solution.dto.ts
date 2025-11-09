import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ChallengeSubmissionStatus } from '@prisma/client';

export class ReviewSolutionDto {
  @ApiProperty({
    description: 'Review status',
    enum: ChallengeSubmissionStatus,
  })
  @IsEnum(ChallengeSubmissionStatus)
  @IsNotEmpty()
  status: ChallengeSubmissionStatus;

  @ApiPropertyOptional({
    description: 'Score (0-100)',
    example: 85,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  score?: number;

  @ApiPropertyOptional({
    description: 'Feedback/comments',
    example: 'Great implementation! Consider adding error handling...',
  })
  @IsString()
  @IsOptional()
  feedback?: string;
}
