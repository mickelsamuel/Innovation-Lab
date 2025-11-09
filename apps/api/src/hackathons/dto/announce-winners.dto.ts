import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WinnerDto {
  @ApiProperty({
    description: 'Submission ID of the winner',
    example: 'cm123456',
  })
  @IsNotEmpty()
  @IsString()
  submissionId: string;

  @ApiProperty({
    description: 'Rank/position (1, 2, 3)',
    example: 1,
    minimum: 1,
    maximum: 3,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(3)
  rank: number;

  @ApiProperty({
    description: 'Prize amount or description (optional)',
    example: '$5,000',
    required: false,
  })
  @IsOptional()
  @IsString()
  prize?: string;
}

export class AnnounceWinnersDto {
  @ApiProperty({
    description: 'Array of winners',
    type: [WinnerDto],
  })
  @IsNotEmpty()
  winners: WinnerDto[];
}
