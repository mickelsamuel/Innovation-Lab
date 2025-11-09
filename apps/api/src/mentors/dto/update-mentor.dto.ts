import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMentorDto {
  @ApiPropertyOptional({
    description: 'Mentor bio/description',
    example: 'Experienced full-stack developer with 10 years in fintech',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Calendly scheduling URL',
    example: 'https://calendly.com/mentor-name',
  })
  @IsString()
  @IsOptional()
  calendlyUrl?: string;

  @ApiPropertyOptional({
    description: 'Areas of expertise',
    example: ['React', 'Node.js', 'AWS'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  expertise?: string[];
}
