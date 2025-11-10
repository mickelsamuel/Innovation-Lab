import { IsString, IsNotEmpty, IsNumber, IsUUID, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScoreDto {
  @ApiProperty({
    description: 'Judging criterion ID',
    example: 'clu8x9y8z00001jv8h2k3l4m5',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  criterionId: string;

  @ApiProperty({
    description: 'Score value (must be between 0 and criterion maxScore)',
    example: 8.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({
    description: 'Optional feedback text',
    example: 'Great innovation and execution. Could improve on documentation.',
    required: false,
  })
  @IsString()
  @IsOptional()
  feedback?: string;
}
