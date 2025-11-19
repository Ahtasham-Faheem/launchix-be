import { Controller, Post, Body, Headers, Logger, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../../decorator/public.decorator';
import { WebhookService } from '../services/webhook.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post('stripe')
  @Public()
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: Request & { rawBody: Buffer },
  ) {
    this.logger.log('Received Stripe webhook');
    return this.webhookService.handleStripeWebhook(signature, request.rawBody);
  }
}
