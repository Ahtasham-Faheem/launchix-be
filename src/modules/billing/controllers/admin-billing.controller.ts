// src/billing/admin-billing.controller.ts
import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BillingService } from '../services/billing.service';
import { CreatePlanDto, UpdatePlanDto } from '../dto/create-plan.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';

@ApiTags('billing-admin')
@ApiBearerAuth()
@UseGuards(AuthGuard, AdminGuard)
@Controller('billing/admin')
export class AdminBillingController {
  constructor(private readonly billing: BillingService) {}

  @Post('plans')
  @ApiOperation({ summary: 'Create a new subscription plan' })
  @ApiResponse({ status: 201, description: 'Plan created successfully' })
  createPlan(@Body() dto: CreatePlanDto) {
    return this.billing.createPlan(dto);
  }

  @Get('plans')
  @ApiOperation({ summary: 'List all plans' })
  getPlans() {
    return this.billing.getPlans();
  }

  @Patch('plans/:id')
  @ApiOperation({ summary: 'Update a plan' })
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.billing.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  @ApiOperation({ summary: 'Delete a plan (no active subscriptions)' })
  deletePlan(@Param('id') id: string) {
    return this.billing.deletePlan(id);
  }
}
