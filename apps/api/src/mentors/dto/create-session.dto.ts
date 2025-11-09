import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt, Min, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiPropertyOptional({
    description: 'Session title/topic',
    example: 'Office Hours: React Best Practices',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Session start time (ISO 8601)',
    example: '2024-12-15T14:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startsAt: string;

  @ApiProperty({
    description: 'Session end time (ISO 8601)',
    example: '2024-12-15T15:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endsAt: string;

  @ApiPropertyOptional({
    description: 'Maximum number of participants',
    example: 10,
    default: 10,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Meeting URL (Zoom, Google Meet, etc.)',
    example: 'https://zoom.us/j/123456789',
  })
  @IsUrl()
  @IsOptional()
  meetingUrl?: string;
}
