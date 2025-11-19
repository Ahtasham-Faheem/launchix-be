import { Controller, Get, Post, UseGuards, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlansService } from '../services/plans.service';
import { AuthGuard } from 'src/guards/auth.guard';

@ApiTags('Plans')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active plans' })
  async getAllPlans() {
    return this.plansService.getAllPlans({});
  }

  @Post('create-default')
  @ApiOperation({ summary: 'Create default plans (run once)' })
  async createDefaultPlans() {
    return this.plansService.createDefaultPlans();
  }

  @Post(':id/subscribe')
  @ApiOperation({ summary: 'Subscribe to a plan' })
  async subscribeToPlan(@Param('id') planId: string, @Req() req: any) {
    return this.plansService.subscribeToPlan(planId, req.user._id.toString());
  }

  @Get('verify/:sessionId')
  @ApiOperation({ summary: 'Verify payment session' })
  async verifyPayment(@Param('sessionId') sessionId: string, @Req() req: any) {
    return this.plansService.verifyPayment(sessionId, req.user._id.toString());
  }
}
