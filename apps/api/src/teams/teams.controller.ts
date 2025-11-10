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
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { JoinRequestDto } from './dto/join-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser, type CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create new team' })
  @ApiResponse({ status: 201, description: 'Team created successfully' })
  @ApiResponse({ status: 404, description: 'Hackathon not found' })
  @ApiResponse({ status: 409, description: 'Already in a team for this hackathon' })
  async create(@Body() dto: CreateTeamDto, @GetCurrentUser() user: CurrentUser) {
    return this.teamsService.create(dto, user.id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all teams for a hackathon' })
  @ApiQuery({ name: 'hackathonId', required: true })
  @ApiResponse({ status: 200, description: 'Teams retrieved successfully' })
  async findAll(@Query('hackathonId') hackathonId: string) {
    return this.teamsService.findAll(hackathonId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: "Get current user's teams" })
  @ApiQuery({ name: 'hackathonId', required: false, description: 'Filter by hackathon ID' })
  @ApiResponse({ status: 200, description: 'User teams retrieved successfully' })
  async getMyTeams(
    @GetCurrentUser() user: CurrentUser,
    @Query('hackathonId') hackathonId?: string
  ) {
    return this.teamsService.findUserTeams(user.id, hackathonId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get team by ID' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Team found' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update team (Lead only)' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Team updated successfully' })
  @ApiResponse({ status: 403, description: 'Only team lead can update' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTeamDto,
    @GetCurrentUser() user: CurrentUser
  ) {
    return this.teamsService.update(id, dto, user.id);
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Add member to team (Lead only)' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Member added successfully' })
  @ApiResponse({ status: 400, description: 'Team is full or user already in team' })
  @ApiResponse({ status: 403, description: 'Only team lead can add members' })
  async addMember(
    @Param('id') teamId: string,
    @Body() dto: InviteMemberDto,
    @GetCurrentUser() user: CurrentUser
  ) {
    return this.teamsService.addMember(teamId, dto, user.id);
  }

  @Post(':id/join-request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Request to join a team' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Join request sent successfully' })
  @ApiResponse({
    status: 400,
    description: 'Team not accepting members, full, or already a member',
  })
  @ApiResponse({ status: 404, description: 'Team not found' })
  async requestToJoin(
    @Param('id') teamId: string,
    @Body() dto: JoinRequestDto,
    @GetCurrentUser() user: CurrentUser
  ) {
    return this.teamsService.handleJoinRequest(teamId, user.id, dto.message);
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove member from team (Lead or self)' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiParam({ name: 'userId', description: 'User ID to remove' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async removeMember(
    @Param('id') teamId: string,
    @Param('userId') userId: string,
    @GetCurrentUser() user: CurrentUser
  ) {
    return this.teamsService.removeMember(teamId, userId, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete team (Lead only)' })
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Team deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete team with submissions' })
  @ApiResponse({ status: 403, description: 'Only team lead can delete' })
  async remove(@Param('id') id: string, @GetCurrentUser() user: CurrentUser) {
    return this.teamsService.remove(id, user.id);
  }
}
