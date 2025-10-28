import { Body, Controller, Post } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { LoginClerkDto } from './dto/login-clerk.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('clerk')
@Controller('clerk')
export class ClerkController {
  constructor(private readonly clerkService: ClerkService) {}

  @Post('token')
  @ApiOperation({
    summary: 'Generate JWT session token for an existing Clerk user (dev/test only)',
  })
  async loginAndGetToken(@Body() body: LoginClerkDto) {
    return await this.clerkService.loginUser(body.email, body.password);
  }
}
