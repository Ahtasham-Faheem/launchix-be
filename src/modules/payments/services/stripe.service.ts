import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    });
  }

  async createCustomer(dto: any) {
    const stripeCustomer = await this.stripe.customers.create({
      email: dto.email,
      name:
        dto.firstName && dto.lastName
          ? `${dto.firstName} ${dto.lastName}`
          : undefined,
      phone: dto.phone,
      metadata: {
        userId: dto.userId,
      },
    });

    this.logger.log(
      `Created Stripe customer ${stripeCustomer.id} for user ${dto.userId}`,
    );
    return stripeCustomer;
  }

  async getProduct(productId: string) {
    return this.stripe.products.retrieve(productId);
  }

  async getPrice(priceId: string, currency: string) {
    const price: Stripe.Price = await this.stripe.prices.retrieve(priceId);

    if (price?.currency === currency) {
      return {
        id: price.id,
        currency: price.currency,
        amount: Number((Number(price.unit_amount ?? 0) / 100).toFixed(2)),

        interval: price.recurring?.interval,
      };
    }

    // Case 2 — multi-currency price (currency_options)
    if (price.currency_options?.[currency]) {
      return {
        id: price.id,
        currency,
        amount: Number(
          (
            Number(
              price.currency_options?.[currency]?.unit_amount_decimal ?? 0,
            ) / 100
          ).toFixed(2),
        ),

        interval: price.recurring?.interval,
      };
    }

    // Not available
    return null;
  }

  async createSubscription(dto: {
    stripeCustomerId: string;
    priceId: string;
    planId?: string;
    userId?: string;
  }) {
    const session = await this.stripe.checkout.sessions.create({
      customer: dto.stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: dto.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      metadata: {
        userId: dto.userId,
        planId: dto.planId || '',
      },
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  }

  async verifySession(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    return {
      paymentStatus: session.payment_status,
      subscription: session?.subscription,
      customerEmail: session.customer_details?.email,
    };
  }
}
