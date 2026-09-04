import { Request, Response, NextFunction } from 'express';
import { siteSettingsService } from './settings.service.js';

export class SiteSettingsController {
  async getPublicSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await siteSettingsService.getPublicSettings();
      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  async getAllSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await siteSettingsService.getSettings();
      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await siteSettingsService.updateSettings(req.body, req.user?._id);
      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  async sendTestEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const targetEmail = email || req.user?.email;
      if (!targetEmail) {
        res.status(400).json({ success: false, error: { message: 'Recipient email is required' } });
        return;
      }
      const { emailService } = await import('../../services/email.service.js');
      const success = await emailService.sendTestEmail(targetEmail);
      res.json({
        success,
        message: success
          ? `Test email sent to ${targetEmail}. Check your Gmail inbox & spam folder!`
          : `Failed to deliver email. Please check your Gmail user & app password credentials.`
      });
    } catch (err) {
      next(err);
    }
  }
}

export const siteSettingsController = new SiteSettingsController();
