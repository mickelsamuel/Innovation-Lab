import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
} from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { SendInvitationDto } from './dto/send-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser, type CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('invitations')
@Controller()
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('teams/:teamId/invitations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Send team invitation' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  @ApiResponse({ status: 201, description: 'Invitation sent successfully' })
  @ApiResponse({ status: 400, description: 'Team is full or duplicate invitation' })
  @ApiResponse({ status: 403, description: 'Only team lead can send invitations' })
  @ApiResponse({ status: 404, description: 'Team or user not found' })
  async sendInvitation(
    @Param('teamId') teamId: string,
    @Body() dto: SendInvitationDto,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.invitationsService.sendInvitation(teamId, dto, user.id);
  }

  @Get('teams/:teamId/invitations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get team invitations' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  @ApiResponse({ status: 200, description: 'Invitations retrieved successfully' })
  async getTeamInvitations(@Param('teamId') teamId: string) {
    return this.invitationsService.getTeamInvitations(teamId);
  }

  @Get('users/me/invitations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current user\'s pending invitations' })
  @ApiResponse({ status: 200, description: 'User invitations retrieved successfully' })
  async getUserInvitations(@GetCurrentUser() user: CurrentUser) {
    return this.invitationsService.getUserInvitations(user.id);
  }

  @Put('invitations/:id/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Accept team invitation' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiResponse({ status: 200, description: 'Invitation accepted successfully' })
  @ApiResponse({ status: 400, description: 'Invitation expired or team full' })
  @ApiResponse({ status: 403, description: 'Not authorized to accept this invitation' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async acceptInvitation(
    @Param('id') id: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.invitationsService.acceptInvitation(id, user.id);
  }

  @Put('invitations/:id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject team invitation' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiResponse({ status: 200, description: 'Invitation rejected successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to reject this invitation' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async rejectInvitation(
    @Param('id') id: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.invitationsService.rejectInvitation(id, user.id);
  }

  @Delete('invitations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel team invitation (sender only)' })
  @ApiParam({ name: 'id', description: 'Invitation ID' })
  @ApiResponse({ status: 200, description: 'Invitation cancelled successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to cancel this invitation' })
  @ApiResponse({ status: 404, description: 'Invitation not found' })
  async cancelInvitation(
    @Param('id') id: string,
    @GetCurrentUser() user: CurrentUser,
  ) {
    return this.invitationsService.cancelInvitation(id, user.id);
  }
}
