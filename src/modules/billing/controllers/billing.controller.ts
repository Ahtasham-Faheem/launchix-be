import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BillingService } from '../services/billing.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdminGuard } from 'src/guards/admin.guard';
import { CurrentUser } from 'src/decorator/auth.decorator';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { CancelSubscriptionDto } from '../dto/cancel-subscription.dto';

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Post('subscriptions')
  @ApiOperation({ summary: 'Create subscription for current user' })
  @ApiResponse({ status: 201, description: 'Subscription + initial invoice created' })
  createSubscription(@CurrentUser() user: any, @Body() dto: CreateSubscriptionDto) {
    return this.billing.createSubscription(user._id, dto);
  }

  @Post('subscriptions/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel subscription',
    description: 'Cancels subscription immediately or at end of billing period.',
  })
  cancelSubscription(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CancelSubscriptionDto,
  ) {
    return this.billing.cancelSubscription(user._id, id, dto);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'List all subscriptions for current user' })
  getUserSubscriptions(
    @CurrentUser() user: any,
    @Query('status') status?: string
  ) {
    return this.billing.getUserSubscriptions(user._id, status);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'List all invoices for current user' })
  getUserInvoices(@CurrentUser() user: any) {
    return this.billing.getUserInvoices(user._id);
  }

  @UseGuards(AdminGuard)
  @Get('admin/subscriptions')
  @ApiOperation({ summary: 'List all subscriptions (Admin only)' })
  getAllSubscriptions() {
    return this.billing.getAllSubscriptions();
  }

  @UseGuards(AdminGuard)
  @Get('admin/invoices')
  @ApiOperation({ summary: 'List all invoices (Admin only)' })
  getAllInvoices() {
    return this.billing.getAllInvoices();
  }

  @Get('plans')
  @ApiOperation({ summary: 'List active plans (public pricing table)' })
  getPlans() {
    return this.billing.getPlans();
  }

  @Get('limit')
  @ApiOperation({ summary: 'Get current brand limit based on subscription' })
  getLimit(@CurrentUser() user: any) {
    return this.billing.getBrandLimitForUser(user._id);
  }
}
