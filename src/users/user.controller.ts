import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiParam, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import ResponseHelper from 'src/utils/response-helper';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('verify/:userId')
  @ApiOperation({ summary: 'Verify if a user exists by ID' })
  async verifyUser(@Param('userId') userId: string) {
    const isValid = await this.userService.verifyUser(userId);
    return ResponseHelper.createResponse({ valid: isValid }, HttpStatus.OK);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user profile by ID' })
  async getUser(@Param('userId') userId: string) {
    const user = await this.userService.getUserProfile(userId);
    return ResponseHelper.createResponse({ user }, HttpStatus.OK);
  }

  @Put(':userId')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('profileImage'))
  @ApiOperation({ summary: 'Update user profile including image' })
  async updateUser(
    @Param('userId') userId: string,
    @UploadedFile() profileImage: Express.Multer.File,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const user = await this.userService.updateUser(userId, updateUserDto, profileImage);
    return ResponseHelper.createResponse({ user }, HttpStatus.OK);
  }

  @Put('change-password/:userId')
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(
    @Param('userId') userId: string,
    @Body() body: ChangePasswordDto
  ) {
    const success = await this.userService.changePassword(userId, body);
    if (!success) throw new HttpException('Invalid current password', HttpStatus.BAD_REQUEST);
    return ResponseHelper.createResponse({}, HttpStatus.OK, 'Password updated');
  }
}
