// src/billing/billing.cron.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BillingService } from './services/billing.service';

@Injectable()
export class BillingCron {
  constructor(private readonly billing: BillingService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleOverdueInvoices() {
    await this.billing.markOverdueInvoices();
  }
}
