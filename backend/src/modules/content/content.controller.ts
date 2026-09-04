import { Request, Response, NextFunction } from 'express';
import { contentService } from './content.service.js';

export class ContentController {
  async getHomepageContent(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await contentService.getHomepageContent();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // Announcement
  async updateAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await contentService.updateAnnouncement(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // Banners
  async getBanners(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const banners = await contentService.getBanners();
      res.json({ success: true, data: banners });
    } catch (err) {
      next(err);
    }
  }

  async createBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const banner = await contentService.createBanner(req.body);
      res.status(201).json({ success: true, data: banner });
    } catch (err) {
      next(err);
    }
  }

  async updateBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const banner = await contentService.updateBanner(req.params.id as string, req.body);
      res.json({ success: true, data: banner });
    } catch (err) {
      next(err);
    }
  }

  async deleteBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await contentService.deleteBanner(req.params.id as string);
      res.json({ success: true, data: { message: 'Banner deleted' } });
    } catch (err) {
      next(err);
    }
  }

  // Instagram
  async getInstagramPosts(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const posts = await contentService.getInstagramPosts();
      res.json({ success: true, data: posts });
    } catch (err) {
      next(err);
    }
  }

  async createInstagramPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const post = await contentService.createInstagramPost(req.body);
      res.status(201).json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  }

  async deleteInstagramPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await contentService.deleteInstagramPost(req.params.id as string);
      res.json({ success: true, data: { message: 'Instagram post deleted' } });
    } catch (err) {
      next(err);
    }
  }

  // FAQs
  async getFAQs(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const faqs = await contentService.getFAQs();
      res.json({ success: true, data: faqs });
    } catch (err) {
      next(err);
    }
  }

  async createFAQ(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const faq = await contentService.createFAQ(req.body);
      res.status(201).json({ success: true, data: faq });
    } catch (err) {
      next(err);
    }
  }

  async updateFAQ(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const faq = await contentService.updateFAQ(req.params.id as string, req.body);
      res.json({ success: true, data: faq });
    } catch (err) {
      next(err);
    }
  }

  async deleteFAQ(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await contentService.deleteFAQ(req.params.id as string);
      res.json({ success: true, data: { message: 'FAQ deleted' } });
    } catch (err) {
      next(err);
    }
  }
}

export const contentController = new ContentController();
