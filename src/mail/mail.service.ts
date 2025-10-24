import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('⚠️ RESEND_API_KEY not found in environment variables');
    }

    this.resend = new Resend(apiKey);
  }

  /**
   * ✅ Send verification email (Launchix AI)
   */
  async sendVerificationEmail(to: string, verificationCode: string) {
    try {
      const html = await this.renderTemplate('verification-email.hbs', {
        code: verificationCode,
        year: new Date().getFullYear(),
      });

      const from = this.configService.get<string>('EMAIL_FROM');
      const subject = 'Verify your email - Launchix AI';

      const response = await this.resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      this.logger.log(`Verification email sent to ${to}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending verification email:', error.stack || error);
      throw new InternalServerErrorException('Failed to send verification email');
    }
  }

  /**
   * ✅ Resend verification email (new code)
   */
  async resendVerificationEmail(to: string, newCode: string) {
    try {
      const html = await this.renderTemplate('verification-email.hbs', {
        code: newCode,
        year: new Date().getFullYear(),
        resend: true,
      });

      const from = this.configService.get<string>('EMAIL_FROM');
      const subject = 'Your new verification code - Launchix AI';

      const response = await this.resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      this.logger.log(`Resent verification email to ${to}`);
      return response;
    } catch (error) {
      this.logger.error('Error resending verification email:', error.stack || error);
      throw new InternalServerErrorException('Failed to resend verification email');
    }
  }

  /**
   * 🧩 Renders an HTML template using Handlebars
   */
  private async renderTemplate(templateName: string, context: any): Promise<string> {
    try {
      const templatePath = path.join(__dirname, `../templates/${templateName}`);
      const source = await fs.promises.readFile(templatePath, 'utf-8');
      const template = Handlebars.compile(source);
      return template(context);
    } catch (error) {
      this.logger.error(`Error rendering template ${templateName}:`, error);
      throw new InternalServerErrorException('Failed to render email template');
    }
  }
}
