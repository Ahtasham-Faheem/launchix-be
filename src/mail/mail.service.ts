import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { CONFIG } from 'src/config/constants';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(CONFIG.MAIL.RESEND_API_KEY);
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

      const response = await this.resend.emails.send({
        from: CONFIG.MAIL.EMAIL_FROM,
        to,
        subject: 'Verify your email - Launchix AI',
        html,
      });

      console.log('Verification email sent:', response);
      return response;
    } catch (error) {
      console.error('Error sending verification email:', error);
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

      const response = await this.resend.emails.send({
        from: CONFIG.MAIL.EMAIL_FROM,
        to,
        subject: 'Your new verification code - Launchix AI',
        html,
      });

      console.log('Resent verification email:', response);
      return response;
    } catch (error) {
      console.error('Error resending verification email:', error);
      throw new InternalServerErrorException('Failed to resend verification email');
    }
  }

  /**
   * 🧩 Renders an HTML template using Handlebars
   */
  private async renderTemplate(templateName: string, context: any): Promise<string> {
    const templatePath = path.join(__dirname, `../templates/${templateName}`);
    const source = await fs.promises.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(source);
    return template(context);
  }
}
