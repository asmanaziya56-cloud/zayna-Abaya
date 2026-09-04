export interface IProductVariant {
  _id?: string;
  size?: string;
  color?: string;
  sku: string;
  price: number; // in paise
  salePrice?: number;
  stock: number;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  variants: IProductVariant[];
  sku: string;
  price: number; // base price in paise
  salePrice?: number;
  stock: number;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  collectionId?: {
    _id: string;
    name: string;
    slug: string;
  };
  tags: string[];
  flags: {
    isBestseller: boolean;
    isFeatured: boolean;
    isNewArrival: boolean;
    isOnSale?: boolean;
  };
  fabricCare?: string;
  deliveryInfo?: string;
  createdAt: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  sortOrder: number;
  active: boolean;
}

export interface ICollection {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  bannerImage?: string;
  description?: string;
  sortOrder: number;
  active: boolean;
}

export interface ICartItem {
  _id?: string;
  productId: string;
  variantId?: string;
  title: string;
  size?: string;
  color?: string;
  price: number;
  quantity: number;
  image?: string;
  slug?: string;
}

export interface ICart {
  items: ICartItem[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  coupon?: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  };
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'superadmin' | 'staff';
  phone?: string;
  addresses?: IAddress[];
  isEmailVerified: boolean;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
}

export interface IAddress {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  guestEmail?: string;
  guestPhone?: string;
  items: {
    productId: string;
    variantId?: string;
    title: string;
    size?: string;
    color?: string;
    price: number;
    quantity: number;
    image?: string;
  }[];
  pricing: {
    subtotal: number;
    discountAmount: number;
    shippingAmount: number;
    taxAmount: number;
    totalAmount: number;
  };
  shippingAddress: IAddress;
  paymentStatus: 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded';
  fulfillmentStatus: 'unfulfilled' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking?: {
    courier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
  };
  createdAt: string;
}

export interface IAnnouncement {
  message: string;
  link?: string;
  active: boolean;
  dismissible: boolean;
}

export interface IHeroBanner {
  _id?: string;
  badgeText?: string;
  title: string;
  subtitle?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export interface IHeroSlide {
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
}

export interface IBrandStorySettings {
  badgeText?: string;
  title?: string;
  paragraph1?: string;
  paragraph2?: string;
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  floatingCardTitle?: string;
  floatingCardText?: string;
}

export interface ICategoriesSectionSettings {
  badgeText?: string;
  title?: string;
}

export interface IHomepageSection {
  _id?: string;
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export interface IFooterSettings {
  bgColor: string;
  textColor: string;
  headingColor?: string;
  showValueBadges: boolean;
  showBrandStory: boolean;
  showCollections: boolean;
  showCustomerCare: boolean;
  showNewsletter: boolean;
  customCopyright?: string;
  // Contact details editable from admin
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
}

export interface IInstagramPost {
  _id?: string;
  imageUrl: string;
  caption?: string;
  postUrl?: string;
}

export interface IFAQ {
  _id?: string;
  question: string;
  answer: string;
  category?: string;
  sortOrder?: number;
  active?: boolean;
}

export interface IInvoiceSettings {
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
}

export interface IButtonSettings {
  addToCartText?: string;
  addToCartBgColor?: string;
  addToCartTextColor?: string;
  buyNowText?: string;
  buyNowBgColor?: string;
  buyNowTextColor?: string;
  quickAddText?: string;
  quickAddBgColor?: string;
  quickAddTextColor?: string;
}

export interface ISiteSettings {
  brand: {
    name: string;
    tagline?: string;
    logoUrl?: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    fontFamily: string;
  };
  announcementBar?: {
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
  navbar?: {
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
  heroSection?: {
    slides: IHeroSlide[];
  };
  brandStory?: IBrandStorySettings;
  categoriesSection?: ICategoriesSectionSettings;
  homepageSections?: IHomepageSection[];
  footer?: IFooterSettings;
  productPage?: {
    showYouMayAlsoAdmire: boolean;
    youMayAlsoAdmireTitle: string;
    youMayAlsoAdmireSubtitle: string;
    itemCount: number;
  };
  buttons?: IButtonSettings;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  social?: {
    instagram?: string;
    facebook?: string;
    pinterest?: string;
    tiktok?: string;
  };
  instagramPosts?: IInstagramPost[];
  shipping: {
    currency: string;
    currencySymbol: string;
    flatShippingRate: number; // in paise
    freeShippingThreshold: number; // in paise
    taxRatePercent: number;
    estimatedDeliveryDays: number;
  };
  features: {
    enableWishlist: boolean;
    enableReviews: boolean;
    enableGuestCheckout: boolean;
    enableNewsletter: boolean;
  };
  invoice?: IInvoiceSettings;
  faqs?: IFAQ[];
}
