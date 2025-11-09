import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUrl,
  IsArray,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateSubmissionDto {
  @ApiProperty({ example: 'clxxx...', description: 'Hackathon ID' })
  @IsString()
  hackathonId: string;

  @ApiProperty({ example: 'clxxx...', description: 'Team ID' })
  @IsString()
  teamId: string;

  @ApiProperty({ example: 'clxxx...', description: 'Track ID', required: false })
  @IsOptional()
  @IsString()
  trackId?: string;

  @ApiProperty({ example: 'AI-Powered Banking Assistant' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Our solution uses AI to provide personalized banking advice...' })
  @IsString()
  @MinLength(50)
  abstract: string;

  @ApiProperty({ example: 'https://github.com/team/project', required: false })
  @IsOptional()
  @IsString()
  @IsUrl()
  repoUrl?: string;

  @ApiProperty({ example: 'https://demo.project.com', required: false })
  @IsOptional()
  @IsString()
  @IsUrl()
  demoUrl?: string;

  @ApiProperty({ example: 'https://youtube.com/watch?v=...', required: false })
  @IsOptional()
  @IsString()
  @IsUrl()
  videoUrl?: string;

  @ApiProperty({
    example: ['file1.pdf', 'presentation.pptx'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];
}
