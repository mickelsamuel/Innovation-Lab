import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JudgingService } from './judging.service';
import { AssignJudgeDto } from './dto/assign-judge.dto';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetCurrentUser, type CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '@innovation-lab/database';

@ApiTags('judging')
@Controller()
export class JudgingController {
  constructor(private readonly judgingService: JudgingService) {}

  // ==================== Judge Assignment ====================

  @Post('hackathons/:hackathonId/judges')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BANK_ADMIN, Role.ORGANIZER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Assign a judge to a hackathon' })
  @ApiParam({ name: 'hackathonId', description: 'Hackathon ID' })
  @ApiResponse({ status: 201, description: 'Judge assigned successfully' })
  @ApiResponse({ status: 400, description: 'User is not a judge' })
  @ApiResponse({ status: 409, description: 'Judge already assigned' })
  async assignJudge(
    @Param('hackathonId') hackathonId: string,
    @Body() dto: AssignJudgeDto,
    @GetCurrentUser() user: CurrentUser
  ) {
    return this.judgingService.assignJudge(hackathonId, dto, user.id);
  }

  @Get('hackathons/:hackathonId/judges')
  @Public()
  @ApiOperation({ summary: 'Get all judges for a hackathon' })
  @ApiParam({ name: 'hackathonId', description: 'Hackathon ID' })
  @ApiResponse({ status: 200, description: 'Judges retrieved successfully' })
  async getJudges(@Param('hackathonId') hackathonId: string) {
    return this.judgingService.getJudges(hackathonId);
  }

  @Delete('hackathons/:hackathonId/judges/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BANK_ADMIN, Role.ORGANIZER)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Remove a judge from a hackathon' })
  @ApiParam({ name: 'hackathonId', description: 'Hackathon ID' })
  @ApiParam({ name: 'userId', description: 'Judge user ID' })
  @ApiResponse({ status: 200, description: 'Judge removed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot remove judge with scores' })
  async removeJudge(
    @Param('hackathonId') hackathonId: string,
    @Param('userId') userId: string,
    @GetCurrentUser() user: CurrentUser
  ) {
    return this.judgingService.removeJudge(hackathonId, userId, user.id);
  }

  // ==================== Scoring ====================

  @Post('submissions/:submissionId/scores')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.JUDGE, Role.BANK_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a score for a submission' })
  @ApiParam({ name: 'submissionId', description: 'Submission ID' })
  @ApiResponse({ status: 201, description: 'Score created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid score or submission not finalized' })
  @ApiResponse({ status: 403, description: 'Not assigned as judge or conflict of interest' })
  @ApiResponse({ status: 409, description: 'Criterion already scored' })
  async createScore(
    @Param('submissionId') submissionId: string,
    @Body() dto: CreateScoreDto,
    @GetCurrentUser() user: CurrentUser
  ) {
    return this.judgingService.createScore(submissionId, dto, user.id);
  }

  @Get('submissions/:submissionId/scores')
  @Public()
  @ApiOperation({ summary: 'Get all scores for a submission' })
  @ApiParam({ name: 'submissionId', description: 'Submission ID' })
  @ApiResponse({ status: 200, description: 'Scores retrieved successfully' })
  async getScores(@Param('submissionId') submissionId: string) {
    return this.judgingService.getScores(submissionId);
  }

  @Put('scores/:scoreId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.JUDGE, Role.BANK_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update a score' })
  @ApiParam({ name: 'scoreId', description: 'Score ID' })
  @ApiResponse({ status: 200, description: 'Score updated successfully' })
  @ApiResponse({ status: 403, description: 'Can only update your own scores' })
  async updateScore(
    @Param('scoreId') scoreId: string,
    @Body() dto: UpdateScoreDto,
    @GetCurrentUser() user: CurrentUser
  ) {
    return this.judgingService.updateScore(scoreId, dto, user.id);
  }

  @Delete('scores/:scoreId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.JUDGE, Role.BANK_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete a score' })
  @ApiParam({ name: 'scoreId', description: 'Score ID' })
  @ApiResponse({ status: 200, description: 'Score deleted successfully' })
  @ApiResponse({ status: 403, description: 'Can only delete your own scores' })
  async deleteScore(@Param('scoreId') scoreId: string, @GetCurrentUser() user: CurrentUser) {
    return this.judgingService.deleteScore(scoreId, user.id);
  }

  // ==================== Judge Dashboard ====================

  @Get('judge/assignments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.JUDGE, Role.BANK_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get submissions assigned to judge' })
  @ApiQuery({ name: 'hackathonId', required: false, description: 'Filter by hackathon' })
  @ApiResponse({ status: 200, description: 'Assignments retrieved successfully' })
  async getJudgeAssignments(
    @GetCurrentUser() user: CurrentUser,
    @Query('hackathonId') hackathonId?: string
  ) {
    return this.judgingService.getJudgeAssignments(user.id, hackathonId);
  }

  @Get('judging/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BANK_ADMIN, Role.ORGANIZER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get judging statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getJudgingStats() {
    return this.judgingService.getStats();
  }

  // ==================== Rankings ====================

  @Post('hackathons/:hackathonId/calculate-rankings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BANK_ADMIN, Role.ORGANIZER)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Calculate rankings for a hackathon' })
  @ApiParam({ name: 'hackathonId', description: 'Hackathon ID' })
  @ApiResponse({ status: 200, description: 'Rankings calculated successfully' })
  async calculateRankings(
    @Param('hackathonId') hackathonId: string,
    @GetCurrentUser() user: CurrentUser
  ) {
    return this.judgingService.calculateRankings(hackathonId, user.id);
  }
}
