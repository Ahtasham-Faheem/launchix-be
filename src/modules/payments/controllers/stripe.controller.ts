import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { StripeService } from '../services/stripe.service';
import { AdminGuard } from 'src/guards/admin.guard';
// import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';

@ApiTags('Payments & Billings')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Get('admin/subscriptions')
  @ApiOperation({ summary: 'Get all Stripe subscriptions (Admin only)' })
  async getAllSubscriptions() {
    const subscriptions = await this.stripeService['stripe'].subscriptions.list(
      { limit: 100 },
    );
    return subscriptions.data.map((sub) => ({
      id: sub.id,
      customer: sub.customer,
      status: sub.status,
      current_period_start: new Date((sub as any).current_period_start * 1000),
      current_period_end: new Date((sub as any).current_period_end * 1000),
      plan: sub.items.data[0]?.price?.nickname || sub.items.data[0]?.price?.id,
    }));
  }

  @Get('admin/invoices')
  @ApiOperation({ summary: 'Get all Stripe invoices (Admin only)' })
  async getAllInvoices() {
    const invoices = await this.stripeService['stripe'].invoices.list({
      limit: 100,
    });
    return invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      customer: invoice.customer,
      customer_email: invoice.customer_email,
      status: invoice.status,
      amount_paid: invoice.amount_paid / 100,
      amount_due: invoice.amount_due / 100,
      currency: invoice.currency.toUpperCase(),
      created: new Date(invoice.created * 1000),
      due_date: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
    }));
  }

  @Post('customer-portal')
  @ApiOperation({ summary: 'Create Stripe Customer Portal session' })
  async createCustomerPortal(@Request() req) {
    const user = req.user;
    if (!user?.metadata?.stripeCustomerId) {
      throw new Error('No Stripe customer ID found');
    }

    const session = await this.stripeService[
      'stripe'
    ].billingPortal.sessions.create({
      customer: user.metadata.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    return { url: session.url };
  }
}
