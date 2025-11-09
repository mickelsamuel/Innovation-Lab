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
import { MentorsService } from './mentors.service';
import { AssignMentorDto } from './dto/assign-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetCurrentUser, type CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '@innovation-lab/database';

@ApiTags('mentors')
@Controller()
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  // ==================== Mentor Assignment ====================

  @Post('hackathons/:hackathonId/mentors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BANK_ADMIN, Role.ORGANIZER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Assign a mentor to a hackathon' })
  @ApiParam({ name: 'hackathonId', description: 'Hackathon ID' })
  @ApiResponse({ status: 201, description: 'Mentor assigned successfully' })
  @ApiResponse({ status: 400, description: 'User is not a mentor' })
  @ApiResponse({ status: 409, description: 'Mentor already assigned' })
  async assignMentor(
    @Param('hackathonId') hackathonId: string,
    @Body() dto: AssignMentorDto,
    @GetCurrentUser() user: CurrentUser
  ) {
    return this.mentorsService.assignMentor(hackathonId, dto, user.id);
  }

  @Get('hackathons/:hackathonId/mentors')
  @Public()
  @ApiOperation({ summary: 'Get all mentors for a hackathon' })
  @ApiParam({ name: 'hackathonId', description: 'Hackathon ID' })
  @ApiResponse({ status: 200, description: 'Mentors retrieved successfully' })
  async getMentors(@Param('hackathonId') hackathonId: string) {
    return this.mentorsService.getMentors(hackathonId);
  }

  @Delete('hackathons/:hackathonId/mentors/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BANK_ADMIN, Role.ORGANIZER)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Remove a mentor from a hackathon' })
  @ApiParam({ name: 'hackathonId', description: 'Hackathon ID' })
  @ApiParam({ name: 'userId', description: 'Mentor user ID' })
  @ApiResponse({ status: 200, description: 'Mentor removed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot remove mentor with upcoming sessions' })
  async removeMentor(
    @Param('hackathonId') hackathonId: string,
    @Param('userId') userId: string,
    @GetCurrentUser() user: CurrentUser
  ) {
    return this.mentorsService.removeMentor(hackathonId, userId, user.id);
  }

  @Put('hackathons/:hackathonId/mentors/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BANK_ADMIN, Role.ORGANIZER, Role.MENTOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update mentor profile' })
  @ApiParam({ name: 'hackathonId', description: 'Hackathon ID' })
  @ApiParam({ name: 'userId', description: 'Mentor user ID' })
  @ApiResponse({ status: 200, description: 'Mentor updated successfully' })
  async updateMentor(
    @Param('hackathonId') hackathonId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMentorDto,
    @GetCurrentUser() user: CurrentUser
  ) {
    return this.mentorsService.updateMentor(hackathonId, userId, dto, user.id);
  }

  // ==================== Mentor Dashboard ====================

  @Get('mentors/my-assignments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR, Role.BANK_ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: "Get mentor's hackathon assignments" })
  @ApiResponse({ status: 200, description: 'Assignments retrieved successfully' })
  async getMyAssignments(@GetCurrentUser() user: CurrentUser) {
    return this.mentorsService.getMentorAssignments(user.id);
  }

  // ==================== Mentor Sessions ====================

  @Post('mentors/:mentorId/sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR, Role.BANK_ADMIN, Role.ORGANIZER)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a mentor session (office hours)' })
  @ApiParam({ name: 'mentorId', description: 'Mentor ID' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid time or scheduling conflict' })
  @ApiResponse({ status: 403, description: 'Not authorized to create sessions for this mentor' })
  async createSession(
    @Param('mentorId') mentorId: string,
    @Body() dto: CreateSessionDto,
    @GetCurrentUser() user: CurrentUser
  ) {
    return this.mentorsService.createSession(mentorId, dto, user.id);
  }

  @Get('mentors/:mentorId/sessions')
  @Public()
  @ApiOperation({ summary: 'Get sessions for a mentor' })
  @ApiParam({ name: 'mentorId', description: 'Mentor ID' })
  @ApiQuery({
    name: 'includeAll',
    required: false,
    description: 'Include past sessions',
    type: Boolean,
  })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  async getMentorSessions(
    @Param('mentorId') mentorId: string,
    @Query('includeAll') includeAll?: string
  ) {
    return this.mentorsService.getMentorSessions(mentorId, includeAll === 'true');
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR, Role.BANK_ADMIN, Role.ORGANIZER)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete a mentor session' })
  @ApiParam({ name: 'sessionId', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete session in progress' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this session' })
  async deleteSession(
    @Param('sessionId') sessionId: string,
    @GetCurrentUser() user: CurrentUser
  ) {
    return this.mentorsService.deleteSession(sessionId, user.id);
  }

  @Get('hackathons/:hackathonId/sessions')
  @Public()
  @ApiOperation({ summary: 'Get all upcoming sessions for a hackathon' })
  @ApiParam({ name: 'hackathonId', description: 'Hackathon ID' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  async getHackathonSessions(@Param('hackathonId') hackathonId: string) {
    return this.mentorsService.getHackathonSessions(hackathonId);
  }
}
