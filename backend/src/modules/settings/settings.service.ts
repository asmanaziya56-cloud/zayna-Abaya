import { SiteSettings, ISiteSettings } from './settings.model.js';
import { logAuditEvent } from '../audit/audit.model.js';

let cachedPublicSettings: any = null;
let publicSettingsCacheTime = 0;

export class SiteSettingsService {
  async getSettings(): Promise<ISiteSettings> {
    let settings = await SiteSettings.findOne().lean();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    return settings as ISiteSettings;
  }

  async getPublicSettings() {
    const now = Date.now();
    if (cachedPublicSettings && now - publicSettingsCacheTime < 60000) {
      return cachedPublicSettings;
    }

    const settings = await this.getSettings();
    cachedPublicSettings = {
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
    publicSettingsCacheTime = now;
    return cachedPublicSettings;
  }

  async updateSettings(data: any, actorUserId?: string) {
    cachedPublicSettings = null;
    publicSettingsCacheTime = 0;
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
