import { z } from 'zod';

export const updateSettingsSchema = z.object({
  brand: z
    .object({
      name: z.string().min(2).optional(),
      logoUrl: z.string().optional(),
      faviconUrl: z.string().optional(),
      tagline: z.string().optional()
    })
    .optional(),
  theme: z
    .object({
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
      accentColor: z.string().optional(),
      backgroundColor: z.string().optional(),
      fontFamily: z.string().optional()
    })
    .optional(),
  announcementBar: z
    .object({
      message: z.string().optional(),
      link: z.string().optional(),
      active: z.boolean().optional(),
      dismissible: z.boolean().optional(),
      bgColor: z.string().optional(),
      textColor: z.string().optional(),
      fontFamily: z.string().optional(),
      isMovable: z.boolean().optional(),
      scrollSpeed: z.enum(['slow', 'medium', 'fast']).optional(),
      textAlign: z.enum(['center', 'left', 'right']).optional()
    })
    .optional(),
  navbar: z
    .object({
      bgColor: z.string().optional(),
      textColor: z.string().optional(),
      borderColor: z.string().optional(),
      drawerBgColor: z.string().optional(),
      drawerTextColor: z.string().optional(),
      drawerAccentColor: z.string().optional(),
      drawerLinks: z
        .array(
          z.object({
            name: z.string(),
            href: z.string(),
            highlight: z.boolean().optional()
          })
        )
        .optional()
    })
    .optional(),
  heroSection: z
    .object({
      slides: z
        .array(
          z.object({
            _id: z.string().optional(),
            badgeText: z.string().optional(),
            title: z.string(),
            subtitle: z.string().optional(),
            mediaType: z.enum(['image', 'video']).default('image'),
            mediaUrl: z.string(),
            ctaText: z.string().default('Shop Now'),
            ctaLink: z.string().default('/shop'),
            secondaryCtaText: z.string().optional(),
            secondaryCtaLink: z.string().optional()
          })
        )
        .optional()
    })
    .optional(),
  brandStory: z
    .object({
      badgeText: z.string().optional(),
      title: z.string().optional(),
      paragraph1: z.string().optional(),
      paragraph2: z.string().optional(),
      stat1Value: z.string().optional(),
      stat1Label: z.string().optional(),
      stat2Value: z.string().optional(),
      stat2Label: z.string().optional(),
      ctaText: z.string().optional(),
      ctaLink: z.string().optional(),
      imageUrl: z.string().optional(),
      floatingCardTitle: z.string().optional(),
      floatingCardText: z.string().optional()
    })
    .optional(),
  categoriesSection: z
    .object({
      badgeText: z.string().optional(),
      title: z.string().optional()
    })
    .optional(),
  homepageSections: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        enabled: z.boolean(),
        order: z.number()
      })
    )
    .optional(),
  footer: z
    .object({
      bgColor: z.string().optional(),
      textColor: z.string().optional(),
      headingColor: z.string().optional(),
      showValueBadges: z.boolean().optional(),
      showBrandStory: z.boolean().optional(),
      showCollections: z.boolean().optional(),
      showCustomerCare: z.boolean().optional(),
      showNewsletter: z.boolean().optional(),
      customCopyright: z.string().optional(),
      contactEmail: z.string().optional(),
      contactPhone: z.string().optional(),
      contactAddress: z.string().optional()
    })
    .optional(),
  instagramPosts: z
    .array(
      z.object({
        _id: z.string().optional(),
        imageUrl: z.string().optional(),
        caption: z.string().optional(),
        postUrl: z.string().optional()
      })
    )
    .optional(),
  productPage: z
    .object({
      showYouMayAlsoAdmire: z.boolean().optional(),
      youMayAlsoAdmireTitle: z.string().optional(),
      youMayAlsoAdmireSubtitle: z.string().optional(),
      itemCount: z.number().int().positive().optional()
    })
    .optional(),
  buttons: z
    .object({
      addToCartText: z.string().optional(),
      addToCartBgColor: z.string().optional(),
      addToCartTextColor: z.string().optional(),
      buyNowText: z.string().optional(),
      buyNowBgColor: z.string().optional(),
      buyNowTextColor: z.string().optional(),
      quickAddText: z.string().optional(),
      quickAddBgColor: z.string().optional(),
      quickAddTextColor: z.string().optional()
    })
    .optional(),
  contact: z
    .object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      whatsappNumber: z.string().optional(),
      address: z.string().optional()
    })
    .optional(),
  social: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      pinterest: z.string().optional(),
      tiktok: z.string().optional()
    })
    .optional(),
  shipping: z
    .object({
      currency: z.string().optional(),
      currencySymbol: z.string().optional(),
      flatShippingRate: z.number().int().nonnegative().optional(),
      freeShippingThreshold: z.number().int().nonnegative().optional(),
      taxRatePercent: z.number().nonnegative().max(100).optional(),
      estimatedDeliveryDays: z.number().int().positive().optional()
    })
    .optional(),
  features: z
    .object({
      enableWishlist: z.boolean().optional(),
      enableReviews: z.boolean().optional(),
      enableGuestCheckout: z.boolean().optional(),
      enableNewsletter: z.boolean().optional()
    })
    .optional(),
  policies: z
    .object({
      privacyPolicy: z.string().optional(),
      termsAndConditions: z.string().optional(),
      returnPolicy: z.string().optional(),
      shippingPolicy: z.string().optional()
    })
    .optional(),
  invoice: z
    .object({
      badgeText: z.string().optional(),
      badgeBgColor: z.string().optional(),
      badgeTextColor: z.string().optional(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      estimatedDeliveryText: z.string().optional(),
      step1Title: z.string().optional(),
      step1Subtitle: z.string().optional(),
      step2Title: z.string().optional(),
      step2Subtitle: z.string().optional(),
      step3Title: z.string().optional(),
      step3Subtitle: z.string().optional(),
      btnTrackText: z.string().optional(),
      btnTrackBgColor: z.string().optional(),
      btnTrackTextColor: z.string().optional(),
      btnTrackLink: z.string().optional(),
      btnContinueText: z.string().optional(),
      btnContinueBgColor: z.string().optional(),
      btnContinueTextColor: z.string().optional(),
      btnContinueLink: z.string().optional(),
      showPrintInvoiceBtn: z.boolean().optional(),
      printInvoiceBtnText: z.string().optional(),
      printInvoiceBtnBgColor: z.string().optional(),
      printInvoiceBtnTextColor: z.string().optional(),
      supportEmail: z.string().optional(),
      supportPhone: z.string().optional(),
      supportNote: z.string().optional()
    })
    .optional(),
  faqs: z
    .array(
      z.object({
        _id: z.string().optional(),
        question: z.string(),
        answer: z.string(),
        category: z.string().optional(),
        sortOrder: z.number().optional(),
        active: z.boolean().optional()
      })
    )
    .optional()
});
