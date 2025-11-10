import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsOptional,
  MinLength,
  IsDateString,
} from 'class-validator';
import { ChallengeStatus, ChallengeVisibility, RewardType } from '@prisma/client';

export class CreateChallengeDto {
  @ApiProperty({
    description: 'Unique slug for the challenge (URL-friendly)',
    example: 'build-payment-api',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'Challenge title',
    example: 'Build a Payment Processing API',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @ApiProperty({
    description: 'Detailed problem statement',
    example: 'Build a RESTful API that processes credit card payments...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  problemStatement: string;

  @ApiPropertyOptional({
    description: 'Organization name (if challenge is sponsored)',
    example: 'TechCorp Inc.',
  })
  @IsString()
  @IsOptional()
  ownerOrg?: string;

  @ApiPropertyOptional({
    description: 'Reward type',
    enum: RewardType,
  })
  @IsEnum(RewardType)
  @IsOptional()
  rewardType?: RewardType;

  @ApiPropertyOptional({
    description: 'Reward value/description',
    example: '$500 prize',
  })
  @IsString()
  @IsOptional()
  rewardValue?: string;

  @ApiPropertyOptional({
    description: 'Challenge categories',
    example: ['backend', 'api', 'fintech'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @ApiPropertyOptional({
    description: 'Required skills',
    example: ['Node.js', 'REST API', 'Database'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({
    description: 'Challenge status',
    enum: ChallengeStatus,
    default: ChallengeStatus.DRAFT,
  })
  @IsEnum(ChallengeStatus)
  @IsOptional()
  status?: ChallengeStatus;

  @ApiPropertyOptional({
    description: 'Challenge visibility',
    enum: ChallengeVisibility,
    default: ChallengeVisibility.PUBLIC,
  })
  @IsEnum(ChallengeVisibility)
  @IsOptional()
  visibility?: ChallengeVisibility;

  @ApiPropertyOptional({
    description: 'Submission deadline',
    example: '2025-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  deadlineAt?: string;
}
