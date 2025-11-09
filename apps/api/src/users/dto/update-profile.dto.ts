import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, MinLength, Matches, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    example: 'john_doe',
    description: 'Unique username handle',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Handle can only contain letters, numbers, underscores, and hyphens',
  })
  handle?: string;

  @ApiProperty({
    example: 'Passionate developer building the future of fintech',
    description: 'User bio',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiProperty({
    example: 'Acme Corp',
    description: 'Organization name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  organization?: string;

  @ApiProperty({
    example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    description: 'Avatar URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Invalid avatar URL' })
  avatarUrl?: string;
}
