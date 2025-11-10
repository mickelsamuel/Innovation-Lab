import { Controller, Get, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsFilterDto,
  PlatformStatsResponseDto,
  GrowthMetricsResponseDto,
  EngagementMetricsResponseDto,
  TopContributorsResponseDto,
  HackathonAnalyticsResponseDto,
  ChallengeAnalyticsResponseDto,
  DepartmentStatsResponseDto,
  AdminStatsResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('admin/stats')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BANK_ADMIN, Role.ORGANIZER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  async getAdminStats(): Promise<AdminStatsResponseDto> {
    return this.analyticsService.getAdminStats();
  }

  @Get('platform')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get platform statistics' })
  async getPlatformStats(): Promise<PlatformStatsResponseDto> {
    return this.analyticsService.getPlatformStats();
  }

  @Get('growth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get growth metrics' })
  async getGrowthMetrics(@Query() filter: AnalyticsFilterDto): Promise<GrowthMetricsResponseDto> {
    return this.analyticsService.getGrowthMetrics(filter);
  }

  @Get('engagement')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get engagement metrics' })
  async getEngagementMetrics(): Promise<EngagementMetricsResponseDto> {
    return this.analyticsService.getEngagementMetrics();
  }

  @Get('users/top')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get top contributors' })
  async getTopContributors(@Query('limit') limit?: number): Promise<TopContributorsResponseDto> {
    return this.analyticsService.getTopContributors(limit);
  }

  @Get('hackathons/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get hackathon analytics' })
  async getHackathonAnalytics(@Param('id') id: string): Promise<HackathonAnalyticsResponseDto> {
    return this.analyticsService.getHackathonAnalytics(id);
  }

  @Get('challenges/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get challenge analytics' })
  async getChallengeAnalytics(@Param('id') id: string): Promise<ChallengeAnalyticsResponseDto> {
    return this.analyticsService.getChallengeAnalytics(id);
  }

  @Get('departments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get department statistics' })
  async getDepartmentStats(): Promise<DepartmentStatsResponseDto> {
    return this.analyticsService.getDepartmentStats();
  }
}
