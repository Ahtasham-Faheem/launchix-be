import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { FeedbackDto } from './dto/feedback.dto';
import { SupportDto } from './dto/support.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private toEmail: string;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.toEmail = 'launchixai@gmail.com';
  }

  /** 🔹 Send Feedback Email */
  async sendFeedbackEmail(data: FeedbackDto) {
    const html = `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f8faff; padding: 24px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden;">
        <div style="background: linear-gradient(90deg, #0052cc, #0078ff); color: #fff; padding: 20px 28px;">
          <h2 style="margin: 0; font-weight: 600;">New Feedback Submission</h2>
        </div>
        <div style="padding: 28px;">
          <p style="font-size: 15px; color: #333; margin-bottom: 12px;">
            <strong>Message:</strong>
          </p>
          <div style="background:#f3f6fb; padding:16px; border-radius:8px; font-size:14px; color:#222;">
            ${data.message}
          </div>
          <p style="margin-top: 28px; font-size: 14px; color: #666;">
            Sent automatically via <strong>Launchix Feedback Portal</strong>.
          </p>
        </div>
        <div style="background:#f8faff; text-align:center; padding:14px;">
          <p style="font-size:12px; color:#999; margin:0;">© ${new Date().getFullYear()} Launchix.ai | All rights reserved</p>
        </div>
      </div>
    </div>`;

    try {
      const result = await this.sendEmail('New Feedback – Launchix', html);
      this.logger.log(`✅ Feedback email sent successfully. Message: "${data.message}"`);
      return result;
    } catch (err) {
      this.logger.error(`❌ Failed to send feedback email: ${err.message}`, err.stack);
      throw err;
    }
  }

  /** 🔸 Send Support Email */
  async sendSupportEmail(data: SupportDto) {
    const html = `
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f8faff; padding: 24px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden;">
        <div style="background: linear-gradient(90deg, #ff6a00, #ff8e53); color: #fff; padding: 20px 28px;">
          <h2 style="margin: 0; font-weight: 600;">New Support Request</h2>
        </div>
        <div style="padding: 28px;">
          <table style="width:100%; font-size:14px; color:#333;">
            <tr><td style="padding:6px 0;"><strong>Name:</strong></td><td>${data.name}</td></tr>
            <tr><td style="padding:6px 0;"><strong>Email:</strong></td><td>${data.email}</td></tr>
            <tr><td style="padding:6px 0; vertical-align:top;"><strong>Message:</strong></td><td>${data.message}</td></tr>
          </table>
          <p style="margin-top: 28px; font-size: 14px; color: #666;">
            Submitted via <strong>Launchix Support Center</strong>.
          </p>
        </div>
        <div style="background:#f8faff; text-align:center; padding:14px;">
          <p style="font-size:12px; color:#999; margin:0;">© ${new Date().getFullYear()} Launchix.ai | Support Desk</p>
        </div>
      </div>
    </div>`;

    try {
      const result = await this.sendEmail('New Support Request – Launchix', html);
      this.logger.log(`📨 Support email sent successfully from ${data.email}`);
      return result;
    } catch (err) {
      this.logger.error(`❌ Failed to send support email from ${data.email}: ${err.message}`, err.stack);
      throw err;
    }
  }

  /** 📧 Internal reusable send method */
  private async sendEmail(subject: string, html: string) {
    try {
      const response = await this.resend.emails.send({
        from: 'Launchix AI <no-reply@launchix.ai>',
        to: this.toEmail,
        subject,
        html,
      });

      this.logger.debug(`Resend API Response: ${JSON.stringify(response)}`);
      return response;
    } catch (error) {
      this.logger.error(`Resend API error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
