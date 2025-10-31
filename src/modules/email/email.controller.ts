import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { FeedbackDto } from './dto/feedback.dto';
import { SupportDto } from './dto/support.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiTags('Email')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('feedback')
  @ApiOperation({ summary: 'Submit feedback message' })
  @ApiResponse({ status: 200, description: 'Feedback sent successfully' })
  async sendFeedback(@Body() body: FeedbackDto) {
    await this.emailService.sendFeedbackEmail(body);
    return { message: 'Feedback sent successfully' };
  }

  @Post('support')
  @ApiOperation({ summary: 'Submit support request' })
  @ApiResponse({ status: 200, description: 'Support request sent successfully' })
  async sendSupport(@Body() body: SupportDto) {
    await this.emailService.sendSupportEmail(body);
    return { message: 'Support request sent successfully' };
  }
}
