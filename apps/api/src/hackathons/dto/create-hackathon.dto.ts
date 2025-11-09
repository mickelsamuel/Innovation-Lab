import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsNumber,
  IsBoolean,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HackathonStatus, HackathonLocation } from '@innovation-lab/database';

class CreateTrackDto {
  @ApiProperty({ example: 'Web & Mobile Apps' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'Build innovative web or mobile applications', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  order: number;
}

class CreateCriteriaDto {
  @ApiProperty({ example: 'Innovation' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Originality and creativity', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  @Max(100)
  maxScore: number;

  @ApiProperty({ example: 0.25 })
  @IsNumber()
  @Min(0)
  @Max(1)
  weight: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  order: number;
}

export class CreateHackathonDto {
  @ApiProperty({ example: 'vaultix-winter-sprint-2025' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  slug: string;

  @ApiProperty({ example: 'Vaultix Winter Sprint 2025' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Build innovative fintech solutions in 48 hours' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-...', required: false })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiProperty({ enum: HackathonStatus, default: HackathonStatus.DRAFT })
  @IsEnum(HackathonStatus)
  status: HackathonStatus;

  @ApiProperty({ enum: HackathonLocation, default: HackathonLocation.VIRTUAL })
  @IsEnum(HackathonLocation)
  location: HackathonLocation;

  @ApiProperty({ example: '2025-01-15T00:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  registrationOpensAt?: string;

  @ApiProperty({ example: '2025-02-01T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString()
  registrationClosesAt?: string;

  @ApiProperty({ example: '2025-02-15T18:00:00Z' })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ example: '2025-02-17T18:00:00Z' })
  @IsDateString()
  endsAt: string;

  @ApiProperty({ example: '2025-02-20T18:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  judgingEndsAt?: string;

  @ApiProperty({ example: 25000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  prizePool?: number;

  @ApiProperty({ example: 5, default: 4 })
  @IsNumber()
  @Min(1)
  @Max(20)
  maxTeamSize: number;

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  allowSoloTeams: boolean;

  @ApiProperty({ example: '# Rules\n\n- Be respectful\n- No plagiarism', required: false })
  @IsOptional()
  @IsString()
  rules?: string;

  @ApiProperty({ type: [CreateTrackDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTrackDto)
  tracks?: CreateTrackDto[];

  @ApiProperty({ type: [CreateCriteriaDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCriteriaDto)
  criteria?: CreateCriteriaDto[];
}
