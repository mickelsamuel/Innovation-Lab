import {
  Controller,
  Get,
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
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetCurrentUser, type CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getMe(@GetCurrentUser() user: CurrentUser) {
    return this.usersService.findOne(user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 409, description: 'Handle already taken' })
  async updateMe(@GetCurrentUser() user: CurrentUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Put('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Current password is incorrect' })
  async changePassword(@GetCurrentUser() user: CurrentUser, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, dto);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get current user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved' })
  async getMyStats(@GetCurrentUser() user: CurrentUser) {
    return this.usersService.getStats(user.id);
  }

  @Get('me/activity')
  @ApiOperation({ summary: 'Get current user activity feed' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Activity feed retrieved' })
  async getMyActivity(
    @GetCurrentUser() user: CurrentUser,
    @Query('limit') limit?: number
  ) {
    return this.usersService.getActivityFeed(user.id, limit);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete current user account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  async deleteMe(@GetCurrentUser() user: CurrentUser) {
    return this.usersService.deleteAccount(user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by name, handle, or exact email' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Fuzzy search query' })
  @ApiQuery({ name: 'email', required: false, type: String, description: 'Exact email lookup' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Users found' })
  async search(
    @Query('q') query?: string,
    @Query('email') email?: string,
    @Query('limit') limit?: number,
  ) {
    if (email) {
      const user = await this.usersService.findByEmail(email);
      return user ? [user] : [];
    }
    return this.usersService.search(query || '', limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('handle/:handle')
  @ApiOperation({ summary: 'Get user by handle' })
  @ApiParam({ name: 'handle', description: 'User handle/username' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findByHandle(@Param('handle') handle: string) {
    return this.usersService.findByHandle(handle);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get user statistics by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved' })
  async getStats(@Param('id') id: string) {
    return this.usersService.getStats(id);
  }
}
