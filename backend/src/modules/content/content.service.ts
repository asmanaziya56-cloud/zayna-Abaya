import { Announcement, HeroBanner, InstagramPost, FAQ } from './content.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class ContentService {
  async getHomepageContent() {
    const [announcement, banners, instagram, faqs] = await Promise.all([
      Announcement.findOne({ active: true }).sort({ updatedAt: -1 }).lean(),
      HeroBanner.find({ active: true }).sort({ sortOrder: 1 }).lean(),
      InstagramPost.find({ active: true }).sort({ sortOrder: 1 }).lean(),
      FAQ.find({ active: true }).sort({ sortOrder: 1 }).lean()
    ]);

    return {
      announcement,
      banners,
      instagram,
      faqs
    };
  }

  // Announcements
  async updateAnnouncement(data: any) {
    let announcement = await Announcement.findOne();
    if (!announcement) {
      announcement = await Announcement.create(data);
    } else {
      Object.assign(announcement, data);
      await announcement.save();
    }
    return announcement;
  }

  // Banners
  async getBanners() {
    return HeroBanner.find().sort({ sortOrder: 1 });
  }

  async createBanner(data: any) {
    return HeroBanner.create(data);
  }

  async updateBanner(id: string, data: any) {
    const banner = await HeroBanner.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!banner) throw new AppError({ message: 'Banner not found', statusCode: 404, code: 'NOT_FOUND' });
    return banner;
  }

  async deleteBanner(id: string) {
    const banner = await HeroBanner.findByIdAndDelete(id);
    if (!banner) throw new AppError({ message: 'Banner not found', statusCode: 404, code: 'NOT_FOUND' });
    return { success: true };
  }

  // Instagram
  async getInstagramPosts() {
    return InstagramPost.find().sort({ sortOrder: 1 });
  }

  async createInstagramPost(data: any) {
    return InstagramPost.create(data);
  }

  async deleteInstagramPost(id: string) {
    const post = await InstagramPost.findByIdAndDelete(id);
    if (!post) throw new AppError({ message: 'Instagram post not found', statusCode: 404, code: 'NOT_FOUND' });
    return { success: true };
  }

  // FAQs
  async getFAQs() {
    return FAQ.find().sort({ sortOrder: 1 });
  }

  async createFAQ(data: any) {
    return FAQ.create(data);
  }

  async updateFAQ(id: string, data: any) {
    const faq = await FAQ.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!faq) throw new AppError({ message: 'FAQ not found', statusCode: 404, code: 'NOT_FOUND' });
    return faq;
  }

  async deleteFAQ(id: string) {
    const faq = await FAQ.findByIdAndDelete(id);
    if (!faq) throw new AppError({ message: 'FAQ not found', statusCode: 404, code: 'NOT_FOUND' });
    return { success: true };
  }
}

export const contentService = new ContentService();
