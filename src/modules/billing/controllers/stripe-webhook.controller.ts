import { Controller, Post, Body, Headers, Logger, RawBodyRequest, Req, Inject, SetMetadata } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import Stripe from 'stripe';
import { Request } from 'express';
import { BillingService } from '../services/billing.service';

// Skip authentication for webhooks
export const SkipAuth = () => SetMetadata('skipAuth', true);

@ApiTags('Stripe Webhooks')
@Controller('stripe/webhook')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);
  private stripe: Stripe;

  constructor(
    @Inject(BillingService) private readonly billingService: BillingService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    });
  }

  @Post()
  @SkipAuth()
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: Request & { rawBody: Buffer },
  ) {
    return this.handleWebhookEvent(signature, request.rawBody);
  }

  async handleWebhookEvent(signature: string, rawBody: Buffer) {
    try {
      if (!signature) throw new Error('No signature provided');
      if (!rawBody) throw new Error('No webhook payload was provided');

      let event: Stripe.Event;

      try {
        event = this.stripe.webhooks.constructEvent(
          rawBody,
          signature,
          process.env.STRIPE_WEBHOOK_SIGNING_SECRET,
        );
      } catch (error) {
        throw new Error(`Webhook Error: ${error.message}`);
      }

      this.logger.log(`Received event: ${event.type}`);

      switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        this.logger.log(`PaymentIntent ${paymentIntent.id} succeeded`);
        // Handle subscription payment
        if (paymentIntent.metadata?.subscriptionId) {
          await this.handleSubscriptionPayment(paymentIntent);
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        this.logger.log(`PaymentIntent ${failedPayment.id} failed`);
        // Handle failed payment
        break;

      case 'customer.created':
        const customer = event.data.object as Stripe.Customer;
        this.logger.log(`Customer ${customer.id} created`);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        this.logger.log(`Invoice ${invoice.id} payment succeeded`);
        // Handle subscription payment success
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        this.logger.log(`Invoice ${failedInvoice.id} payment failed`);
        // Handle subscription payment failure
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

      return { received: true };
    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`);
      throw error;
    }
  }

  private async handleSubscriptionPayment(paymentIntent: Stripe.PaymentIntent) {
    try {
      const { 
        subscriptionId, 
        planId, 
        originalAmount, 
        discountAmount, 
        couponCode 
      } = paymentIntent.metadata;
      
      // Log payment details
      this.logger.log(`Payment processed: ${paymentIntent.amount} cents (original: ${originalAmount}, discount: ${discountAmount}, coupon: ${couponCode || 'none'})`);
      
      // Activate subscription with payment details
      await this.billingService.activateSubscription(subscriptionId, paymentIntent.id, {
        originalAmount: parseInt(originalAmount || '0'),
        discountAmount: parseInt(discountAmount || '0'),
        couponCode: couponCode || null,
        planId,
      });
      
      this.logger.log(`Subscription ${subscriptionId} activated after payment ${paymentIntent.id}`);
    } catch (error) {
      this.logger.error(`Error handling subscription payment: ${error.message}`);
    }
  }
}