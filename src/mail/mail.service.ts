import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import { CONFIG } from 'src/config/constants';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (CONFIG.EMAIL.SERVICE === 'gmail') {
      console.log('Running GMAIL', console.log('Running CUSTOM SMTP', CONFIG.EMAIL))
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: CONFIG.EMAIL.USER,
          pass: CONFIG.EMAIL.PASS,
        },
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: CONFIG.EMAIL.SMTP.HOST,
        port: CONFIG.EMAIL.SMTP.PORT,
        secure: CONFIG.EMAIL.SMTP.SECURE,
        auth: {
          user: CONFIG.EMAIL.SMTP.USER,
          pass: CONFIG.EMAIL.SMTP.PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    }
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const resetUrl = `${CONFIG.FRONTEND_URL}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: `"X-Invoice" <${this.getSenderEmail()}>`,
      to: email,
      subject: 'Reset Password',
      text: `You requested a password reset. Please click the following link to reset your password: ${resetUrl}`,
    });
  }

  async sendVerificationEmail(to: string, verificationCode: string) {
    const mailOptions = {
      from: `"X-Invoice" <${this.getSenderEmail()}>`,
      to,
      subject: 'Verification Email',
      html: await this.generateEmailTemplate(verificationCode),
    };

    await this.transporter.sendMail(mailOptions);
  }

  private async generateEmailTemplate(verificationCode: string): Promise<string> {
    const filePath = path.join(__dirname, '../templates/verification-email.hbs');
    const templateSource = await fs.promises.readFile(filePath, 'utf-8');
    const template = Handlebars.compile(templateSource);
    return template({ code: verificationCode });
  }

  private getSenderEmail(): string {
    return CONFIG.EMAIL.SERVICE === 'gmail' ? CONFIG.EMAIL.USER : CONFIG.EMAIL.SMTP.USER;
  }
}
