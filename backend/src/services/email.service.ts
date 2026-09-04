import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  public initTransporter() {
    if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: env.GMAIL_USER,
          pass: env.GMAIL_APP_PASSWORD
        }
      });
      logger.info(`Gmail SMTP transport initialized with: ${env.GMAIL_USER}`);
    } else if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS
        }
      });
      logger.info(`Custom SMTP transport initialized with: ${env.SMTP_HOST}`);
    } else {
      this.transporter = null;
      logger.info('SMTP credentials not provided; using development console email logger');
    }
  }

  public isConfigured(): boolean {
    return this.transporter !== null;
  }

  async sendMail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    try {
      const fromAddress = env.GMAIL_USER ? `"Zayna Abaya" <${env.GMAIL_USER}>` : env.EMAIL_FROM;
      if (this.transporter) {
        await this.transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]*>?/gm, '')
        });
        logger.info(`Email sent to ${to}`, { subject });
        return true;
      } else {
        logger.info(`[DEV EMAIL MOCK] Sent to: ${to} | Subject: ${subject}`);
        return true;
      }
    } catch (error: any) {
      logger.error(`Failed to send email to ${to}`, { error: error.message });
      return false;
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const link = `${env.CLIENT_URL}/auth/verify-email?token=${token}`;
    const html = `
      <div style="font-family: 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #FAF7F2; border: 1px solid #E5E0D8; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0A1128; font-size: 24px; letter-spacing: 2px; margin: 0; text-transform: uppercase;">Zayna Abaya</h1>
          <p style="color: #C5A880; font-size: 11px; letter-spacing: 3px; margin-top: 4px; text-transform: uppercase;">Haute Modesty & Atelier</p>
        </div>
        <div style="background-color: #FFFFFF; padding: 28px; border-radius: 6px; border: 1px solid #E5E0D8; color: #1A1A1A;">
          <h2 style="font-size: 18px; color: #1A2F5A; margin-top: 0;">Welcome to Zayna Abaya</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #4A4A4A;">Thank you for creating an account with our boutique atelier. Please verify your email address to confirm your membership:</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${link}" style="background-color: #1A2F5A; color: #FFFFFF; padding: 12px 28px; font-size: 13px; font-weight: bold; letter-spacing: 1px; text-decoration: none; border-radius: 4px; display: inline-block;">VERIFY EMAIL ADDRESS</a>
          </div>
          <p style="font-size: 12px; color: #7f8c8d; line-height: 1.5;">Or copy and paste this link into your browser:<br><a href="${link}" style="color: #8E6E53;">${link}</a></p>
          <p style="font-size: 11px; color: #999999; margin-top: 24px; border-top: 1px solid #EEEEEE; padding-top: 12px;">This link will expire in 24 hours. If you did not create an account, please disregard this email.</p>
        </div>
      </div>
    `;
    return this.sendMail(email, 'Verify your Zayna Abaya account', html);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<{ sent: boolean; resetLink: string }> {
    const link = `${env.CLIENT_URL}/auth/reset-password?token=${token}`;
    const html = `
      <div style="font-family: 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #FAF7F2; border: 1px solid #E5E0D8; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0A1128; font-size: 24px; letter-spacing: 2px; margin: 0; text-transform: uppercase;">Zayna Abaya</h1>
          <p style="color: #C5A880; font-size: 11px; letter-spacing: 3px; margin-top: 4px; text-transform: uppercase;">Haute Modesty & Private Client Service</p>
        </div>
        <div style="background-color: #FFFFFF; padding: 28px; border-radius: 6px; border: 1px solid #E5E0D8; color: #1A1A1A;">
          <h2 style="font-size: 18px; color: #1A2F5A; margin-top: 0;">Password Reset Request</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #4A4A4A;">We received a request to reset your password for your Zayna Abaya client account.</p>
          <p style="font-size: 14px; line-height: 1.6; color: #4A4A4A;">Click the button below to choose a new password:</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${link}" style="background-color: #1A2F5A; color: #FFFFFF; padding: 12px 28px; font-size: 13px; font-weight: bold; letter-spacing: 1px; text-decoration: none; border-radius: 4px; display: inline-block;">RESET MY PASSWORD</a>
          </div>
          <p style="font-size: 12px; color: #7f8c8d; line-height: 1.5;">Or copy and paste this link into your browser:<br><a href="${link}" style="color: #8E6E53;">${link}</a></p>
          <p style="font-size: 11px; color: #999999; margin-top: 24px; border-top: 1px solid #EEEEEE; padding-top: 12px;">This password reset link will expire in 1 hour for your security. If you did not request a password reset, please ignore this email or reach out to our concierge support team.</p>
        </div>
      </div>
    `;
    const sent = await this.sendMail(email, 'Password Reset Instructions — Zayna Abaya', html);
    return { sent, resetLink: link };
  }

  async sendTestEmail(to: string): Promise<boolean> {
    const html = `
      <div style="font-family: 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #FAF7F2; border: 1px solid #E5E0D8; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0A1128; font-size: 24px; letter-spacing: 2px; margin: 0; text-transform: uppercase;">Zayna Abaya</h1>
          <p style="color: #C5A880; font-size: 11px; letter-spacing: 3px; margin-top: 4px; text-transform: uppercase;">Gmail Delivery Verification</p>
        </div>
        <div style="background-color: #FFFFFF; padding: 28px; border-radius: 6px; border: 1px solid #E5E0D8; color: #1A1A1A;">
          <h2 style="font-size: 18px; color: #1B3B2B; margin-top: 0;">✨ Gmail Delivery Confirmed!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #4A4A4A;">Your Gmail SMTP setup for Zayna Abaya is functioning properly. Staff password reset links, client notifications, and order updates will now be delivered directly to Gmail inboxes.</p>
          <p style="font-size: 12px; color: #7f8c8d; margin-top: 20px;">Sent at: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
    return this.sendMail(to, '✨ Zayna Abaya — Gmail Delivery Test', html);
  }

  async sendOrderConfirmationEmail(email: string, orderNumber: string, totalAmount: number): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Order Confirmed!</h2>
        <p>Thank you for choosing Zayna Abaya. Your order <strong>${orderNumber}</strong> has been received.</p>
        <p>Total amount: <strong>₹${(totalAmount / 100).toFixed(2)}</strong></p>
        <p>You can track the progress of your delivery on our website.</p>
      </div>
    `;
    return this.sendMail(email, `Order Confirmation - ${orderNumber}`, html);
  }
}

export const emailService = new EmailService();
