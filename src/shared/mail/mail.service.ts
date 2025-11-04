import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

// Avoid using import.meta so this file compiles under CommonJS/other TS module settings.
// Use the process current working directory as a safe runtime fallback for locating templates.

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private readonly templatesDir = path.join(process.cwd(), 'src', 'shared', 'mail', 'templates');

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('❌ RESEND_API_KEY not configured');
    this.resend = new Resend(apiKey);
  }

  /** Utility to load + compile a Handlebars HTML template */
  private compileTemplate(templateName: string, variables: Record<string, any>): string {
    const filePath = path.join(this.templatesDir, `${templateName}.html`);
    console.log('filePath', filePath);
    if (!fs.existsSync(filePath)) throw new Error(`Template not found: ${templateName}`);
    const html = fs.readFileSync(filePath, 'utf-8');
    const template = Handlebars.compile(html);
    return template(variables);
  }

  /** Send any custom email */
  async sendEmail({
    to,
    subject,
    template,
    variables,
  }: {
    to: string;
    subject: string;
    template: string;
    variables: Record<string, any>;
  }) {
    const html = this.compileTemplate(template, variables);
    await this.resend.emails.send({
      from: 'Launchix <noreply@launchix.ai>',
      to,
      subject,
      html,
    });
    this.logger.log(`📩 Email sent to ${to}: ${subject}`);
  }

  /** Prebuilt: Invoice Email */
  async sendInvoiceEmail(to: string, data: { amount: number; currency: string; dueDate: Date; invoiceId: string }) {
    const html = this.compileTemplate('invoice', {
      ...data,
      formattedAmount: (data.amount / 100).toFixed(2),
      dueDateFormatted: data.dueDate.toDateString(),
    });
    await this.resend.emails.send({
      from: 'Launchix Billing <billing@launchix.ai>',
      to,
      subject: `Invoice #${data.invoiceId} - Payment Due`,
      html,
    });
    this.logger.log(`📩 Invoice email sent to ${to}`);
  }

  /** Prebuilt: Overdue Invoice */
  async sendOverdueEmail(to: string, data: { amount: number; currency: string; invoiceId: string }) {
    const html = this.compileTemplate('overdue', {
      ...data,
      formattedAmount: (data.amount / 100).toFixed(2),
    });
    await this.resend.emails.send({
      from: 'Launchix Billing <billing@launchix.ai>',
      to,
      subject: `⚠️ Payment Overdue - Invoice #${data.invoiceId}`,
      html,
    });
    this.logger.warn(`⚠️ Overdue notice sent to ${to}`);
  }

  /** Prebuilt: Welcome Email */
  async sendWelcomeEmail(to: string, name: string) {
    const html = this.compileTemplate('welcome', { name });
    await this.resend.emails.send({
      from: 'Launchix <noreply@launchix.ai>',
      to,
      subject: `Welcome to Launchix 🚀`,
      html,
    });
  }
}
