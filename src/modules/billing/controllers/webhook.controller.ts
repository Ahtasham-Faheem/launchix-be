// src/billing/webhook.controller.ts
import { Controller, Post, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BillingService } from '../services/billing.service';
import { Request } from 'express';

@ApiTags('billing-webhook')
@Controller('billing/webhook')
export class BillingWebhookController {
  constructor(private readonly billing: BillingService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generic payment provider webhook endpoint',
    description:
      'Use this URL as the webhook target for Stripe/Paddle/etc. Parse event types (invoice.paid, invoice.payment_failed, subscription.canceled, etc.) and forward to BillingService.',
  })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(@Req() req: Request) {
    const event = req.body;

    // pseudo logic, you will adjust when you plug in provider:
    if (event.type === 'invoice.paid') {
      await this.billing.markInvoicePaid(event.data.invoiceId, event.data.providerInvoiceId);
    }
    // handle more events in future...

    return { received: true };
  }
}
