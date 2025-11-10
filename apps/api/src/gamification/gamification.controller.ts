import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../common/interfaces/request.interface';
import {
  AwardXpDto,
  AwardBadgeDto,
  CreateBadgeDto,
  GetLeaderboardDto,
  GamificationProfileResponseDto,
  LeaderboardEntryDto,
  XpEventDto,
  BadgeDto,
} from './dto/gamification.dto';

@ApiTags('Gamification')
@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  /**
   * Get current user's gamification profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user gamification profile' })
  @ApiResponse({
    status: 200,
    description: 'Gamification profile retrieved',
    type: GamificationProfileResponseDto,
  })
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    return this.gamificationService.getUserProfile(req.user.id);
  }

  /**
   * Get user's gamification profile by ID
   */
  @Get('profile/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user gamification profile by ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Gamification profile retrieved',
    type: GamificationProfileResponseDto,
  })
  async getUserProfile(@Param('userId') userId: string) {
    return this.gamificationService.getUserProfile(userId);
  }

  /**
   * Get global leaderboard
   */
  @Get('leaderboard')
  @ApiOperation({ summary: 'Get leaderboard' })
  @ApiQuery({
    name: 'scope',
    enum: ['GLOBAL', 'HACKATHON', 'CHALLENGE'],
    required: false,
  })
  @ApiQuery({
    name: 'period',
    enum: ['ALLTIME', 'SEASON', 'MONTH', 'WEEK'],
    required: false,
  })
  @ApiQuery({ name: 'scopeId', required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard retrieved',
    type: [LeaderboardEntryDto],
  })
  async getLeaderboard(@Query() query: GetLeaderboardDto) {
    return this.gamificationService.getLeaderboard(
      query.scope,
      query.period,
      query.scopeId,
      query.limit
    );
  }

  /**
   * Get all available badges
   */
  @Get('badges')
  @ApiOperation({ summary: 'Get all badges' })
  @ApiResponse({
    status: 200,
    description: 'List of all badges',
    type: [BadgeDto],
  })
  async getAllBadges() {
    return this.gamificationService.getAllBadges();
  }

  /**
   * Get user's earned badges with full details
   */
  @Get('badges/user/:userId')
  @ApiOperation({ summary: 'Get user earned badges' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'List of user badges',
    type: [BadgeDto],
  })
  async getUserBadges(@Param('userId') userId: string) {
    return this.gamificationService.getUserBadges(userId);
  }

  /**
   * Get user's XP events history
   */
  @Get('xp-events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user XP events history' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({
    status: 200,
    description: 'XP events retrieved',
    type: [XpEventDto],
  })
  async getMyXpEvents(@Req() req: AuthenticatedRequest, @Query('limit') limit?: number) {
    return this.gamificationService.getUserXpEvents(
      req.user.id,
      limit ? parseInt(limit.toString()) : 50
    );
  }

  /**
   * Get user's XP events history by user ID
   */
  @Get('xp-events/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user XP events history by ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({
    status: 200,
    description: 'XP events retrieved',
    type: [XpEventDto],
  })
  async getUserXpEvents(@Param('userId') userId: string, @Query('limit') limit?: number) {
    return this.gamificationService.getUserXpEvents(
      userId,
      limit ? parseInt(limit.toString()) : 50
    );
  }

  /**
   * Award XP to user (admin only)
   */
  @Post('award-xp')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BANK_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Award XP to user (Admin only)' })
  @ApiResponse({ status: 201, description: 'XP awarded successfully' })
  async awardXp(@Body() awardXpDto: AwardXpDto) {
    await this.gamificationService.awardXp(
      awardXpDto.userId,
      awardXpDto.eventType,
      awardXpDto.points,
      awardXpDto.refType,
      awardXpDto.refId,
      awardXpDto.metadata
    );
    return { message: 'XP awarded successfully' };
  }

  /**
   * Award badge to user (admin only)
   */
  @Post('award-badge')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BANK_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Award badge to user (Admin only)' })
  @ApiResponse({ status: 201, description: 'Badge awarded successfully' })
  async awardBadge(@Body() awardBadgeDto: AwardBadgeDto) {
    await this.gamificationService.awardBadge(awardBadgeDto.userId, awardBadgeDto.badgeSlug);
    return { message: 'Badge awarded successfully' };
  }

  /**
   * Create new badge (admin only)
   */
  @Post('badges')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BANK_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new badge (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Badge created successfully',
    type: BadgeDto,
  })
  async createBadge(@Body() createBadgeDto: CreateBadgeDto) {
    return this.gamificationService.createBadge(createBadgeDto);
  }

  /**
   * Update daily streak (called automatically on user activity)
   */
  @Post('update-streak')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update daily login streak' })
  @ApiResponse({ status: 200, description: 'Streak updated' })
  async updateStreak(@Req() req: AuthenticatedRequest) {
    await this.gamificationService.updateDailyStreak(req.user.id);
    return { message: 'Streak updated' };
  }

  /**
   * Delete badge (admin only)
   */
  @Delete('badges/:badgeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BANK_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete badge (Admin only)' })
  @ApiParam({ name: 'badgeId', description: 'Badge ID' })
  @ApiResponse({ status: 200, description: 'Badge deleted successfully' })
  async deleteBadge(@Param('badgeId') badgeId: string) {
    await this.gamificationService.deleteBadge(badgeId);
    return { message: 'Badge deleted successfully' };
  }
}
