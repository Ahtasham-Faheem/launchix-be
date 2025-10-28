// src/profile/profile.controller.ts
import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { users } from '@clerk/clerk-sdk-node'; // keep this for user fetch

@Controller('profile')
export class ProfileController {
  @Get('profile')
  getUserProfile(@Req() req: Request) {
    // The user profile is now available on req.user
    // thanks to the ClerkAuthMiddleware
    return {
      success: true,
      user: req.user,
    };
  }

  @Get('me')
  getCurrentUser(@Req() req: Request) {
    // You can also access it in any protected route
    return req.user;
  }
}
