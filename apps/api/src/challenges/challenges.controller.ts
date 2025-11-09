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
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { SubmitSolutionDto } from './dto/submit-solution.dto';
import { ReviewSolutionDto } from './dto/review-solution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ChallengeStatus } from '@prisma/client';

@ApiTags('challenges')
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  /**
   * Create a new challenge
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BANK_ADMIN, Role.ORGANIZER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new challenge' })
  @ApiResponse({ status: 201, description: 'Challenge created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request (validation error)' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized (not authenticated)',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (insufficient permissions)',
  })
  create(@Req() req: any, @Body() createChallengeDto: CreateChallengeDto) {
    return this.challengesService.create(req.user.id, createChallengeDto);
  }

  /**
   * Get all challenges
   */
  @Get()
  @ApiOperation({ summary: 'Get all challenges with optional filters' })
  @ApiQuery({ name: 'status', enum: ChallengeStatus, required: false })
  @ApiQuery({ name: 'category', type: String, required: false })
  @ApiQuery({ name: 'skill', type: String, required: false })
  @ApiQuery({ name: 'ownerId', type: String, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiResponse({ status: 200, description: 'Challenges retrieved' })
  findAll(
    @Query('status') status?: ChallengeStatus,
    @Query('category') category?: string,
    @Query('skill') skill?: string,
    @Query('ownerId') ownerId?: string,
    @Query('search') search?: string
  ) {
    return this.challengesService.findAll({
      status,
      category,
      skill,
      ownerId,
      search,
    });
  }

  /**
   * Get user's submissions
   */
  @Get('user/submissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current user\'s submissions' })
  @ApiResponse({ status: 200, description: 'Submissions retrieved' })
  getUserSubmissions(@Req() req: any) {
    return this.challengesService.getUserSubmissions(req.user.id);
  }

  /**
   * Get count of completed challenges for current user
   */
  @Get('my/completed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get completed challenges count' })
  @ApiResponse({ status: 200, description: 'Completed challenges count retrieved' })
  getCompletedCount(@Req() req: any) {
    return this.challengesService.getCompletedCount(req.user.id);
  }

  /**
   * Get challenge by slug
   */
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get challenge by slug' })
  @ApiResponse({ status: 200, description: 'Challenge retrieved' })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.challengesService.findBySlug(slug);
  }

  /**
   * Get challenge by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get challenge by ID' })
  @ApiResponse({ status: 200, description: 'Challenge retrieved' })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  findOne(@Param('id') id: string) {
    return this.challengesService.findOne(id);
  }

  /**
   * Update challenge
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update challenge (owner or admin only)' })
  @ApiResponse({ status: 200, description: 'Challenge updated successfully' })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (not owner or admin)',
  })
  update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateChallengeDto: UpdateChallengeDto
  ) {
    return this.challengesService.update(
      id,
      req.user.id,
      req.user.role,
      updateChallengeDto
    );
  }

  /**
   * Delete challenge
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete challenge (owner or admin only)' })
  @ApiResponse({ status: 200, description: 'Challenge deleted successfully' })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (not owner or admin)',
  })
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.challengesService.remove(id, req.user.id, req.user.role);
    return { message: 'Challenge deleted successfully' };
  }

  /**
   * Submit solution to challenge
   */
  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Submit solution to challenge' })
  @ApiResponse({
    status: 201,
    description: 'Solution submitted successfully',
  })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request (challenge closed, duplicate, etc.)',
  })
  submitSolution(
    @Param('id') id: string,
    @Req() req: any,
    @Body() submitSolutionDto: SubmitSolutionDto
  ) {
    return this.challengesService.submitSolution(
      id,
      req.user.id,
      submitSolutionDto
    );
  }

  /**
   * Get all submissions for a challenge
   */
  @Get(':id/submissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get all submissions for a challenge' })
  @ApiResponse({ status: 200, description: 'Submissions retrieved' })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  getChallengeSubmissions(@Param('id') id: string) {
    return this.challengesService.getChallengeSubmissions(id);
  }

  /**
   * Get submission by ID
   */
  @Get('submissions/:id')
  @ApiOperation({ summary: 'Get challenge submission by ID' })
  @ApiResponse({ status: 200, description: 'Submission retrieved' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  getSubmissionById(@Param('id') id: string) {
    return this.challengesService.getSubmissionById(id);
  }

  /**
   * Review submission
   */
  @Post('submissions/:id/review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Review submission (challenge owner or admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Submission reviewed successfully',
  })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (not owner or admin)',
  })
  reviewSubmission(
    @Param('id') id: string,
    @Req() req: any,
    @Body() reviewSolutionDto: ReviewSolutionDto
  ) {
    return this.challengesService.reviewSubmission(
      id,
      req.user.id,
      req.user.role,
      reviewSolutionDto
    );
  }
}
