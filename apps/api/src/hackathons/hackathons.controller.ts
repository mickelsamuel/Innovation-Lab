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
import { HackathonsService } from './hackathons.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';
import { QueryHackathonDto } from './dto/query-hackathon.dto';
import { AnnounceWinnersDto } from './dto/announce-winners.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetCurrentUser, type CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('hackathons')
@Controller('hackathons')
export class HackathonsController {
  constructor(private readonly hackathonsService: HackathonsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BANK_ADMIN', 'ORGANIZER')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create new hackathon (Organizer/Admin only)' })
  @ApiResponse({ status: 201, description: 'Hackathon created successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  async create(@Body() dto: CreateHackathonDto, @GetCurrentUser() user: CurrentUser) {
    return this.hackathonsService.create(dto, user.id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all hackathons with filters' })
  @ApiResponse({ status: 200, description: 'Hackathons retrieved successfully' })
  async findAll(@Query() query: QueryHackathonDto) {
    return this.hackathonsService.findAll(query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current user\'s hackathons' })
  @ApiResponse({ status: 200, description: 'User hackathons retrieved successfully' })
  async getMyHackathons(@GetCurrentUser() user: CurrentUser) {
    return this.hackathonsService.findUserHackathons(user.id);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get hackathon by slug' })
  @ApiParam({ name: 'slug', description: 'Hackathon slug' })
  @ApiResponse({ status: 200, description: 'Hackathon found' })
  @ApiResponse({ status: 404, description: 'Hackathon not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.hackathonsService.findBySlug(slug);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get hackathon by ID' })
  @ApiParam({ name: 'id', description: 'Hackathon ID' })
  @ApiResponse({ status: 200, description: 'Hackathon found' })
  @ApiResponse({ status: 404, description: 'Hackathon not found' })
  async findOne(@Param('id') id: string) {
    return this.hackathonsService.findOne(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get hackathon statistics' })
  @ApiParam({ name: 'id', description: 'Hackathon ID' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  @ApiResponse({ status: 404, description: 'Hackathon not found' })
  async getStats(@Param('id') id: string) {
    return this.hackathonsService.getStats(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BANK_ADMIN', 'ORGANIZER')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update hackathon (Organizer/Admin only)' })
  @ApiParam({ name: 'id', description: 'Hackathon ID' })
  @ApiResponse({ status: 200, description: 'Hackathon updated successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Hackathon not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateHackathonDto,
    @GetCurrentUser() user: CurrentUser
  ) {
    return this.hackathonsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BANK_ADMIN')
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete hackathon (Admin only)' })
  @ApiParam({ name: 'id', description: 'Hackathon ID' })
  @ApiResponse({ status: 200, description: 'Hackathon deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Hackathon not found' })
  async remove(@Param('id') id: string, @GetCurrentUser() user: CurrentUser) {
    return this.hackathonsService.remove(id, user.id);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register for a hackathon' })
  @ApiParam({ name: 'id', description: 'Hackathon ID' })
  @ApiResponse({ status: 201, description: 'Successfully registered for hackathon' })
  @ApiResponse({ status: 400, description: 'Registration closed or hackathon not accepting registrations' })
  @ApiResponse({ status: 404, description: 'Hackathon not found' })
  @ApiResponse({ status: 409, description: 'Already registered' })
  async registerForHackathon(
    @Param('id') id: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    await this.hackathonsService.registerParticipant(id, user.id);
    return { message: 'Successfully registered for hackathon' };
  }

  @Post(':id/winners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BANK_ADMIN', 'ORGANIZER')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Announce hackathon winners and award XP (Organizer/Admin only)' })
  @ApiParam({ name: 'id', description: 'Hackathon ID' })
  @ApiResponse({ status: 200, description: 'Winners announced successfully' })
  @ApiResponse({ status: 400, description: 'Invalid hackathon status or submission' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Hackathon or submission not found' })
  async announceWinners(
    @Param('id') id: string,
    @Body() dto: AnnounceWinnersDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.hackathonsService.announceWinners(id, dto, user.id);
  }

  @Post(':id/announcements')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BANK_ADMIN', 'ORGANIZER')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a hackathon announcement (Organizer/Admin only)' })
  @ApiParam({ name: 'id', description: 'Hackathon ID' })
  @ApiResponse({ status: 201, description: 'Announcement created successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Hackathon not found' })
  async createAnnouncement(
    @Param('id') id: string,
    @Body() dto: CreateAnnouncementDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.hackathonsService.createAnnouncement(id, dto, user.id);
  }

  @Get(':id/announcements')
  @ApiOperation({ summary: 'Get all announcements for a hackathon' })
  @ApiParam({ name: 'id', description: 'Hackathon ID' })
  @ApiResponse({ status: 200, description: 'Announcements retrieved successfully' })
  async getAnnouncements(@Param('id') id: string) {
    return this.hackathonsService.getAnnouncements(id);
  }

  @Delete(':id/announcements/:announcementId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BANK_ADMIN', 'ORGANIZER')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete a hackathon announcement (Organizer/Admin only)' })
  @ApiParam({ name: 'id', description: 'Hackathon ID' })
  @ApiParam({ name: 'announcementId', description: 'Announcement ID' })
  @ApiResponse({ status: 200, description: 'Announcement deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async deleteAnnouncement(
    @Param('id') id: string,
    @Param('announcementId') announcementId: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.hackathonsService.deleteAnnouncement(id, announcementId, user.id);
  }

  @Get(':id/submissions')
  @ApiOperation({ summary: 'Get all submissions for a hackathon' })
  @ApiParam({ name: 'id', description: 'Hackathon ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by submission status' })
  @ApiResponse({ status: 200, description: 'Submissions retrieved successfully' })
  async getHackathonSubmissions(
    @Param('id') id: string,
    @Query('status') status?: string,
  ) {
    return this.hackathonsService.getHackathonSubmissions(id, status);
  }
}
