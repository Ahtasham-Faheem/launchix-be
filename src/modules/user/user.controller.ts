// src/user/user.controller.ts
import { Controller, Get, Delete, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from 'src/decorator/auth.decorator';
import { AuthGuard } from '../../guards/auth.guard';
import { UserService } from './user.service';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get currently authenticated user' })
  getCurrentUser(@CurrentUser() user: any) {
    return user;
  }

  /** 🗑️ Hard Delete Current User */
  @Delete('me')
  @HttpCode(200)
  @ApiOperation({ summary: 'hard delete current user (Clerk + Mongo)' })
  @ApiResponse({ status: 200, description: 'User soft deleted successfully' })
  async softDeleteCurrentUser(@CurrentUser() user: any) {
    return await this.userService.softDeleteUser(user._id);
    return await this.userService.softDeleteUser('6908adbed25378e05810429a');
  }

}
