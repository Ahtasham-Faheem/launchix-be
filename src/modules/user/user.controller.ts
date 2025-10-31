// src/profile/profile.controller.ts
import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { users } from '@clerk/clerk-sdk-node'; // keep this for user fetch
import { CurrentUser } from 'src/decorator/auth.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../guards/auth.guard';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('user')
export class UserController {

  @Get('me')
  getCurrentUser(@CurrentUser() user: any) {
    // You can also access it in any protected route
    return user;
  }
}
