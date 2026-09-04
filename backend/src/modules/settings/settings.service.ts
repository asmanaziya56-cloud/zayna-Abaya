import { SiteSettings, ISiteSettings } from './settings.model.js';
import { logAuditEvent } from '../audit/audit.model.js';

export class SiteSettingsService {
  async getSettings(): Promise<ISiteSettings> {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    return settings;
  }

  async getPublicSettings() {
    const settings = await this.getSettings();
    return {
      brand: settings.brand,
      theme: settings.theme,
      announcementBar: settings.announcementBar,
      navbar: settings.navbar,
      heroSection: settings.heroSection,
      brandStory: (settings as any).brandStory,
      categoriesSection: (settings as any).categoriesSection,
      homepageSections: settings.homepageSections,
      footer: settings.footer,
      productPage: settings.productPage,
      buttons: (settings as any).buttons,
      contact: settings.contact,
      social: settings.social,
      instagramPosts: (settings as any).instagramPosts,
      shipping: {
        currency: settings.shipping.currency,
        currencySymbol: settings.shipping.currencySymbol,
        flatShippingRate: settings.shipping.flatShippingRate,
        freeShippingThreshold: settings.shipping.freeShippingThreshold,
        taxRatePercent: settings.shipping.taxRatePercent,
        estimatedDeliveryDays: settings.shipping.estimatedDeliveryDays
      },
      features: settings.features,
      policies: settings.policies,
      invoice: settings.invoice,
      faqs: settings.faqs
    };
  }

  async updateSettings(data: any, actorUserId?: string) {
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { $set: data },
      { new: true, upsert: true }
    );

    await logAuditEvent({
      actor: actorUserId,
      action: 'SITE_SETTINGS_UPDATED',
      resource: 'SiteSettings',
      resourceId: settings._id.toString(),
      metadata: { modifiedSections: Object.keys(data) }
    });

    return settings;
  }
}

export const siteSettingsService = new SiteSettingsService();
