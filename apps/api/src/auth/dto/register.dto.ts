import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'john_doe',
    description: 'Unique username handle',
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Handle can only contain letters, numbers, underscores, and hyphens',
  })
  handle: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'User password (min 8 chars, must contain uppercase, lowercase, number, special char)',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{}|;:'",.<>?/\\])[A-Za-z\d@$!%*?&#^()_+\-=[\]{}|;:'",.<>?/\\]{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

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
    example: true,
    description: 'Accept terms and conditions',
  })
  @IsBoolean()
  acceptTerms: boolean;
}

export class RegisterResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false, nullable: true })
  name: string | null;

  @ApiProperty({ required: false, nullable: true })
  handle: string | null;

  @ApiProperty()
  message: string;
}
