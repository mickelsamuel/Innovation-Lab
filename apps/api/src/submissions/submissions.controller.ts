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
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser, type CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { SubmissionStatus } from '@innovation-lab/database';

@ApiTags('submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create new submission' })
  @ApiResponse({ status: 201, description: 'Submission created successfully' })
  @ApiResponse({ status: 400, description: 'Team already has a submission or deadline passed' })
  @ApiResponse({ status: 403, description: 'Not a team member' })
  async create(@Body() dto: CreateSubmissionDto, @GetCurrentUser() user: CurrentUser) {
    return this.submissionsService.create(dto, user.id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all submissions for a hackathon' })
  @ApiQuery({ name: 'hackathonId', required: true })
  @ApiQuery({ name: 'status', enum: SubmissionStatus, required: false })
  @ApiResponse({ status: 200, description: 'Submissions retrieved successfully' })
  async findAll(
    @Query('hackathonId') hackathonId: string,
    @Query('status') status?: SubmissionStatus
  ) {
    return this.submissionsService.findAll(hackathonId, status);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: "Get current user's submissions" })
  @ApiResponse({ status: 200, description: 'User submissions retrieved successfully' })
  async getMySubmissions(@GetCurrentUser() user: CurrentUser) {
    return this.submissionsService.findUserSubmissions(user.id);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get submission by ID' })
  @ApiParam({ name: 'id', description: 'Submission ID' })
  @ApiResponse({ status: 200, description: 'Submission found' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  async findOne(@Param('id') id: string) {
    return this.submissionsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update submission (Team member only, before deadline)' })
  @ApiParam({ name: 'id', description: 'Submission ID' })
  @ApiResponse({ status: 200, description: 'Submission updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update finalized submission or after deadline' })
  @ApiResponse({ status: 403, description: 'Only team members can update' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSubmissionDto,
    @GetCurrentUser() user: CurrentUser
  ) {
    return this.submissionsService.update(id, dto, user.id);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Submit (finalize) submission (Team lead only)' })
  @ApiParam({ name: 'id', description: 'Submission ID' })
  @ApiResponse({ status: 200, description: 'Submission finalized successfully' })
  @ApiResponse({ status: 400, description: 'Already finalized or deadline passed' })
  @ApiResponse({ status: 403, description: 'Only team lead can finalize' })
  async submit(@Param('id') id: string, @GetCurrentUser() user: CurrentUser) {
    return this.submissionsService.submit(id, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete submission (Team lead only, before scoring)' })
  @ApiParam({ name: 'id', description: 'Submission ID' })
  @ApiResponse({ status: 200, description: 'Submission deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete scored submission' })
  @ApiResponse({ status: 403, description: 'Only team lead can delete' })
  async remove(@Param('id') id: string, @GetCurrentUser() user: CurrentUser) {
    return this.submissionsService.remove(id, user.id);
  }
}
