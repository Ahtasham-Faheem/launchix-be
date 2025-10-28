// src/profile/profile.controller.ts
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { users } from '@clerk/clerk-sdk-node'; // keep this for user fetch
import { CurrentUser } from 'src/decorator/auth.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('profile')
export class ProfileController {
  @Get('profile')
  getUserProfile(@CurrentUser() user: any) {
    // The user profile is now available on req.user
    // thanks to the ClerkAuthMiddleware
    return {
      success: true,
      user: {},
    };
  }

  @Get('me')
  getCurrentUser(@CurrentUser() user: any) {
    // You can also access it in any protected route
    return user;
  }
}
