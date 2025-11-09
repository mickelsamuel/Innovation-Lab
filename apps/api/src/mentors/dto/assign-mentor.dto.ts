import { IsString, IsNotEmpty, IsUUID, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignMentorDto {
  @ApiProperty({
    description: 'User ID of the mentor to assign',
    example: 'clu8x9y8z00001jv8h2k3l4m5',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

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
