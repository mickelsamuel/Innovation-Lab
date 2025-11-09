import { IsOptional, IsEnum, IsString } from 'class-validator';

export enum TimeRange {
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  ALL = 'all',
}

export class AnalyticsFilterDto {
  @IsOptional()
  @IsEnum(TimeRange)
  timeRange?: TimeRange = TimeRange.MONTH;

  @IsOptional()
  @IsString()
  department?: string;
}
