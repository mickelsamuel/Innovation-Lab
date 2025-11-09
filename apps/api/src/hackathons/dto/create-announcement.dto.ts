import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty({
    description: 'Announcement title',
    example: 'Important Update: Submission Deadline Extended',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Announcement body/message',
    example: 'We have extended the submission deadline by 24 hours due to technical issues.',
  })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiProperty({
    description: 'Pin announcement to top',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}
