import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
  brand: {
    name: string;
    logoUrl?: string;
    faviconUrl?: string;
    tagline?: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    fontFamily: string;
  };
  announcementBar: {
    message: string;
    link?: string;
    active: boolean;
    dismissible: boolean;
    bgColor: string;
    textColor: string;
    fontFamily: string;
    isMovable?: boolean;
    scrollSpeed?: 'slow' | 'medium' | 'fast';
    textAlign?: 'center' | 'left' | 'right';
  };
  navbar: {
    bgColor: string;
    textColor: string;
    borderColor: string;
    drawerBgColor?: string;
    drawerTextColor?: string;
    drawerAccentColor?: string;
    drawerLinks?: {
      name: string;
      href: string;
      highlight?: boolean;
    }[];
  };
  heroSection: {
    slides: {
      _id?: string;
      badgeText?: string;
      title: string;
      subtitle?: string;
      mediaType: 'image' | 'video';
      mediaUrl: string;
      ctaText: string;
      ctaLink: string;
      secondaryCtaText?: string;
      secondaryCtaLink?: string;
    }[];
  };
  brandStory: {
    badgeText: string;
    title: string;
    paragraph1: string;
    paragraph2: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    ctaText: string;
    ctaLink: string;
    imageUrl: string;
    floatingCardTitle: string;
    floatingCardText: string;
  };
  categoriesSection: {
    badgeText: string;
    title: string;
  };
  homepageSections: {
    id: string;
    name: string;
    enabled: boolean;
    order: number;
  }[];
  footer: {
    bgColor: string;
    textColor: string;
    headingColor?: string;
    showValueBadges: boolean;
    showBrandStory: boolean;
    showCollections: boolean;
    showCustomerCare: boolean;
    showNewsletter: boolean;
    customCopyright?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactAddress?: string;
  };
  instagramPosts?: {
    _id?: string;
    imageUrl?: string;
    caption?: string;
    postUrl?: string;
  }[];
  productPage: {
    showYouMayAlsoAdmire: boolean;
    youMayAlsoAdmireTitle: string;
    youMayAlsoAdmireSubtitle: string;
    itemCount: number;
  };
  buttons?: {
    addToCartText?: string;
    addToCartBgColor?: string;
    addToCartTextColor?: string;
    buyNowText?: string;
    buyNowBgColor?: string;
    buyNowTextColor?: string;
    quickAddText?: string;
    quickAddBgColor?: string;
    quickAddTextColor?: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsappNumber?: string;
    address?: string;
  };
  social: {
    instagram?: string;
    facebook?: string;
    pinterest?: string;
    tiktok?: string;
  };
  shipping: {
    currency: string;
    currencySymbol: string;
    flatShippingRate: number; // in paise (e.g. 10000 = ₹100)
    freeShippingThreshold: number; // in paise (e.g. 299900 = ₹2999)
    taxRatePercent: number; // e.g. 5 for 5%
    estimatedDeliveryDays: number;
  };
  features: {
    enableWishlist: boolean;
    enableReviews: boolean;
    enableGuestCheckout: boolean;
    enableNewsletter: boolean;
  };
  policies: {
    privacyPolicy?: string;
    termsAndConditions?: string;
    returnPolicy?: string;
    shippingPolicy?: string;
  };
  invoice?: {
    badgeText?: string;
    badgeBgColor?: string;
    badgeTextColor?: string;
    title?: string;
    subtitle?: string;
    estimatedDeliveryText?: string;
    step1Title?: string;
    step1Subtitle?: string;
    step2Title?: string;
    step2Subtitle?: string;
    step3Title?: string;
    step3Subtitle?: string;
    btnTrackText?: string;
    btnTrackBgColor?: string;
    btnTrackTextColor?: string;
    btnTrackLink?: string;
    btnContinueText?: string;
    btnContinueBgColor?: string;
    btnContinueTextColor?: string;
    btnContinueLink?: string;
    showPrintInvoiceBtn?: boolean;
    printInvoiceBtnText?: string;
    printInvoiceBtnBgColor?: string;
    printInvoiceBtnTextColor?: string;
    supportEmail?: string;
    supportPhone?: string;
    supportNote?: string;
  };
  faqs?: {
    _id?: string;
    question: string;
    answer: string;
    category?: string;
    sortOrder?: number;
    active?: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    brand: {
      name: { type: String, default: 'Zayna Abaya' },
      logoUrl: { type: String },
      faviconUrl: { type: String },
      tagline: { type: String, default: 'Elegance Redefined' }
    },
    theme: {
      primaryColor: { type: String, default: '#8E6E53' },
      secondaryColor: { type: String, default: '#2C3E50' },
      accentColor: { type: String, default: '#D4AF37' },
      backgroundColor: { type: String, default: '#FAF7F2' },
      fontFamily: { type: String, default: 'Cinzel, sans-serif' }
    },
    announcementBar: {
      message: {
        type: String,
        default: '✨ Complimentary Luxury Keepsake Box & Free Express Shipping on orders above ₹2,999 | Code: EIDMUBARAK'
      },
      link: { type: String, default: '/shop' },
      active: { type: Boolean, default: true },
      dismissible: { type: Boolean, default: true },
      bgColor: { type: String, default: '#8E6E53' },
      textColor: { type: String, default: '#FAF7F2' },
      fontFamily: { type: String, default: 'Cinzel, sans-serif' },
      isMovable: { type: Boolean, default: false },
      scrollSpeed: { type: String, enum: ['slow', 'medium', 'fast'], default: 'medium' },
      textAlign: { type: String, enum: ['center', 'left', 'right'], default: 'center' }
    },
    navbar: {
      bgColor: { type: String, default: '#FFFFFF' },
      textColor: { type: String, default: '#1A1A1A' },
      borderColor: { type: String, default: '#E5E0D8' },
      drawerBgColor: { type: String, default: '#1A2F5A' },
      drawerTextColor: { type: String, default: '#FFFFFF' },
      drawerAccentColor: { type: String, default: '#C5A880' },
      drawerLinks: {
        type: [
          {
            name: { type: String, required: true },
            href: { type: String, required: true },
            highlight: { type: Boolean, default: false }
          }
        ],
        default: [
          { name: 'Shop All Collections', href: '/shop', highlight: false },
          { name: 'Everyday Essentials', href: '/shop?category=everyday-essentials', highlight: false },
          { name: 'Luxury Occasion Wear', href: '/shop?category=luxury-occasion', highlight: false },
          { name: 'Open Front & Kimonos', href: '/shop?category=open-front-kimonos', highlight: false },
          { name: 'Eid & Festive Edits ✨', href: '/shop?category=eid-festive', highlight: true },
          { name: 'Silk & Chiffon Hijabs', href: '/shop?category=silk-chiffon-hijabs', highlight: false }
        ]
      }
    },
    heroSection: {
      slides: {
        type: [
          {
            badgeText: { type: String, default: 'Boutique Haute Couture' },
            title: { type: String, default: 'The Royal Noor Eid Edit' },
            subtitle: { type: String, default: 'Hand-embroidered silhouettes adorned with champagne zari & pure silk drape' },
            mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
            mediaUrl: {
              type: String,
              default: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1800&auto=format&fit=crop'
            },
            ctaText: { type: String, default: 'Explore Collection' },
            ctaLink: { type: String, default: '/shop?category=luxury-occasion' },
            secondaryCtaText: { type: String, default: 'View Lookbook' },
            secondaryCtaLink: { type: String, default: '/shop' }
          }
        ],
        default: [
          {
            badgeText: 'Boutique Haute Couture',
            title: 'The Royal Noor Eid Edit',
            subtitle: 'Hand-embroidered silhouettes adorned with champagne zari & pure silk drape',
            mediaType: 'image',
            mediaUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1800&auto=format&fit=crop',
            ctaText: 'Explore Collection',
            ctaLink: '/shop?category=luxury-occasion',
            secondaryCtaText: 'View Lookbook',
            secondaryCtaLink: '/shop'
          },
          {
            badgeText: 'Boutique Haute Couture',
            title: 'Everyday Minimalist Grace',
            subtitle: 'Crease-resistant Firdaus crepe tailored for modern everyday modesty',
            mediaType: 'image',
            mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1800&auto=format&fit=crop',
            ctaText: 'Shop Essentials',
            ctaLink: '/shop?category=everyday-essentials',
            secondaryCtaText: 'View Lookbook',
            secondaryCtaLink: '/shop'
          }
        ]
      }
    },
    brandStory: {
      badgeText: { type: String, default: 'Artisan Heritage' },
      title: { type: String, default: 'Where Modest Heritage Meets Modern Grandeur' },
      paragraph1: {
        type: String,
        default:
          'Founded on the principle that modesty is the purest expression of luxury, Zayna Abaya merges centuries of Arab tailoring traditions with sharp, minimalist silhouettes designed for the contemporary woman.'
      },
      paragraph2: {
        type: String,
        default:
          'Every garment in our atelier begins with ethically sourced textiles—whether custom-milled Korean Nidha, hand-woven organza, or liquid satin georgette. Our master artisans hand-stitch delicate gold-wire zari and French seams, ensuring every piece drapes with effortless distinction.'
      },
      stat1Value: { type: String, default: '100%' },
      stat1Label: { type: String, default: 'Opacity Tested' },
      stat2Value: { type: String, default: '35+' },
      stat2Label: { type: String, default: 'Hours Per Bridal Piece' },
      ctaText: { type: String, default: 'Explore The Atelier' },
      ctaLink: { type: String, default: '/shop' },
      imageUrl: {
        type: String,
        default: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1200&auto=format&fit=crop'
      },
      floatingCardTitle: { type: String, default: 'Pure Korean Nidha' },
      floatingCardText: {
        type: String,
        default: 'Featherweight, breathable, and woven with dense micro-fibers for 100% natural opacity without bulk.'
      }
    },
    categoriesSection: {
      badgeText: { type: String, default: 'Curated Categories' },
      title: { type: String, default: 'Designed for Every Occasion' }
    },
    homepageSections: {
      type: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          enabled: { type: Boolean, default: true },
          order: { type: Number, required: true }
        }
      ],
      default: [
        { id: 'hero', name: 'Hero Campaign (Image / Video)', enabled: true, order: 1 },
        { id: 'valueProps', name: 'Value Propositions', enabled: true, order: 2 },
        { id: 'categories', name: 'Curated Collections Showcase', enabled: true, order: 3 },
        { id: 'bestsellers', name: 'Coveted Bestsellers Grid', enabled: true, order: 4 },
        { id: 'brandStory', name: 'Atelier Craftsmanship Story', enabled: true, order: 5 },
        { id: 'instagram', name: 'Instagram Lookbook Journal', enabled: true, order: 6 },
        { id: 'faqs', name: 'Client Concierge & Sizing FAQs', enabled: true, order: 7 }
      ]
    },
    footer: {
      bgColor: { type: String, default: '#121212' },
      textColor: { type: String, default: '#FAF7F2' },
      headingColor: { type: String, default: '#C5A880' },
      showValueBadges: { type: Boolean, default: true },
      showBrandStory: { type: Boolean, default: true },
      showCollections: { type: Boolean, default: true },
      showCustomerCare: { type: Boolean, default: true },
      showNewsletter: { type: Boolean, default: true },
      customCopyright: { type: String, default: '' },
      contactEmail: { type: String },
      contactPhone: { type: String },
      contactAddress: { type: String }
    },
    instagramPosts: [
      {
        imageUrl: { type: String },
        caption: { type: String },
        postUrl: { type: String }
      }
    ],
    productPage: {
      showYouMayAlsoAdmire: { type: Boolean, default: true },
      youMayAlsoAdmireTitle: { type: String, default: 'You May Also Admire' },
      youMayAlsoAdmireSubtitle: { type: String, default: 'Complete The Look' },
      itemCount: { type: Number, default: 4 }
    },
    buttons: {
      addToCartText: { type: String, default: 'ADD TO SHOPPING BAG' },
      addToCartBgColor: { type: String, default: '#0B1B3D' },
      addToCartTextColor: { type: String, default: '#FFFFFF' },
      buyNowText: { type: String, default: 'INSTANT CHECKOUT' },
      buyNowBgColor: { type: String, default: '#0B1B3D' },
      buyNowTextColor: { type: String, default: '#FFFFFF' },
      quickAddText: { type: String, default: 'QUICK ADD TO BAG' },
      quickAddBgColor: { type: String, default: '#FFFFFF' },
      quickAddTextColor: { type: String, default: '#0A1128' }
    },
    contact: {
      email: { type: String, default: 'care@zaynaabaya.com' },
      phone: { type: String, default: '+91 9876543210' },
      whatsappNumber: { type: String },
      address: { type: String, default: 'Boutique House, Commercial Street, Bangalore, India' }
    },
    social: {
      instagram: { type: String },
      facebook: { type: String },
      pinterest: { type: String },
      tiktok: { type: String }
    },
    shipping: {
      currency: { type: String, default: 'INR' },
      currencySymbol: { type: String, default: '₹' },
      flatShippingRate: { type: Number, default: 10000 }, // ₹100
      freeShippingThreshold: { type: Number, default: 299900 }, // ₹2999
      taxRatePercent: { type: Number, default: 0 }, // Prices are all-inclusive (Taxes included)
      estimatedDeliveryDays: { type: Number, default: 5 }
    },
    features: {
      enableWishlist: { type: Boolean, default: true },
      enableReviews: { type: Boolean, default: true },
      enableGuestCheckout: { type: Boolean, default: true },
      enableNewsletter: { type: Boolean, default: true }
    },
    policies: {
      privacyPolicy: { type: String },
      termsAndConditions: { type: String },
      returnPolicy: { type: String },
      shippingPolicy: { type: String }
    },
    invoice: {
      badgeText: { type: String, default: 'Order Confirmed' },
      badgeBgColor: { type: String, default: '#ECFDF5' },
      badgeTextColor: { type: String, default: '#047857' },
      title: { type: String, default: 'Thank You For Choosing Zayna' },
      subtitle: {
        type: String,
        default: 'Your creation is being prepared with utmost care by our atelier artisans. An order receipt and live tracking updates have been dispatched to your email.'
      },
      estimatedDeliveryText: { type: String, default: '3 – 5 Business Days' },
      step1Title: { type: String, default: '1. Atelier Packing' },
      step1Subtitle: { type: String, default: 'Luxury Gift Box' },
      step2Title: { type: String, default: '2. Express Dispatch' },
      step2Subtitle: { type: String, default: 'Air Priority Cargo' },
      step3Title: { type: String, default: '3. Doorstep Arrival' },
      step3Subtitle: { type: String, default: 'Hassle-free fit exchange' },
      btnTrackText: { type: String, default: 'Track Delivery Timeline' },
      btnTrackBgColor: { type: String, default: '#FAF7F2' },
      btnTrackTextColor: { type: String, default: '#1A1A1A' },
      btnTrackLink: { type: String, default: '/track' },
      btnContinueText: { type: String, default: 'Continue Browsing' },
      btnContinueBgColor: { type: String, default: '#8E6E53' },
      btnContinueTextColor: { type: String, default: '#FFFFFF' },
      btnContinueLink: { type: String, default: '/shop' },
      showPrintInvoiceBtn: { type: Boolean, default: true },
      printInvoiceBtnText: { type: String, default: 'Print / Download Official Invoice' },
      printInvoiceBtnBgColor: { type: String, default: '#0B1B3D' },
      printInvoiceBtnTextColor: { type: String, default: '#FFFFFF' },
      supportEmail: { type: String, default: 'care@zaynaabaya.com' },
      supportPhone: { type: String, default: '+91 9876543210' },
      supportNote: {
        type: String,
        default: 'Need concierge support regarding your fit or custom adjustments? Our atelier team is here to assist.'
      }
    },
    faqs: {
      type: [
        {
          question: { type: String, required: true },
          answer: { type: String, required: true },
          category: { type: String, default: 'General' },
          sortOrder: { type: Number, default: 0 },
          active: { type: Boolean, default: true }
        }
      ],
      default: [
        {
          question: 'How do I choose the correct abaya size?',
          answer: "Abaya sizing is primarily based on total body height from shoulder to floor. Size 52 corresponds to height 5'0\" - 5'2\", Size 54 is 5'3\" - 5'4\", Size 56 is 5'5\" - 5'6\", and Size 58 is 5'7\" - 5'8\". If you prefer wearing heels, we recommend choosing one size up. Check our interactive Size Guide on any product page for exact bust and sleeve measurements.",
          category: 'Sizing & Fit'
        },
        {
          question: 'What premium fabrics do you use?',
          answer: 'We exclusively source genuine Korean Nidha, Japanese Firdaus Crepe, and Austrian Lenzing Modal Silk. All our textiles undergo rigorous opacity and breathability testing to ensure maximum modesty and comfort in all climates.',
          category: 'Fabrics & Quality'
        },
        {
          question: 'How long does shipping take and is it free?',
          answer: 'We offer complimentary express shipping on all orders over ₹2,999 across India. Orders are dispatched from Bangalore within 24-48 hours and arrive in 3-5 business days. Real-time tracking links are provided via SMS and email upon dispatch.',
          category: 'Shipping & Delivery'
        },
        {
          question: 'What is your return and exchange policy?',
          answer: 'We offer hassle-free 7-day exchanges for size and styling adjustments on unworn garments with original tags attached and in original packaging. Our courier partner arranges convenient doorstep pickup.',
          category: 'Exchanges & Returns'
        }
      ]
    }
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
