import { Controller, Get, Post, UseGuards, Param, Req, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlansService } from '../services/plans.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { CreatePlansDto } from '../dto/create-plans.dto';

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
  @UseGuards(AdminGuard)
  @ApiOperation({ 
    summary: 'Create default plans with Stripe IDs (Admin only)',
    description: 'Creates 3 plans: Starter (free), Standard, and Premium. If plans already exist, will not create duplicates - maximum 3 plans allowed.'
  })
  async createDefaultPlans(@Body() createPlansDto: CreatePlansDto) {
    return this.plansService.createDefaultPlans(createPlansDto);
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

  @Get('my-plan')
  @ApiOperation({ summary: 'Get current user plan' })
  async getMyPlan(@Req() req: any) {
    return this.plansService.getUserCurrentPlan(req.user._id.toString());
  }
}
