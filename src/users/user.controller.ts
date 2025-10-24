import {
  Controller,
  Get,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import ResponseHelper from 'src/utils/response-helper';
import { AuthGuard } from 'src/guard/auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get logged-in user profile (from token)' })
  async getProfile(@Request() req) {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return ResponseHelper.createResponse(
        {},
        HttpStatus.UNAUTHORIZED,
        'Invalid or missing token payload',
      );
    }

    const user = await this.userService.getUserProfile(userId);
    return ResponseHelper.createResponse({ user }, HttpStatus.OK);
  }
}
