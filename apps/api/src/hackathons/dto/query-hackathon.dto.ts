import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { HackathonStatus, HackathonLocation } from '@innovation-lab/database';

export class QueryHackathonDto {
  @ApiProperty({ required: false, enum: HackathonStatus })
  @IsOptional()
  @IsEnum(HackathonStatus)
  status?: HackathonStatus;

  @ApiProperty({ required: false, enum: HackathonLocation })
  @IsOptional()
  @IsEnum(HackathonLocation)
  location?: HackathonLocation;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  search?: string;
}
