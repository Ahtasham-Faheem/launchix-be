import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { StripeService } from '../services/stripe.service';
// import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { StripeChargeDto } from '../dto/stripe-charge.dto';

@ApiTags('Stripe Payments')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Get('payment-methods')
  @ApiOperation({ summary: 'Get user payment methods' })
  async getPaymentMethods(@Request() req) {
    const customer = await this.stripeService.getCustomerByUserId(req.user._id);
    
    if (!customer) {
      return { paymentMethods: [] };
    }

    const paymentMethods = await this.stripeService.getPaymentMethods(
      customer.stripeCustomerId,
    );

    return { paymentMethods: paymentMethods.data };
  }

  @Post('attach-payment-method')
  @ApiOperation({ summary: 'Attach payment method to customer' })
  async attachPaymentMethod(
    @Request() req,
    @Body() body: { paymentMethodId: string },
  ) {
    const customer = await this.stripeService.getCustomerByUserId(req.user._id);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    const paymentMethod = await this.stripeService.attachPaymentMethod(
      body.paymentMethodId,
      customer.stripeCustomerId,
    );

    return { paymentMethod };
  }

  @Post('detach-payment-method/:paymentMethodId')
  @ApiOperation({ summary: 'Detach payment method from customer' })
  async detachPaymentMethod(@Param('paymentMethodId') paymentMethodId: string) {
    const paymentMethod = await this.stripeService.detachPaymentMethod(paymentMethodId);
    return { paymentMethod };
  }

  @Get('customer')
  @ApiOperation({ summary: 'Get current user Stripe customer info' })
  async getCustomer(@Request() req) {
    const customer = await this.stripeService.getCustomerByUserId(req.user._id);
    return { customer };
  }

  @Post('charge')
  @ApiOperation({ summary: 'Charge subscription with payment method' })
  async chargeSubscription(
    @Request() req,
    @Body() dto: StripeChargeDto,
  ) {
    const customer = await this.stripeService.getCustomerByUserId(req.user._id);
    
    if (!customer) {
      throw new Error('Stripe customer not found');
    }

    const result = await this.stripeService.chargeSubscription(
      dto.subscriptionId,
      dto.paymentMethodId,
      customer.stripeCustomerId,
    );

    return result;
  }
}