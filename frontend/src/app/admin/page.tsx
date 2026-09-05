'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Package,
  Boxes,
  BellRing,
  CheckCircle,
  Truck,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Plus,
  Trash2,
  Upload,
  X,
  Sparkles,
  Camera,
  Palette,
  Film,
  ArrowUp,
  ArrowDown,
  Eye,
  Sliders,
  Type,
  Layout,
  Check,
  Layers,
  Play,
  BookOpen,
  Grid,
  Edit3,
  Image as ImageIcon,
  ShoppingBag,
  ArrowRight,
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Percent,
  Flame,
  Users,
  UserCheck,
  UserX,
  Key,
  Mail,
  ShieldAlert,
  FileText,
  HelpCircle,
  Printer,
  ChevronDown,
  ChevronUp,
  Phone,
  Tag,
  Ticket
} from 'lucide-react';
import { useAuth } from '../../components/providers/AuthProvider';
import { ordersApi } from '../../lib/api/orders.api';
import { productsApi } from '../../lib/api/products.api';
import { contentApi } from '../../lib/api/content.api';
import { settingsApi } from '../../lib/api/settings.api';
import { usersApi, UserStats } from '../../lib/api/users.api';
import { couponsApi, ICouponData } from '../../lib/api/coupons.api';
import { IOrder, IProduct, ICategory, IUser, ISiteSettings, IHeroSlide, IHomepageSection, IFooterSettings } from '../../types';
import { formatINR } from '../../lib/utils/currency';

const LUXURY_COLOR_PRESETS = [
  { name: 'Noir Black', hex: '#1A1A1A' },
  { name: 'Emerald Green', hex: '#0B3B24' },
  { name: 'Deep Wine', hex: '#4A0E17' },
  { name: 'Sand Beige', hex: '#C2A382' },
  { name: 'Slate Navy', hex: '#1B263B' },
  { name: 'Rose Taupe', hex: '#8C5D63' },
  { name: 'Mocha Brown', hex: '#4A3728' },
  { name: 'Olive Green', hex: '#3D4529' },
  { name: 'Dusty Lilac', hex: '#7D6B7D' },
  { name: 'Pearl White', hex: '#EAE6DF' },
];

function getColorHex(name?: string): string {
  if (!name) return '#1A1A1A';
  const clean = name.toLowerCase().trim();
  const preset = LUXURY_COLOR_PRESETS.find(
    (p) => p.name.toLowerCase() === clean || clean.includes(p.name.toLowerCase().split(' ')[0])
  );
  if (preset) return preset.hex;
  if (clean.includes('black')) return '#1A1A1A';
  if (clean.includes('green')) return '#0B3B24';
  if (clean.includes('wine') || clean.includes('maroon') || clean.includes('burgundy')) return '#4A0E17';
  if (clean.includes('beige') || clean.includes('cream')) return '#C2A382';
  if (clean.includes('navy') || clean.includes('blue')) return '#1B263B';
  if (clean.includes('rose') || clean.includes('pink')) return '#8C5D63';
  if (clean.includes('white')) return '#EAE6DF';
  return '#8E6E53';
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'storefront' | 'products' | 'orders' | 'analytics' | 'staff' | 'coupons'>('storefront');
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'7d' | '30d' | 'all'>('30d');

  // Coupons state
  const [coupons, setCoupons] = useState<ICouponData[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxUses: '',
    active: true
  });
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [couponSearchQuery, setCouponSearchQuery] = useState('');

  // Orders state
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Products state
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Storefront Designer Sub-Tabs & Settings
  const [siteSettings, setSiteSettings] = useState<ISiteSettings | null>(null);
  const [designerSubTab, setDesignerSubTab] = useState<
    'announcement' | 'hero' | 'categories' | 'brandStory' | 'layout' | 'navbar' | 'footer' | 'recommendations' | 'instagram' | 'buttons' | 'invoice' | 'faqs'
  >('announcement');
  const [savingDesigner, setSavingDesigner] = useState(false);
  const [designerNotice, setDesignerNotice] = useState('');
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementNotice, setAnnouncementNotice] = useState('');

  // Announcement Bar Studio Fields
  const [announcementMsg, setAnnouncementMsg] = useState('✨ Complimentary Luxury Keepsake Box & Free Express Shipping on orders above ₹2,999 | Code: EIDMUBARAK');
  const [announcementLink, setAnnouncementLink] = useState('/shop');
  const [announcementActive, setAnnouncementActive] = useState(true);
  const [announcementDismissible, setAnnouncementDismissible] = useState(true);
  const [announcementBgColor, setAnnouncementBgColor] = useState('#8E6E53');
  const [announcementTextColor, setAnnouncementTextColor] = useState('#FAF7F2');
  const [announcementFont, setAnnouncementFont] = useState('Cinzel, sans-serif');
  const [announcementIsMovable, setAnnouncementIsMovable] = useState(false);
  const [announcementScrollSpeed, setAnnouncementScrollSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [announcementTextAlign, setAnnouncementTextAlign] = useState<'center' | 'left' | 'right'>('center');

  // Hero Section Media Manager Fields
  const [heroSlides, setHeroSlides] = useState<IHeroSlide[]>([
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
  ]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [uploadingHeroMedia, setUploadingHeroMedia] = useState(false);
  const heroMediaInputRef = useRef<HTMLInputElement>(null);

  // Brand Story & Atelier Heritage Fields (2nd screenshot)
  const [storyBadge, setStoryBadge] = useState('Artisan Heritage');
  const [storyTitle, setStoryTitle] = useState('Where Modest Heritage Meets Modern Grandeur');
  const [storyP1, setStoryP1] = useState(
    'Founded on the principle that modesty is the purest expression of luxury, Zayna Abaya merges centuries of Arab tailoring traditions with sharp, minimalist silhouettes designed for the contemporary woman.'
  );
  const [storyP2, setStoryP2] = useState(
    'Every garment in our atelier begins with ethically sourced textiles—whether custom-milled Korean Nidha, hand-woven organza, or liquid satin georgette. Our master artisans hand-stitch delicate gold-wire zari and French seams, ensuring every piece drapes with effortless distinction.'
  );
  const [storyStat1Val, setStoryStat1Val] = useState('100%');
  const [storyStat1Lbl, setStoryStat1Lbl] = useState('Opacity Tested');
  const [storyStat2Val, setStoryStat2Val] = useState('35+');
  const [storyStat2Lbl, setStoryStat2Lbl] = useState('Hours Per Bridal Piece');
  const [storyCtaText, setStoryCtaText] = useState('Explore The Atelier');
  const [storyCtaLink, setStoryCtaLink] = useState('/shop');
  const [storyImage, setStoryImage] = useState(
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1200&auto=format&fit=crop'
  );
  const [storyCardTitle, setStoryCardTitle] = useState('Pure Korean Nidha');
  const [storyCardText, setStoryCardText] = useState(
    'Featherweight, breathable, and woven with dense micro-fibers for 100% natural opacity without bulk.'
  );
  const [uploadingStoryImage, setUploadingStoryImage] = useState(false);
  const storyImageInputRef = useRef<HTMLInputElement>(null);

  // Curated Categories Fields (3rd screenshot)
  const [categoriesBadge, setCategoriesBadge] = useState('Curated Categories');
  const [categoriesTitle, setCategoriesTitle] = useState('Designed for Every Occasion');
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);
  const [uploadingCatImage, setUploadingCatImage] = useState(false);
  const catImageInputRef = useRef<HTMLInputElement>(null);

  // Homepage Layout Section Shuffler
  const [homepageSections, setHomepageSections] = useState<IHomepageSection[]>([
    { id: 'hero', name: 'Hero Campaign (Image / Video)', enabled: true, order: 1 },
    { id: 'valueProps', name: 'Value Propositions Strip', enabled: true, order: 2 },
    { id: 'categories', name: 'Curated Collections Showcase', enabled: true, order: 3 },
    { id: 'bestsellers', name: 'Coveted Bestsellers Grid', enabled: true, order: 4 },
    { id: 'brandStory', name: 'Atelier Craftsmanship Story', enabled: true, order: 5 },
    { id: 'instagram', name: 'Instagram Lookbook Journal', enabled: true, order: 6 },
    { id: 'faqs', name: 'Client Concierge & Sizing FAQs', enabled: true, order: 7 }
  ]);

  // Navbar & Storefront Theme Fields
  const [navbarBgColor, setNavbarBgColor] = useState('#FFFFFF');
  const [navbarTextColor, setNavbarTextColor] = useState('#1A1A1A');
  const [navbarBorderColor, setNavbarBorderColor] = useState('#E5E0D8');
  const [drawerBgColor, setDrawerBgColor] = useState('#1A2F5A');
  const [drawerTextColor, setDrawerTextColor] = useState('#FFFFFF');
  const [drawerAccentColor, setDrawerAccentColor] = useState('#C5A880');
  const [drawerLinks, setDrawerLinks] = useState<Array<{ name: string; href: string; highlight?: boolean }>>([
    { name: 'Shop All Collections', href: '/shop', highlight: false },
    { name: 'Everyday Essentials', href: '/shop?category=everyday-essentials', highlight: false },
    { name: 'Luxury Occasion Wear', href: '/shop?category=luxury-occasion', highlight: false },
    { name: 'Open Front & Kimonos', href: '/shop?category=open-front-kimonos', highlight: false },
    { name: 'Eid & Festive Edits ✨', href: '/shop?category=eid-festive', highlight: true },
    { name: 'Silk & Chiffon Hijabs', href: '/shop?category=silk-chiffon-hijabs', highlight: false }
  ]);
  const [brandName, setBrandName] = useState('Zayna Abaya');
  const [brandTagline, setBrandTagline] = useState('Elegance Redefined');
  const [primaryColor, setPrimaryColor] = useState('#8E6E53');
  const [accentColor, setAccentColor] = useState('#D4AF37');
  const [backgroundColor, setBackgroundColor] = useState('#FAF7F2');

  // Footer Builder Fields ("What I want / what I don't want")
  const [footerBgColor, setFooterBgColor] = useState('#121212');
  const [footerTextColor, setFooterTextColor] = useState('#FAF7F2');
  const [footerHeadingColor, setFooterHeadingColor] = useState('#C5A880');
  const [footerShowValueBadges, setFooterShowValueBadges] = useState(true);
  const [footerShowBrandStory, setFooterShowBrandStory] = useState(true);
  const [footerShowCollections, setFooterShowCollections] = useState(true);
  const [footerShowCustomerCare, setFooterShowCustomerCare] = useState(true);
  const [footerShowNewsletter, setFooterShowNewsletter] = useState(true);
  const [footerCustomCopyright, setFooterCustomCopyright] = useState('');
  const [footerContactEmail, setFooterContactEmail] = useState('care@zaynaabaya.com');
  const [footerContactPhone, setFooterContactPhone] = useState('+91 9876543210');
  const [footerContactAddress, setFooterContactAddress] = useState('Commercial Street, Bangalore, India');

  // Instagram Gallery
  const [instagramHandle, setInstagramHandle] = useState('zaynaabaya');
  const [instagramPosts, setInstagramPosts] = useState([
    { imageUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600&auto=format&fit=crop', caption: 'Everyday elegance', postUrl: '' },
    { imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop', caption: 'Gold zari handcrafted cuffs', postUrl: '' },
    { imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop', caption: 'Desert linen kimono drape', postUrl: '' },
    { imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop', caption: 'Pure modal silk sheylas', postUrl: '' }
  ]);

  const [uploadingInstaIndex, setUploadingInstaIndex] = useState<number | null>(null);

  // Button Customization Fields (Product Detail & Card CTAs)
  const [btnAddToCartText, setBtnAddToCartText] = useState('ADD TO SHOPPING BAG');
  const [btnAddToCartBgColor, setBtnAddToCartBgColor] = useState('#0B1B3D');
  const [btnAddToCartTextColor, setBtnAddToCartTextColor] = useState('#FFFFFF');

  const [btnBuyNowText, setBtnBuyNowText] = useState('INSTANT CHECKOUT');
  const [btnBuyNowBgColor, setBtnBuyNowBgColor] = useState('#0B1B3D');
  const [btnBuyNowTextColor, setBtnBuyNowTextColor] = useState('#FFFFFF');

  const [btnQuickAddText, setBtnQuickAddText] = useState('QUICK ADD TO BAG');
  const [btnQuickAddBgColor, setBtnQuickAddBgColor] = useState('#FFFFFF');
  const [btnQuickAddTextColor, setBtnQuickAddTextColor] = useState('#0A1128');

  // Product Recommendations ("You May Also Admire")
  const [showYouMayAlsoAdmire, setShowYouMayAlsoAdmire] = useState(true);
  const [youMayAlsoAdmireTitle, setYouMayAlsoAdmireTitle] = useState('You May Also Admire');
  const [youMayAlsoAdmireSubtitle, setYouMayAlsoAdmireSubtitle] = useState('Complete The Look');
  const [itemCount, setItemCount] = useState(4);

  // Invoice & Order Confirmation Studio Fields
  const [invoiceBadge, setInvoiceBadge] = useState('Order Confirmed');
  const [invoiceBadgeBg, setInvoiceBadgeBg] = useState('#ECFDF5');
  const [invoiceBadgeTextColor, setInvoiceBadgeTextColor] = useState('#047857');
  const [invoiceTitle, setInvoiceTitle] = useState('Thank You For Choosing Zayna');
  const [invoiceSubtitle, setInvoiceSubtitle] = useState(
    'Your creation is being prepared with utmost care by our atelier artisans. An order receipt and live tracking updates have been dispatched to your email.'
  );
  const [invoiceDeliveryText, setInvoiceDeliveryText] = useState('3 – 5 Business Days');
  const [invoiceStep1Title, setInvoiceStep1Title] = useState('1. Atelier Packing');
  const [invoiceStep1Sub, setInvoiceStep1Sub] = useState('Luxury Gift Box');
  const [invoiceStep2Title, setInvoiceStep2Title] = useState('2. Express Dispatch');
  const [invoiceStep2Sub, setInvoiceStep2Sub] = useState('Air Priority Cargo');
  const [invoiceStep3Title, setInvoiceStep3Title] = useState('3. Doorstep Arrival');
  const [invoiceStep3Sub, setInvoiceStep3Sub] = useState('Hassle-free fit exchange');

  const [invoiceBtnTrackText, setInvoiceBtnTrackText] = useState('Track Delivery Timeline');
  const [invoiceBtnTrackBg, setInvoiceBtnTrackBg] = useState('#FAF7F2');
  const [invoiceBtnTrackTextColor, setInvoiceBtnTrackTextColor] = useState('#1A1A1A');
  const [invoiceBtnTrackLink, setInvoiceBtnTrackLink] = useState('/track');

  const [invoiceBtnContText, setInvoiceBtnContText] = useState('Continue Browsing');
  const [invoiceBtnContBg, setInvoiceBtnContBg] = useState('#8E6E53');
  const [invoiceBtnContTextColor, setInvoiceBtnContTextColor] = useState('#FFFFFF');
  const [invoiceBtnContLink, setInvoiceBtnContLink] = useState('/shop');

  const [invoiceShowPrintBtn, setInvoiceShowPrintBtn] = useState(true);
  const [invoicePrintBtnText, setInvoicePrintBtnText] = useState('Print / Download Official Invoice');
  const [invoicePrintBtnBg, setInvoicePrintBtnBg] = useState('#0B1B3D');
  const [invoicePrintBtnTextColor, setInvoicePrintBtnTextColor] = useState('#FFFFFF');

  const [invoiceSupportEmail, setInvoiceSupportEmail] = useState('care@zaynaabaya.com');
  const [invoiceSupportPhone, setInvoiceSupportPhone] = useState('+91 9876543210');
  const [invoiceSupportNote, setInvoiceSupportNote] = useState(
    'Need concierge support regarding your fit or custom adjustments? Our atelier team is here to assist.'
  );

  // Concierge FAQs Studio Fields
  const [faqsList, setFaqsList] = useState<Array<{ _id?: string; question: string; answer: string; category?: string }>>([
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
  ]);
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState('General');

  // Selected order details view modal
  const [viewingOrder, setViewingOrder] = useState<IOrder | null>(null);

  // Selected order fulfillment update modal
  const [editingOrder, setEditingOrder] = useState<IOrder | null>(null);
  const [newStatus, setNewStatus] = useState('processing');
  const [courier, setCourier] = useState('BlueDart Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updatingFulfillment, setUpdatingFulfillment] = useState(false);

  // Staff & Team Access Management
  const [usersList, setUsersList] = useState<IUser[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalStaff: 0,
    totalAdmins: 0,
    totalCustomers: 0,
    suspendedCount: 0
  });
  const [usersLoading, setUsersLoading] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'staff_admin' | 'staff' | 'admin' | 'customer'>('staff_admin');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [staffNotice, setStaffNotice] = useState('');

  // Add Staff Modal state
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'staff' | 'admin'>('staff');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffSendReset, setNewStaffSendReset] = useState(true);
  const [savingStaff, setSavingStaff] = useState(false);

  // Gmail Test Email state
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailNotice, setTestEmailNotice] = useState('');

  // New Product Modal state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [formNotice, setFormNotice] = useState('');
  const [formError, setFormError] = useState('');

  // Add Product Form fields
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodPriceINR, setProdPriceINR] = useState('');
  const [prodSalePriceINR, setProdSalePriceINR] = useState('');
  const [prodStock, setProdStock] = useState('25');
  const [prodDescription, setProdDescription] = useState('');
  const [prodFabricCare, setProdFabricCare] = useState('Pure Korean Nidha & Silk blend. Dry clean or delicate hand wash cold.');
  const [prodDeliveryInfo, setProdDeliveryInfo] = useState('Dispatched within 24-48 hours. Delivered in 3-5 business days across India.');
  const [prodColors, setProdColors] = useState<Array<{ name: string; hex: string }>>([
    { name: 'Noir Black', hex: '#1A1A1A' }
  ]);
  const [defaultColorIndex, setDefaultColorIndex] = useState(0);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#1A1A1A');
  const [prodSizes, setProdSizes] = useState<string[]>(['52', '54', '56', '58', '60']);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isFeatured, setIsFeatured] = useState(true);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isOnSale, setIsOnSale] = useState(false);

  // Direct Multiple Pictures & Video Upload State
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prodVideos, setProdVideos] = useState<string[]>([]);
  const [prodVideoInputUrl, setProdVideoInputUrl] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdCategory, setEditProdCategory] = useState('');
  const [editProdPriceINR, setEditProdPriceINR] = useState('');
  const [editProdSalePriceINR, setEditProdSalePriceINR] = useState('');
  const [editProdStock, setEditProdStock] = useState('20');
  const [editProdDescription, setEditProdDescription] = useState('');
  const [editProdFabricCare, setEditProdFabricCare] = useState('');
  const [editProdDeliveryInfo, setEditProdDeliveryInfo] = useState('');
  const [editProdSizes, setEditProdSizes] = useState<string[]>(['52', '54', '56', '58', '60']);
  const [editProdColors, setEditProdColors] = useState<Array<{ name: string; hex: string }>>([
    { name: 'Noir Black', hex: '#1A1A1A' }
  ]);
  const [editDefaultColorIndex, setEditDefaultColorIndex] = useState(0);
  const [editCustomColorName, setEditCustomColorName] = useState('');
  const [editCustomColorHex, setEditCustomColorHex] = useState('#1A1A1A');
  const [editIsBestseller, setEditIsBestseller] = useState(false);
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editIsNewArrival, setEditIsNewArrival] = useState(false);
  const [editIsOnSale, setEditIsOnSale] = useState(false);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [editProdVideos, setEditProdVideos] = useState<string[]>([]);
  const [editProdVideoInputUrl, setEditProdVideoInputUrl] = useState('');
  const [editUploadingVideo, setEditUploadingVideo] = useState(false);
  const [savingEditProduct, setSavingEditProduct] = useState(false);
  const [editFormError, setEditFormError] = useState('');
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editVideoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    setOrdersLoading(true);
    setProductsLoading(true);
    setCouponsLoading(true);

    try {
      const [ordListResult, prodResResult, contentResResult, catsResult, settingsResResult, couponsResResult] = await Promise.allSettled([
        ordersApi.getAdminOrders(),
        productsApi.getProducts({ limit: 100 }),
        contentApi.getHomepageContent(),
        productsApi.getCategories(),
        settingsApi.getPublicSettings(),
        couponsApi.getCoupons()
      ]);

      if (ordListResult.status === 'fulfilled') {
        setOrders(ordListResult.value);
      }
      if (prodResResult.status === 'fulfilled') {
        setProducts(prodResResult.value.products);
      }
      if (catsResult.status === 'fulfilled') {
        setCategories(catsResult.value);
        if (catsResult.value.length > 0 && !prodCategory) {
          setProdCategory(catsResult.value[0]._id);
        }
      }
      if (couponsResResult.status === 'fulfilled') {
        setCoupons(couponsResResult.value);
      }

      // Populate Settings & Customizations
      if (settingsResResult.status === 'fulfilled' && settingsResResult.value) {
        const s = settingsResResult.value;
        setSiteSettings(s);

        // Announcement Bar
        if (s.announcementBar) {
          if (s.announcementBar.message) setAnnouncementMsg(s.announcementBar.message);
          if (s.announcementBar.link) setAnnouncementLink(s.announcementBar.link);
          setAnnouncementActive(s.announcementBar.active !== false);
          setAnnouncementDismissible(s.announcementBar.dismissible !== false);
          if (s.announcementBar.bgColor) setAnnouncementBgColor(s.announcementBar.bgColor);
          if (s.announcementBar.textColor) setAnnouncementTextColor(s.announcementBar.textColor);
          if (s.announcementBar.fontFamily) setAnnouncementFont(s.announcementBar.fontFamily);
          if (typeof s.announcementBar.isMovable === 'boolean') setAnnouncementIsMovable(s.announcementBar.isMovable);
          if (s.announcementBar.scrollSpeed) setAnnouncementScrollSpeed(s.announcementBar.scrollSpeed);
          if (s.announcementBar.textAlign) setAnnouncementTextAlign(s.announcementBar.textAlign);
        }

        // Hero Section
        if (s.heroSection?.slides && s.heroSection.slides.length > 0) {
          setHeroSlides(s.heroSection.slides);
        }

        // Brand Story
        if (s.brandStory) {
          if (s.brandStory.badgeText) setStoryBadge(s.brandStory.badgeText);
          if (s.brandStory.title) setStoryTitle(s.brandStory.title);
          if (s.brandStory.paragraph1) setStoryP1(s.brandStory.paragraph1);
          if (s.brandStory.paragraph2) setStoryP2(s.brandStory.paragraph2);
          if (s.brandStory.stat1Value) setStoryStat1Val(s.brandStory.stat1Value);
          if (s.brandStory.stat1Label) setStoryStat1Lbl(s.brandStory.stat1Label);
          if (s.brandStory.stat2Value) setStoryStat2Val(s.brandStory.stat2Value);
          if (s.brandStory.stat2Label) setStoryStat2Lbl(s.brandStory.stat2Label);
          if (s.brandStory.ctaText) setStoryCtaText(s.brandStory.ctaText);
          if (s.brandStory.ctaLink) setStoryCtaLink(s.brandStory.ctaLink);
          if (s.brandStory.imageUrl) setStoryImage(s.brandStory.imageUrl);
          if (s.brandStory.floatingCardTitle) setStoryCardTitle(s.brandStory.floatingCardTitle);
          if (s.brandStory.floatingCardText) setStoryCardText(s.brandStory.floatingCardText);
        }

        // Categories Section
        if (s.categoriesSection) {
          if (s.categoriesSection.badgeText) setCategoriesBadge(s.categoriesSection.badgeText);
          if (s.categoriesSection.title) setCategoriesTitle(s.categoriesSection.title);
        }

        // Homepage Layout Sections (filter out announcement bar which has its own dedicated studio tab)
        if (s.homepageSections && s.homepageSections.length > 0) {
          const filtered = s.homepageSections.filter((sec) => sec.id !== 'announcement');
          setHomepageSections(filtered.sort((a, b) => a.order - b.order));
        }

        // Navbar & Theme
        if (s.navbar) {
          if (s.navbar.bgColor) setNavbarBgColor(s.navbar.bgColor);
          if (s.navbar.textColor) setNavbarTextColor(s.navbar.textColor);
          if (s.navbar.borderColor) setNavbarBorderColor(s.navbar.borderColor);
          if (s.navbar.drawerBgColor) setDrawerBgColor(s.navbar.drawerBgColor);
          if (s.navbar.drawerTextColor) setDrawerTextColor(s.navbar.drawerTextColor);
          if (s.navbar.drawerAccentColor) setDrawerAccentColor(s.navbar.drawerAccentColor);
          if (s.navbar.drawerLinks && s.navbar.drawerLinks.length > 0) {
            setDrawerLinks(s.navbar.drawerLinks);
          }
        }
        if (s.brand?.name) setBrandName(s.brand.name);
        if (s.brand?.tagline) setBrandTagline(s.brand.tagline);
        if (s.theme?.primaryColor) setPrimaryColor(s.theme.primaryColor);
        if (s.theme?.accentColor) setAccentColor(s.theme.accentColor);
        if (s.theme?.backgroundColor) setBackgroundColor(s.theme.backgroundColor);

        // Footer
        if (s.footer) {
          if (s.footer.bgColor) setFooterBgColor(s.footer.bgColor);
          if (s.footer.textColor) setFooterTextColor(s.footer.textColor);
          if (s.footer.headingColor) setFooterHeadingColor(s.footer.headingColor);
          setFooterShowValueBadges(s.footer.showValueBadges !== false);
          setFooterShowBrandStory(s.footer.showBrandStory !== false);
          setFooterShowCollections(s.footer.showCollections !== false);
          setFooterShowCustomerCare(s.footer.showCustomerCare !== false);
          setFooterShowNewsletter(s.footer.showNewsletter !== false);
          if (s.footer.customCopyright) setFooterCustomCopyright(s.footer.customCopyright);
          if (s.footer.contactEmail) setFooterContactEmail(s.footer.contactEmail);
          if (s.footer.contactPhone) setFooterContactPhone(s.footer.contactPhone);
          if (s.footer.contactAddress) setFooterContactAddress(s.footer.contactAddress);
        }
        // Fallback footer contact from contact section
        if (!s.footer?.contactEmail && s.contact?.email) setFooterContactEmail(s.contact.email);
        if (!s.footer?.contactPhone && s.contact?.phone) setFooterContactPhone(s.contact.phone);
        if (!s.footer?.contactAddress && s.contact?.address) setFooterContactAddress(s.contact.address);

        // Instagram Gallery
        if (s.social?.instagram) {
          const raw = s.social.instagram.replace('@', '').replace('https://instagram.com/', '').replace('https://www.instagram.com/', '');
          setInstagramHandle(raw);
        }
        if (s.instagramPosts && s.instagramPosts.length > 0) {
          setInstagramPosts(s.instagramPosts.map((p) => ({ imageUrl: p.imageUrl, caption: p.caption || '', postUrl: p.postUrl || '' })));
        }

        // Product Page Recommendations
        if (s.productPage) {
          setShowYouMayAlsoAdmire(s.productPage.showYouMayAlsoAdmire !== false);
          if (s.productPage.youMayAlsoAdmireTitle) setYouMayAlsoAdmireTitle(s.productPage.youMayAlsoAdmireTitle);
          if (s.productPage.youMayAlsoAdmireSubtitle) setYouMayAlsoAdmireSubtitle(s.productPage.youMayAlsoAdmireSubtitle);
          if (s.productPage.itemCount) setItemCount(s.productPage.itemCount);
        }

        // Button Customization
        if (s.buttons) {
          if (s.buttons.addToCartText) setBtnAddToCartText(s.buttons.addToCartText);
          if (s.buttons.addToCartBgColor) setBtnAddToCartBgColor(s.buttons.addToCartBgColor);
          if (s.buttons.addToCartTextColor) setBtnAddToCartTextColor(s.buttons.addToCartTextColor);

          if (s.buttons.buyNowText) setBtnBuyNowText(s.buttons.buyNowText);
          if (s.buttons.buyNowBgColor) setBtnBuyNowBgColor(s.buttons.buyNowBgColor);
          if (s.buttons.buyNowTextColor) setBtnBuyNowTextColor(s.buttons.buyNowTextColor);

          if (s.buttons.quickAddText) setBtnQuickAddText(s.buttons.quickAddText);
          if (s.buttons.quickAddBgColor) setBtnQuickAddBgColor(s.buttons.quickAddBgColor);
          if (s.buttons.quickAddTextColor) setBtnQuickAddTextColor(s.buttons.quickAddTextColor);
        }

        // Invoice & Order Confirmation Customization
        if (s.invoice) {
          if (s.invoice.badgeText) setInvoiceBadge(s.invoice.badgeText);
          if (s.invoice.badgeBgColor) setInvoiceBadgeBg(s.invoice.badgeBgColor);
          if (s.invoice.badgeTextColor) setInvoiceBadgeTextColor(s.invoice.badgeTextColor);
          if (s.invoice.title) setInvoiceTitle(s.invoice.title);
          if (s.invoice.subtitle) setInvoiceSubtitle(s.invoice.subtitle);
          if (s.invoice.estimatedDeliveryText) setInvoiceDeliveryText(s.invoice.estimatedDeliveryText);
          if (s.invoice.step1Title) setInvoiceStep1Title(s.invoice.step1Title);
          if (s.invoice.step1Subtitle) setInvoiceStep1Sub(s.invoice.step1Subtitle);
          if (s.invoice.step2Title) setInvoiceStep2Title(s.invoice.step2Title);
          if (s.invoice.step2Subtitle) setInvoiceStep2Sub(s.invoice.step2Subtitle);
          if (s.invoice.step3Title) setInvoiceStep3Title(s.invoice.step3Title);
          if (s.invoice.step3Subtitle) setInvoiceStep3Sub(s.invoice.step3Subtitle);
          if (s.invoice.btnTrackText) setInvoiceBtnTrackText(s.invoice.btnTrackText);
          if (s.invoice.btnTrackBgColor) setInvoiceBtnTrackBg(s.invoice.btnTrackBgColor);
          if (s.invoice.btnTrackTextColor) setInvoiceBtnTrackTextColor(s.invoice.btnTrackTextColor);
          if (s.invoice.btnTrackLink) setInvoiceBtnTrackLink(s.invoice.btnTrackLink);
          if (s.invoice.btnContinueText) setInvoiceBtnContText(s.invoice.btnContinueText);
          if (s.invoice.btnContinueBgColor) setInvoiceBtnContBg(s.invoice.btnContinueBgColor);
          if (s.invoice.btnContinueTextColor) setInvoiceBtnContTextColor(s.invoice.btnContinueTextColor);
          if (s.invoice.btnContinueLink) setInvoiceBtnContLink(s.invoice.btnContinueLink);
          if (s.invoice.showPrintInvoiceBtn !== undefined) setInvoiceShowPrintBtn(s.invoice.showPrintInvoiceBtn);
          if (s.invoice.printInvoiceBtnText) setInvoicePrintBtnText(s.invoice.printInvoiceBtnText);
          if (s.invoice.printInvoiceBtnBgColor) setInvoicePrintBtnBg(s.invoice.printInvoiceBtnBgColor);
          if (s.invoice.printInvoiceBtnTextColor) setInvoicePrintBtnTextColor(s.invoice.printInvoiceBtnTextColor);
          if (s.invoice.supportEmail) setInvoiceSupportEmail(s.invoice.supportEmail);
          if (s.invoice.supportPhone) setInvoiceSupportPhone(s.invoice.supportPhone);
          if (s.invoice.supportNote) setInvoiceSupportNote(s.invoice.supportNote);
        }

        // FAQs
        if (s.faqs && s.faqs.length > 0) {
          setFaqsList(s.faqs.map((f) => ({ question: f.question, answer: f.answer, category: f.category || 'General', _id: f._id })));
        } else if (contentResResult.status === 'fulfilled' && (contentResResult.value as any)?.faqs?.length) {
          setFaqsList((contentResResult.value as any).faqs.map((f: any) => ({ question: f.question, answer: f.answer, category: f.category || 'General', _id: f._id })));
        }
      } else if (contentResResult.status === 'fulfilled' && contentResResult.value.announcement) {
        setAnnouncementMsg(contentResResult.value.announcement.message);
        setAnnouncementLink(contentResResult.value.announcement.link || '');
        setAnnouncementActive(contentResResult.value.announcement.active);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setOrdersLoading(false);
      setProductsLoading(false);
      setCouponsLoading(false);
    }
  };

  // Coupons Management Helpers
  const loadCoupons = async () => {
    setCouponsLoading(true);
    try {
      const list = await couponsApi.getCoupons();
      setCoupons(list);
    } catch (err: any) {
      console.error('Failed to refresh coupons', err);
    } finally {
      setCouponsLoading(false);
    }
  };

  const handleOpenCreateCoupon = () => {
    setEditingCouponId(null);
    setCouponForm({
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 0,
      maxDiscountAmount: 0,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maxUses: '',
      active: true
    });
    setCouponError('');
    setCouponSuccess('');
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (cpn: ICouponData) => {
    setEditingCouponId(cpn._id || null);
    setCouponForm({
      code: cpn.code,
      discountType: cpn.discountType,
      discountValue: cpn.discountType === 'fixed' ? Math.round(cpn.discountValue / 100) : cpn.discountValue,
      minOrderAmount: cpn.minOrderAmount ? Math.round(cpn.minOrderAmount / 100) : 0,
      maxDiscountAmount: cpn.maxDiscountAmount ? Math.round(cpn.maxDiscountAmount / 100) : 0,
      validUntil: cpn.validUntil ? new Date(cpn.validUntil).toISOString().split('T')[0] : '',
      maxUses: cpn.maxUses ? String(cpn.maxUses) : '',
      active: cpn.active !== false
    });
    setCouponError('');
    setCouponSuccess('');
    setIsCouponModalOpen(true);
  };

  const handleToggleCouponStatus = async (cpn: ICouponData) => {
    if (!cpn._id) return;
    try {
      await couponsApi.updateCoupon(cpn._id, { active: !cpn.active });
      await loadCoupons();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to update coupon status');
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to permanently delete coupon "${code}"?`)) return;
    try {
      await couponsApi.deleteCoupon(id);
      await loadCoupons();
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to delete coupon');
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const cleanCode = couponForm.code.trim().toUpperCase();
      if (!cleanCode) {
        throw new Error('Please specify a coupon code (e.g. ZAYNA100)');
      }

      const numVal = Number(couponForm.discountValue);
      if (isNaN(numVal) || numVal <= 0) {
        throw new Error('Please enter a valid positive discount amount');
      }

      const payload: any = {
        code: cleanCode,
        discountType: couponForm.discountType,
        discountValue: couponForm.discountType === 'fixed' 
          ? Math.round(numVal * 100) // convert ₹ to paise
          : numVal, // percentage number
        minOrderAmount: Math.round(Number(couponForm.minOrderAmount || 0) * 100),
        active: couponForm.active
      };

      if (couponForm.maxDiscountAmount && couponForm.discountType === 'percentage') {
        payload.maxDiscountAmount = Math.round(Number(couponForm.maxDiscountAmount) * 100);
      }

      if (couponForm.validUntil) {
        payload.validUntil = new Date(couponForm.validUntil).toISOString();
      }

      if (couponForm.maxUses && Number(couponForm.maxUses) > 0) {
        payload.maxUses = Number(couponForm.maxUses);
      }

      if (editingCouponId) {
        await couponsApi.updateCoupon(editingCouponId, payload);
        setCouponSuccess(`Coupon "${cleanCode}" updated successfully!`);
      } else {
        await couponsApi.createCoupon(payload);
        setCouponSuccess(`Coupon "${cleanCode}" created successfully! It is active and ready for client checkout.`);
      }

      await loadCoupons();
      setTimeout(() => {
        setIsCouponModalOpen(false);
      }, 1100);
    } catch (err: any) {
      setCouponError(err?.response?.data?.error?.message || err?.message || 'Failed to save coupon');
    } finally {
      setSavingCoupon(false);
    }
  };

  // Section Reordering Helpers
  const moveSectionUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...homepageSections];
    const itemToMove = updated[index];
    const itemAbove = updated[index - 1];
    if (!itemToMove || !itemAbove) return;

    const tempOrder = itemToMove.order;
    itemToMove.order = itemAbove.order;
    itemAbove.order = tempOrder;

    updated[index] = itemAbove;
    updated[index - 1] = itemToMove;
    setHomepageSections(updated);
  };

  const moveSectionDown = (index: number) => {
    if (index >= homepageSections.length - 1) return;
    const updated = [...homepageSections];
    const itemToMove = updated[index];
    const itemBelow = updated[index + 1];
    if (!itemToMove || !itemBelow) return;

    const tempOrder = itemToMove.order;
    itemToMove.order = itemBelow.order;
    itemBelow.order = tempOrder;

    updated[index] = itemBelow;
    updated[index + 1] = itemToMove;
    setHomepageSections(updated);
  };

  const toggleSectionEnabled = (id: string) => {
    setHomepageSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  // Slide-out Drawer Navigation Helpers
  const addDrawerLink = () => {
    setDrawerLinks((prev) => [...prev, { name: 'New Collection', href: '/shop', highlight: false }]);
  };

  const removeDrawerLink = (index: number) => {
    setDrawerLinks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateDrawerLink = (index: number, field: 'name' | 'href' | 'highlight', value: any) => {
    setDrawerLinks((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  };

  const moveDrawerLinkUp = (index: number) => {
    if (index <= 0) return;
    setDrawerLinks((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const moveDrawerLinkDown = (index: number) => {
    setDrawerLinks((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const syncDrawerWithCategories = () => {
    if (!categories || categories.length === 0) {
      alert('No categories found to sync.');
      return;
    }
    const synced = [
      { name: 'Shop All Collections', href: '/shop', highlight: false },
      ...categories.map((c) => ({
        name: c.name,
        href: `/shop?category=${c.slug}`,
        highlight: c.name.toLowerCase().includes('festive') || c.name.toLowerCase().includes('eid')
      }))
    ];
    setDrawerLinks(synced);
  };

  // Concierge FAQs Management Helpers
  const [previewFaqOpen, setPreviewFaqOpen] = useState<number | null>(0);

  const handleAddFaq = () => {
    setEditingFaqIndex(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqCategory('General');
    setFaqModalOpen(true);
  };

  const handleEditFaq = (idx: number) => {
    const f = faqsList[idx];
    if (!f) return;
    setEditingFaqIndex(idx);
    setFaqQuestion(f.question);
    setFaqAnswer(f.answer);
    setFaqCategory(f.category || 'General');
    setFaqModalOpen(true);
  };

  const handleSaveFaqModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      alert('Please provide both question and answer.');
      return;
    }
    if (editingFaqIndex !== null) {
      setFaqsList((prev) =>
        prev.map((item, i) =>
          i === editingFaqIndex
            ? { ...item, question: faqQuestion.trim(), answer: faqAnswer.trim(), category: faqCategory.trim() }
            : item
        )
      );
    } else {
      setFaqsList((prev) => [
        ...prev,
        { question: faqQuestion.trim(), answer: faqAnswer.trim(), category: faqCategory.trim() }
      ]);
    }
    setFaqModalOpen(false);
    setEditingFaqIndex(null);
    setFaqQuestion('');
    setFaqAnswer('');
  };

  const handleDeleteFaq = (idx: number) => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to remove this FAQ?')) {
      setFaqsList((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const moveFaqUp = (idx: number) => {
    if (idx <= 0) return;
    setFaqsList((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      return copy;
    });
  };

  const moveFaqDown = (idx: number) => {
    if (idx >= faqsList.length - 1) return;
    setFaqsList((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      return copy;
    });
  };

  // Staff & Team Access Management Handlers
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await usersApi.listUsers({
        role: userRoleFilter === 'all' ? undefined : userRoleFilter,
        search: userSearchQuery.trim() || undefined
      });
      setUsersList(res.users || res.customers || []);
      if (res.stats) {
        setUserStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin, userRoleFilter, userSearchQuery]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStaff(true);
    setStaffNotice('');
    try {
      const res = await usersApi.createStaff({
        name: newStaffName,
        email: newStaffEmail,
        role: newStaffRole,
        password: newStaffPassword,
        sendResetEmail: newStaffSendReset
      });
      setIsAddStaffOpen(false);
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPassword('');
      let notice = `✨ Staff member "${newStaffName}" (${newStaffRole}) created successfully!`;
      if (res.resetLink) {
        notice += ` Password reset link: ${res.resetLink}`;
      }
      setStaffNotice(notice);
      setTimeout(() => setStaffNotice(''), 8000);
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to create staff member');
    } finally {
      setSavingStaff(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean | undefined) => {
    const nextStatus = currentStatus === false ? true : false;
    try {
      await usersApi.toggleUserStatus(userId, nextStatus);
      setStaffNotice(nextStatus ? 'Account activated!' : 'Account suspended & active sessions revoked!');
      setTimeout(() => setStaffNotice(''), 4000);
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update account status');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await usersApi.updateUserRole(userId, newRole);
      setStaffNotice(`Role updated to ${newRole}`);
      setTimeout(() => setStaffNotice(''), 4000);
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to change role');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove/delete "${userName}"? They will no longer be able to log in.`)) {
      return;
    }
    try {
      await usersApi.deleteUser(userId);
      setStaffNotice(`User "${userName}" removed successfully.`);
      setTimeout(() => setStaffNotice(''), 4000);
      await loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete user');
    }
  };

  const handleSendResetPassword = async (userId: string, email: string) => {
    try {
      const res = await usersApi.sendResetPassword(userId);
      let notice = `✨ Password reset email sent to ${email}!`;
      if (res.resetLink) {
        notice += ` Direct link: ${res.resetLink}`;
      }
      setStaffNotice(notice);
      setTimeout(() => setStaffNotice(''), 10000);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to send reset email');
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const recipient = testEmailRecipient.trim() || user?.email || '';
    if (!recipient) {
      alert('Please enter a recipient Gmail address');
      return;
    }
    setSendingTestEmail(true);
    setTestEmailNotice('');
    try {
      const res = await usersApi.sendTestEmail(recipient);
      setTestEmailNotice(res.message);
      setTimeout(() => setTestEmailNotice(''), 6000);
    } catch (err: any) {
      setTestEmailNotice(err.response?.data?.error?.message || 'Failed to send test email');
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Image downscaler to prevent browser/memory freezing on large camera uploads
  const compressImageFile = (file: File, maxWidth = 1920, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('video')) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      const img = document.createElement('img');
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } else {
          resolve(img.src);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Hero Media Upload (Direct Image & Video loop files from device)
  const handleHeroMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHeroMedia(true);
    try {
      const isVid = file.type.startsWith('video') || /\.(mp4|webm|mov)$/i.test(file.name);
      const dataUrl = await compressImageFile(file);
      try {
        const urls = await settingsApi.uploadMedia([dataUrl]);
        if (urls && urls[0]) {
          const uploadedUrl = urls[0];
          setHeroSlides((prev) => {
            const copy = [...prev];
            if (copy[activeSlideIndex]) {
              copy[activeSlideIndex] = {
                ...copy[activeSlideIndex],
                mediaUrl: uploadedUrl,
                mediaType: isVid ? 'video' : 'image'
              };
            }
            return copy;
          });
          setDesignerNotice(`✨ Hero ${isVid ? 'video' : 'image'} uploaded! Click "Publish Storefront Visual Customizations" below to save live to visitors.`);
          setTimeout(() => setDesignerNotice(''), 7000);
        }
      } catch {
        alert('Failed to upload hero media file. Please try a smaller clip or image.');
      } finally {
        setUploadingHeroMedia(false);
      }
    } catch {
      setUploadingHeroMedia(false);
    }
  };

  const addHeroSlide = () => {
    const newSlide: IHeroSlide = {
      title: 'New Haute Couture Edit',
      subtitle: 'Handcrafted luxury silhouettes tailored for effortless modest grace',
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1800&auto=format&fit=crop',
      ctaText: 'Explore Edit',
      ctaLink: '/shop'
    };
    setHeroSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(heroSlides.length);
  };

  const removeHeroSlide = (idxToRemove: number) => {
    if (heroSlides.length <= 1) {
      alert('At least one hero slide must remain in the hero campaign presentation.');
      return;
    }
    setHeroSlides((prev) => prev.filter((_, i) => i !== idxToRemove));
    setActiveSlideIndex((prev) => Math.max(0, prev - 1));
  };

  // Save Storefront Designer Configurations
  const handleSaveDesigner = async () => {
    setSavingDesigner(true);
    setDesignerNotice('');
    try {
      const payload: Partial<ISiteSettings> = {
        brand: {
          name: brandName,
          tagline: brandTagline
        },
        theme: {
          primaryColor,
          accentColor,
          backgroundColor,
          secondaryColor: '#2C3E50',
          fontFamily: 'Cinzel, sans-serif'
        },
        announcementBar: {
          message: announcementMsg,
          link: announcementLink,
          active: announcementActive,
          dismissible: announcementDismissible,
          bgColor: announcementBgColor,
          textColor: announcementTextColor,
          fontFamily: announcementFont,
          isMovable: announcementIsMovable,
          scrollSpeed: announcementScrollSpeed,
          textAlign: announcementTextAlign
        },
        navbar: {
          bgColor: navbarBgColor,
          textColor: navbarTextColor,
          borderColor: navbarBorderColor,
          drawerBgColor,
          drawerTextColor,
          drawerAccentColor,
          drawerLinks
        },
        heroSection: {
          slides: heroSlides
        },
        brandStory: {
          badgeText: storyBadge,
          title: storyTitle,
          paragraph1: storyP1,
          paragraph2: storyP2,
          stat1Value: storyStat1Val,
          stat1Label: storyStat1Lbl,
          stat2Value: storyStat2Val,
          stat2Label: storyStat2Lbl,
          ctaText: storyCtaText,
          ctaLink: storyCtaLink,
          imageUrl: storyImage,
          floatingCardTitle: storyCardTitle,
          floatingCardText: storyCardText
        },
        categoriesSection: {
          badgeText: categoriesBadge,
          title: categoriesTitle
        },
        homepageSections: homepageSections,
        footer: {
          bgColor: footerBgColor,
          textColor: footerTextColor,
          headingColor: footerHeadingColor,
          showValueBadges: footerShowValueBadges,
          showBrandStory: footerShowBrandStory,
          showCollections: footerShowCollections,
          showCustomerCare: footerShowCustomerCare,
          showNewsletter: footerShowNewsletter,
          customCopyright: footerCustomCopyright,
          contactEmail: footerContactEmail,
          contactPhone: footerContactPhone,
          contactAddress: footerContactAddress
        },
        social: {
          instagram: instagramHandle
            ? (instagramHandle.startsWith('http') ? instagramHandle : `https://instagram.com/${instagramHandle.replace('@', '')}`)
            : undefined
        },
        instagramPosts: instagramPosts,
        productPage: {
          showYouMayAlsoAdmire,
          youMayAlsoAdmireTitle,
          youMayAlsoAdmireSubtitle,
          itemCount
        },
        buttons: {
          addToCartText: btnAddToCartText,
          addToCartBgColor: btnAddToCartBgColor,
          addToCartTextColor: btnAddToCartTextColor,
          buyNowText: btnBuyNowText,
          buyNowBgColor: btnBuyNowBgColor,
          buyNowTextColor: btnBuyNowTextColor,
          quickAddText: btnQuickAddText,
          quickAddBgColor: btnQuickAddBgColor,
          quickAddTextColor: btnQuickAddTextColor
        },
        invoice: {
          badgeText: invoiceBadge,
          badgeBgColor: invoiceBadgeBg,
          badgeTextColor: invoiceBadgeTextColor,
          title: invoiceTitle,
          subtitle: invoiceSubtitle,
          estimatedDeliveryText: invoiceDeliveryText,
          step1Title: invoiceStep1Title,
          step1Subtitle: invoiceStep1Sub,
          step2Title: invoiceStep2Title,
          step2Subtitle: invoiceStep2Sub,
          step3Title: invoiceStep3Title,
          step3Subtitle: invoiceStep3Sub,
          btnTrackText: invoiceBtnTrackText,
          btnTrackBgColor: invoiceBtnTrackBg,
          btnTrackTextColor: invoiceBtnTrackTextColor,
          btnTrackLink: invoiceBtnTrackLink,
          btnContinueText: invoiceBtnContText,
          btnContinueBgColor: invoiceBtnContBg,
          btnContinueTextColor: invoiceBtnContTextColor,
          btnContinueLink: invoiceBtnContLink,
          showPrintInvoiceBtn: invoiceShowPrintBtn,
          printInvoiceBtnText: invoicePrintBtnText,
          printInvoiceBtnBgColor: invoicePrintBtnBg,
          printInvoiceBtnTextColor: invoicePrintBtnTextColor,
          supportEmail: invoiceSupportEmail,
          supportPhone: invoiceSupportPhone,
          supportNote: invoiceSupportNote
        },
        faqs: faqsList
      };

      await settingsApi.updateSettings(payload);
      setDesignerNotice('✨ All storefront visual customizations & layout sequences published live! Visitors see these immediately.');
      setTimeout(() => setDesignerNotice(''), 4500);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save storefront configuration');
    } finally {
      setSavingDesigner(false);
    }
  };

  // Brand Story Direct Image Upload
  const handleStoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingStoryImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        try {
          const urls = await settingsApi.uploadMedia([dataUrl]);
          if (urls && urls[0]) {
            setStoryImage(urls[0]);
            setDesignerNotice('Brand Story image successfully uploaded!');
            setTimeout(() => setDesignerNotice(''), 3000);
          }
        } catch {
          alert('Failed to upload image file.');
        } finally {
          setUploadingStoryImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingStoryImage(false);
    }
  };

  // Category Direct Image Upload
  const handleCatImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCatImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        try {
          const urls = await settingsApi.uploadMedia([dataUrl]);
          if (urls && urls[0]) {
            setCatImage(urls[0]);
          }
        } catch {
          alert('Failed to upload category image.');
        } finally {
          setUploadingCatImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingCatImage(false);
    }
  };

  // Instagram Lookbook Direct Image Upload
  const handleInstagramImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingInstaIndex(index);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        try {
          const urls = await settingsApi.uploadMedia([dataUrl]);
          if (urls && urls[0]) {
            setInstagramPosts((prev) => {
              const copy = [...prev];
              copy[index] = { ...copy[index], imageUrl: urls[0] };
              return copy;
            });
            setDesignerNotice(`Instagram lookbook #${index + 1} photo uploaded successfully!`);
            setTimeout(() => setDesignerNotice(''), 3000);
          }
        } catch {
          alert('Failed to upload image file.');
        } finally {
          setUploadingInstaIndex(null);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingInstaIndex(null);
    }
  };

  // Instagram Lookbook Studio Dynamic Post Helpers
  const handleAddInstagramPost = () => {
    setInstagramPosts((prev) => [
      ...prev,
      {
        imageUrl: '',
        caption: '',
        postUrl: ''
      }
    ]);
  };

  const handleRemoveInstagramPost = (indexToRemove: number) => {
    if (instagramPosts.length <= 1) {
      alert('At least one lookbook entry must remain in your journal.');
      return;
    }
    setInstagramPosts((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMoveInstagramPost = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= instagramPosts.length) return;
    const reordered = [...instagramPosts];
    const temp = reordered[index];
    reordered[index] = reordered[target];
    reordered[target] = temp;
    setInstagramPosts(reordered);
  };

  // Product Video Helpers for Add Product
  const handleAddVideoUrl = () => {
    const trimmed = prodVideoInputUrl.trim();
    if (!trimmed) return;
    if (prodVideos.includes(trimmed)) {
      alert('Video URL is already added.');
      return;
    }
    setProdVideos((prev) => [...prev, trimmed]);
    setProdVideoInputUrl('');
  };

  const handleRemoveVideo = (indexToRemove: number) => {
    setProdVideos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleVideoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 50 * 1024 * 1024) {
      alert('Video file exceeds 50MB limit. Please choose a smaller video or enter a cloud video URL.');
      return;
    }
    setUploadingVideo(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProdVideos((prev) => [...prev, reader.result as string]);
        }
        setUploadingVideo(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadingVideo(false);
      alert('Failed to read video file.');
    }
    if (videoFileInputRef.current) {
      videoFileInputRef.current.value = '';
    }
  };

  // Product Video Helpers for Edit Product
  const handleEditAddVideoUrl = () => {
    const trimmed = editProdVideoInputUrl.trim();
    if (!trimmed) return;
    if (editProdVideos.includes(trimmed)) {
      alert('Video URL is already added.');
      return;
    }
    setEditProdVideos((prev) => [...prev, trimmed]);
    setEditProdVideoInputUrl('');
  };

  const handleEditRemoveVideo = (indexToRemove: number) => {
    setEditProdVideos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleEditVideoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 50 * 1024 * 1024) {
      alert('Video file exceeds 50MB limit. Please choose a smaller video or enter a cloud video URL.');
      return;
    }
    setEditUploadingVideo(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditProdVideos((prev) => [...prev, reader.result as string]);
        }
        setEditUploadingVideo(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setEditUploadingVideo(false);
      alert('Failed to read video file.');
    }
    if (editVideoFileInputRef.current) {
      editVideoFileInputRef.current.value = '';
    }
  };

  const handleOpenEditCategory = (cat: ICategory) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDesc(cat.description || '');
    setCatImage(cat.image || '');
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setSavingCategory(true);
    try {
      const updated = await productsApi.updateCategory(editingCategory._id, {
        name: catName,
        description: catDesc,
        image: catImage
      });
      setCategories((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
      setCatModalOpen(false);
      setDesignerNotice(`Category "${updated.name}" updated successfully!`);
      setTimeout(() => setDesignerNotice(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update category');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      await productsApi.deleteCategory(catId);
      setCategories((prev) => prev.filter((c) => c._id !== catId));
      setDesignerNotice(`Category "${catName}" deleted successfully.`);
      setTimeout(() => setDesignerNotice(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete category');
    }
  };

  // Handle direct multiple picture selection
  const handlePictureSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setSelectedImageFiles((prev) => [...prev, ...fileList]);

    // Read and compress preview URLs for immediate fluid visual feedback
    for (const file of fileList) {
      try {
        const compressedUrl = await compressImageFile(file, 1600, 0.82);
        setImagePreviews((prev) => [...prev, compressedUrl]);
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setImagePreviews((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    }

    // Reset input so user can choose more if they wish
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePicture = (indexToRemove: number) => {
    setSelectedImageFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleSizeSelection = (size: string) => {
    setProdSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Create Product Submit Handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormNotice('');

    if (!prodName.trim()) {
      setFormError('Please provide a product title');
      return;
    }

    const basePricePaise = Math.round(parseFloat(prodPriceINR) * 100);
    if (isNaN(basePricePaise) || basePricePaise <= 0) {
      setFormError('Please provide a valid base price in ₹');
      return;
    }

    const salePricePaise = prodSalePriceINR ? Math.round(parseFloat(prodSalePriceINR) * 100) : undefined;
    const initialStock = parseInt(prodStock, 10) || 10;

    setCreatingProduct(true);

    try {
      // 1. Upload direct picture files if any were chosen
      let finalImageUrls: string[] = [];
      if (imagePreviews.length > 0) {
        try {
          finalImageUrls = await productsApi.uploadImages(imagePreviews);
        } catch (uploadErr) {
          console.warn('Backend /upload fallback: using direct data URLs', uploadErr);
          finalImageUrls = imagePreviews;
        }
      } else {
        // Default elegant luxury fallback image if no pictures uploaded
        finalImageUrls = ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop'];
      }

      // Generate slug and SKU
      const slug = prodName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-4);

      const skuPrefix = 'ZA-' + prodName.substring(0, 3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

      // Sort colors with radio-selected default color first
      const sortedColors = [
        prodColors[defaultColorIndex] || prodColors[0] || { name: 'Noir Black', hex: '#1A1A1A' },
        ...prodColors.filter((_, idx) => idx !== defaultColorIndex)
      ];

      // Generate variants for selected sizes × selected colors
      const variants: any[] = [];
      const totalVariantsCount = Math.max(1, sortedColors.length * prodSizes.length);
      const perVariantStock = Math.max(1, Math.floor(initialStock / totalVariantsCount));

      for (const colorItem of sortedColors) {
        const colorClean = colorItem.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'BLK';
        for (const sz of prodSizes) {
          variants.push({
            size: sz,
            color: colorItem.name,
            sku: `${skuPrefix}-${colorClean}-${sz}`,
            price: basePricePaise,
            salePrice: salePricePaise,
            stock: perVariantStock
          });
        }
      }

      await productsApi.createProduct({
        name: prodName.trim(),
        slug,
        description: prodDescription.trim() || `${prodName}. Hand-tailored luxury modest silhouette from Zayna Abaya atelier.`,
        images: finalImageUrls,
        videos: prodVideos,
        variants,
        sku: skuPrefix,
        price: basePricePaise,
        salePrice: salePricePaise,
        stock: initialStock,
        category: prodCategory as any,
        tags: ['Abaya', 'Modest', ...sortedColors.map((c) => c.name), 'Luxury'].filter(Boolean),
        flags: {
          isBestseller,
          isFeatured,
          isNewArrival,
          isOnSale
        },
        fabricCare: prodFabricCare,
        deliveryInfo: prodDeliveryInfo
      });

      // Reset form
      setProdName('');
      setProdPriceINR('');
      setProdSalePriceINR('');
      setProdDescription('');
      setIsOnSale(false);
      setSelectedImageFiles([]);
      setImagePreviews([]);
      setProdVideos([]);
      setProdVideoInputUrl('');
      setProdColors([{ name: 'Noir Black', hex: '#1A1A1A' }]);
      setDefaultColorIndex(0);
      setCustomColorName('');
      setIsAddProductOpen(false);

      // Reload products table
      await loadData();
      alert('🎉 Creation added successfully to Zayna catalog!');
    } catch (err: any) {
      console.error('Failed to create product:', err);
      setFormError(err.response?.data?.error?.message || 'Failed to save product. Please check your inputs.');
    } finally {
      setCreatingProduct(false);
    }
  };

  // Color Manager Helpers for Add Product
  const handleAddPresetColor = (preset: { name: string; hex: string }) => {
    if (!prodColors.some((c) => c.name.toLowerCase() === preset.name.toLowerCase())) {
      setProdColors((prev) => [...prev, preset]);
    }
  };

  const handleAddCustomColor = () => {
    const trimmed = customColorName.trim();
    if (!trimmed) return;
    if (prodColors.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('This color is already added');
      return;
    }
    setProdColors((prev) => [...prev, { name: trimmed, hex: customColorHex || '#1A1A1A' }]);
    setCustomColorName('');
  };

  const handleRemoveColor = (indexToRemove: number) => {
    if (prodColors.length <= 1) {
      alert('At least one color must remain for the creation');
      return;
    }
    setProdColors((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (defaultColorIndex >= indexToRemove && defaultColorIndex > 0) {
      setDefaultColorIndex((prev) => prev - 1);
    }
  };

  const handleMoveColor = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= prodColors.length) return;
    const reordered = [...prodColors];
    const item = reordered[index];
    reordered[index] = reordered[target];
    reordered[target] = item;
    setProdColors(reordered);
    if (defaultColorIndex === index) setDefaultColorIndex(target);
    else if (defaultColorIndex === target) setDefaultColorIndex(index);
  };

  // Toggle Sale status on product directly
  const handleToggleProductSale = async (product: IProduct) => {
    try {
      const currentOnSale = !!product.flags?.isOnSale;
      const updatedFlags = {
        isBestseller: !!product.flags?.isBestseller,
        isFeatured: !!product.flags?.isFeatured,
        isNewArrival: !!product.flags?.isNewArrival,
        isOnSale: !currentOnSale
      };
      await productsApi.updateProduct(product._id, { flags: updatedFlags });
      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? { ...p, flags: updatedFlags } : p))
      );
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update sale status');
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from the active catalog?`)) {
      try {
        await productsApi.deleteProduct(id);
        await loadData();
      } catch (err: any) {
        alert(err.response?.data?.error?.message || 'Failed to delete creation');
      }
    }
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (p: IProduct) => {
    setEditingProduct(p);
    setEditProdName(p.name || '');
    setEditProdCategory(p.category?._id || (p.category as any) || '');
    setEditProdPriceINR(p.price ? (p.price / 100).toString() : '');
    setEditProdSalePriceINR(p.salePrice ? (p.salePrice / 100).toString() : '');
    setEditProdStock(p.stock ? p.stock.toString() : '20');
    setEditProdDescription(p.description || '');
    setEditProdFabricCare(p.fabricCare || 'Pure Korean Nidha & Silk blend. Dry clean or delicate hand wash cold.');
    setEditProdDeliveryInfo(p.deliveryInfo || 'Dispatched within 24-48 hours. Delivered in 3-5 business days across India.');

    const existingSizes = Array.from(new Set(p.variants?.map((v) => v.size).filter(Boolean))) as string[];
    setEditProdSizes(existingSizes.length > 0 ? existingSizes : ['52', '54', '56', '58', '60']);

    const existingColors = Array.from(new Set(p.variants?.map((v) => v.color).filter(Boolean))) as string[];
    if (existingColors.length > 0) {
      setEditProdColors(existingColors.map((c) => ({ name: c, hex: getColorHex(c) })));
    } else {
      setEditProdColors([{ name: 'Noir Black', hex: '#1A1A1A' }]);
    }
    setEditDefaultColorIndex(0);
    setEditCustomColorName('');
    setEditCustomColorHex('#1A1A1A');

    setEditIsBestseller(!!p.flags?.isBestseller);
    setEditIsFeatured(!!p.flags?.isFeatured);
    setEditIsNewArrival(!!p.flags?.isNewArrival);
    setEditIsOnSale(!!p.flags?.isOnSale);
    setEditImages(p.images || []);
    setEditImagePreviews([]);
    setEditProdVideos(p.videos || []);
    setEditProdVideoInputUrl('');
    setEditFormError('');
  };

  const handleCloseEditProduct = () => {
    setEditingProduct(null);
    setEditFormError('');
  };

  const handleEditAddPresetColor = (preset: { name: string; hex: string }) => {
    if (!editProdColors.some((c) => c.name.toLowerCase() === preset.name.toLowerCase())) {
      setEditProdColors((prev) => [...prev, preset]);
    }
  };

  const handleEditAddCustomColor = () => {
    const trimmed = editCustomColorName.trim();
    if (!trimmed) return;
    if (editProdColors.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('This color is already added');
      return;
    }
    setEditProdColors((prev) => [...prev, { name: trimmed, hex: editCustomColorHex || '#1A1A1A' }]);
    setEditCustomColorName('');
  };

  const handleEditRemoveColor = (indexToRemove: number) => {
    if (editProdColors.length <= 1) {
      alert('At least one color must remain for the creation');
      return;
    }
    setEditProdColors((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (editDefaultColorIndex >= indexToRemove && editDefaultColorIndex > 0) {
      setEditDefaultColorIndex((prev) => prev - 1);
    }
  };

  const handleEditMoveColor = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= editProdColors.length) return;
    const reordered = [...editProdColors];
    const item = reordered[index];
    reordered[index] = reordered[target];
    reordered[target] = item;
    setEditProdColors(reordered);
    if (editDefaultColorIndex === index) setEditDefaultColorIndex(target);
    else if (editDefaultColorIndex === target) setEditDefaultColorIndex(index);
  };

  const toggleEditSizeSelection = (size: string) => {
    setEditProdSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleEditPicturesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileList = Array.from(files);
    for (const file of fileList) {
      try {
        const compressedUrl = await compressImageFile(file, 1600, 0.82);
        setEditImagePreviews((prev) => [...prev, compressedUrl]);
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setEditImagePreviews((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  const handleRemoveEditNewPicture = (indexToRemove: number) => {
    setEditImagePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleRemoveExistingEditPicture = (indexToRemove: number) => {
    setEditImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditFormError('');

    if (!editProdName.trim()) {
      setEditFormError('Please provide a product title');
      return;
    }

    const basePricePaise = Math.round(parseFloat(editProdPriceINR) * 100);
    if (isNaN(basePricePaise) || basePricePaise <= 0) {
      setEditFormError('Please provide a valid base price in ₹');
      return;
    }

    const salePricePaise = editProdSalePriceINR ? Math.round(parseFloat(editProdSalePriceINR) * 100) : undefined;
    const initialStock = parseInt(editProdStock, 10) || 10;

    if (editProdSizes.length === 0) {
      setEditFormError('Please select at least one size');
      return;
    }

    if (editProdColors.length === 0) {
      setEditFormError('Please add at least one color');
      return;
    }

    setSavingEditProduct(true);

    try {
      let allImages = [...editImages];
      if (editImagePreviews.length > 0) {
        try {
          const uploadedUrls = await productsApi.uploadImages(editImagePreviews);
          allImages = [...allImages, ...uploadedUrls];
        } catch (uploadErr) {
          allImages = [...allImages, ...editImagePreviews];
        }
      }

      if (allImages.length === 0) {
        allImages = ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop'];
      }

      // Sort colors with radio-selected default color first
      const sortedColors = [
        editProdColors[editDefaultColorIndex] || editProdColors[0],
        ...editProdColors.filter((_, idx) => idx !== editDefaultColorIndex)
      ];

      const skuPrefix = editingProduct.sku || ('ZA-' + editProdName.substring(0, 3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900));

      const totalVariantsCount = Math.max(1, sortedColors.length * editProdSizes.length);
      const perVariantStock = Math.max(1, Math.floor(initialStock / totalVariantsCount));
      const variants: any[] = [];

      for (const colorItem of sortedColors) {
        const colorClean = colorItem.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'BLK';
        for (const sz of editProdSizes) {
          const existingVar = editingProduct.variants?.find(
            (v) => v.size === sz && v.color?.toLowerCase() === colorItem.name.toLowerCase()
          );
          variants.push({
            ...(existingVar?._id ? { _id: existingVar._id } : {}),
            size: sz,
            color: colorItem.name,
            sku: existingVar?.sku || `${skuPrefix}-${colorClean}-${sz}`,
            price: basePricePaise,
            salePrice: salePricePaise,
            stock: existingVar?.stock ?? perVariantStock
          });
        }
      }

      await productsApi.updateProduct(editingProduct._id, {
        name: editProdName.trim(),
        description: editProdDescription.trim(),
        category: editProdCategory as any,
        price: basePricePaise,
        salePrice: salePricePaise,
        stock: initialStock,
        variants,
        images: allImages,
        videos: editProdVideos,
        fabricCare: editProdFabricCare,
        deliveryInfo: editProdDeliveryInfo,
        tags: ['Abaya', 'Modest', ...sortedColors.map((c) => c.name), 'Luxury'].filter(Boolean),
        flags: {
          isBestseller: editIsBestseller,
          isFeatured: editIsFeatured,
          isNewArrival: editIsNewArrival,
          isOnSale: editIsOnSale
        }
      });

      setEditingProduct(null);
      await loadData();
      alert('✨ Creation updated successfully in Zayna catalog!');
    } catch (err: any) {
      console.error('Failed to update product:', err);
      setEditFormError(err.response?.data?.error?.message || 'Failed to update product. Please check your inputs.');
    } finally {
      setSavingEditProduct(false);
    }
  };

  const handleUpdateFulfillment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setUpdatingFulfillment(true);
    try {
      await ordersApi.updateFulfillment(editingOrder._id, {
        status: newStatus,
        courier,
        trackingNumber
      });
      setEditingOrder(null);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update order fulfillment');
    } finally {
      setUpdatingFulfillment(false);
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAnnouncement(true);
    setAnnouncementNotice('');
    try {
      await contentApi.updateAnnouncement(announcementMsg, announcementLink, announcementActive);
      setAnnouncementNotice('Announcement bar updated live!');
      setTimeout(() => setAnnouncementNotice(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to update announcement');
    } finally {
      setSavingAnnouncement(false);
    }
  };

  // Sales Graph & Analytics Calculations
  const analyticsData = React.useMemo(() => {
    let daysToInclude = 30;
    if (analyticsTimeframe === '7d') daysToInclude = 7;
    else if (analyticsTimeframe === '30d') daysToInclude = 30;
    else daysToInclude = 365;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToInclude);
    cutoffDate.setHours(0, 0, 0, 0);

    const filteredOrders = orders.filter((o) => {
      if (!o.createdAt) return true;
      const orderDate = new Date(o.createdAt);
      return orderDate >= cutoffDate;
    });

    const totalRevenuePaise = filteredOrders.reduce((sum, o) => sum + (o.pricing?.totalAmount || 0), 0);
    const totalOrdersCount = filteredOrders.length;
    const aovPaise = totalOrdersCount > 0 ? Math.round(totalRevenuePaise / totalOrdersCount) : 0;
    const totalItemsSold = filteredOrders.reduce(
      (sum, o) => sum + (o.items?.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0) || 0),
      0
    );

    const paidOrders = filteredOrders.filter((o) => o.paymentStatus === 'paid').length;
    const deliveredOrders = filteredOrders.filter((o) => o.fulfillmentStatus === 'delivered').length;
    const shippedOrders = filteredOrders.filter((o) => o.fulfillmentStatus === 'shipped').length;
    const processingOrders = filteredOrders.filter(
      (o) => o.fulfillmentStatus === 'processing' || o.fulfillmentStatus === 'unfulfilled'
    ).length;

    // Daily buckets for timeline chart
    const dailyBuckets: { [dateStr: string]: { date: string; displayDate: string; revenuePaise: number; orderCount: number } } = {};

    const numDays = Math.min(daysToInclude, 30);
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      dailyBuckets[key] = {
        date: key,
        displayDate,
        revenuePaise: 0,
        orderCount: 0
      };
    }

    filteredOrders.forEach((o) => {
      const dateKey = o.createdAt ? o.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];
      if (dailyBuckets[dateKey]) {
        dailyBuckets[dateKey].revenuePaise += (o.pricing?.totalAmount || 0);
        dailyBuckets[dateKey].orderCount += 1;
      }
    });

    const points = Object.values(dailyBuckets);
    const maxRevenuePaise = Math.max(...points.map((p) => p.revenuePaise), 500000); // baseline scale ₹5,000

    return {
      totalRevenuePaise,
      totalOrdersCount,
      aovPaise,
      totalItemsSold,
      paidOrders,
      deliveredOrders,
      shippedOrders,
      processingOrders,
      points,
      maxRevenuePaise
    };
  }, [orders, analyticsTimeframe]);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto py-24 text-center text-sm font-serif">
        Verifying administrator permissions...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl text-brand-noir">Admin Portal Access Restricted</h2>
        <p className="text-xs text-brand-noir/70 leading-relaxed">
          You must be authenticated as an administrator or superadmin to view backoffice operations.
        </p>
        <Link
          href="/auth/login"
          className="inline-block px-6 py-2.5 bg-brand-mocha text-white text-xs font-semibold uppercase tracking-wider rounded"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-brand-border gap-4">
          <div>
            <span className="text-xs uppercase font-semibold tracking-[0.2em] text-brand-mocha">
              Internal Backoffice
            </span>
            <h1 className="font-serif text-3xl text-brand-noir">Zayna Atelier Operations</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded text-xs font-semibold uppercase tracking-wider shadow-sm transition-all active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Creation</span>
            </button>
            <button
              onClick={loadData}
              className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-brand-border rounded text-xs font-semibold text-brand-noir hover:bg-brand-sand transition-colors shadow-sm"
              title="Refresh live data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <Link
              href="/"
              target="_blank"
              className="px-3 py-2 bg-brand-noir text-white rounded text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors flex items-center space-x-1"
            >
              <span>Live Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-brand-border text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('storefront')}
            className={`pb-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'storefront'
                ? 'border-brand-mocha text-brand-mocha'
                : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Storefront Designer & Layout Builder</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'products'
                ? 'border-brand-mocha text-brand-mocha'
                : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Products & Stock ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'orders'
                ? 'border-brand-mocha text-brand-mocha'
                : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Orders & Shipments ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'analytics'
                ? 'border-brand-mocha text-brand-mocha'
                : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Sales Graph & Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`pb-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'staff'
                ? 'border-brand-mocha text-brand-mocha'
                : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff & Team Access ({userStats.totalStaff + userStats.totalAdmins})</span>
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`pb-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'coupons'
                ? 'border-brand-mocha text-brand-mocha'
                : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Coupons & Discounts ({coupons.length})</span>
          </button>
        </div>

        {/* Tab 1: Products & Inventory */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-sand/30">
              <div>
                <h3 className="font-serif text-base text-brand-noir">Catalog Inventory Overview</h3>
                <span className="text-xs text-brand-noir/60">{products.length} catalog items in database</span>
              </div>
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded text-xs font-semibold uppercase tracking-wider shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Creation Details & Photos</span>
              </button>
            </div>

            {productsLoading ? (
              <div className="p-12 text-center text-xs text-brand-noir/60">Loading catalog items...</div>
            ) : products.length === 0 ? (
              <div className="p-16 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-brand-sand flex items-center justify-center mx-auto text-brand-mocha">
                  <Boxes className="w-7 h-7" />
                </div>
                <p className="font-serif text-lg text-brand-noir">No Creations Found</p>
                <p className="text-xs text-brand-noir/60 max-w-sm mx-auto">
                  Click the button below to add your first luxury abaya creation with photos and sizing variants.
                </p>
                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="px-6 py-2.5 bg-brand-mocha text-white text-xs font-semibold uppercase tracking-wider rounded"
                >
                  Add Your First Abaya
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-brand-noir">
                  <thead className="bg-brand-sand/60 uppercase font-serif tracking-wider text-brand-noir/80 border-b border-brand-border">
                    <tr>
                      <th className="py-3 px-4">Preview</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Sale Status</th>
                      <th className="py-3 px-4">Base Price</th>
                      <th className="py-3 px-4">Sale Price</th>
                      <th className="py-3 px-4">Total Stock</th>
                      <th className="py-3 px-4">Colors</th>
                      <th className="py-3 px-4">Sizes</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {products.map((p) => {
                      const thumb = p.images?.[0] || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=300&auto=format&fit=crop';
                      const onSale = !!p.flags?.isOnSale || (!!p.salePrice && p.salePrice < p.price);
                      const uniqueSizes = Array.from(new Set(p.variants?.map((v) => v.size).filter(Boolean))) as string[];
                      const uniqueColors = Array.from(new Set(p.variants?.map((v) => v.color).filter(Boolean))) as string[];
                      return (
                        <tr key={p._id} className="hover:bg-brand-sand/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="relative w-12 h-14 rounded overflow-hidden bg-brand-sand border border-brand-border">
                              <Image src={thumb} alt={p.name} fill unoptimized className="object-cover" />
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            <Link href={`/product/${p.slug}`} target="_blank" className="hover:text-brand-mocha">
                              {p.name}
                            </Link>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-brand-noir/60">{p.sku}</td>
                          <td className="py-3 px-4">
                            {onSale ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                <Flame className="w-3 h-3 text-red-600" />
                                <span>ON SALE</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
                                Regular
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold">{formatINR(p.price)}</td>
                          <td className="py-3 px-4 text-emerald-700 font-semibold">
                            {p.salePrice ? formatINR(p.salePrice) : '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-bold ${p.stock <= 5 ? 'text-red-600' : 'text-emerald-700'}`}>
                              {p.stock} units
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1 items-center max-w-[150px]">
                              {uniqueColors.length > 0 ? (
                                uniqueColors.map((cName, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-brand-sand/60 text-brand-noir border border-brand-border/60"
                                    title={cName}
                                  >
                                    <span
                                      className="w-2 h-2 rounded-full border border-black/20 shrink-0"
                                      style={{ backgroundColor: getColorHex(cName) }}
                                    />
                                    <span className="truncate max-w-[70px]">{cName}</span>
                                  </span>
                                ))
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-brand-sand/60 text-brand-noir border border-brand-border/60">
                                  <span className="w-2 h-2 rounded-full bg-[#1A1A1A] shrink-0" />
                                  <span>Noir Black</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[11px] text-brand-noir/70">
                            {uniqueSizes.join(', ') || 'Standard'}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenEditProduct(p)}
                              className="px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all inline-flex items-center gap-1 cursor-pointer bg-brand-sand/70 text-brand-noir hover:bg-brand-mocha hover:text-white border border-brand-border/80"
                              title="Edit creation details, colors, and stock"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleProductSale(p)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all inline-flex items-center gap-1 cursor-pointer ${
                                p.flags?.isOnSale
                                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                  : 'bg-brand-sand/70 text-brand-noir hover:bg-brand-mocha hover:text-white'
                              }`}
                              title={p.flags?.isOnSale ? 'Stop Sale' : 'Put On Sale'}
                            >
                              <Flame className="w-3 h-3" />
                              <span>{p.flags?.isOnSale ? 'Stop Sale' : 'Put On Sale'}</span>
                            </button>
                            <Link
                              href={`/product/${p.slug}`}
                              target="_blank"
                              className="text-brand-mocha hover:underline inline-flex items-center text-xs"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(p._id, p.name)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete creation"
                            >
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Orders Management */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-brand-border flex items-center justify-between bg-brand-sand/30">
              <h3 className="font-serif text-base text-brand-noir">Client Orders & Fulfillment</h3>
              <span className="text-xs text-brand-noir/60">Live orders synced from database</span>
            </div>

            {ordersLoading ? (
              <div className="p-8 text-center text-xs text-brand-noir/60">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-xs text-brand-noir/60">
                No orders placed yet. Test the storefront checkout to see live records appear here!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-brand-noir">
                  <thead className="bg-brand-sand/60 uppercase font-serif tracking-wider text-brand-noir/80 border-b border-brand-border">
                    <tr>
                      <th className="py-3 px-4">Order Ref</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Fulfillment</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {orders.map((o) => (
                      <tr key={o._id} className="hover:bg-brand-sand/20">
                        <td className="py-3.5 px-4 font-mono font-bold text-brand-mocha">
                          {o.orderNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium">{o.shippingAddress?.fullName || 'Guest Client'}</p>
                          <p className="text-[10px] text-brand-noir/60">{o.guestEmail || '—'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-brand-noir">{o.items?.length || 0} item(s)</p>
                          <p className="text-[10px] text-brand-mocha font-medium truncate max-w-[180px]" title={o.items?.map((it: any) => it.name || it.title || it.product?.name).filter(Boolean).join(', ')}>
                            {o.items?.map((it: any) => it.name || it.title || it.product?.name).filter(Boolean).join(', ') || '—'}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-bold">
                          {formatINR(o.pricing?.totalAmount || 0)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            o.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="capitalize font-semibold bg-brand-sand px-2 py-0.5 rounded text-[11px]">
                            {o.fulfillmentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => setViewingOrder(o)}
                              className="text-brand-noir/60 font-semibold hover:text-brand-noir hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button
                              onClick={() => {
                                setEditingOrder(o);
                                setNewStatus(o.fulfillmentStatus || 'processing');
                                setCourier(o.tracking?.courier || 'BlueDart Air Express');
                                setTrackingNumber(o.tracking?.trackingNumber || '');
                              }}
                              className="text-brand-mocha font-semibold hover:underline"
                            >
                              Update Dispatch
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Sales Graph & Commercial Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Header & Timeframe Selector */}
            <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-mocha flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  Commercial Intelligence
                </span>
                <h2 className="font-serif text-2xl text-brand-noir mt-0.5">Sales Graph & Revenue Analytics</h2>
                <p className="text-xs text-brand-noir/70 mt-1">
                  Real-time sales velocity, revenue telemetry, and order fulfillment progression across your boutique.
                </p>
              </div>

              {/* Timeframe selector */}
              <div className="flex items-center bg-brand-sand/50 p-1 rounded-lg border border-brand-border text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAnalyticsTimeframe('7d')}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    analyticsTimeframe === '7d'
                      ? 'bg-brand-mocha text-white shadow-xs'
                      : 'text-brand-noir/70 hover:text-brand-noir'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsTimeframe('30d')}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    analyticsTimeframe === '30d'
                      ? 'bg-brand-mocha text-white shadow-xs'
                      : 'text-brand-noir/70 hover:text-brand-noir'
                  }`}
                >
                  Last 30 Days
                </button>
                <button
                  type="button"
                  onClick={() => setAnalyticsTimeframe('all')}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    analyticsTimeframe === 'all'
                      ? 'bg-brand-mocha text-white shadow-xs'
                      : 'text-brand-noir/70 hover:text-brand-noir'
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-brand-noir/60 font-semibold block">
                    Gross Revenue
                  </span>
                  <span className="font-serif text-2xl font-bold text-brand-noir block">
                    {formatINR(analyticsData.totalRevenuePaise)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>Live storefront orders</span>
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-brand-noir/60 font-semibold block">
                    Orders Volume
                  </span>
                  <span className="font-serif text-2xl font-bold text-brand-noir block">
                    {analyticsData.totalOrdersCount}
                  </span>
                  <span className="text-[10px] text-brand-noir/50 block mt-0.5">
                    {analyticsData.paidOrders} paid ({analyticsData.totalOrdersCount > 0 ? Math.round((analyticsData.paidOrders / analyticsData.totalOrdersCount) * 100) : 0}%)
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
                  <Percent className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-brand-noir/60 font-semibold block">
                    Average Order Value (AOV)
                  </span>
                  <span className="font-serif text-2xl font-bold text-brand-noir block">
                    {formatINR(analyticsData.aovPaise)}
                  </span>
                  <span className="text-[10px] text-brand-noir/50 block mt-0.5">
                    Avg basket size
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-brand-border shadow-sm flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-brand-noir/60 font-semibold block">
                    Items Shipped / In Transit
                  </span>
                  <span className="font-serif text-2xl font-bold text-brand-noir block">
                    {analyticsData.totalItemsSold}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                    {analyticsData.deliveredOrders} delivered to clients
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Revenue SVG Graph */}
            <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-brand-mocha" />
                  <h3 className="font-serif text-base text-brand-noir">
                    Revenue Trajectory Timeline ({analyticsTimeframe === '7d' ? 'Last 7 Days' : analyticsTimeframe === '30d' ? 'Last 30 Days' : 'All Time'})
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-xs text-brand-noir/60">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-mocha" />
                    <span>Daily Gross Revenue (₹)</span>
                  </span>
                  <span className="font-semibold text-brand-noir">
                    Peak: {formatINR(analyticsData.maxRevenuePaise)}
                  </span>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              {(() => {
                const svgWidth = 800;
                const svgHeight = 240;
                const padLeft = 80;
                const padRight = 30;
                const padTop = 25;
                const padBottom = 35;
                const chartW = svgWidth - padLeft - padRight;
                const chartH = svgHeight - padTop - padBottom;
                const pts = analyticsData.points;
                const maxVal = analyticsData.maxRevenuePaise;

                const coords = pts.map((p, idx) => {
                  const x = padLeft + (pts.length > 1 ? (idx / (pts.length - 1)) * chartW : chartW / 2);
                  const ratio = maxVal > 0 ? Math.min(1, p.revenuePaise / maxVal) : 0;
                  const y = padTop + chartH - ratio * chartH;
                  return { ...p, x, y };
                });

                const linePath = coords.length > 0
                  ? `M ${coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' L ')}`
                  : '';

                const areaPath = coords.length > 0
                  ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)},${(padTop + chartH).toFixed(1)} L ${coords[0].x.toFixed(1)},${(padTop + chartH).toFixed(1)} Z`
                  : '';

                const step = pts.length > 15 ? Math.ceil(pts.length / 7) : pts.length > 7 ? 2 : 1;

                return (
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[650px]">
                      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
                        <defs>
                          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8E6E53" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#8E6E53" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Horizontal Gridlines & Y-Axis Labels */}
                        {[1, 0.66, 0.33, 0].map((ratio) => {
                          const yVal = padTop + chartH - ratio * chartH;
                          const labelVal = Math.round(maxVal * ratio);
                          return (
                            <g key={ratio}>
                              <line
                                x1={padLeft}
                                y1={yVal}
                                x2={svgWidth - padRight}
                                y2={yVal}
                                stroke="#EFEBE4"
                                strokeDasharray="4 4"
                                strokeWidth="1"
                              />
                              <text
                                x={padLeft - 10}
                                y={yVal + 3.5}
                                textAnchor="end"
                                fontSize="10"
                                fill="#8C827A"
                                fontFamily="sans-serif"
                                fontWeight="500"
                              >
                                {formatINR(labelVal)}
                              </text>
                            </g>
                          );
                        })}

                        {/* Shaded Area Under Curve */}
                        {areaPath && (
                          <path d={areaPath} fill="url(#revenueGrad)" />
                        )}

                        {/* Revenue Curve Line */}
                        {linePath && (
                          <path
                            d={linePath}
                            fill="none"
                            stroke="#8E6E53"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}

                        {/* Data Points and X-Axis Labels */}
                        {coords.map((pt, idx) => {
                          const showLabel = idx % step === 0 || idx === coords.length - 1;
                          return (
                            <g key={idx} className="group">
                              {/* Circle Node */}
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={pt.revenuePaise > 0 ? '4' : '2.5'}
                                fill={pt.revenuePaise > 0 ? '#8E6E53' : '#C5A880'}
                                stroke="#FFFFFF"
                                strokeWidth="2"
                                className="transition-all hover:r-6 cursor-pointer"
                              >
                                <title>{`${pt.displayDate}: ${formatINR(pt.revenuePaise)} (${pt.orderCount} orders)`}</title>
                              </circle>

                              {/* Amount text over peaks */}
                              {pt.revenuePaise > 0 && (
                                <text
                                  x={pt.x}
                                  y={pt.y - 8}
                                  textAnchor="middle"
                                  fontSize="9"
                                  fill="#4A3B32"
                                  fontWeight="bold"
                                >
                                  {formatINR(pt.revenuePaise)}
                                </text>
                              )}

                              {/* X Axis Date Label */}
                              {showLabel && (
                                <text
                                  x={pt.x}
                                  y={padTop + chartH + 18}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fill="#8C827A"
                                  fontFamily="sans-serif"
                                >
                                  {pt.displayDate}
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Bottom Row: Order Status Breakdown & Fulfillment Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Status Breakdown */}
              <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-base text-brand-noir flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-mocha" />
                  <span>Fulfillment Pipeline Status</span>
                </h3>

                <div className="space-y-3">
                  {[
                    { label: 'Delivered to Clients', count: analyticsData.deliveredOrders, color: 'bg-emerald-500' },
                    { label: 'Dispatched & In Transit', count: analyticsData.shippedOrders, color: 'bg-blue-500' },
                    { label: 'Processing in Atelier', count: analyticsData.processingOrders, color: 'bg-amber-500' }
                  ].map((s, idx) => {
                    const pct = analyticsData.totalOrdersCount > 0
                      ? Math.round((s.count / analyticsData.totalOrdersCount) * 100)
                      : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-brand-noir">
                          <span>{s.label}</span>
                          <span className="font-semibold">{s.count} orders ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-brand-sand/60 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${s.color} transition-all duration-500 rounded-full`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Settlement Status */}
              <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-base text-brand-noir flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Payment Settlement Health</span>
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                      Paid & Cleared
                    </span>
                    <span className="font-serif text-2xl font-bold text-emerald-900 block">
                      {analyticsData.paidOrders}
                    </span>
                    <span className="text-[10px] text-emerald-700">
                      Settled transactions
                    </span>
                  </div>

                  <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                    <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                      Pending Settlement
                    </span>
                    <span className="font-serif text-2xl font-bold text-amber-900 block">
                      {Math.max(0, analyticsData.totalOrdersCount - analyticsData.paidOrders)}
                    </span>
                    <span className="text-[10px] text-amber-700">
                      COD / Processing
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-brand-border text-xs text-brand-noir/70 flex items-center justify-between">
                  <span>Overall Conversion Settlement Rate:</span>
                  <span className="font-bold text-brand-noir">
                    {analyticsData.totalOrdersCount > 0
                      ? Math.round((analyticsData.paidOrders / analyticsData.totalOrdersCount) * 100)
                      : 100}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Staff & Team Access Management */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            {/* Notice banner */}
            {staffNotice && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{staffNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStaffNotice('')}
                  className="text-emerald-700 hover:text-emerald-900 font-bold ml-4 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Header and Add Staff Button */}
            <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-mocha flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Administrative Security & Team Permissions
                </span>
                <h2 className="font-serif text-2xl text-brand-noir mt-0.5">Staff & Team Access Directory</h2>
                <p className="text-xs text-brand-noir/70 mt-1">
                  Manage who can log into the atelier backoffice, assign staff and admin roles, deactivate accounts, and trigger password reset emails directly to Gmail.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Staff Member</span>
                </button>
                <button
                  type="button"
                  onClick={loadUsers}
                  className="p-2.5 bg-white border border-brand-border rounded-lg text-brand-noir hover:bg-brand-sand transition-colors cursor-pointer"
                  title="Refresh user directory"
                >
                  <RefreshCw className="w-4 h-4 text-brand-mocha" />
                </button>
              </div>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-brand-noir/60">
                  <span className="uppercase tracking-wider font-semibold text-[10px]">Staff Members</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="font-serif text-2xl font-bold text-brand-noir">{userStats.totalStaff}</div>
                <p className="text-[10px] text-brand-noir/50">Operations & Atelier fulfillment</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-brand-noir/60">
                  <span className="uppercase tracking-wider font-semibold text-[10px]">Store Admins</span>
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                </div>
                <div className="font-serif text-2xl font-bold text-brand-noir">{userStats.totalAdmins}</div>
                <p className="text-[10px] text-brand-noir/50">Full backoffice control</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-brand-noir/60">
                  <span className="uppercase tracking-wider font-semibold text-[10px]">Registered Clients</span>
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="font-serif text-2xl font-bold text-brand-noir">{userStats.totalCustomers}</div>
                <p className="text-[10px] text-brand-noir/50">Storefront customer accounts</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-brand-noir/60">
                  <span className="uppercase tracking-wider font-semibold text-[10px]">Suspended / Deactivated</span>
                  <UserX className="w-4 h-4 text-red-600" />
                </div>
                <div className="font-serif text-2xl font-bold text-brand-noir">{userStats.suspendedCount}</div>
                <p className="text-[10px] text-brand-noir/50">Blocked from logging in</p>
              </div>
            </div>

            {/* Gmail SMTP Delivery Verification Card */}
            <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-serif text-base text-brand-noir font-semibold">Direct Gmail Delivery Engine</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-brand-noir/70">
                      Dispatches password reset instructions, security links, and concierge emails directly into recipients' Gmail inboxes.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSendTestEmail} className="flex items-center gap-2">
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    placeholder="Recipient Gmail..."
                    className="bg-brand-sand/30 border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-noir focus:outline-none focus:border-brand-mocha w-56 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={sendingTestEmail}
                    className="px-3.5 py-2 bg-brand-noir text-white text-xs font-semibold rounded-lg hover:bg-brand-mocha transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {sendingTestEmail ? 'Sending...' : 'Send Test to Gmail'}
                  </button>
                </form>
              </div>

              {testEmailNotice && (
                <div className="p-3 bg-brand-sand/40 border border-brand-border rounded-lg text-xs text-brand-noir font-medium flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{testEmailNotice}</span>
                </div>
              )}
            </div>

            {/* Users Directory Table */}
            <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden space-y-0">
              {/* Filter & Search Bar */}
              <div className="p-4 border-b border-brand-border bg-brand-sand/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('staff_admin')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      userRoleFilter === 'staff_admin'
                        ? 'bg-brand-mocha text-white shadow-2xs'
                        : 'bg-white border border-brand-border text-brand-noir hover:bg-brand-sand/40'
                    }`}
                  >
                    Staff & Admins ({userStats.totalStaff + userStats.totalAdmins})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('staff')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      userRoleFilter === 'staff'
                        ? 'bg-brand-mocha text-white shadow-2xs'
                        : 'bg-white border border-brand-border text-brand-noir hover:bg-brand-sand/40'
                    }`}
                  >
                    Staff Only ({userStats.totalStaff})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('admin')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      userRoleFilter === 'admin'
                        ? 'bg-brand-mocha text-white shadow-2xs'
                        : 'bg-white border border-brand-border text-brand-noir hover:bg-brand-sand/40'
                    }`}
                  >
                    Admins ({userStats.totalAdmins})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('customer')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      userRoleFilter === 'customer'
                        ? 'bg-brand-mocha text-white shadow-2xs'
                        : 'bg-white border border-brand-border text-brand-noir hover:bg-brand-sand/40'
                    }`}
                  >
                    Clients ({userStats.totalCustomers})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      userRoleFilter === 'all'
                        ? 'bg-brand-mocha text-white shadow-2xs'
                        : 'bg-white border border-brand-border text-brand-noir hover:bg-brand-sand/40'
                    }`}
                  >
                    All Users
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full sm:w-64 bg-white border border-brand-border rounded-lg pl-3 pr-8 py-1.5 text-xs text-brand-noir focus:outline-none focus:border-brand-mocha"
                  />
                  {userSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setUserSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              {usersLoading ? (
                <div className="p-12 text-center text-xs text-brand-noir/60">Loading team members & users...</div>
              ) : usersList.length === 0 ? (
                <div className="p-12 text-center text-xs text-brand-noir/60 space-y-2">
                  <Users className="w-8 h-8 mx-auto text-brand-noir/30" />
                  <p>No users found matching this filter.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-brand-noir">
                    <thead className="bg-brand-sand/60 uppercase font-serif tracking-wider text-brand-noir/80 border-b border-brand-border">
                      <tr>
                        <th className="py-3 px-4">User Details</th>
                        <th className="py-3 px-4">Role Permission</th>
                        <th className="py-3 px-4">Login Status</th>
                        <th className="py-3 px-4">Last Active / Login</th>
                        <th className="py-3 px-4 text-right">Access Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {usersList.map((u) => {
                        const isSelf = user?._id === u._id;
                        const isSuspended = u.isActive === false;

                        return (
                          <tr key={u._id} className="hover:bg-brand-sand/20 transition-colors">
                            {/* User details */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-brand-sand flex items-center justify-center font-bold text-xs text-brand-mocha border border-brand-border shrink-0">
                                  {u.name?.slice(0, 2).toUpperCase() || 'ZA'}
                                </div>
                                <div>
                                  <div className="font-semibold text-brand-noir flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {isSelf && (
                                      <span className="text-[9px] font-bold bg-brand-mocha text-white px-1.5 py-0.2 rounded uppercase">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-brand-noir/60 font-mono">{u.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* Role selector */}
                            <td className="py-3.5 px-4">
                              <select
                                value={u.role}
                                disabled={isSelf}
                                onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                                className={`text-xs font-semibold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                                  u.role === 'superadmin' || u.role === 'admin'
                                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                                    : u.role === 'staff'
                                    ? 'bg-blue-50 text-blue-900 border-blue-300'
                                    : 'bg-zinc-100 text-zinc-800 border-zinc-200'
                                } disabled:opacity-60 disabled:cursor-not-allowed`}
                              >
                                <option value="staff">Staff (Atelier)</option>
                                <option value="admin">Admin (Full Control)</option>
                                <option value="customer">Client / Customer</option>
                              </select>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <button
                                type="button"
                                disabled={isSelf}
                                onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                                  !isSuspended
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-red-100 hover:text-red-800'
                                    : 'bg-red-100 text-red-800 hover:bg-emerald-100 hover:text-emerald-800'
                                } disabled:opacity-60 disabled:cursor-not-allowed`}
                                title={isSelf ? 'Cannot deactivate yourself' : 'Click to toggle Active / Suspended'}
                              >
                                {!isSuspended ? (
                                  <>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span>Active</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="w-2 h-2 rounded-full bg-red-500" />
                                    <span>Suspended</span>
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Last Active */}
                            <td className="py-3.5 px-4 text-brand-noir/70">
                              {u.lastLoginAt ? (
                                <div>
                                  <div className="font-medium text-brand-noir">
                                    {new Date(u.lastLoginAt).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </div>
                                  <div className="text-[10px] text-brand-noir/50">
                                    {new Date(u.lastLoginAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-zinc-400 italic text-[11px]">Never logged in</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {/* Send Password Reset Email */}
                                <button
                                  type="button"
                                  onClick={() => handleSendResetPassword(u._id, u.email)}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-brand-sand/50 hover:bg-brand-sand text-brand-noir hover:text-brand-mocha transition-colors cursor-pointer text-[11px] font-medium"
                                  title={`Send password reset link directly to ${u.email}`}
                                >
                                  <Key className="w-3.5 h-3.5 text-brand-mocha" />
                                  <span>Reset Password</span>
                                </button>

                                {/* Remove / Delete User */}
                                {!isSelf && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u._id, u.name)}
                                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                    title="Remove this staff member / user"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Add New Staff Member Modal */}
            {isAddStaffOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-brand-border">
                  <div className="flex items-center justify-between border-b border-brand-border pb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-brand-mocha/15 flex items-center justify-center text-brand-mocha">
                        <Users className="w-4 h-4" />
                      </div>
                      <h3 className="font-serif text-lg text-brand-noir font-semibold">Add New Staff Member</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddStaffOpen(false)}
                      className="text-zinc-400 hover:text-brand-noir p-1 rounded-md cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateStaff} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        placeholder="e.g. Mariam Al-Hassan"
                        className="w-full bg-brand-sand/20 border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-noir focus:outline-none focus:border-brand-mocha font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Gmail or Work Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={newStaffEmail}
                        onChange={(e) => setNewStaffEmail(e.target.value)}
                        placeholder="e.g. mariam.staff@gmail.com"
                        className="w-full bg-brand-sand/20 border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-noir focus:outline-none focus:border-brand-mocha font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Assigned Role
                      </label>
                      <select
                        value={newStaffRole}
                        onChange={(e) => setNewStaffRole(e.target.value as 'staff' | 'admin')}
                        className="w-full bg-brand-sand/20 border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-noir focus:outline-none focus:border-brand-mocha font-medium"
                      >
                        <option value="staff">Staff (Atelier Operations & Fulfillment)</option>
                        <option value="admin">Administrator (Full Backoffice & Studio Access)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Initial Temporary Password
                      </label>
                      <input
                        type="text"
                        required
                        minLength={8}
                        value={newStaffPassword}
                        onChange={(e) => setNewStaffPassword(e.target.value)}
                        placeholder="e.g. AtelierStaff@2026"
                        className="w-full bg-brand-sand/20 border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-noir focus:outline-none focus:border-brand-mocha font-mono"
                      />
                    </div>

                    <div className="p-3 bg-brand-sand/30 rounded-lg border border-brand-border">
                      <label className="flex items-start space-x-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newStaffSendReset}
                          onChange={(e) => setNewStaffSendReset(e.target.checked)}
                          className="mt-0.5 rounded border-brand-border text-brand-mocha focus:ring-brand-mocha"
                        />
                        <span className="text-xs text-brand-noir leading-tight">
                          <strong>Send password setup email to their Gmail immediately</strong> so they can choose their own confidential password.
                        </span>
                      </label>
                    </div>

                    <div className="pt-2 flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsAddStaffOpen(false)}
                        className="px-4 py-2 border border-brand-border text-xs font-semibold rounded-lg hover:bg-brand-sand/30 text-brand-noir cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingStaff}
                        className="px-5 py-2 bg-brand-mocha hover:bg-brand-mocha-dark text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {savingStaff ? 'Creating Staff Member...' : 'Create Staff Member'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Coupons & Promo Codes Studio */}
        {activeTab === 'coupons' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-mocha flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Atelier Marketing & Promotions
                </span>
                <h2 className="font-serif text-2xl text-brand-noir mt-0.5">Coupons & Promo Codes Studio</h2>
                <p className="text-xs text-brand-noir/70 mt-1">
                  Create, configure, and manage instant promotional vouchers. Codes apply automatically to both the slide-out Shopping Bag and Checkout.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenCreateCoupon}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Coupon</span>
                </button>
                <button
                  type="button"
                  onClick={loadCoupons}
                  className="p-2.5 bg-white border border-brand-border rounded-lg text-brand-noir hover:bg-brand-sand transition-colors cursor-pointer"
                  title="Refresh coupons list"
                >
                  <RefreshCw className={`w-4 h-4 text-brand-mocha ${couponsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-brand-noir/60">
                  <span className="uppercase tracking-wider font-semibold text-[10px]">Total Coupons</span>
                  <Tag className="w-4 h-4 text-brand-mocha" />
                </div>
                <div className="font-serif text-2xl font-bold text-brand-noir">{coupons.length}</div>
                <p className="text-[10px] text-brand-noir/50">Configured in atelier database</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-brand-noir/60">
                  <span className="uppercase tracking-wider font-semibold text-[10px]">Active & Live</span>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="font-serif text-2xl font-bold text-emerald-700">
                  {coupons.filter((c) => c.active !== false).length}
                </div>
                <p className="text-[10px] text-brand-noir/50">Ready to redeem at checkout</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-brand-noir/60">
                  <span className="uppercase tracking-wider font-semibold text-[10px]">Client Redemptions</span>
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div className="font-serif text-2xl font-bold text-brand-noir">
                  {coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)}
                </div>
                <p className="text-[10px] text-brand-noir/50">Total orders with voucher applied</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs space-y-1">
                <div className="flex items-center justify-between text-xs text-brand-noir/60">
                  <span className="uppercase tracking-wider font-semibold text-[10px]">Default Vouchers</span>
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>
                <div className="font-serif text-sm font-bold text-brand-noir flex items-center gap-1.5 pt-1">
                  <span className="px-2 py-0.5 bg-brand-sand rounded font-mono text-xs">ZAYNA100</span>
                  <span className="text-[11px] text-emerald-700 font-sans font-semibold">₹100 OFF</span>
                </div>
                <p className="text-[10px] text-brand-noir/50">Plus ZAYNA10, EIDMUBARAK</p>
              </div>
            </div>

            {/* Coupons Table Card */}
            <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
              {/* Filter bar */}
              <div className="p-4 border-b border-brand-border bg-brand-sand/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2 text-xs font-semibold">
                  <span className="text-brand-noir/60 uppercase tracking-wider">Promo Codes</span>
                  <span className="px-2 py-0.5 rounded-full bg-brand-sand text-brand-mocha text-[11px]">
                    {coupons.length} total
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={couponSearchQuery}
                    onChange={(e) => setCouponSearchQuery(e.target.value)}
                    placeholder="Search by code name..."
                    className="w-full sm:w-64 bg-white border border-brand-border rounded-lg pl-3 pr-8 py-1.5 text-xs text-brand-noir focus:outline-none focus:border-brand-mocha uppercase"
                  />
                  {couponSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCouponSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Table Body */}
              {couponsLoading ? (
                <div className="p-12 text-center text-xs text-brand-noir/60">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-mocha mb-2" />
                  Loading promo codes...
                </div>
              ) : coupons.length === 0 ? (
                <div className="p-12 text-center text-xs text-brand-noir/60 space-y-3">
                  <Tag className="w-8 h-8 mx-auto text-brand-noir/30" />
                  <p className="font-serif text-sm text-brand-noir">No coupons registered yet.</p>
                  <button
                    type="button"
                    onClick={handleOpenCreateCoupon}
                    className="px-4 py-2 bg-brand-mocha text-white text-xs font-semibold rounded-lg hover:bg-brand-mocha-dark cursor-pointer shadow-xs"
                  >
                    Create Your First Coupon
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-brand-noir">
                    <thead className="bg-brand-sand/60 uppercase font-serif tracking-wider text-brand-noir/80 border-b border-brand-border">
                      <tr>
                        <th className="py-3 px-4">Coupon Code</th>
                        <th className="py-3 px-4">Discount Value</th>
                        <th className="py-3 px-4">Order Condition</th>
                        <th className="py-3 px-4">Redemptions</th>
                        <th className="py-3 px-4">Expiration</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {coupons
                        .filter((c) =>
                          !couponSearchQuery || c.code.toLowerCase().includes(couponSearchQuery.toLowerCase().trim())
                        )
                        .map((cpn) => {
                          const isPercentage = cpn.discountType === 'percentage';
                          const displayVal = isPercentage
                            ? `${cpn.discountValue}% OFF`
                            : `${formatINR(cpn.discountValue)} FLAT OFF`;
                          const minOrderStr =
                            cpn.minOrderAmount && cpn.minOrderAmount > 0
                              ? `Min. Order: ${formatINR(cpn.minOrderAmount)}`
                              : 'No minimum order';

                          return (
                            <tr key={cpn._id || cpn.code} className="hover:bg-brand-sand/20 transition-colors">
                              {/* Code */}
                              <td className="py-3.5 px-4 font-mono font-bold text-xs text-brand-noir">
                                <div className="flex items-center space-x-2">
                                  <span className="px-2.5 py-1 bg-brand-sand/80 border border-brand-border rounded tracking-wider">
                                    {cpn.code}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard?.writeText(cpn.code);
                                      alert(`Copied "${cpn.code}" to clipboard!`);
                                    }}
                                    className="text-[10px] text-brand-noir/40 hover:text-brand-mocha cursor-pointer"
                                    title="Copy coupon code"
                                  >
                                    Copy
                                  </button>
                                </div>
                              </td>

                              {/* Discount Value */}
                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                    isPercentage
                                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                      : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                  }`}
                                >
                                  {displayVal}
                                </span>
                                {isPercentage && cpn.maxDiscountAmount ? (
                                  <span className="block text-[10px] text-brand-noir/60 mt-0.5">
                                    Capped at {formatINR(cpn.maxDiscountAmount)}
                                  </span>
                                ) : null}
                              </td>

                              {/* Order Condition */}
                              <td className="py-3.5 px-4 text-brand-noir/70">
                                <span>{minOrderStr}</span>
                              </td>

                              {/* Redemptions */}
                              <td className="py-3.5 px-4 text-brand-noir">
                                <span className="font-semibold">{cpn.usedCount || 0}</span>
                                <span className="text-brand-noir/50">
                                  {cpn.maxUses ? ` / ${cpn.maxUses} max` : ' (unlimited)'}
                                </span>
                              </td>

                              {/* Expiration */}
                              <td className="py-3.5 px-4 text-brand-noir/70">
                                {cpn.validUntil ? (
                                  <div>
                                    <span>
                                      {new Date(cpn.validUntil).toLocaleDateString('en-IN', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </span>
                                    {new Date(cpn.validUntil) < new Date() ? (
                                      <span className="ml-1.5 text-[9px] font-bold text-red-600 uppercase">
                                        Expired
                                      </span>
                                    ) : null}
                                  </div>
                                ) : (
                                  <span className="text-emerald-700 font-semibold">No expiry</span>
                                )}
                              </td>

                              {/* Status Toggle */}
                              <td className="py-3.5 px-4">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCouponStatus(cpn)}
                                  className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                                    cpn.active !== false
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-red-100 hover:text-red-800'
                                      : 'bg-zinc-100 text-zinc-600 hover:bg-emerald-100 hover:text-emerald-800'
                                  }`}
                                  title="Click to toggle active status"
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      cpn.active !== false ? 'bg-emerald-500' : 'bg-zinc-400'
                                    }`}
                                  />
                                  <span>{cpn.active !== false ? 'Active' : 'Inactive'}</span>
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="inline-flex items-center space-x-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditCoupon(cpn)}
                                    className="p-1.5 text-brand-noir/60 hover:text-brand-mocha rounded hover:bg-brand-sand/50 transition-colors cursor-pointer"
                                    title="Edit coupon parameters"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  {cpn._id && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCoupon(cpn._id!, cpn.code)}
                                      className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                                      title="Delete coupon"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* MODAL: ADD / EDIT COUPON */}
            {isCouponModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-brand-border my-8">
                  <div className="flex items-center justify-between border-b border-brand-border pb-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-full bg-brand-mocha/15 flex items-center justify-center text-brand-mocha">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg text-brand-noir font-semibold">
                          {editingCouponId ? 'Edit Promo Coupon' : 'Create New Promo Coupon'}
                        </h3>
                        <p className="text-[11px] text-brand-noir/60">
                          {editingCouponId ? 'Modify discount terms or expiry' : 'Add custom coupon code for instant checkout discounts'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCouponModalOpen(false)}
                      className="text-zinc-400 hover:text-brand-noir p-1 rounded-md cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {couponError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                      {couponError}
                    </div>
                  )}

                  {couponSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-medium flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{couponSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveCoupon} className="space-y-4">
                    {/* Code */}
                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Coupon Promo Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. ZAYNA100, EIDMUBARAK, SPECIAL50"
                        className="w-full bg-brand-sand/20 border border-brand-border rounded-lg px-3 py-2 text-xs font-mono font-bold tracking-wider text-brand-noir focus:outline-none focus:border-brand-mocha uppercase"
                      />
                      <span className="text-[10px] text-brand-noir/50">
                        Clients will type this exact code in their cart drawer or checkout.
                      </span>
                    </div>

                    {/* Discount Type & Value */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Discount Type
                        </label>
                        <select
                          value={couponForm.discountType}
                          onChange={(e) =>
                            setCouponForm({
                              ...couponForm,
                              discountType: e.target.value as 'percentage' | 'fixed'
                            })
                          }
                          className="w-full bg-brand-sand/20 border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-noir focus:outline-none focus:border-brand-mocha font-medium cursor-pointer"
                        >
                          <option value="fixed">Flat Amount Off (₹ INR)</option>
                          <option value="percentage">Percentage Off (%)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          {couponForm.discountType === 'percentage' ? 'Percentage Value (%) *' : 'Flat Discount (₹ INR) *'}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min="1"
                            max={couponForm.discountType === 'percentage' ? 100 : undefined}
                            value={couponForm.discountValue}
                            onChange={(e) =>
                              setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })
                            }
                            placeholder={couponForm.discountType === 'percentage' ? '15' : '100'}
                            className="w-full bg-brand-sand/20 border border-brand-border rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-brand-noir focus:outline-none focus:border-brand-mocha"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-noir/40">
                            {couponForm.discountType === 'percentage' ? '%' : '₹'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Minimum Order Amount & Max Discount Cap */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Min. Order Subtotal (₹ INR)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={couponForm.minOrderAmount}
                          onChange={(e) =>
                            setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })
                          }
                          placeholder="0 for no minimum"
                          className="w-full bg-brand-sand/20 border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-noir focus:outline-none focus:border-brand-mocha"
                        />
                        <span className="text-[10px] text-brand-noir/50">Enter 0 to allow on any cart.</span>
                      </div>

                      {couponForm.discountType === 'percentage' ? (
                        <div>
                          <label className="block text-xs font-semibold text-brand-noir mb-1">
                            Max Discount Cap (₹ INR)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={couponForm.maxDiscountAmount || ''}
                            onChange={(e) =>
                              setCouponForm({
                                ...couponForm,
                                maxDiscountAmount: Number(e.target.value) || 0
                              })
                            }
                            placeholder="Optional cap (e.g. 1500)"
                            className="w-full bg-brand-sand/20 border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-noir focus:outline-none focus:border-brand-mocha"
                          />
                          <span className="text-[10px] text-brand-noir/50">Leave empty for no limit.</span>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-semibold text-brand-noir mb-1">
                            Max Total Redemptions
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={couponForm.maxUses}
                            onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                            placeholder="Optional (e.g. 500)"
                            className="w-full bg-brand-sand/20 border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-noir focus:outline-none focus:border-brand-mocha"
                          />
                          <span className="text-[10px] text-brand-noir/50">Leave empty for unlimited.</span>
                        </div>
                      )}
                    </div>

                    {/* Expiration Date & Active Toggle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Expiration Date
                        </label>
                        <input
                          type="date"
                          value={couponForm.validUntil}
                          onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                          className="w-full bg-brand-sand/20 border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-noir focus:outline-none focus:border-brand-mocha cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center pt-5">
                        <label className="flex items-center space-x-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={couponForm.active}
                            onChange={(e) => setCouponForm({ ...couponForm, active: e.target.checked })}
                            className="w-4 h-4 rounded text-brand-mocha focus:ring-brand-mocha border-brand-border"
                          />
                          <span className="text-xs font-semibold text-brand-noir">
                            Active & Ready for Checkout
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Live Preview Box */}
                    <div className="p-3 bg-brand-sand/40 border border-brand-border rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-noir/60 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-brand-mocha" />
                        Live Shopping Bag Preview
                      </span>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center text-brand-mocha font-semibold">
                          <Tag className="w-3.5 h-3.5 mr-1 text-brand-gold" />
                          <span>Code {couponForm.code || 'COUPON'} applied</span>
                          <span className="ml-1 text-emerald-700 font-bold">
                            (-{couponForm.discountType === 'percentage' ? `${couponForm.discountValue || 0}%` : `₹${couponForm.discountValue || 0}`})
                          </span>
                        </div>
                        <span className="text-[10px] text-red-600">Remove</span>
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-end space-x-3 border-t border-brand-border">
                      <button
                        type="button"
                        onClick={() => setIsCouponModalOpen(false)}
                        className="px-4 py-2 border border-brand-border text-xs font-semibold rounded-lg hover:bg-brand-sand/30 text-brand-noir cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingCoupon}
                        className="px-5 py-2 bg-brand-mocha hover:bg-brand-mocha-dark text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {savingCoupon ? 'Saving Voucher...' : editingCouponId ? 'Save Changes' : 'Create & Activate Coupon'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Storefront Designer & Layout Builder */}
        {activeTab === 'storefront' && (
          <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
            {/* Studio Header */}
            <div className="p-6 border-b border-brand-border bg-brand-sand/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-mocha flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  Live Theme & Content Engine
                </span>
                <h2 className="font-serif text-2xl text-brand-noir">Storefront Designer & Layout Studio</h2>
                <p className="text-xs text-brand-noir/70 mt-1">
                  Customize colors, fonts, hero video/images, shuffle homepage sections, and toggle footer modules in real time.
                </p>
              </div>

              {/* Save Action */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveDesigner}
                  disabled={savingDesigner}
                  className="px-5 py-2.5 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded-lg text-xs font-semibold uppercase tracking-wider shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{savingDesigner ? 'Publishing Changes...' : 'Save & Publish Live'}</span>
                </button>
              </div>
            </div>

            {/* Notification Toast */}
            {designerNotice && (
              <div className="mx-6 mt-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center shadow-xs animate-fade-in">
                <CheckCircle className="w-4 h-4 mr-2 shrink-0 text-emerald-600" />
                <span className="font-medium">{designerNotice}</span>
              </div>
            )}

            {/* Sub-Tabs Bar */}
            <div className="flex border-b border-brand-border px-6 pt-4 gap-2 overflow-x-auto text-xs font-semibold uppercase tracking-wider bg-zinc-50/50">
              <button
                onClick={() => setDesignerSubTab('announcement')}
                className={`pb-3 px-3.5 border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
                  designerSubTab === 'announcement'
                    ? 'border-brand-mocha text-brand-mocha'
                    : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
                }`}
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Announcement Bar</span>
              </button>

              <button
                onClick={() => setDesignerSubTab('hero')}
                className={`pb-3 px-3.5 border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
                  designerSubTab === 'hero'
                    ? 'border-brand-mocha text-brand-mocha'
                    : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Hero Media & Text</span>
              </button>

              <button
                onClick={() => setDesignerSubTab('brandStory')}
                className={`pb-3 px-3.5 border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
                  designerSubTab === 'brandStory'
                    ? 'border-brand-mocha text-brand-mocha'
                    : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Brand Story & Heritage</span>
              </button>

              <button
                onClick={() => setDesignerSubTab('categories')}
                className={`pb-3 px-3.5 border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
                  designerSubTab === 'categories'
                    ? 'border-brand-mocha text-brand-mocha'
                    : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Curated Categories</span>
              </button>

              <button
                onClick={() => setDesignerSubTab('layout')}
                className={`pb-3 px-3.5 border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
                  designerSubTab === 'layout'
                    ? 'border-brand-mocha text-brand-mocha'
                    : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Homepage Section Shuffler</span>
              </button>

              <button
                onClick={() => setDesignerSubTab('navbar')}
                className={`pb-3 px-3.5 border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
                  designerSubTab === 'navbar'
                    ? 'border-brand-mocha text-brand-mocha'
                    : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Navbar & Theme Colors</span>
              </button>

              <button
                onClick={() => setDesignerSubTab('footer')}
                className={`pb-3 px-3.5 border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
                  designerSubTab === 'footer'
                    ? 'border-brand-mocha text-brand-mocha'
                    : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Footer Modules</span>
              </button>

              <button
                onClick={() => setDesignerSubTab('instagram')}
                className={`pb-3 px-3.5 border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
                  designerSubTab === 'instagram'
                    ? 'border-brand-mocha text-brand-mocha'
                    : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Instagram Lookbook</span>
              </button>

              <button
                onClick={() => setDesignerSubTab('recommendations')}
                className={`pb-3 px-3.5 border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
                  designerSubTab === 'recommendations'
                    ? 'border-brand-mocha text-brand-mocha'
                    : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>You May Also Admire</span>
              </button>

              <button
                onClick={() => setDesignerSubTab('buttons')}
                className={`pb-3 px-3.5 border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
                  designerSubTab === 'buttons'
                    ? 'border-brand-mocha text-brand-mocha'
                    : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Buttons & CTAs</span>
              </button>

              <button
                onClick={() => setDesignerSubTab('invoice')}
                className={`pb-3 px-3.5 border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
                  designerSubTab === 'invoice'
                    ? 'border-brand-mocha text-brand-mocha'
                    : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Invoice & Receipt</span>
              </button>

              <button
                onClick={() => setDesignerSubTab('faqs')}
                className={`pb-3 px-3.5 border-b-2 transition-all flex items-center space-x-1.5 shrink-0 ${
                  designerSubTab === 'faqs'
                    ? 'border-brand-mocha text-brand-mocha'
                    : 'border-transparent text-brand-noir/60 hover:text-brand-noir'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Concierge FAQs</span>
              </button>
            </div>

            {/* Sub-Tab 1: Announcement Bar Studio */}
            {designerSubTab === 'announcement' && (
              <div className="p-6 sm:p-8 space-y-8 max-w-4xl">
                {/* Live Preview Card */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-noir/60 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      Live Announcement Bar Preview
                    </span>
                    {announcementIsMovable ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Movable Marquee Active ({announcementScrollSpeed})
                      </span>
                    ) : (
                      <span className="text-[10px] text-brand-noir/50">
                        Static ({announcementTextAlign})
                      </span>
                    )}
                  </div>

                  <div
                    className="py-2.5 px-4 text-xs sm:text-sm rounded-lg shadow-sm transition-all border border-black/10 relative overflow-hidden"
                    style={{
                      backgroundColor: announcementBgColor,
                      color: announcementTextColor,
                      fontFamily: announcementFont
                    }}
                  >
                    {announcementIsMovable ? (
                      <div className="overflow-hidden w-full relative flex select-none py-0.5">
                        <style jsx>{`
                          @keyframes adminPreviewMarquee {
                            0% { transform: translateX(0%); }
                            100% { transform: translateX(-50%); }
                          }
                          .admin-preview-track {
                            display: inline-flex;
                            width: max-content;
                            animation: adminPreviewMarquee ${announcementScrollSpeed === 'slow' ? 34 : announcementScrollSpeed === 'fast' ? 14 : 22}s linear infinite;
                          }
                          .admin-preview-track:hover {
                            animation-play-state: paused;
                          }
                        `}</style>
                        <div className="admin-preview-track">
                          {[1, 2, 3, 4].map((i) => (
                            <span key={i} className="inline-flex items-center mx-6 whitespace-nowrap shrink-0">
                              <Sparkles className="w-3.5 h-3.5 mr-2 shrink-0 animate-pulse inline" style={{ color: announcementTextColor }} />
                              <span>{announcementMsg || 'Announcement bar text preview'}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`flex items-center font-medium tracking-wide ${
                          announcementTextAlign === 'left'
                            ? 'justify-start text-left pl-2 pr-8'
                            : announcementTextAlign === 'right'
                            ? 'justify-end text-right pr-8 pl-2'
                            : 'justify-center text-center px-6'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-2 shrink-0 animate-pulse" style={{ color: announcementTextColor }} />
                        <span className="truncate">
                          {announcementMsg || 'Announcement bar text preview'}
                        </span>
                      </div>
                    )}

                    {announcementDismissible && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 text-xs bg-black/10 rounded-full p-0.5">✕</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Message, Link & Movement Settings */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Announcement Text *
                      </label>
                      <textarea
                        rows={3}
                        value={announcementMsg}
                        onChange={(e) => setAnnouncementMsg(e.target.value)}
                        placeholder="e.g. ✨ Free Express Shipping on orders above ₹2,999 | Code: EIDMUBARAK"
                        className="w-full bg-brand-sand/20 border border-brand-border rounded-lg p-3 text-xs focus:outline-none focus:border-brand-mocha"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Destination Link (Optional)
                      </label>
                      <input
                        type="text"
                        value={announcementLink}
                        onChange={(e) => setAnnouncementLink(e.target.value)}
                        placeholder="/shop or /shop?category=eid-festive"
                        className="w-full bg-brand-sand/20 border border-brand-border rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                      />
                    </div>

                    {/* Movable / Marquee Motion Settings Card */}
                    <div className="bg-brand-sand/30 border border-brand-border rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-brand-mocha/20 flex items-center justify-center text-brand-mocha">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-brand-noir">Movable Text / Scrolling Marquee</h4>
                            <p className="text-[10px] text-brand-noir/60">Animate text continuously across the top bar</p>
                          </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={announcementIsMovable}
                            onChange={(e) => setAnnouncementIsMovable(e.target.checked)}
                            className="w-4 h-4 rounded text-brand-mocha focus:ring-brand-mocha cursor-pointer"
                          />
                          <span className="ml-2 text-xs font-semibold text-brand-noir">
                            {announcementIsMovable ? 'Movable' : 'Static'}
                          </span>
                        </label>
                      </div>

                      {announcementIsMovable ? (
                        <div className="pt-2 border-t border-brand-border/60 space-y-2 animate-fade-in">
                          <label className="block text-[11px] font-semibold text-brand-noir">
                            Movement Speed
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'slow', label: 'Slow & Regal', hint: '34s per loop' },
                              { id: 'medium', label: 'Medium', hint: '22s per loop' },
                              { id: 'fast', label: 'Fast & Dynamic', hint: '14s per loop' }
                            ].map((spd) => (
                              <button
                                key={spd.id}
                                type="button"
                                onClick={() => setAnnouncementScrollSpeed(spd.id as any)}
                                className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                                  announcementScrollSpeed === spd.id
                                    ? 'bg-brand-mocha text-white border-brand-mocha shadow-2xs'
                                    : 'bg-white border-brand-border text-brand-noir hover:bg-brand-sand/50'
                                }`}
                              >
                                <div className="text-[11px] font-bold">{spd.label}</div>
                                <div className={`text-[9px] ${announcementScrollSpeed === spd.id ? 'text-white/80' : 'text-brand-noir/50'}`}>
                                  {spd.hint}
                                </div>
                              </button>
                            ))}
                          </div>
                          <p className="text-[10px] text-brand-noir/50 italic pt-1">
                            ✨ Shoppers can hover over the text to pause it and click the promotion link.
                          </p>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-brand-border/60 space-y-2 animate-fade-in">
                          <label className="block text-[11px] font-semibold text-brand-noir">
                            Text Position / Alignment
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'left', label: 'Left Aligned' },
                              { id: 'center', label: 'Centered (Default)' },
                              { id: 'right', label: 'Right Aligned' }
                            ].map((pos) => (
                              <button
                                key={pos.id}
                                type="button"
                                onClick={() => setAnnouncementTextAlign(pos.id as any)}
                                className={`py-1.5 px-2 rounded-lg border text-center transition-colors cursor-pointer text-xs font-semibold ${
                                  announcementTextAlign === pos.id
                                    ? 'bg-brand-mocha text-white border-brand-mocha shadow-2xs'
                                    : 'bg-white border-brand-border text-brand-noir hover:bg-brand-sand/50'
                                }`}
                              >
                                {pos.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="flex items-center space-x-2 text-xs font-medium text-brand-noir cursor-pointer">
                        <input
                          type="checkbox"
                          checked={announcementActive}
                          onChange={(e) => setAnnouncementActive(e.target.checked)}
                          className="rounded text-brand-mocha focus:ring-brand-mocha"
                        />
                        <span>Show announcement bar on live storefront</span>
                      </label>

                      <label className="flex items-center space-x-2 text-xs font-medium text-brand-noir cursor-pointer">
                        <input
                          type="checkbox"
                          checked={announcementDismissible}
                          onChange={(e) => setAnnouncementDismissible(e.target.checked)}
                          className="rounded text-brand-mocha focus:ring-brand-mocha"
                        />
                        <span>Allow shoppers to dismiss announcement</span>
                      </label>
                    </div>
                  </div>

                  {/* Font & Color Styling */}
                  <div className="space-y-4 bg-brand-sand/15 p-5 rounded-xl border border-brand-border">
                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Font Family
                      </label>
                      <select
                        value={announcementFont}
                        onChange={(e) => setAnnouncementFont(e.target.value)}
                        className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha font-medium"
                      >
                        <option value="Cinzel, sans-serif">Cinzel (Haute Modesty Signature)</option>
                        <option value="'Playfair Display', serif">Playfair Display (Editorial Serif)</option>
                        <option value="'Montserrat', sans-serif">Montserrat (Modern Clean Geometric)</option>
                        <option value="'Cormorant Garamond', serif">Cormorant Garamond (Artisan Luxury)</option>
                        <option value="sans-serif">System Clean Sans-Serif</option>
                      </select>
                    </div>

                    {/* Background Color Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Background Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={announcementBgColor}
                          onChange={(e) => setAnnouncementBgColor(e.target.value)}
                          className="w-9 h-9 rounded cursor-pointer border border-brand-border p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={announcementBgColor}
                          onChange={(e) => setAnnouncementBgColor(e.target.value)}
                          className="w-28 bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                      {/* Presets */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[
                          { name: 'Mocha', hex: '#8E6E53' },
                          { name: 'Noir', hex: '#121212' },
                          { name: 'Emerald', hex: '#1B3B2B' },
                          { name: 'Navy', hex: '#1A2530' },
                          { name: 'Burgundy', hex: '#4A1521' }
                        ].map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setAnnouncementBgColor(c.hex)}
                            className="px-2 py-1 bg-white border border-brand-border rounded text-[10px] font-medium hover:border-brand-mocha flex items-center space-x-1"
                          >
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: c.hex }} />
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Text Color Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Text Color
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={announcementTextColor}
                          onChange={(e) => setAnnouncementTextColor(e.target.value)}
                          className="w-9 h-9 rounded cursor-pointer border border-brand-border p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={announcementTextColor}
                          onChange={(e) => setAnnouncementTextColor(e.target.value)}
                          className="w-28 bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                      {/* Presets */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {[
                          { name: 'Pure White', hex: '#FFFFFF' },
                          { name: 'Cream', hex: '#FAF7F2' },
                          { name: 'Gold', hex: '#D4AF37' },
                          { name: 'Noir', hex: '#1A1A1A' }
                        ].map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setAnnouncementTextColor(c.hex)}
                            className="px-2 py-1 bg-white border border-brand-border rounded text-[10px] font-medium hover:border-brand-mocha flex items-center space-x-1"
                          >
                            <span className="w-2.5 h-2.5 rounded-full inline-block border border-black/10" style={{ backgroundColor: c.hex }} />
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 2: Hero Section Media Manager (Images & Videos) */}
            {designerSubTab === 'hero' && (
              <div className="p-6 sm:p-8 space-y-8 max-w-5xl">
                {/* Hidden File Input for Direct Media Upload */}
                <input
                  type="file"
                  ref={heroMediaInputRef}
                  accept="image/*,video/mp4,video/webm,video/quicktime"
                  onChange={handleHeroMediaUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-brand-border">
                  <div>
                    <h3 className="font-serif text-lg text-brand-noir">Editorial Hero Campaign Slider</h3>
                    <p className="text-xs text-brand-noir/60">
                      Upload cinema video clips (`.mp4`) or high-res photographs directly from your computer.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addHeroSlide}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded text-xs font-semibold uppercase tracking-wider"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Slide</span>
                  </button>
                </div>

                {/* Slide Selector Tabs */}
                <div className="flex flex-wrap gap-2">
                  {heroSlides.map((slide, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => setActiveSlideIndex(sIdx)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 border transition-all ${
                        activeSlideIndex === sIdx
                          ? 'bg-brand-mocha text-white border-brand-mocha shadow-sm'
                          : 'bg-white text-brand-noir border-brand-border hover:bg-brand-sand/40'
                      }`}
                    >
                      {slide.mediaType === 'video' ? (
                        <Film className="w-3.5 h-3.5" />
                      ) : (
                        <Camera className="w-3.5 h-3.5" />
                      )}
                      <span>Slide #{sIdx + 1}: {slide.title ? slide.title.slice(0, 16) + '...' : 'Slide'}</span>
                    </button>
                  ))}
                </div>

                {/* Active Slide Form */}
                {heroSlides[activeSlideIndex] && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-brand-sand/15 p-6 rounded-xl border border-brand-border">
                    {/* Media Preview & Direct File Uploader (5 cols) */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand-noir uppercase tracking-wider">
                          Media Preview ({heroSlides[activeSlideIndex].mediaType === 'video' ? '🎬 Cinema Video' : '📷 High-Res Photo'})
                        </span>
                        {heroSlides.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeHeroSlide(activeSlideIndex)}
                            className="text-red-600 hover:text-red-700 text-xs flex items-center space-x-1"
                            title="Remove this slide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Slide</span>
                          </button>
                        )}
                      </div>

                      {/* Preview Box */}
                      <div className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden bg-black border border-brand-border shadow-inner flex items-center justify-center">
                        {heroSlides[activeSlideIndex].mediaType === 'video' ||
                        /\.(mp4|webm|mov)(\?.*)?$/i.test(heroSlides[activeSlideIndex].mediaUrl || '') ? (
                          <video
                            src={heroSlides[activeSlideIndex].mediaUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={heroSlides[activeSlideIndex].mediaUrl || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1800&auto=format&fit=crop'}
                            alt="Hero slide preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/70 text-white text-[10px] font-semibold tracking-wider uppercase backdrop-blur-xs flex items-center gap-1">
                          {heroSlides[activeSlideIndex].mediaType === 'video' ? <Film className="w-3 h-3 text-brand-gold" /> : <Camera className="w-3 h-3 text-brand-gold" />}
                          <span>{heroSlides[activeSlideIndex].mediaType.toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Direct Upload Trigger */}
                      <button
                        type="button"
                        onClick={() => heroMediaInputRef.current?.click()}
                        disabled={uploadingHeroMedia}
                        className="w-full py-3 px-4 bg-white border-2 border-dashed border-brand-mocha/60 hover:border-brand-mocha rounded-xl text-xs font-semibold text-brand-mocha flex items-center justify-center space-x-2 transition-all hover:bg-brand-sand/20 cursor-pointer shadow-xs"
                      >
                        <Upload className="w-4 h-4" />
                        <span>
                          {uploadingHeroMedia
                            ? 'Uploading Media File from Device...'
                            : 'Upload Photo or Video Loop from Device'}
                        </span>
                      </button>
                      <p className="text-[11px] text-brand-noir/60 text-center">
                        Supports MP4, WebM, MOV videos and JPG, PNG, WebP photos.
                      </p>
                    </div>

                    {/* Slide Information Inputs (7 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Media Type Toggle */}
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1.5">
                          Slide Media Format
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...heroSlides];
                              if (updated[activeSlideIndex]) {
                                updated[activeSlideIndex].mediaType = 'image';
                                setHeroSlides(updated);
                              }
                            }}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center space-x-1.5 transition-all ${
                              heroSlides[activeSlideIndex].mediaType === 'image'
                                ? 'bg-brand-mocha text-white border-brand-mocha shadow-xs'
                                : 'bg-white text-brand-noir border-brand-border'
                            }`}
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Photography Image</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...heroSlides];
                              if (updated[activeSlideIndex]) {
                                updated[activeSlideIndex].mediaType = 'video';
                                setHeroSlides(updated);
                              }
                            }}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center space-x-1.5 transition-all ${
                              heroSlides[activeSlideIndex].mediaType === 'video'
                                ? 'bg-brand-mocha text-white border-brand-mocha shadow-xs'
                                : 'bg-white text-brand-noir border-brand-border'
                            }`}
                          >
                            <Film className="w-3.5 h-3.5" />
                            <span>Cinema Video Loop</span>
                          </button>
                        </div>
                      </div>

                      {/* Direct Media URL */}
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Media File URL (Local Path or Web URL)
                        </label>
                        <input
                          type="text"
                          value={heroSlides[activeSlideIndex].mediaUrl || ''}
                          onChange={(e) => {
                            const updated = [...heroSlides];
                            if (updated[activeSlideIndex]) {
                              updated[activeSlideIndex].mediaUrl = e.target.value;
                              setHeroSlides(updated);
                            }
                          }}
                          placeholder="e.g. http://localhost:5000/uploads/... or https://..."
                          className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-brand-mocha"
                        />
                      </div>

                      {/* Eyebrow Badge (e.g. Boutique Haute Couture) */}
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Eyebrow Badge Tag
                        </label>
                        <input
                          type="text"
                          value={heroSlides[activeSlideIndex].badgeText || ''}
                          onChange={(e) => {
                            const updated = [...heroSlides];
                            if (updated[activeSlideIndex]) {
                              updated[activeSlideIndex].badgeText = e.target.value;
                              setHeroSlides(updated);
                            }
                          }}
                          placeholder="e.g. Boutique Haute Couture"
                          className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-brand-mocha"
                        />
                      </div>

                      {/* Headline Title */}
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Headline / Title *
                        </label>
                        <input
                          type="text"
                          value={heroSlides[activeSlideIndex].title || ''}
                          onChange={(e) => {
                            const updated = [...heroSlides];
                            if (updated[activeSlideIndex]) {
                              updated[activeSlideIndex].title = e.target.value;
                              setHeroSlides(updated);
                            }
                          }}
                          placeholder="e.g. The Royal Noor Eid Edit"
                          className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-brand-mocha"
                        />
                      </div>

                      {/* Subtitle */}
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Subtitle Narrative
                        </label>
                        <textarea
                          rows={2}
                          value={heroSlides[activeSlideIndex].subtitle || ''}
                          onChange={(e) => {
                            const updated = [...heroSlides];
                            if (updated[activeSlideIndex]) {
                              updated[activeSlideIndex].subtitle = e.target.value;
                              setHeroSlides(updated);
                            }
                          }}
                          placeholder="e.g. Hand-embroidered silhouettes adorned with champagne zari..."
                          className="w-full bg-white border border-brand-border rounded-lg p-3 text-xs focus:outline-none focus:border-brand-mocha"
                        />
                      </div>

                      {/* CTA Button and Link */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-brand-noir mb-1">
                            Primary Button Label
                          </label>
                          <input
                            type="text"
                            value={heroSlides[activeSlideIndex].ctaText || ''}
                            onChange={(e) => {
                              const updated = [...heroSlides];
                              if (updated[activeSlideIndex]) {
                                updated[activeSlideIndex].ctaText = e.target.value;
                                setHeroSlides(updated);
                              }
                            }}
                            placeholder="Explore Collection"
                            className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-brand-noir mb-1">
                            Primary Link
                          </label>
                          <input
                            type="text"
                            value={heroSlides[activeSlideIndex].ctaLink || ''}
                            onChange={(e) => {
                              const updated = [...heroSlides];
                              if (updated[activeSlideIndex]) {
                                updated[activeSlideIndex].ctaLink = e.target.value;
                                setHeroSlides(updated);
                              }
                            }}
                            placeholder="/shop?category=luxury-occasion"
                            className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                          />
                        </div>
                      </div>

                      {/* Secondary CTA Button and Link */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-brand-noir mb-1">
                            Secondary Button Label
                          </label>
                          <input
                            type="text"
                            value={heroSlides[activeSlideIndex].secondaryCtaText || ''}
                            onChange={(e) => {
                              const updated = [...heroSlides];
                              if (updated[activeSlideIndex]) {
                                updated[activeSlideIndex].secondaryCtaText = e.target.value;
                                setHeroSlides(updated);
                              }
                            }}
                            placeholder="e.g. View Lookbook"
                            className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-brand-noir mb-1">
                            Secondary Link
                          </label>
                          <input
                            type="text"
                            value={heroSlides[activeSlideIndex].secondaryCtaLink || ''}
                            onChange={(e) => {
                              const updated = [...heroSlides];
                              if (updated[activeSlideIndex]) {
                                updated[activeSlideIndex].secondaryCtaLink = e.target.value;
                                setHeroSlides(updated);
                              }
                            }}
                            placeholder="e.g. /shop"
                            className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sub-Tab 3: Homepage Layout Section Shuffler */}
            {designerSubTab === 'layout' && (
              <div className="p-6 sm:p-8 space-y-6 max-w-3xl">
                <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-xl text-xs text-amber-900 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-700" />
                    Shuffle & Reorder Homepage Layout
                  </p>
                  <p className="text-amber-800/80 leading-relaxed">
                    Use the <strong>Up (↑)</strong> and <strong>Down (↓)</strong> buttons below to reorder sections in any sequence you want (e.g. Hero first, then Collections, then Bestsellers). Uncheck any section to hide it completely from your storefront.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {homepageSections.map((sec, idx) => (
                    <div
                      key={sec.id}
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                        sec.enabled
                          ? 'bg-white border-brand-border shadow-xs'
                          : 'bg-zinc-100/60 border-zinc-200 opacity-60'
                      }`}
                    >
                      {/* Left: Badge & Name */}
                      <div className="flex items-center space-x-3.5">
                        <span className="w-7 h-7 rounded-full bg-brand-sand text-brand-mocha font-bold text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <div>
                          <h4 className="font-serif text-sm font-medium text-brand-noir">
                            {sec.name}
                          </h4>
                          <span className="text-[11px] text-brand-noir/50">
                            Identifier: <code className="text-brand-mocha">{sec.id}</code>
                          </span>
                        </div>
                      </div>

                      {/* Right: Controls (Move Up, Move Down, Toggle Visibility) */}
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center space-x-1.5 text-xs text-brand-noir cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={sec.enabled}
                            onChange={() => toggleSectionEnabled(sec.id)}
                            className="rounded text-brand-mocha focus:ring-brand-mocha"
                          />
                          <span className="font-medium text-[11px]">
                            {sec.enabled ? 'Visible' : 'Hidden'}
                          </span>
                        </label>

                        <div className="flex items-center space-x-1 border-l border-brand-border pl-3">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveSectionUp(idx)}
                            className="p-1.5 bg-brand-sand/50 hover:bg-brand-mocha hover:text-white rounded transition-colors disabled:opacity-30 cursor-pointer"
                            title="Move section up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === homepageSections.length - 1}
                            onClick={() => moveSectionDown(idx)}
                            className="p-1.5 bg-brand-sand/50 hover:bg-brand-mocha hover:text-white rounded transition-colors disabled:opacity-30 cursor-pointer"
                            title="Move section down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-Tab 4: Navbar & Theme Studio */}
            {designerSubTab === 'navbar' && (
              <div className="p-6 sm:p-8 space-y-8 max-w-4xl">
                {/* Navbar Panel Customization */}
                <div className="space-y-4 pb-6 border-b border-brand-border">
                  <h3 className="font-serif text-lg text-brand-noir">Navigation Panel Styling</h3>
                  <p className="text-xs text-brand-noir/70">
                    Your navigation panel is currently set to luxury white as requested. You can customize the exact panel color and typography accents below.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {/* Preset 1: Luxury White (Active Default) */}
                    <button
                      type="button"
                      onClick={() => {
                        setNavbarBgColor('#FFFFFF');
                        setNavbarTextColor('#1A1A1A');
                        setNavbarBorderColor('#E5E0D8');
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        navbarBgColor.toUpperCase() === '#FFFFFF'
                          ? 'border-brand-mocha bg-brand-sand/20 shadow-xs'
                          : 'border-brand-border bg-white hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-4 h-4 rounded-full bg-white border border-zinc-300 inline-block shadow-2xs" />
                        {navbarBgColor.toUpperCase() === '#FFFFFF' && (
                          <span className="text-[10px] font-bold text-brand-mocha uppercase tracking-wider">Active</span>
                        )}
                      </div>
                      <h4 className="font-serif text-sm font-medium text-brand-noir">Crisp Luxury White</h4>
                      <p className="text-[11px] text-brand-noir/60 mt-0.5">High-contrast white background with dark typography & icons</p>
                    </button>

                    {/* Preset 2: Obsidian Noir Black */}
                    <button
                      type="button"
                      onClick={() => {
                        setNavbarBgColor('#000000');
                        setNavbarTextColor('#FFFFFF');
                        setNavbarBorderColor('#262626');
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        navbarBgColor === '#000000'
                          ? 'border-brand-mocha bg-brand-sand/20 shadow-xs'
                          : 'border-brand-border bg-white hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-4 h-4 rounded-full bg-black inline-block" />
                        {navbarBgColor === '#000000' && (
                          <span className="text-[10px] font-bold text-brand-mocha uppercase tracking-wider">Active</span>
                        )}
                      </div>
                      <h4 className="font-serif text-sm font-medium text-brand-noir">Obsidian Noir Black</h4>
                      <p className="text-[11px] text-brand-noir/60 mt-0.5">Dark haute-couture background with crisp white typography</p>
                    </button>

                    {/* Custom Colors */}
                    <div className="p-4 rounded-xl border border-brand-border bg-white space-y-2.5">
                      <h4 className="font-serif text-xs font-semibold text-brand-noir">Custom Navbar Colors</h4>
                      <div className="flex items-center space-x-2 text-xs">
                        <input
                          type="color"
                          value={navbarBgColor}
                          onChange={(e) => setNavbarBgColor(e.target.value)}
                          className="w-7 h-7 rounded cursor-pointer border p-0.5 bg-white"
                        />
                        <span className="text-[11px] text-brand-noir/70">Background</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs">
                        <input
                          type="color"
                          value={navbarTextColor}
                          onChange={(e) => setNavbarTextColor(e.target.value)}
                          className="w-7 h-7 rounded cursor-pointer border p-0.5 bg-white"
                        />
                        <span className="text-[11px] text-brand-noir/70">Icons & Text</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slide-Out Navigation Menu Drawer Customizer (Screenshot 2) */}
                <div className="space-y-6 pb-8 border-b border-brand-border">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-mocha text-[11px] font-semibold mb-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Screenshot 2 Customizer</span>
                      </div>
                      <h3 className="font-serif text-lg text-brand-noir">Slide-Out Navigation Menu Drawer</h3>
                      <p className="text-xs text-brand-noir/70">
                        Customize the background color, typography colors, and all collection category links inside the side drawer menu (opened by clicking the menu icon).
                      </p>
                    </div>
                  </div>

                  {/* Drawer Theme Colors & Presets */}
                  <div className="bg-brand-sand/15 p-5 rounded-xl border border-brand-border space-y-4">
                    <h4 className="font-serif text-sm font-semibold text-brand-noir">Drawer Color Scheme</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      {/* Preset 1: Midnight Royal Navy */}
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerBgColor('#1A2F5A');
                          setDrawerTextColor('#FFFFFF');
                          setDrawerAccentColor('#C5A880');
                        }}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          drawerBgColor === '#1A2F5A'
                            ? 'border-brand-mocha bg-white shadow-xs'
                            : 'border-brand-border bg-white/70 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#1A2F5A] border inline-block" />
                          {drawerBgColor === '#1A2F5A' && (
                            <span className="text-[9px] font-bold text-brand-mocha uppercase">Active</span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-brand-noir">Royal Midnight Navy</div>
                        <div className="text-[10px] text-brand-noir/60">Signature luxury deep blue</div>
                      </button>

                      {/* Preset 2: Obsidian Couture Black */}
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerBgColor('#0B0B0B');
                          setDrawerTextColor('#FAF7F2');
                          setDrawerAccentColor('#D4AF37');
                        }}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          drawerBgColor === '#0B0B0B'
                            ? 'border-brand-mocha bg-white shadow-xs'
                            : 'border-brand-border bg-white/70 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#0B0B0B] border inline-block" />
                          {drawerBgColor === '#0B0B0B' && (
                            <span className="text-[9px] font-bold text-brand-mocha uppercase">Active</span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-brand-noir">Obsidian Noir</div>
                        <div className="text-[10px] text-brand-noir/60">Midnight velvet black & pure gold</div>
                      </button>

                      {/* Preset 3: Desert Cream Minimalist */}
                      <button
                        type="button"
                        onClick={() => {
                          setDrawerBgColor('#FAF7F2');
                          setDrawerTextColor('#1A1A1A');
                          setDrawerAccentColor('#8E6E53');
                        }}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          drawerBgColor === '#FAF7F2'
                            ? 'border-brand-mocha bg-white shadow-xs'
                            : 'border-brand-border bg-white/70 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="w-3.5 h-3.5 rounded-full bg-[#FAF7F2] border border-zinc-300 inline-block" />
                          {drawerBgColor === '#FAF7F2' && (
                            <span className="text-[9px] font-bold text-brand-mocha uppercase">Active</span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-brand-noir">Warm Desert Linen</div>
                        <div className="text-[10px] text-brand-noir/60">Light ivory sand with mocha accents</div>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1.5">
                          Drawer Background Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={drawerBgColor}
                            onChange={(e) => setDrawerBgColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={drawerBgColor}
                            onChange={(e) => setDrawerBgColor(e.target.value)}
                            className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1.5">
                          Drawer Text & Links Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={drawerTextColor}
                            onChange={(e) => setDrawerTextColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={drawerTextColor}
                            onChange={(e) => setDrawerTextColor(e.target.value)}
                            className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1.5">
                          Highlight & Accent Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={drawerAccentColor}
                            onChange={(e) => setDrawerAccentColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={drawerAccentColor}
                            onChange={(e) => setDrawerAccentColor(e.target.value)}
                            className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Drawer Category Navigation Links Editor */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h4 className="font-serif text-sm font-semibold text-brand-noir flex items-center gap-2">
                          <span>Drawer Navigation Category Links</span>
                          <span className="text-[10px] bg-brand-sand px-2 py-0.5 rounded-full text-brand-noir/70 font-sans font-medium">
                            {drawerLinks.length} Links
                          </span>
                        </h4>
                        <p className="text-[11px] text-brand-noir/60">
                          Reorder, rename, change destination URL, or toggle the golden sparkle highlight for each link.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={syncDrawerWithCategories}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-white border border-brand-border rounded-lg text-brand-noir hover:bg-brand-sand/30 font-medium transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-brand-mocha" />
                          <span>Sync Store Categories</span>
                        </button>
                        <button
                          type="button"
                          onClick={addDrawerLink}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-brand-noir text-white rounded-lg hover:bg-brand-mocha transition-colors font-medium cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Link</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {drawerLinks.map((link, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-white border border-brand-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand-mocha/40 transition-all shadow-2xs"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {/* Reorder Buttons */}
                            <div className="flex flex-col gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveDrawerLinkUp(idx)}
                                className={`p-1 rounded text-zinc-400 hover:text-brand-noir hover:bg-zinc-100 transition-colors ${
                                  idx === 0 ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                                title="Move up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === drawerLinks.length - 1}
                                onClick={() => moveDrawerLinkDown(idx)}
                                className={`p-1 rounded text-zinc-400 hover:text-brand-noir hover:bg-zinc-100 transition-colors ${
                                  idx === drawerLinks.length - 1 ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                                title="Move down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <span className="text-xs font-mono font-bold text-zinc-400 w-5 text-center">
                              {idx + 1}
                            </span>

                            {/* Link Title */}
                            <div className="flex-1 min-w-[140px]">
                              <input
                                type="text"
                                value={link.name}
                                onChange={(e) => updateDrawerLink(idx, 'name', e.target.value)}
                                placeholder="Link Label (e.g. Luxury Occasion Wear)"
                                className="w-full bg-zinc-50 border border-brand-border rounded-lg px-2.5 py-1.5 text-xs text-brand-noir focus:bg-white focus:outline-none focus:border-brand-mocha font-medium"
                              />
                            </div>

                            {/* Destination URL */}
                            <div className="flex-1 min-w-[160px]">
                              <input
                                type="text"
                                value={link.href}
                                onChange={(e) => updateDrawerLink(idx, 'href', e.target.value)}
                                placeholder="URL (e.g. /shop?category=...)"
                                className="w-full bg-zinc-50 border border-brand-border rounded-lg px-2.5 py-1.5 text-xs text-brand-noir focus:bg-white focus:outline-none focus:border-brand-mocha font-mono text-[11px]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 justify-end">
                            {/* Highlight toggle */}
                            <button
                              type="button"
                              onClick={() => updateDrawerLink(idx, 'highlight', !link.highlight)}
                              className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                                link.highlight
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-transparent'
                              }`}
                              title="Toggle golden sparkle highlight"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-[11px]">{link.highlight ? 'Highlighted' : 'Normal'}</span>
                            </button>

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => removeDrawerLink(idx)}
                              className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Link"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Drawer Live Visual Simulator */}
                  <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="font-semibold uppercase tracking-wider text-[10px]">Live Drawer Preview</span>
                      <span>(How it displays when client opens menu)</span>
                    </div>
                    <div
                      className="p-5 rounded-lg border max-w-sm"
                      style={{
                        backgroundColor: drawerBgColor,
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        color: drawerTextColor
                      }}
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                        <span className="font-serif tracking-widest text-sm font-semibold">{brandName}</span>
                        <span className="text-xs opacity-50 border rounded px-1.5 py-0.5">✕</span>
                      </div>
                      <div className="space-y-2.5 font-serif text-sm">
                        {drawerLinks.map((link, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between py-0.5"
                            style={{
                              color: link.highlight ? drawerAccentColor : drawerTextColor
                            }}
                          >
                            <span>{link.name}</span>
                            <span style={{ color: drawerAccentColor }}>→</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brand Identity & Palette */}
                <div className="space-y-4">
                  <h3 className="font-serif text-lg text-brand-noir">Storefront Brand Identity & Palette</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Brand Name
                      </label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="Zayna Abaya"
                        className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Brand Tagline
                      </label>
                      <input
                        type="text"
                        value={brandTagline}
                        onChange={(e) => setBrandTagline(e.target.value)}
                        placeholder="Elegance Redefined"
                        className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Primary Luxury Tone
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-28 bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Accent Gold Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-28 bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 5: Footer "What I Want / What I Don't Want" Builder */}
            {designerSubTab === 'footer' && (
              <div className="p-6 sm:p-8 space-y-8 max-w-4xl">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-brand-noir">Footer Settings & Modular Builder</h3>
                  <p className="text-xs text-brand-noir/70">
                    Control footer styling, brand story details, contact info, and choose exactly what links and sections to show or hide.
                  </p>
                </div>

                {/* Footer Brand & Contact Information */}
                <div className="space-y-4 bg-brand-sand/15 p-5 rounded-xl border border-brand-border">
                  <h4 className="font-serif text-sm font-semibold text-brand-noir flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-brand-mocha" />
                    <span>Brand Manifesto & Contact Details (Shown in Footer)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Brand Tagline / Manifesto Subtitle
                      </label>
                      <input
                        type="text"
                        value={brandTagline}
                        onChange={(e) => setBrandTagline(e.target.value)}
                        placeholder="Elegance Redefined"
                        className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                      />
                      <p className="text-[10px] text-brand-noir/60 mt-1">Appears directly beneath the brand title in the footer</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Atelier Street Address
                      </label>
                      <input
                        type="text"
                        value={footerContactAddress}
                        onChange={(e) => setFooterContactAddress(e.target.value)}
                        placeholder="Commercial Street, Bangalore, India"
                        className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Customer Concierge Email
                      </label>
                      <input
                        type="email"
                        value={footerContactEmail}
                        onChange={(e) => setFooterContactEmail(e.target.value)}
                        placeholder="care@zaynaabaya.com"
                        className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Customer Care Phone / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={footerContactPhone}
                        onChange={(e) => setFooterContactPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Instagram Profile / Handle
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs text-brand-noir/50">@</span>
                        <input
                          type="text"
                          value={instagramHandle.replace('@', '')}
                          onChange={(e) => setInstagramHandle(e.target.value.replace('@', ''))}
                          placeholder="zaynaabaya"
                          className="w-full bg-white border border-brand-border rounded-lg pl-7 pr-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                        />
                      </div>
                      <p className="text-[10px] text-brand-noir/60 mt-1">Links to https://instagram.com/{instagramHandle.replace('@', '') || 'zaynaabaya'}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Colors */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-brand-sand/15 p-5 rounded-xl border border-brand-border">
                  <div>
                    <label className="block text-xs font-semibold text-brand-noir mb-1">
                      Footer Background Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={footerBgColor}
                        onChange={(e) => setFooterBgColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={footerBgColor}
                        onChange={(e) => setFooterBgColor(e.target.value)}
                        className="w-28 bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-noir mb-1">
                      Footer Text / Body Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={footerTextColor}
                        onChange={(e) => setFooterTextColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={footerTextColor}
                        onChange={(e) => setFooterTextColor(e.target.value)}
                        className="w-28 bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-noir mb-1">
                      Footer Headings & Accents
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={footerHeadingColor}
                        onChange={(e) => setFooterHeadingColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={footerHeadingColor}
                        onChange={(e) => setFooterHeadingColor(e.target.value)}
                        className="w-28 bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* What I Want / What I Don't Want Toggles */}
                <div className="space-y-3">
                  <h4 className="font-serif text-sm font-semibold text-brand-noir">
                    Modular Footer Sections (Show / Hide)
                  </h4>

                  <div className="space-y-2.5">
                    {[
                      {
                        label: 'Artisan Value Propositions Strip',
                        desc: 'Shows Artisan Craftsmanship, Complimentary Shipping, and Certified Modest Fit badges',
                        checked: footerShowValueBadges,
                        setter: setFooterShowValueBadges
                      },
                      {
                        label: 'Brand Manifesto & Atelier Address',
                        desc: 'Shows brand heritage story, Commercial Street address, and contact info',
                        checked: footerShowBrandStory,
                        setter: setFooterShowBrandStory
                      },
                      {
                        label: 'Collections & Category Quick Links',
                        desc: 'Shows direct links to Everyday Essentials, Occasion Wear, Kimonos, and Hijabs',
                        checked: footerShowCollections,
                        setter: setFooterShowCollections
                      },
                      {
                        label: 'Customer Care & Tracking Links',
                        desc: 'Shows Track Order, Sizing Chart, Return FAQs, and Client Account links',
                        checked: footerShowCustomerCare,
                        setter: setFooterShowCustomerCare
                      },
                      {
                        label: 'VIP Cercle Privé (Newsletter Sign-up Form)',
                        desc: 'Shows email subscription box for capsule drops and private client privileges',
                        checked: footerShowNewsletter,
                        setter: setFooterShowNewsletter
                      }
                    ].map((mod, mIdx) => (
                      <label
                        key={mIdx}
                        className="p-4 rounded-xl border border-brand-border bg-white flex items-center justify-between cursor-pointer hover:bg-brand-sand/15 transition-colors"
                      >
                        <div className="pr-4">
                          <span className="text-xs font-semibold text-brand-noir block">
                            {mod.label}
                          </span>
                          <span className="text-[11px] text-brand-noir/60 block mt-0.5">
                            {mod.desc}
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={mod.checked}
                          onChange={(e) => mod.setter(e.target.checked)}
                          className="w-4 h-4 rounded text-brand-mocha focus:ring-brand-mocha"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom Copyright */}
                <div>
                  <label className="block text-xs font-semibold text-brand-noir mb-1">
                    Custom Copyright Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={footerCustomCopyright}
                    onChange={(e) => setFooterCustomCopyright(e.target.value)}
                    placeholder={`© ${new Date().getFullYear()} Zayna Abaya. All rights reserved. Elegance Redefined.`}
                    className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveDesigner}
                    disabled={savingDesigner}
                    className="px-6 py-2.5 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{savingDesigner ? 'Saving Footer Changes...' : 'Save Footer Settings'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sub-Tab: Instagram Lookbook & Gallery Studio */}
            {designerSubTab === 'instagram' && (
              <div className="p-6 sm:p-8 space-y-8 max-w-4xl">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-brand-noir flex items-center gap-2">
                    <Camera className="w-5 h-5 text-brand-mocha" />
                    <span>Instagram Lookbook Gallery & Link Studio</span>
                  </h3>
                  <p className="text-xs text-brand-noir/70">
                    Customize your homepage lookbook journal photos, hashtags, and direct click-through links to your official Instagram page or product drops.
                  </p>
                </div>

                {/* Instagram Handle & Account Link */}
                <div className="bg-brand-sand/15 p-5 rounded-xl border border-brand-border space-y-3">
                  <h4 className="font-serif text-sm font-semibold text-brand-noir flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-brand-mocha" />
                    <span>Official Instagram Account</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Instagram Username / Handle
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs text-brand-noir/50">@</span>
                        <input
                          type="text"
                          value={instagramHandle.replace('@', '')}
                          onChange={(e) => setInstagramHandle(e.target.value.replace('@', ''))}
                          placeholder="zaynaabaya"
                          className="w-full bg-white border border-brand-border rounded-lg pl-7 pr-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Active Live Profile Link
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          readOnly
                          value={`https://instagram.com/${instagramHandle.replace('@', '') || 'zaynaabaya'}`}
                          className="w-full bg-white/70 border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-noir/70 font-mono"
                        />
                        <a
                          href={`https://instagram.com/${instagramHandle.replace('@', '') || 'zaynaabaya'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-white border border-brand-border rounded-lg hover:bg-brand-sand/30 text-brand-noir text-xs shrink-0 flex items-center gap-1"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instagram Lookbook Photo Cards (Unlimited Dynamic Posts) */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-sand/20 p-4 rounded-xl border border-brand-border">
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-brand-noir flex items-center gap-2">
                        <span>Seasonal Lookbook Gallery Photos & Direct Links</span>
                        <span className="bg-brand-mocha text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {instagramPosts.length} Active Posts
                        </span>
                      </h4>
                      <p className="text-[11px] text-brand-noir/60 mt-0.5">
                        Add as many Instagram lookbook entries as you like. Upload photos, set hover captions, reorder sequence, and configure direct click links.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddInstagramPost}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Lookbook Post</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {instagramPosts.map((post, pIdx) => (
                      <div
                        key={pIdx}
                        className="bg-white border border-brand-border rounded-xl p-4 space-y-3.5 shadow-xs hover:border-brand-gold/50 transition-colors"
                      >
                        <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-brand-mocha flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-brand-gold" />
                            <span>Lookbook Photo #{pIdx + 1}</span>
                          </span>
                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              disabled={pIdx === 0}
                              onClick={() => handleMoveInstagramPost(pIdx, 'up')}
                              className="p-1 text-brand-noir/50 hover:text-brand-noir disabled:opacity-20 rounded cursor-pointer"
                              title="Move earlier in order"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={pIdx === instagramPosts.length - 1}
                              onClick={() => handleMoveInstagramPost(pIdx, 'down')}
                              className="p-1 text-brand-noir/50 hover:text-brand-noir disabled:opacity-20 rounded cursor-pointer"
                              title="Move later in order"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={instagramPosts.length <= 1}
                              onClick={() => handleRemoveInstagramPost(pIdx)}
                              className="p-1 text-red-500 hover:text-red-700 disabled:opacity-20 rounded cursor-pointer ml-1"
                              title="Delete post slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Image Preview & Upload */}
                        <div className="flex items-start space-x-3">
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-brand-sand border border-brand-border shrink-0">
                            {post.imageUrl ? (
                              <Image
                                src={post.imageUrl}
                                alt={post.caption || `Post ${pIdx + 1}`}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-brand-noir/30">
                                <ImageIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 space-y-1.5">
                            <label className="block text-[11px] font-semibold text-brand-noir">
                              Direct Picture Upload
                            </label>
                            <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-sand/40 hover:bg-brand-sand text-brand-noir rounded border border-brand-border text-xs cursor-pointer transition-colors">
                              <Upload className="w-3.5 h-3.5 text-brand-mocha" />
                              <span>{uploadingInstaIndex === pIdx ? 'Uploading...' : 'Choose Picture'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingInstaIndex === pIdx}
                                onChange={(e) => handleInstagramImageUpload(pIdx, e)}
                              />
                            </label>
                            <p className="text-[10px] text-brand-noir/50">PNG, JPG, WebP supported</p>
                          </div>
                        </div>

                        {/* Image URL fallback */}
                        <div>
                          <label className="block text-[11px] font-semibold text-brand-noir mb-1">
                            Or Image URL
                          </label>
                          <input
                            type="text"
                            value={post.imageUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInstagramPosts((prev) => {
                                const copy = [...prev];
                                copy[pIdx] = { ...copy[pIdx], imageUrl: val };
                                return copy;
                              });
                            }}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-brand-mocha font-mono text-[11px]"
                          />
                        </div>

                        {/* Caption */}
                        <div>
                          <label className="block text-[11px] font-semibold text-brand-noir mb-1">
                            Photo Hover Caption
                          </label>
                          <input
                            type="text"
                            value={post.caption || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInstagramPosts((prev) => {
                                const copy = [...prev];
                                copy[pIdx] = { ...copy[pIdx], caption: val };
                                return copy;
                              });
                            }}
                            placeholder="Everyday elegance / #ZaynaWoman"
                            className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-brand-mocha"
                          />
                        </div>

                        {/* Destination Link */}
                        <div>
                          <label className="block text-[11px] font-semibold text-brand-noir mb-1">
                            Click Destination Link / Post URL
                          </label>
                          <input
                            type="text"
                            value={post.postUrl || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInstagramPosts((prev) => {
                                const copy = [...prev];
                                copy[pIdx] = { ...copy[pIdx], postUrl: val };
                                return copy;
                              });
                            }}
                            placeholder={`https://instagram.com/p/... or /shop?category=everyday-essentials`}
                            className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-brand-mocha font-mono text-[11px]"
                          />
                          <p className="text-[10px] text-brand-noir/50 mt-0.5">Leave blank to default to your main Instagram profile</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveDesigner}
                    disabled={savingDesigner}
                    className="px-6 py-2.5 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center space-x-2 cursor-pointer shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>{savingDesigner ? 'Publishing Changes...' : 'Save & Publish Instagram Lookbook'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sub-Tab 6: Product Recommendations ("You May Also Admire") */}
            {designerSubTab === 'recommendations' && (
              <div className="p-6 sm:p-8 space-y-6 max-w-2xl">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-brand-noir">Product Page Recommendations</h3>
                  <p className="text-xs text-brand-noir/70">
                    Customize the related creations section displayed beneath product details.
                  </p>
                </div>

                <div className="space-y-4 bg-brand-sand/15 p-6 rounded-xl border border-brand-border">
                  <label className="flex items-center space-x-2.5 text-xs font-semibold text-brand-noir cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showYouMayAlsoAdmire}
                      onChange={(e) => setShowYouMayAlsoAdmire(e.target.checked)}
                      className="rounded text-brand-mocha focus:ring-brand-mocha"
                    />
                    <span>Display "You May Also Admire" section on product pages</span>
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-brand-noir mb-1">
                      Section Main Title
                    </label>
                    <input
                      type="text"
                      value={youMayAlsoAdmireTitle}
                      onChange={(e) => setYouMayAlsoAdmireTitle(e.target.value)}
                      placeholder="You May Also Admire"
                      className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-noir mb-1">
                      Section Subtitle / Tag
                    </label>
                    <input
                      type="text"
                      value={youMayAlsoAdmireSubtitle}
                      onChange={(e) => setYouMayAlsoAdmireSubtitle(e.target.value)}
                      placeholder="Complete The Look"
                      className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-noir mb-1">
                      Number of Recommended Creations to Display
                    </label>
                    <select
                      value={itemCount}
                      onChange={(e) => setItemCount(Number(e.target.value))}
                      className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                    >
                      <option value={2}>2 Creations</option>
                      <option value={4}>4 Creations (Standard Grid)</option>
                      <option value={6}>6 Creations</option>
                      <option value={8}>8 Creations</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab: Button Colors & Text Studio (CTAs) */}
            {designerSubTab === 'buttons' && (
              <div className="p-6 sm:p-8 space-y-8 max-w-4xl">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-brand-noir flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-brand-mocha" />
                    <span>Button Colors & Text Studio (Storefront CTAs)</span>
                  </h3>
                  <p className="text-xs text-brand-noir/70">
                    Customize the text, background color, and text color of your main action buttons across product pages and product cards.
                  </p>
                </div>

                {/* Live Preview Card */}
                <div className="bg-brand-sand/20 border border-brand-border rounded-xl p-5 space-y-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-noir/60 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-brand-mocha" />
                    <span>Live Interactive Button Previews</span>
                  </span>

                  {/* Product Detail Page Action Buttons Preview */}
                  <div className="bg-white border border-brand-border rounded-lg p-4 space-y-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-noir/50">
                      Product Detail Page Preview (Add to Bag + Instant Checkout)
                    </span>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        className="flex-1 py-3 px-4 rounded-md text-xs font-semibold uppercase tracking-widest flex items-center justify-center space-x-2 shadow-sm transition-all"
                        style={{
                          backgroundColor: btnAddToCartBgColor,
                          color: btnAddToCartTextColor
                        }}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{btnAddToCartText || 'ADD TO SHOPPING BAG'}</span>
                      </button>

                      <button
                        type="button"
                        className="flex-1 py-3 px-4 rounded-md text-xs font-semibold uppercase tracking-widest flex items-center justify-center space-x-2 shadow-sm transition-all"
                        style={{
                          backgroundColor: btnBuyNowBgColor,
                          color: btnBuyNowTextColor
                        }}
                      >
                        <span>{btnBuyNowText || 'INSTANT CHECKOUT'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Product Card Hover & Direct Button Preview */}
                  <div className="bg-white border border-brand-border rounded-lg p-4 space-y-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-noir/50">
                      Product Card Buttons Preview (Card Hover & Card Bottom)
                    </span>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="flex-1 w-full p-2 bg-brand-sand/30 rounded border border-brand-border/60 text-center">
                        <span className="text-[10px] text-brand-noir/50 block mb-1">Image Hover Overlay Button</span>
                        <button
                          type="button"
                          className="w-full py-2 px-3 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-sm"
                          style={{
                            backgroundColor: btnQuickAddBgColor,
                            color: btnQuickAddTextColor
                          }}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{btnQuickAddText || 'QUICK ADD TO BAG'}</span>
                        </button>
                      </div>

                      <div className="flex-1 w-full p-2 bg-brand-sand/30 rounded border border-brand-border/60 text-center">
                        <span className="text-[10px] text-brand-noir/50 block mb-1">Card Direct Add Button</span>
                        <button
                          type="button"
                          className="py-1.5 px-3 rounded text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-1 shadow-xs mx-auto"
                          style={{
                            backgroundColor: btnAddToCartBgColor,
                            color: btnAddToCartTextColor
                          }}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{btnAddToCartText ? btnAddToCartText.replace(/add to shopping bag/i, 'Add to Bag') : 'Add to Bag'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="bg-white border border-brand-border rounded-xl p-5 space-y-3">
                  <span className="text-xs font-semibold text-brand-noir flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-brand-mocha" />
                    <span>Quick Color Palette Presets</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      {
                        name: 'Midnight Navy & Gold',
                        addBg: '#0B1B3D',
                        addText: '#FFFFFF',
                        buyBg: '#C5A880',
                        buyText: '#0B1B3D',
                        quickBg: '#FFFFFF',
                        quickText: '#0B1B3D'
                      },
                      {
                        name: 'Monochrome Luxe',
                        addBg: '#0A1128',
                        addText: '#FFFFFF',
                        buyBg: '#1A2F5A',
                        buyText: '#FFFFFF',
                        quickBg: '#FFFFFF',
                        quickText: '#0A1128'
                      },
                      {
                        name: 'Warm Mocha & Bronze',
                        addBg: '#3D2B1F',
                        addText: '#FFFFFF',
                        buyBg: '#8E6E53',
                        buyText: '#FFFFFF',
                        quickBg: '#FAF7F2',
                        quickText: '#3D2B1F'
                      },
                      {
                        name: 'Emerald & Gold',
                        addBg: '#064E3B',
                        addText: '#FFFFFF',
                        buyBg: '#D4AF37',
                        buyText: '#064E3B',
                        quickBg: '#FFFFFF',
                        quickText: '#064E3B'
                      }
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setBtnAddToCartBgColor(p.addBg);
                          setBtnAddToCartTextColor(p.addText);
                          setBtnBuyNowBgColor(p.buyBg);
                          setBtnBuyNowTextColor(p.buyText);
                          setBtnQuickAddBgColor(p.quickBg);
                          setBtnQuickAddTextColor(p.quickText);
                        }}
                        className="p-2.5 rounded-lg border border-brand-border hover:border-brand-mocha text-left transition-colors bg-brand-sand/10 hover:bg-brand-sand/30 cursor-pointer"
                      >
                        <span className="text-xs font-semibold text-brand-noir block">{p.name}</span>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: p.addBg }} />
                          <span className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: p.buyBg }} />
                          <span className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: p.quickBg }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Controls for All 3 Buttons */}
                <div className="space-y-6">
                  {/* 1. Add to Shopping Bag Button */}
                  <div className="bg-white border border-brand-border rounded-xl p-5 space-y-4">
                    <div className="border-b border-brand-border/60 pb-2 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-mocha flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>1. "Add to Shopping Bag" Button (Product Page & Card)</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Button Text Label
                        </label>
                        <input
                          type="text"
                          value={btnAddToCartText}
                          onChange={(e) => setBtnAddToCartText(e.target.value)}
                          placeholder="ADD TO SHOPPING BAG"
                          className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Background Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={btnAddToCartBgColor}
                            onChange={(e) => setBtnAddToCartBgColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={btnAddToCartBgColor}
                            onChange={(e) => setBtnAddToCartBgColor(e.target.value)}
                            className="w-28 bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Text / Icon Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={btnAddToCartTextColor}
                            onChange={(e) => setBtnAddToCartTextColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={btnAddToCartTextColor}
                            onChange={(e) => setBtnAddToCartTextColor(e.target.value)}
                            className="w-28 bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Instant Checkout / Buy Now Button */}
                  <div className="bg-white border border-brand-border rounded-xl p-5 space-y-4">
                    <div className="border-b border-brand-border/60 pb-2 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-mocha flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>2. "Instant Checkout" / "Buy Now" Button (Product Page)</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Button Text Label
                        </label>
                        <input
                          type="text"
                          value={btnBuyNowText}
                          onChange={(e) => setBtnBuyNowText(e.target.value)}
                          placeholder="INSTANT CHECKOUT"
                          className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Background Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={btnBuyNowBgColor}
                            onChange={(e) => setBtnBuyNowBgColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={btnBuyNowBgColor}
                            onChange={(e) => setBtnBuyNowBgColor(e.target.value)}
                            className="w-28 bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Text / Icon Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={btnBuyNowTextColor}
                            onChange={(e) => setBtnBuyNowTextColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={btnBuyNowTextColor}
                            onChange={(e) => setBtnBuyNowTextColor(e.target.value)}
                            className="w-28 bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Quick Add to Bag (Card Hover) Button */}
                  <div className="bg-white border border-brand-border rounded-xl p-5 space-y-4">
                    <div className="border-b border-brand-border/60 pb-2 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-mocha flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>3. "Quick Add to Bag" Button (Product Card Desktop Hover)</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Button Text Label
                        </label>
                        <input
                          type="text"
                          value={btnQuickAddText}
                          onChange={(e) => setBtnQuickAddText(e.target.value)}
                          placeholder="QUICK ADD TO BAG"
                          className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Background Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={btnQuickAddBgColor}
                            onChange={(e) => setBtnQuickAddBgColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={btnQuickAddBgColor}
                            onChange={(e) => setBtnQuickAddBgColor(e.target.value)}
                            className="w-28 bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Text / Icon Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={btnQuickAddTextColor}
                            onChange={(e) => setBtnQuickAddTextColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={btnQuickAddTextColor}
                            onChange={(e) => setBtnQuickAddTextColor(e.target.value)}
                            className="w-28 bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveDesigner}
                    disabled={savingDesigner}
                    className="px-6 py-2.5 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center space-x-2 cursor-pointer shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>{savingDesigner ? 'Publishing Button Styles...' : 'Save & Publish Button Changes'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sub-Tab 7: Brand Story & Atelier Heritage (Screenshot 2) */}
            {designerSubTab === 'brandStory' && (
              <div className="p-6 sm:p-8 space-y-8 max-w-5xl">
                {/* Hidden File Input for Story Direct Photo Upload */}
                <input
                  type="file"
                  ref={storyImageInputRef}
                  accept="image/*"
                  onChange={handleStoryImageUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-brand-border">
                  <div>
                    <h3 className="font-serif text-lg text-brand-noir">Atelier Heritage Story Studio</h3>
                    <p className="text-xs text-brand-noir/60">
                      Customize the editorial narrative, opacity & bridal craftsmanship metrics, and atelier photo displayed on your homepage.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveDesigner}
                    disabled={savingDesigner}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{savingDesigner ? 'Saving...' : 'Save & Publish'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-brand-sand/15 p-6 rounded-xl border border-brand-border">
                  {/* Left Column: Image Preview, Direct Upload & Floating Card (5 cols) */}
                  <div className="lg:col-span-5 space-y-5">
                    <div>
                      <span className="text-xs font-semibold text-brand-noir uppercase tracking-wider block mb-2">
                        Atelier Editorial Photograph
                      </span>
                      <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden bg-brand-sand border border-brand-border shadow-inner">
                        <img
                          src={storyImage || 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1200&auto=format&fit=crop'}
                          alt="Atelier Story Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Direct Upload Button */}
                    <button
                      type="button"
                      onClick={() => storyImageInputRef.current?.click()}
                      disabled={uploadingStoryImage}
                      className="w-full py-3 px-4 bg-white border-2 border-dashed border-brand-mocha/60 hover:border-brand-mocha rounded-xl text-xs font-semibold text-brand-mocha flex items-center justify-center space-x-2 transition-all hover:bg-brand-sand/20 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-4 h-4" />
                      <span>
                        {uploadingStoryImage ? 'Uploading Image from Device...' : 'Upload Story Photo from Device'}
                      </span>
                    </button>

                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Direct Image URL (or use Upload button above)
                      </label>
                      <input
                        type="text"
                        value={storyImage}
                        onChange={(e) => setStoryImage(e.target.value)}
                        placeholder="https://... or http://localhost:5000/uploads/..."
                        className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-brand-mocha"
                      />
                    </div>

                    {/* Floating Badge Card Customizer */}
                    <div className="p-4 bg-white rounded-xl border border-brand-border space-y-3 shadow-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-mocha block">
                        Floating Accent Card (Overlaid on Photo)
                      </span>
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Card Header
                        </label>
                        <input
                          type="text"
                          value={storyCardTitle}
                          onChange={(e) => setStoryCardTitle(e.target.value)}
                          placeholder="Pure Korean Nidha"
                          className="w-full bg-brand-sand/20 border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Card Subtitle / Description
                        </label>
                        <textarea
                          rows={2}
                          value={storyCardText}
                          onChange={(e) => setStoryCardText(e.target.value)}
                          placeholder="Featherweight, breathable, and woven with dense micro-fibers..."
                          className="w-full bg-brand-sand/20 border border-brand-border rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Story Copy & Metrics (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Eyebrow Badge Tag
                      </label>
                      <input
                        type="text"
                        value={storyBadge}
                        onChange={(e) => setStoryBadge(e.target.value)}
                        placeholder="e.g. Artisan Heritage"
                        className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-brand-mocha"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Main Headline / Title *
                      </label>
                      <input
                        type="text"
                        value={storyTitle}
                        onChange={(e) => setStoryTitle(e.target.value)}
                        placeholder="e.g. Where Modest Heritage Meets Modern Grandeur"
                        className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-brand-mocha"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Opening Narrative Paragraph
                      </label>
                      <textarea
                        rows={3}
                        value={storyP1}
                        onChange={(e) => setStoryP1(e.target.value)}
                        placeholder="Founded on the principle that modesty is the purest expression of luxury..."
                        className="w-full bg-white border border-brand-border rounded-lg p-3 text-xs focus:outline-none focus:border-brand-mocha leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Craftsmanship & Textile Narrative Paragraph
                      </label>
                      <textarea
                        rows={3}
                        value={storyP2}
                        onChange={(e) => setStoryP2(e.target.value)}
                        placeholder="Every garment in our atelier begins with ethically sourced textiles..."
                        className="w-full bg-white border border-brand-border rounded-lg p-3 text-xs focus:outline-none focus:border-brand-mocha leading-relaxed"
                      />
                    </div>

                    {/* Metrics / Statistics Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-3 bg-white rounded-lg border border-brand-border space-y-2">
                        <span className="text-[10px] font-bold text-brand-noir/60 uppercase tracking-wider block">
                          Stat Metric 1
                        </span>
                        <input
                          type="text"
                          value={storyStat1Val}
                          onChange={(e) => setStoryStat1Val(e.target.value)}
                          placeholder="100%"
                          className="w-full bg-brand-sand/20 border border-brand-border rounded px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-brand-mocha"
                        />
                        <input
                          type="text"
                          value={storyStat1Lbl}
                          onChange={(e) => setStoryStat1Lbl(e.target.value)}
                          placeholder="Opacity Tested"
                          className="w-full bg-brand-sand/20 border border-brand-border rounded px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-brand-mocha"
                        />
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-brand-border space-y-2">
                        <span className="text-[10px] font-bold text-brand-noir/60 uppercase tracking-wider block">
                          Stat Metric 2
                        </span>
                        <input
                          type="text"
                          value={storyStat2Val}
                          onChange={(e) => setStoryStat2Val(e.target.value)}
                          placeholder="35+"
                          className="w-full bg-brand-sand/20 border border-brand-border rounded px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-brand-mocha"
                        />
                        <input
                          type="text"
                          value={storyStat2Lbl}
                          onChange={(e) => setStoryStat2Lbl(e.target.value)}
                          placeholder="Hours Per Bridal Piece"
                          className="w-full bg-brand-sand/20 border border-brand-border rounded px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-brand-mocha"
                        />
                      </div>
                    </div>

                    {/* CTA Button Label & Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          CTA Button Label
                        </label>
                        <input
                          type="text"
                          value={storyCtaText}
                          onChange={(e) => setStoryCtaText(e.target.value)}
                          placeholder="Explore The Atelier"
                          className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          CTA Destination Link
                        </label>
                        <input
                          type="text"
                          value={storyCtaLink}
                          onChange={(e) => setStoryCtaLink(e.target.value)}
                          placeholder="/shop"
                          className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab 8: Curated Categories Showcase (Screenshot 3) */}
            {designerSubTab === 'categories' && (
              <div className="p-6 sm:p-8 space-y-8 max-w-5xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-brand-border">
                  <div>
                    <h3 className="font-serif text-lg text-brand-noir">Curated Collections & Categories</h3>
                    <p className="text-xs text-brand-noir/60">
                      Update the section header, eyebrow badge, and individual collection cards (images, names, descriptions).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveDesigner}
                    disabled={savingDesigner}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded text-xs font-semibold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{savingDesigner ? 'Saving...' : 'Save & Publish'}</span>
                  </button>
                </div>

                {/* Section Header Controls */}
                <div className="bg-brand-sand/20 p-6 rounded-xl border border-brand-border space-y-4 max-w-2xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-mocha block">
                    Section Header Titles
                  </span>
                  <div>
                    <label className="block text-xs font-semibold text-brand-noir mb-1">
                      Eyebrow Badge Tag
                    </label>
                    <input
                      type="text"
                      value={categoriesBadge}
                      onChange={(e) => setCategoriesBadge(e.target.value)}
                      placeholder="Curated Categories"
                      className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-brand-mocha"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-noir mb-1">
                      Main Section Title *
                    </label>
                    <input
                      type="text"
                      value={categoriesTitle}
                      onChange={(e) => setCategoriesTitle(e.target.value)}
                      placeholder="Designed for Every Occasion"
                      className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-brand-mocha"
                    />
                  </div>
                </div>

                {/* Individual Category Cards */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-noir">
                      Active Category Banners ({categories.length})
                    </span>
                    <span className="text-xs text-brand-noir/60">
                      Click any collection below to change its photo or text.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat) => {
                      const catThumb = cat.image || 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=800&auto=format&fit=crop';
                      return (
                        <div
                          key={cat._id}
                          className="bg-white rounded-xl border border-brand-border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                        >
                          <div className="relative w-full h-48 bg-brand-sand overflow-hidden">
                            <img
                              src={catThumb}
                              alt={cat.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                            <span className="absolute bottom-3 left-3 text-white font-serif font-medium text-base drop-shadow-sm">
                              {cat.name}
                            </span>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <p className="text-xs text-brand-noir/70 line-clamp-2">
                              {cat.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditCategory(cat)}
                                className="flex-1 py-2 px-3 bg-brand-sand/40 hover:bg-brand-mocha hover:text-white text-brand-noir rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-brand-border cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Photo & Text</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat._id, cat.name)}
                                className="py-2 px-3 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition-colors border border-red-200 cursor-pointer"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab: Invoice & Order Confirmation Studio */}
            {designerSubTab === 'invoice' && (
              <div className="p-6 sm:p-8 space-y-8 max-w-5xl">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-brand-noir flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-mocha" />
                    <span>Order Confirmation & Official Invoice Studio</span>
                  </h3>
                  <p className="text-xs text-brand-noir/70">
                    Customize every single piece of copy, step timeline titles, delivery estimates, support contacts, and button styling for your customer order confirmation and printable invoice receipt.
                  </p>
                </div>

                {/* Live Interactive Invoice Simulator */}
                <div className="bg-brand-sand/20 border border-brand-border rounded-xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-noir/60 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-brand-mocha" />
                      <span>Live Invoice & Confirmation Simulator (What Customers See)</span>
                    </span>
                    <span className="text-[11px] text-brand-mocha font-medium">
                      Order Reference: ZA-849204
                    </span>
                  </div>

                  {/* Simulated Receipt Card matching media_1788521128089.png */}
                  <div className="max-w-xl mx-auto bg-white rounded-xl border border-brand-border shadow-md p-6 sm:p-8 text-center space-y-5">
                    {/* Checkmark Circle */}
                    <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                      <CheckCircle className="w-8 h-8 stroke-[1.5]" />
                    </div>

                    {/* Badge & Headings */}
                    <div className="space-y-2">
                      <span
                        className="text-[10px] uppercase font-semibold tracking-[0.2em] px-3 py-0.5 rounded-full inline-block border border-black/10"
                        style={{
                          backgroundColor: invoiceBadgeBg,
                          color: invoiceBadgeTextColor
                        }}
                      >
                        {invoiceBadge || 'ORDER CONFIRMED'}
                      </span>
                      <h4 className="font-serif text-2xl text-brand-noir">
                        {invoiceTitle || 'Thank You For Choosing Zayna'}
                      </h4>
                      <p className="text-[11px] text-brand-noir/70 max-w-sm mx-auto leading-relaxed">
                        {invoiceSubtitle || 'Your creation is being prepared with utmost care by our atelier artisans.'}
                      </p>
                    </div>

                    {/* Reference Card Box */}
                    <div className="bg-brand-sand/50 rounded-lg p-4 border border-brand-border text-left text-xs space-y-2.5">
                      <div className="flex justify-between items-center border-b border-brand-border/70 pb-2">
                        <span className="text-brand-noir/70 font-medium">Order Reference:</span>
                        <span className="font-mono font-bold text-brand-mocha">ZA-849204</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-brand-noir/80">Fulfillment Status:</span>
                        <span className="capitalize font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          Processing
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-brand-noir/80">Estimated Delivery:</span>
                        <span className="font-medium text-brand-noir">{invoiceDeliveryText || '3 – 5 Business Days'}</span>
                      </div>
                      <div className="pt-2 border-t border-brand-border/70 flex justify-between items-center font-bold text-brand-noir">
                        <span>Total Paid:</span>
                        <span>₹7,499.00</span>
                      </div>
                    </div>

                    {/* 3 Step Timeline */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-xs text-brand-noir/70">
                      <div className="flex flex-col items-center space-y-1">
                        <Package className="w-4 h-4 text-brand-mocha" />
                        <span className="font-medium text-brand-noir text-[11px]">{invoiceStep1Title || '1. Atelier Packing'}</span>
                        <span className="text-[9px] text-brand-noir/50">{invoiceStep1Sub || 'Luxury Gift Box'}</span>
                      </div>
                      <div className="flex flex-col items-center space-y-1">
                        <Truck className="w-4 h-4 text-brand-gold" />
                        <span className="font-medium text-brand-noir text-[11px]">{invoiceStep2Title || '2. Express Dispatch'}</span>
                        <span className="text-[9px] text-brand-noir/50">{invoiceStep2Sub || 'Air Priority Cargo'}</span>
                      </div>
                      <div className="flex flex-col items-center space-y-1">
                        <ShieldCheck className="w-4 h-4 text-brand-noir" />
                        <span className="font-medium text-brand-noir text-[11px]">{invoiceStep3Title || '3. Doorstep Arrival'}</span>
                        <span className="text-[9px] text-brand-noir/50">{invoiceStep3Sub || 'Hassle-free fit exchange'}</span>
                      </div>
                    </div>

                    {/* Concierge Note */}
                    <div className="bg-amber-50/50 border border-amber-200/60 rounded-lg p-2.5 text-[11px] text-brand-noir/70 text-center">
                      <p className="font-serif italic">{invoiceSupportNote}</p>
                      <p className="text-[10px] text-brand-mocha font-semibold mt-0.5">
                        {invoiceSupportEmail} | {invoiceSupportPhone}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 space-y-2.5">
                      {invoiceShowPrintBtn && (
                        <div
                          className="w-full py-2.5 px-4 rounded text-[11px] uppercase font-semibold tracking-wider flex items-center justify-center gap-1.5 shadow-xs"
                          style={{
                            backgroundColor: invoicePrintBtnBg,
                            color: invoicePrintBtnTextColor
                          }}
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{invoicePrintBtnText || 'Print / Download Official Invoice'}</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <div
                          className="flex-1 py-2.5 px-4 text-[11px] uppercase font-semibold tracking-wider rounded border border-brand-border/60 text-center"
                          style={{
                            backgroundColor: invoiceBtnTrackBg,
                            color: invoiceBtnTrackTextColor
                          }}
                        >
                          {invoiceBtnTrackText || 'Track Delivery Timeline'}
                        </div>
                        <div
                          className="flex-1 py-2.5 px-4 text-[11px] uppercase font-semibold tracking-wider rounded text-center shadow-xs"
                          style={{
                            backgroundColor: invoiceBtnContBg,
                            color: invoiceBtnContTextColor
                          }}
                        >
                          {invoiceBtnContText || 'Continue Browsing'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Controls Section */}
                <div className="space-y-6">
                  {/* Card 1: Header Badge & Copy */}
                  <div className="bg-white border border-brand-border rounded-xl p-5 space-y-4">
                    <div className="border-b border-brand-border/60 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-mocha flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5" />
                        <span>1. Header Badge, Main Heading & Narrative Subtitle</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Header Badge Text
                        </label>
                        <input
                          type="text"
                          value={invoiceBadge}
                          onChange={(e) => setInvoiceBadge(e.target.value)}
                          placeholder="Order Confirmed"
                          className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Badge Background Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={invoiceBadgeBg}
                            onChange={(e) => setInvoiceBadgeBg(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={invoiceBadgeBg}
                            onChange={(e) => setInvoiceBadgeBg(e.target.value)}
                            className="w-28 bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Badge Text Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={invoiceBadgeTextColor}
                            onChange={(e) => setInvoiceBadgeTextColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={invoiceBadgeTextColor}
                            onChange={(e) => setInvoiceBadgeTextColor(e.target.value)}
                            className="w-28 bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Main Celebration Heading
                        </label>
                        <input
                          type="text"
                          value={invoiceTitle}
                          onChange={(e) => setInvoiceTitle(e.target.value)}
                          placeholder="Thank You For Choosing Zayna"
                          className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha font-serif text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Estimated Delivery Display Text
                        </label>
                        <input
                          type="text"
                          value={invoiceDeliveryText}
                          onChange={(e) => setInvoiceDeliveryText(e.target.value)}
                          placeholder="3 – 5 Business Days"
                          className="w-full bg-white border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-noir mb-1">
                        Narrative Subtitle Paragraph
                      </label>
                      <textarea
                        rows={2}
                        value={invoiceSubtitle}
                        onChange={(e) => setInvoiceSubtitle(e.target.value)}
                        placeholder="Your creation is being prepared with utmost care by our atelier artisans..."
                        className="w-full bg-white border border-brand-border rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                      />
                    </div>
                  </div>

                  {/* Card 2: 3-Step Atelier Timeline Milestones */}
                  <div className="bg-white border border-brand-border rounded-xl p-5 space-y-4">
                    <div className="border-b border-brand-border/60 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-mocha flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" />
                        <span>2. 3-Step Atelier Timeline Milestones</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Step 1 */}
                      <div className="p-3 bg-brand-sand/30 rounded-lg border border-brand-border/60 space-y-2">
                        <span className="text-[11px] font-bold text-brand-noir uppercase block">Step 1</span>
                        <div>
                          <label className="block text-[10px] font-semibold text-brand-noir/70 mb-0.5">Title</label>
                          <input
                            type="text"
                            value={invoiceStep1Title}
                            onChange={(e) => setInvoiceStep1Title(e.target.value)}
                            placeholder="1. Atelier Packing"
                            className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-brand-noir/70 mb-0.5">Subtitle</label>
                          <input
                            type="text"
                            value={invoiceStep1Sub}
                            onChange={(e) => setInvoiceStep1Sub(e.target.value)}
                            placeholder="Luxury Gift Box"
                            className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs"
                          />
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="p-3 bg-brand-sand/30 rounded-lg border border-brand-border/60 space-y-2">
                        <span className="text-[11px] font-bold text-brand-noir uppercase block">Step 2</span>
                        <div>
                          <label className="block text-[10px] font-semibold text-brand-noir/70 mb-0.5">Title</label>
                          <input
                            type="text"
                            value={invoiceStep2Title}
                            onChange={(e) => setInvoiceStep2Title(e.target.value)}
                            placeholder="2. Express Dispatch"
                            className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-brand-noir/70 mb-0.5">Subtitle</label>
                          <input
                            type="text"
                            value={invoiceStep2Sub}
                            onChange={(e) => setInvoiceStep2Sub(e.target.value)}
                            placeholder="Air Priority Cargo"
                            className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs"
                          />
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="p-3 bg-brand-sand/30 rounded-lg border border-brand-border/60 space-y-2">
                        <span className="text-[11px] font-bold text-brand-noir uppercase block">Step 3</span>
                        <div>
                          <label className="block text-[10px] font-semibold text-brand-noir/70 mb-0.5">Title</label>
                          <input
                            type="text"
                            value={invoiceStep3Title}
                            onChange={(e) => setInvoiceStep3Title(e.target.value)}
                            placeholder="3. Doorstep Arrival"
                            className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-brand-noir/70 mb-0.5">Subtitle</label>
                          <input
                            type="text"
                            value={invoiceStep3Sub}
                            onChange={(e) => setInvoiceStep3Sub(e.target.value)}
                            placeholder="Hassle-free fit exchange"
                            className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Button Labels & Colors ("from button to everything") */}
                  <div className="bg-white border border-brand-border rounded-xl p-5 space-y-5">
                    <div className="border-b border-brand-border/60 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-mocha flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5" />
                        <span>3. Action Button Labels, Colors & Official Invoice Download</span>
                      </span>
                    </div>

                    {/* Official Invoice Print Button */}
                    <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2.5 text-xs font-semibold text-brand-noir cursor-pointer">
                          <input
                            type="checkbox"
                            checked={invoiceShowPrintBtn}
                            onChange={(e) => setInvoiceShowPrintBtn(e.target.checked)}
                            className="rounded text-brand-mocha focus:ring-brand-mocha"
                          />
                          <span>Show "Print / Download Official Invoice" Button</span>
                        </label>
                        <span className="text-[10px] text-zinc-500 font-mono">Prints luxury invoice receipt</span>
                      </div>

                      {invoiceShowPrintBtn && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-brand-noir mb-1">Button Label</label>
                            <input
                              type="text"
                              value={invoicePrintBtnText}
                              onChange={(e) => setInvoicePrintBtnText(e.target.value)}
                              placeholder="Print / Download Official Invoice"
                              className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-brand-noir mb-1">Background Color</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={invoicePrintBtnBg}
                                onChange={(e) => setInvoicePrintBtnBg(e.target.value)}
                                className="w-7 h-7 rounded cursor-pointer border p-0.5 bg-white"
                              />
                              <input
                                type="text"
                                value={invoicePrintBtnBg}
                                onChange={(e) => setInvoicePrintBtnBg(e.target.value)}
                                className="w-24 bg-white border border-brand-border rounded px-2 py-1 text-xs font-mono"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-brand-noir mb-1">Text Color</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={invoicePrintBtnTextColor}
                                onChange={(e) => setInvoicePrintBtnTextColor(e.target.value)}
                                className="w-7 h-7 rounded cursor-pointer border p-0.5 bg-white"
                              />
                              <input
                                type="text"
                                value={invoicePrintBtnTextColor}
                                onChange={(e) => setInvoicePrintBtnTextColor(e.target.value)}
                                className="w-24 bg-white border border-brand-border rounded px-2 py-1 text-xs font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Button 1: Track Timeline */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Button 1: Label
                        </label>
                        <input
                          type="text"
                          value={invoiceBtnTrackText}
                          onChange={(e) => setInvoiceBtnTrackText(e.target.value)}
                          placeholder="Track Delivery Timeline"
                          className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Link Destination
                        </label>
                        <input
                          type="text"
                          value={invoiceBtnTrackLink}
                          onChange={(e) => setInvoiceBtnTrackLink(e.target.value)}
                          placeholder="/track"
                          className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Background Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={invoiceBtnTrackBg}
                            onChange={(e) => setInvoiceBtnTrackBg(e.target.value)}
                            className="w-7 h-7 rounded cursor-pointer border p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={invoiceBtnTrackBg}
                            onChange={(e) => setInvoiceBtnTrackBg(e.target.value)}
                            className="w-24 bg-white border border-brand-border rounded px-2 py-1 text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Text Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={invoiceBtnTrackTextColor}
                            onChange={(e) => setInvoiceBtnTrackTextColor(e.target.value)}
                            className="w-7 h-7 rounded cursor-pointer border p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={invoiceBtnTrackTextColor}
                            onChange={(e) => setInvoiceBtnTrackTextColor(e.target.value)}
                            className="w-24 bg-white border border-brand-border rounded px-2 py-1 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Button 2: Continue Browsing */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Button 2: Label
                        </label>
                        <input
                          type="text"
                          value={invoiceBtnContText}
                          onChange={(e) => setInvoiceBtnContText(e.target.value)}
                          placeholder="Continue Browsing"
                          className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Link Destination
                        </label>
                        <input
                          type="text"
                          value={invoiceBtnContLink}
                          onChange={(e) => setInvoiceBtnContLink(e.target.value)}
                          placeholder="/shop"
                          className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Background Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={invoiceBtnContBg}
                            onChange={(e) => setInvoiceBtnContBg(e.target.value)}
                            className="w-7 h-7 rounded cursor-pointer border p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={invoiceBtnContBg}
                            onChange={(e) => setInvoiceBtnContBg(e.target.value)}
                            className="w-24 bg-white border border-brand-border rounded px-2 py-1 text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-brand-noir mb-1">
                          Text Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={invoiceBtnContTextColor}
                            onChange={(e) => setInvoiceBtnContTextColor(e.target.value)}
                            className="w-7 h-7 rounded cursor-pointer border p-0.5 bg-white"
                          />
                          <input
                            type="text"
                            value={invoiceBtnContTextColor}
                            onChange={(e) => setInvoiceBtnContTextColor(e.target.value)}
                            className="w-24 bg-white border border-brand-border rounded px-2 py-1 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Concierge Support Notice & Contact */}
                  <div className="bg-white border border-brand-border rounded-xl p-5 space-y-4">
                    <div className="border-b border-brand-border/60 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-mocha flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span>4. Concierge Assistance & Contact Note</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-brand-noir mb-1">Support Email</label>
                        <input
                          type="email"
                          value={invoiceSupportEmail}
                          onChange={(e) => setInvoiceSupportEmail(e.target.value)}
                          placeholder="care@zaynaabaya.com"
                          className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-brand-noir mb-1">Support Phone</label>
                        <input
                          type="text"
                          value={invoiceSupportPhone}
                          onChange={(e) => setInvoiceSupportPhone(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-brand-noir mb-1">Concierge Note Prompt</label>
                        <input
                          type="text"
                          value={invoiceSupportNote}
                          onChange={(e) => setInvoiceSupportNote(e.target.value)}
                          placeholder="Need concierge support regarding your fit or custom adjustments?"
                          className="w-full bg-white border border-brand-border rounded px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveDesigner}
                    disabled={savingDesigner}
                    className="px-6 py-2.5 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center space-x-2 cursor-pointer shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>{savingDesigner ? 'Publishing Invoice Settings...' : 'Save & Publish Invoice Configurations'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sub-Tab: Concierge FAQs Studio */}
            {designerSubTab === 'faqs' && (
              <div className="p-6 sm:p-8 space-y-8 max-w-5xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-brand-border">
                  <div>
                    <h3 className="font-serif text-lg text-brand-noir flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-brand-mocha" />
                      <span>Client Concierge FAQs Studio</span>
                    </h3>
                    <p className="text-xs text-brand-noir/70">
                      Add, edit, reorder, and remove frequently asked questions displayed on the storefront home accordion.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="px-4 py-2 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New FAQ Question</span>
                  </button>
                </div>

                {/* FAQs Reorderable Table / List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-brand-noir/60">
                    <span className="font-semibold uppercase tracking-wider text-[11px]">
                      Published FAQs ({faqsList.length})
                    </span>
                    <span>Use ↑ and ↓ arrows to reorder how questions appear to customers</span>
                  </div>

                  {faqsList.length === 0 ? (
                    <div className="p-8 text-center bg-brand-sand/20 rounded-xl border border-brand-border text-xs text-brand-noir/60 space-y-2">
                      <p>No questions created yet.</p>
                      <button
                        type="button"
                        onClick={handleAddFaq}
                        className="text-brand-mocha font-semibold hover:underline"
                      >
                        Click here to add your first FAQ
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {faqsList.map((faq, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-brand-border rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand-mocha/40 transition-colors"
                        >
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-brand-sand/60 text-brand-noir text-[10px] font-bold flex items-center justify-center font-mono">
                                {idx + 1}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-sand text-brand-mocha">
                                {faq.category || 'General'}
                              </span>
                              <h4 className="font-serif text-sm text-brand-noir font-medium">
                                {faq.question}
                              </h4>
                            </div>
                            <p className="text-xs text-brand-noir/70 line-clamp-2 pl-7">
                              {faq.answer}
                            </p>
                          </div>

                          {/* Controls: Reorder & Edit & Delete */}
                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => moveFaqUp(idx)}
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg border border-brand-border text-brand-noir/60 hover:text-brand-noir hover:bg-brand-sand/40 disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveFaqDown(idx)}
                              disabled={idx === faqsList.length - 1}
                              className="p-1.5 rounded-lg border border-brand-border text-brand-noir/60 hover:text-brand-noir hover:bg-brand-sand/40 disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditFaq(idx)}
                              className="px-2.5 py-1.5 rounded-lg bg-brand-sand/40 hover:bg-brand-sand text-brand-noir text-xs font-semibold flex items-center gap-1 border border-brand-border cursor-pointer ml-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFaq(idx)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Live Accordion Preview */}
                <div className="bg-brand-sand/20 border border-brand-border rounded-xl p-5 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-noir/60 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-brand-mocha" />
                    <span>Live Interactive Storefront FAQ Accordion Preview</span>
                  </span>

                  <div className="space-y-2 bg-white p-4 rounded-xl border border-brand-border">
                    {faqsList.map((item, i) => {
                      const isOpen = previewFaqOpen === i;
                      return (
                        <div key={i} className="border border-brand-border rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setPreviewFaqOpen(isOpen ? null : i)}
                            className="w-full px-4 py-3 text-left flex items-center justify-between text-xs sm:text-sm text-brand-noir font-medium hover:text-brand-mocha transition-colors bg-brand-sand/10"
                          >
                            <span className="font-serif">{item.question}</span>
                            <ChevronDown
                              className={`w-4 h-4 text-brand-mocha transition-transform duration-200 ${
                                isOpen ? 'rotate-180 text-brand-gold' : ''
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-4 pb-4 pt-2 text-xs text-brand-noir/80 leading-relaxed border-t border-brand-sand">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Save Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveDesigner}
                    disabled={savingDesigner}
                    className="px-6 py-2.5 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center space-x-2 cursor-pointer shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>{savingDesigner ? 'Publishing FAQs...' : 'Save & Publish FAQs to Storefront'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: ADD NEW CREATION WITH DIRECT MULTIPLE PICTURES UPLOAD */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-brand-border shadow-2xl max-w-3xl w-full my-8 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-fade-in text-brand-noir">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-mocha">
                  New Atelier Creation
                </span>
                <h2 className="font-serif text-2xl text-brand-noir">Add Product Details & Photos</h2>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1.5 text-brand-noir/60 hover:text-brand-noir rounded-md"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-6">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-noir mb-1">
                    Creation Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Zahara Embroidered Silk Abaya"
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-noir mb-1">
                    Category *
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-noir mb-1">
                    Base Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={prodPriceINR}
                    onChange={(e) => setProdPriceINR(e.target.value)}
                    placeholder="e.g. 5499"
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 text-xs focus:outline-none focus:border-brand-mocha font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-noir mb-1">
                    Sale Price (₹ INR) (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={prodSalePriceINR}
                    onChange={(e) => setProdSalePriceINR(e.target.value)}
                    placeholder="e.g. 4799"
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-noir mb-1">
                    Total Inventory Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="25"
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                  />
                </div>
              </div>

              {/* DIRECT MULTIPLE PICTURES UPLOADER (NO URLS REQUIRED!) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-brand-noir">
                    Creation Pictures & Lookbook Photos *
                  </label>
                  <span className="text-[11px] text-brand-mocha font-medium">
                    {imagePreviews.length} picture(s) selected
                  </span>
                </div>

                {/* Dropzone / File Picker Button */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-brand-border hover:border-brand-mocha bg-brand-sand/30 hover:bg-brand-sand/50 rounded-xl p-6 text-center cursor-pointer transition-colors space-y-2 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePictureSelection}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto text-brand-mocha group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brand-noir">
                      Click to choose pictures from your device
                    </p>
                    <p className="text-[11px] text-brand-noir/60 mt-0.5">
                      Select multiple photos directly (JPG, PNG, WebP) — No URLs needed!
                    </p>
                  </div>
                </div>

                {/* Live Selected Pictures Gallery Preview */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative aspect-[3/4] rounded-lg overflow-hidden bg-brand-sand border-2 border-brand-border group shadow-sm"
                      >
                        <Image
                          src={preview}
                          alt={`Uploaded preview ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        {/* Cover Badge on First Photo */}
                        {index === 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-brand-mocha text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                            Cover Photo
                          </span>
                        )}
                        {/* Delete Picture Button */}
                        <button
                          type="button"
                          onClick={() => handleRemovePicture(index)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow"
                          title="Remove this picture"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* INSTAGRAM-STYLE PRODUCT VIDEOS (REELS / MP4 / MOV) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-brand-mocha" />
                    <label className="block text-xs font-semibold text-brand-noir">
                      Product Videos & Instagram Reels ({prodVideos.length})
                    </label>
                  </div>
                  <span className="text-[10px] text-brand-noir/60 uppercase tracking-wider font-medium">
                    Auto-plays like Instagram Reel
                  </span>
                </div>

                {/* Upload or Add URL controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Direct Video File Upload */}
                  <div
                    onClick={() => videoFileInputRef.current?.click()}
                    className="border-2 border-dashed border-brand-border hover:border-brand-mocha bg-brand-sand/20 hover:bg-brand-sand/40 rounded-xl p-4 text-center cursor-pointer transition-colors group flex flex-col items-center justify-center space-y-1.5"
                  >
                    <input
                      ref={videoFileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      onChange={handleVideoFileSelected}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-mocha group-hover:scale-110 transition-transform">
                      {uploadingVideo ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Film className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-brand-noir">
                        {uploadingVideo ? 'Processing video...' : 'Upload Video File'}
                      </p>
                      <p className="text-[10px] text-brand-noir/60">
                        MP4, MOV, WebM (up to 50MB)
                      </p>
                    </div>
                  </div>

                  {/* Video URL Input */}
                  <div className="border border-brand-border bg-white rounded-xl p-4 flex flex-col justify-center space-y-2">
                    <label className="block text-[11px] font-semibold text-brand-noir">
                      Or Add Video Link / Cloud URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={prodVideoInputUrl}
                        onChange={(e) => setProdVideoInputUrl(e.target.value)}
                        placeholder="https://.../video.mp4"
                        className="flex-1 bg-brand-sand/30 border border-brand-border rounded p-2 text-xs focus:outline-none focus:border-brand-mocha"
                      />
                      <button
                        type="button"
                        onClick={handleAddVideoUrl}
                        className="px-3 py-2 bg-brand-noir text-white text-xs font-semibold rounded hover:bg-brand-mocha transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>
                    <p className="text-[10px] text-brand-noir/50">
                      Supports direct MP4 links, CDN videos, Cloudinary, etc.
                    </p>
                  </div>
                </div>

                {/* Video Previews */}
                {prodVideos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    {prodVideos.map((vidUrl, index) => (
                      <div
                        key={index}
                        className="relative aspect-[3/4] rounded-lg overflow-hidden bg-black border-2 border-brand-mocha/40 group shadow-sm"
                      >
                        <video
                          src={vidUrl}
                          muted
                          loop
                          playsInline
                          onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Play className="w-2.5 h-2.5 fill-white" />
                          Reel {index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(index)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow"
                          title="Remove video"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-1.5 inset-x-1.5 text-center bg-black/60 backdrop-blur-sm py-1 rounded text-[9px] text-white/80">
                          Hover to preview
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-brand-noir mb-1">
                  Creation Description & Styling Notes
                </label>
                <textarea
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Describe the silhouette, drape, embroidery, lining, and styling versatility..."
                  className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                />
              </div>

              {/* Length / Size Variants & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-noir mb-2">
                    Available Abaya Lengths / Sizes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['52', '54', '56', '58', '60'].map((sz) => {
                      const isSelected = prodSizes.includes(sz);
                      return (
                        <button
                          type="button"
                          key={sz}
                          onClick={() => toggleSizeSelection(sz)}
                          className={`w-10 h-8 rounded text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-brand-mocha text-white shadow-sm'
                              : 'bg-brand-sand/60 text-brand-noir hover:bg-brand-border'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-brand-noir/50 mt-1 block">
                    Click to include/exclude sizes from the variant selector
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-brand-noir">
                      Product Colors ({prodColors.length})
                    </label>
                    <span className="text-[10px] text-brand-noir/60">
                      Select radio for Default / Primary Color
                    </span>
                  </div>

                  {/* List of Added Colors with Radio Selector, Reorder, and Delete */}
                  <div className="space-y-2 border border-brand-border/80 rounded-lg p-3 bg-brand-sand/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {prodColors.map((colorItem, idx) => {
                        const isDefault = defaultColorIndex === idx;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-2 rounded-md border text-xs transition-all ${
                              isDefault
                                ? 'bg-white border-brand-mocha shadow-sm ring-1 ring-brand-mocha/40'
                                : 'bg-white/80 border-brand-border hover:border-brand-border/90'
                            }`}
                          >
                            <label className="flex items-center gap-2 cursor-pointer select-none flex-1 min-w-0">
                              <input
                                type="radio"
                                name="add-default-color-radio"
                                checked={isDefault}
                                onChange={() => setDefaultColorIndex(idx)}
                                className="w-3.5 h-3.5 text-brand-mocha focus:ring-brand-mocha accent-[#8E6E53] cursor-pointer shrink-0"
                              />
                              <span
                                className="w-4 h-4 rounded-full border border-black/20 shadow-inner shrink-0"
                                style={{ backgroundColor: colorItem.hex || getColorHex(colorItem.name) }}
                              />
                              <span className="font-medium text-brand-noir truncate max-w-[110px]">
                                {colorItem.name}
                              </span>
                              {isDefault && (
                                <span className="text-[9px] font-bold uppercase bg-brand-mocha text-white px-1.5 py-0.5 rounded tracking-wide shrink-0">
                                  Default
                                </span>
                              )}
                            </label>

                            <div className="flex items-center space-x-1 shrink-0 ml-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveColor(idx, 'up')}
                                className="p-1 text-brand-noir/50 hover:text-brand-noir disabled:opacity-20 rounded cursor-pointer"
                                title="Move earlier in order"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === prodColors.length - 1}
                                onClick={() => handleMoveColor(idx, 'down')}
                                className="p-1 text-brand-noir/50 hover:text-brand-noir disabled:opacity-20 rounded cursor-pointer"
                                title="Move later in order"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={prodColors.length <= 1}
                                onClick={() => handleRemoveColor(idx)}
                                className="p-1 text-red-500 hover:text-red-700 disabled:opacity-20 rounded cursor-pointer"
                                title="Remove color"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Add Luxury Preset Colors */}
                    <div className="pt-2 border-t border-brand-border/60">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-noir/60 block mb-1.5">
                        Quick Add Preset Palettes:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {LUXURY_COLOR_PRESETS.map((preset) => {
                          const isAlreadyAdded = prodColors.some(
                            (c) => c.name.toLowerCase() === preset.name.toLowerCase()
                          );
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              disabled={isAlreadyAdded}
                              onClick={() => handleAddPresetColor(preset)}
                              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                                isAlreadyAdded
                                  ? 'opacity-40 bg-brand-sand/40 text-brand-noir/50 cursor-not-allowed'
                                  : 'bg-white border border-brand-border hover:border-brand-mocha hover:bg-brand-sand/50 text-brand-noir cursor-pointer'
                              }`}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/20"
                                style={{ backgroundColor: preset.hex }}
                              />
                              <span>{preset.name}</span>
                              {!isAlreadyAdded && <Plus className="w-2.5 h-2.5 text-brand-mocha" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Color Adder */}
                    <div className="pt-2 border-t border-brand-border/60 flex items-center gap-2">
                      <input
                        type="color"
                        value={customColorHex}
                        onChange={(e) => setCustomColorHex(e.target.value)}
                        className="w-8 h-8 rounded border border-brand-border cursor-pointer p-0.5 bg-white"
                        title="Pick custom hex color"
                      />
                      <input
                        type="text"
                        value={customColorName}
                        onChange={(e) => setCustomColorName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomColor();
                          }
                        }}
                        placeholder="Add custom color name (e.g. Sage Green)"
                        className="flex-1 bg-white border border-brand-border rounded p-2 text-xs focus:outline-none focus:border-brand-mocha"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomColor}
                        className="px-3 py-2 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specifications: Fabric & Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-noir mb-1">
                    Fabric & Care Instructions
                  </label>
                  <input
                    type="text"
                    value={prodFabricCare}
                    onChange={(e) => setProdFabricCare(e.target.value)}
                    placeholder="e.g. Pure Korean Nidha, hand wash cold"
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-noir mb-1">
                    Delivery Timeline Note
                  </label>
                  <input
                    type="text"
                    value={prodDeliveryInfo}
                    onChange={(e) => setProdDeliveryInfo(e.target.value)}
                    placeholder="e.g. Dispatched in 24-48 hours across India"
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                  />
                </div>
              </div>

              {/* Merchandising Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                  <input
                    type="checkbox"
                    checked={isOnSale}
                    onChange={(e) => setIsOnSale(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-600"
                  />
                  <span className="font-bold text-red-700 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-red-600" />
                    <span>On Sale (Display SALE Badge)</span>
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                    className="rounded text-brand-mocha focus:ring-brand-mocha"
                  />
                  <span>Mark as Bestseller</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-brand-mocha focus:ring-brand-mocha"
                  />
                  <span>Feature on Homepage</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="rounded text-brand-mocha focus:ring-brand-mocha"
                  />
                  <span>New Arrival Badge</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-5 py-2.5 border border-brand-border rounded text-xs font-semibold text-brand-noir hover:bg-brand-sand transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingProduct}
                  className="px-6 py-2.5 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded text-xs font-semibold uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                >
                  {creatingProduct ? 'Uploading Pictures & Saving...' : 'Save Creation to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CREATION DETAILS & COLORS */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-brand-border shadow-2xl max-w-3xl w-full my-8 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-fade-in text-brand-noir">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-mocha">
                  Modify Atelier Creation
                </span>
                <h2 className="font-serif text-2xl text-brand-noir">Edit Product & Color Variants</h2>
              </div>
              <button
                onClick={handleCloseEditProduct}
                className="p-1.5 text-brand-noir/60 hover:text-brand-noir rounded-md cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editFormError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                {editFormError}
              </div>
            )}

            <form onSubmit={handleSaveEditProduct} className="space-y-6">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-noir mb-1">
                    Creation Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editProdName}
                    onChange={(e) => setEditProdName(e.target.value)}
                    placeholder="e.g. Zahara Embroidered Silk Abaya"
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-noir mb-1">
                    Category
                  </label>
                  <select
                    value={editProdCategory}
                    onChange={(e) => setEditProdCategory(e.target.value)}
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-noir mb-1">
                    Base Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editProdPriceINR}
                    onChange={(e) => setEditProdPriceINR(e.target.value)}
                    placeholder="e.g. 5499"
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-noir mb-1">
                    Sale Price (₹ INR) (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editProdSalePriceINR}
                    onChange={(e) => setEditProdSalePriceINR(e.target.value)}
                    placeholder="e.g. 4499"
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-noir mb-1">
                    Total Inventory Stock
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editProdStock}
                    onChange={(e) => setEditProdStock(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-brand-noir mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={editProdDescription}
                  onChange={(e) => setEditProdDescription(e.target.value)}
                  placeholder="Describe the silhouette, embroidery, occasion, and fabric cut..."
                  className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 text-xs focus:outline-none focus:border-brand-mocha resize-none"
                />
              </div>

              {/* Product Photos Management */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-brand-noir">
                  Product Photos ({editImages.length + editImagePreviews.length})
                </label>

                {/* Existing Images */}
                {editImages.length > 0 && (
                  <div>
                    <span className="text-[10px] text-brand-noir/60 block mb-1">Current Photos:</span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {editImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-brand-border group">
                          <Image src={imgUrl} alt={`Current ${idx + 1}`} fill unoptimized className="object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingEditPicture(idx)}
                            className="absolute top-1 right-1 bg-red-600/90 text-white rounded p-1 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                            title="Remove picture"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newly Added Images */}
                {editImagePreviews.length > 0 && (
                  <div>
                    <span className="text-[10px] text-emerald-700 font-semibold block mb-1">New Photos to Add:</span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {editImagePreviews.map((previewUrl, idx) => (
                        <div key={idx} className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-emerald-500 group">
                          <Image src={previewUrl} alt={`New upload ${idx + 1}`} fill unoptimized className="object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveEditNewPicture(idx)}
                            className="absolute top-1 right-1 bg-red-600/90 text-white rounded p-1 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                            title="Remove picture"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleEditPicturesSelected}
                    className="hidden"
                    id="edit-file-upload-input"
                  />
                  <label
                    htmlFor="edit-file-upload-input"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-sand/60 hover:bg-brand-sand border border-brand-border rounded text-xs font-semibold text-brand-noir cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Additional Pictures</span>
                  </label>
                </div>
              </div>

              {/* PRODUCT VIDEOS & INSTAGRAM REELS */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-brand-mocha" />
                    <label className="block text-xs font-semibold text-brand-noir">
                      Product Videos & Reels ({editProdVideos.length})
                    </label>
                  </div>
                  <span className="text-[10px] text-brand-noir/60 uppercase tracking-wider font-medium">
                    Instagram Style Reel Playback
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Direct Video File Upload */}
                  <div
                    onClick={() => editVideoFileInputRef.current?.click()}
                    className="border-2 border-dashed border-brand-border hover:border-brand-mocha bg-brand-sand/20 hover:bg-brand-sand/40 rounded-xl p-4 text-center cursor-pointer transition-colors group flex flex-col items-center justify-center space-y-1.5"
                  >
                    <input
                      ref={editVideoFileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/*"
                      onChange={handleEditVideoFileSelected}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-brand-mocha group-hover:scale-110 transition-transform">
                      {editUploadingVideo ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Film className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-brand-noir">
                        {editUploadingVideo ? 'Processing video...' : 'Upload Video File'}
                      </p>
                      <p className="text-[10px] text-brand-noir/60">
                        MP4, MOV, WebM (up to 50MB)
                      </p>
                    </div>
                  </div>

                  {/* Video URL Input */}
                  <div className="border border-brand-border bg-white rounded-xl p-4 flex flex-col justify-center space-y-2">
                    <label className="block text-[11px] font-semibold text-brand-noir">
                      Or Add Video Link / Cloud URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={editProdVideoInputUrl}
                        onChange={(e) => setEditProdVideoInputUrl(e.target.value)}
                        placeholder="https://.../video.mp4"
                        className="flex-1 bg-brand-sand/30 border border-brand-border rounded p-2 text-xs focus:outline-none focus:border-brand-mocha"
                      />
                      <button
                        type="button"
                        onClick={handleEditAddVideoUrl}
                        className="px-3 py-2 bg-brand-noir text-white text-xs font-semibold rounded hover:bg-brand-mocha transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>
                    <p className="text-[10px] text-brand-noir/50">
                      Supports direct MP4 links, CDN videos, Cloudinary, etc.
                    </p>
                  </div>
                </div>

                {/* Edit Videos Previews */}
                {editProdVideos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    {editProdVideos.map((vidUrl, index) => (
                      <div
                        key={index}
                        className="relative aspect-[3/4] rounded-lg overflow-hidden bg-black border-2 border-brand-mocha/40 group shadow-sm"
                      >
                        <video
                          src={vidUrl}
                          muted
                          loop
                          playsInline
                          onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Play className="w-2.5 h-2.5 fill-white" />
                          Reel {index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleEditRemoveVideo(index)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow"
                          title="Remove video"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute bottom-1.5 inset-x-1.5 text-center bg-black/60 backdrop-blur-sm py-1 rounded text-[9px] text-white/80">
                          Hover to preview
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lengths/Sizes and Multi-Color Selector */}
              <div className="space-y-4 pt-2 border-t border-brand-border">
                <div>
                  <label className="block text-xs font-semibold text-brand-noir mb-2">
                    Available Abaya Lengths / Sizes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['52', '54', '56', '58', '60'].map((sz) => {
                      const isSelected = editProdSizes.includes(sz);
                      return (
                        <button
                          type="button"
                          key={sz}
                          onClick={() => toggleEditSizeSelection(sz)}
                          className={`w-10 h-8 rounded text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-brand-mocha text-white shadow-sm'
                              : 'bg-brand-sand/60 text-brand-noir hover:bg-brand-border'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Manager for Edit */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-brand-noir">
                      Product Colors ({editProdColors.length})
                    </label>
                    <span className="text-[10px] text-brand-noir/60">
                      Select radio for Default / Primary Color
                    </span>
                  </div>

                  {/* List of Added Colors */}
                  <div className="space-y-2 border border-brand-border/80 rounded-lg p-3 bg-brand-sand/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {editProdColors.map((colorItem, idx) => {
                        const isDefault = editDefaultColorIndex === idx;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-2 rounded-md border text-xs transition-all ${
                              isDefault
                                ? 'bg-white border-brand-mocha shadow-sm ring-1 ring-brand-mocha/40'
                                : 'bg-white/80 border-brand-border hover:border-brand-border/90'
                            }`}
                          >
                            <label className="flex items-center gap-2 cursor-pointer select-none flex-1 min-w-0">
                              <input
                                type="radio"
                                name="edit-default-color-radio"
                                checked={isDefault}
                                onChange={() => setEditDefaultColorIndex(idx)}
                                className="w-3.5 h-3.5 text-brand-mocha focus:ring-brand-mocha accent-[#8E6E53] cursor-pointer shrink-0"
                              />
                              <span
                                className="w-4 h-4 rounded-full border border-black/20 shadow-inner shrink-0"
                                style={{ backgroundColor: colorItem.hex || getColorHex(colorItem.name) }}
                              />
                              <span className="font-medium text-brand-noir truncate max-w-[110px]">
                                {colorItem.name}
                              </span>
                              {isDefault && (
                                <span className="text-[9px] font-bold uppercase bg-brand-mocha text-white px-1.5 py-0.5 rounded tracking-wide shrink-0">
                                  Default
                                </span>
                              )}
                            </label>

                            <div className="flex items-center space-x-1 shrink-0 ml-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleEditMoveColor(idx, 'up')}
                                className="p-1 text-brand-noir/50 hover:text-brand-noir disabled:opacity-20 rounded cursor-pointer"
                                title="Move earlier in order"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === editProdColors.length - 1}
                                onClick={() => handleEditMoveColor(idx, 'down')}
                                className="p-1 text-brand-noir/50 hover:text-brand-noir disabled:opacity-20 rounded cursor-pointer"
                                title="Move later in order"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={editProdColors.length <= 1}
                                onClick={() => handleEditRemoveColor(idx)}
                                className="p-1 text-red-500 hover:text-red-700 disabled:opacity-20 rounded cursor-pointer"
                                title="Remove color"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Add Presets */}
                    <div className="pt-2 border-t border-brand-border/60">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-noir/60 block mb-1.5">
                        Quick Add Preset Palettes:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {LUXURY_COLOR_PRESETS.map((preset) => {
                          const isAlreadyAdded = editProdColors.some(
                            (c) => c.name.toLowerCase() === preset.name.toLowerCase()
                          );
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              disabled={isAlreadyAdded}
                              onClick={() => handleEditAddPresetColor(preset)}
                              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                                isAlreadyAdded
                                  ? 'opacity-40 bg-brand-sand/40 text-brand-noir/50 cursor-not-allowed'
                                  : 'bg-white border border-brand-border hover:border-brand-mocha hover:bg-brand-sand/50 text-brand-noir cursor-pointer'
                              }`}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/20"
                                style={{ backgroundColor: preset.hex }}
                              />
                              <span>{preset.name}</span>
                              {!isAlreadyAdded && <Plus className="w-2.5 h-2.5 text-brand-mocha" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Color Adder */}
                    <div className="pt-2 border-t border-brand-border/60 flex items-center gap-2">
                      <input
                        type="color"
                        value={editCustomColorHex}
                        onChange={(e) => setEditCustomColorHex(e.target.value)}
                        className="w-8 h-8 rounded border border-brand-border cursor-pointer p-0.5 bg-white"
                        title="Pick custom hex color"
                      />
                      <input
                        type="text"
                        value={editCustomColorName}
                        onChange={(e) => setEditCustomColorName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleEditAddCustomColor();
                          }
                        }}
                        placeholder="Add custom color name (e.g. Sage Green)"
                        className="flex-1 bg-white border border-brand-border rounded p-2 text-xs focus:outline-none focus:border-brand-mocha"
                      />
                      <button
                        type="button"
                        onClick={handleEditAddCustomColor}
                        className="px-3 py-2 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specifications: Fabric & Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-noir mb-1">
                    Fabric & Care Instructions
                  </label>
                  <input
                    type="text"
                    value={editProdFabricCare}
                    onChange={(e) => setEditProdFabricCare(e.target.value)}
                    placeholder="e.g. Pure Korean Nidha, hand wash cold"
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-noir mb-1">
                    Delivery Timeline Note
                  </label>
                  <input
                    type="text"
                    value={editProdDeliveryInfo}
                    onChange={(e) => setEditProdDeliveryInfo(e.target.value)}
                    placeholder="e.g. Dispatched in 24-48 hours across India"
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                  />
                </div>
              </div>

              {/* Merchandising Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                  <input
                    type="checkbox"
                    checked={editIsOnSale}
                    onChange={(e) => setEditIsOnSale(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-600"
                  />
                  <span className="font-bold text-red-700 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-red-600" />
                    <span>On Sale (Display SALE Badge)</span>
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsBestseller}
                    onChange={(e) => setEditIsBestseller(e.target.checked)}
                    className="rounded text-brand-mocha focus:ring-brand-mocha"
                  />
                  <span>Mark as Bestseller</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsFeatured}
                    onChange={(e) => setEditIsFeatured(e.target.checked)}
                    className="rounded text-brand-mocha focus:ring-brand-mocha"
                  />
                  <span>Feature on Homepage</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsNewArrival}
                    onChange={(e) => setEditIsNewArrival(e.target.checked)}
                    className="rounded text-brand-mocha focus:ring-brand-mocha"
                  />
                  <span>New Arrival Badge</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-brand-border">
                <button
                  type="button"
                  onClick={handleCloseEditProduct}
                  className="px-5 py-2.5 border border-brand-border rounded text-xs font-semibold text-brand-noir hover:bg-brand-sand transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEditProduct}
                  className="px-6 py-2.5 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded text-xs font-semibold uppercase tracking-wider shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingEditProduct ? 'Updating Creation...' : 'Update & Save Creation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details View Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-brand-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-border sticky top-0 bg-white z-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-mocha">Order Details</p>
                <h3 className="font-serif text-lg text-brand-noir">#{viewingOrder.orderNumber}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  viewingOrder.fulfillmentStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                  viewingOrder.fulfillmentStatus === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  viewingOrder.fulfillmentStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {viewingOrder.fulfillmentStatus || 'Processing'}
                </span>
                <button onClick={() => setViewingOrder(null)} className="text-brand-noir/50 hover:text-brand-noir">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer & Shipping Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-sand/30 rounded-lg p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-mocha">Customer</p>
                  <p className="font-semibold text-brand-noir">{viewingOrder.shippingAddress?.fullName || 'Guest'}</p>
                  <p className="text-xs text-brand-noir/60">{viewingOrder.guestEmail || '—'}</p>
                  {viewingOrder.shippingAddress?.phone && (
                    <p className="text-xs text-brand-noir/60 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {viewingOrder.shippingAddress.phone}
                    </p>
                  )}
                </div>
                <div className="bg-brand-sand/30 rounded-lg p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-mocha">Shipping Address</p>
                  <p className="text-xs text-brand-noir leading-relaxed">
                    {viewingOrder.shippingAddress?.street}<br />
                    {viewingOrder.shippingAddress?.apartment && <>{viewingOrder.shippingAddress.apartment}<br /></>}
                    {viewingOrder.shippingAddress?.city}, {viewingOrder.shippingAddress?.state} {viewingOrder.shippingAddress?.postalCode}<br />
                    {viewingOrder.shippingAddress?.country}
                  </p>
                </div>
              </div>

              {/* Items Ordered */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-mocha mb-3">Items Ordered</p>
                <div className="border border-brand-border rounded-lg overflow-hidden divide-y divide-brand-border">
                  {viewingOrder.items?.map((item: any, idx: number) => {
                    const itemName = item.name || item.title || item.product?.name || 'Zayna Creation';
                    const itemImage = item.image || item.product?.images?.[0] || (typeof item.product?.images?.[0] === 'string' ? item.product.images[0] : item.product?.images?.[0]?.url);
                    const itemSku = item.sku || item.product?.sku || '';
                    const itemPrice = item.price || (item.total && item.quantity ? Math.round(item.total / item.quantity) : 0);
                    const itemTotal = item.total || (itemPrice * (item.quantity || 1));

                    return (
                      <div key={idx} className="flex items-center gap-4 p-4">
                        {itemImage ? (
                          <img src={itemImage} alt={itemName} className="w-14 h-14 object-cover rounded-lg border border-brand-border flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-14 bg-brand-sand/60 rounded-lg border border-brand-border flex items-center justify-center text-brand-mocha font-serif text-xs font-bold flex-shrink-0">
                            ZA
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-brand-noir text-sm">{itemName}</p>
                          {itemSku && (
                            <p className="text-[11px] font-mono text-brand-noir/50">SKU: {itemSku}</p>
                          )}
                          {(item.size || item.color) && (
                            <p className="text-xs text-brand-noir/60 mt-0.5">
                              {item.size && <span>Size: <strong>{item.size}</strong></span>}
                              {item.size && item.color && ' · '}
                              {item.color && <span>Color: <strong>{item.color}</strong></span>}
                            </p>
                          )}
                          <p className="text-xs text-brand-noir/60 mt-0.5">Qty: <strong>{item.quantity}</strong></p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-brand-noir">{formatINR(itemTotal)}</p>
                          <p className="text-[10px] text-brand-noir/50">{formatINR(itemPrice)} each</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-brand-sand/30 rounded-lg p-4 space-y-2 text-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-mocha mb-2">Pricing Breakdown</p>
                <div className="flex justify-between text-brand-noir/70">
                  <span>Subtotal</span>
                  <span>{formatINR(viewingOrder.pricing?.subtotal || 0)}</span>
                </div>
                {(viewingOrder.pricing?.discountAmount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span>− {formatINR(viewingOrder.pricing.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-brand-noir/70">
                  <span>Shipping</span>
                  <span>{(viewingOrder.pricing?.shippingAmount || 0) === 0 ? 'Free' : formatINR(viewingOrder.pricing?.shippingAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-brand-noir/70">
                  <span>GST / Taxes</span>
                  <span className="text-emerald-700 font-medium">
                    {(viewingOrder.pricing?.taxAmount || 0) > 0
                      ? formatINR(viewingOrder.pricing.taxAmount)
                      : 'Included'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-brand-noir border-t border-brand-border pt-2 mt-1">
                  <span>Total</span>
                  <span>{formatINR(viewingOrder.pricing?.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-brand-noir/60">Payment</span>
                  <span className={`font-bold ${viewingOrder.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {viewingOrder.paymentStatus?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Tracking Info */}
              {viewingOrder.tracking?.trackingNumber && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Tracking Info</p>
                  <p className="text-xs text-brand-noir"><strong>Courier:</strong> {viewingOrder.tracking.courier}</p>
                  <p className="text-xs text-brand-noir"><strong>Tracking #:</strong> <span className="font-mono">{viewingOrder.tracking.trackingNumber}</span></p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setViewingOrder(null);
                    setEditingOrder(viewingOrder);
                    setNewStatus(viewingOrder.fulfillmentStatus || 'processing');
                    setCourier(viewingOrder.tracking?.courier || 'BlueDart Air Express');
                    setTrackingNumber(viewingOrder.tracking?.trackingNumber || '');
                  }}
                  className="flex-1 bg-brand-mocha text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-brand-mocha/90 transition-colors"
                >
                  Update Dispatch
                </button>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="px-6 border border-brand-border text-brand-noir py-2.5 rounded-lg font-semibold text-sm hover:bg-brand-sand/40 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fulfillment Update Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-brand-border shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-serif text-lg text-brand-noir">
              Update Dispatch: #{editingOrder.orderNumber}
            </h3>

            <form onSubmit={handleUpdateFulfillment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-brand-noir mb-1">
                  Fulfillment Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-brand-sand/40 border border-brand-border rounded p-2 text-xs"
                >
                  <option value="unfulfilled">Unfulfilled</option>
                  <option value="processing">Processing in Atelier</option>
                  <option value="shipped">Dispatched / Shipped</option>
                  <option value="delivered">Delivered to Client</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-noir mb-1">
                  Courier Company
                </label>
                <input
                  type="text"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  placeholder="e.g. BlueDart, Delhivery, DTDC"
                  className="w-full bg-brand-sand/40 border border-brand-border rounded p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-noir mb-1">
                  AWB Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. BLU-827391823"
                  className="w-full bg-brand-sand/40 border border-brand-border rounded p-2 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 border border-brand-border text-xs rounded hover:bg-brand-sand"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingFulfillment}
                  className="px-5 py-2 bg-brand-mocha text-white text-xs font-semibold rounded hover:bg-brand-mocha-dark"
                >
                  {updatingFulfillment ? 'Saving...' : 'Update & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CURATED CATEGORY WITH DIRECT PHOTO UPLOAD */}
      {catModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-brand-border shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 text-brand-noir animate-fade-in">
            {/* Hidden Direct File Input */}
            <input
              type="file"
              ref={catImageInputRef}
              accept="image/*"
              onChange={handleCatImageUpload}
              className="hidden"
            />

            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-mocha">
                  Curated Showcase
                </span>
                <h3 className="font-serif text-xl text-brand-noir">Edit Collection: {editingCategory.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setCatModalOpen(false)}
                className="p-1 text-brand-noir/60 hover:text-brand-noir rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              {/* Category Image Preview & Upload */}
              <div>
                <label className="block text-xs font-semibold text-brand-noir mb-1.5">
                  Collection Cover Photograph
                </label>
                <div className="relative w-full h-44 rounded-lg overflow-hidden bg-brand-sand border border-brand-border mb-2.5">
                  <img
                    src={catImage || 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=800&auto=format&fit=crop'}
                    alt={catName || 'Category image'}
                    className="w-full h-full object-cover"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => catImageInputRef.current?.click()}
                  disabled={uploadingCatImage}
                  className="w-full py-2.5 px-3 bg-white border border-brand-mocha text-brand-mocha rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 hover:bg-brand-sand/30 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {uploadingCatImage ? 'Uploading Picture from Device...' : 'Upload Photo from Device'}
                  </span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-noir mb-1">
                  Or Image URL
                </label>
                <input
                  type="text"
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  placeholder="https://... or http://localhost:5000/uploads/..."
                  className="w-full bg-brand-sand/20 border border-brand-border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-brand-mocha"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-noir mb-1">
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Luxury Occasion Abayas"
                  className="w-full bg-brand-sand/20 border border-brand-border rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-brand-mocha"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-noir mb-1">
                  Editorial Description
                </label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Intricately hand-embroidered silhouettes for celebrations and evening soirees."
                  className="w-full bg-brand-sand/20 border border-brand-border rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                />
              </div>

              <div className="flex justify-end space-x-2.5 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 border border-brand-border text-xs rounded-lg hover:bg-brand-sand text-brand-noir"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="px-5 py-2 bg-brand-mocha text-white text-xs font-semibold rounded-lg hover:bg-brand-mocha-dark transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {savingCategory ? 'Updating Collection...' : 'Save Collection Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT FAQ QUESTION */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-brand-border shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-in text-brand-noir">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-mocha">
                  Client Concierge
                </span>
                <h3 className="font-serif text-lg text-brand-noir">
                  {editingFaqIndex !== null ? 'Edit FAQ Question & Answer' : 'Add New FAQ Question'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFaqModalOpen(false)}
                className="p-1.5 text-brand-noir/60 hover:text-brand-noir rounded-md cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaqModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-noir mb-1">
                  Topic Category
                </label>
                <select
                  value={faqCategory}
                  onChange={(e) => setFaqCategory(e.target.value)}
                  className="w-full bg-brand-sand/30 border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha font-medium"
                >
                  <option value="Sizing & Fit">Sizing & Fit</option>
                  <option value="Fabrics & Quality">Fabrics & Quality</option>
                  <option value="Shipping & Delivery">Shipping & Delivery</option>
                  <option value="Exchanges & Returns">Exchanges & Returns</option>
                  <option value="Care & Maintenance">Care & Maintenance</option>
                  <option value="Custom Orders">Custom Orders</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-noir mb-1">
                  Question Prompt *
                </label>
                <input
                  type="text"
                  required
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="e.g. How do I choose the correct abaya size?"
                  className="w-full bg-brand-sand/30 border border-brand-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-noir mb-1">
                  Detailed Answer Response *
                </label>
                <textarea
                  required
                  rows={4}
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Provide a clear, luxurious and helpful answer for your clients..."
                  className="w-full bg-brand-sand/30 border border-brand-border rounded-lg p-2.5 text-xs focus:outline-none focus:border-brand-mocha leading-relaxed"
                />
              </div>

              <div className="flex justify-end space-x-2.5 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(false)}
                  className="px-4 py-2 border border-brand-border text-xs rounded-lg hover:bg-brand-sand text-brand-noir cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-mocha text-white text-xs font-semibold rounded-lg hover:bg-brand-mocha-dark transition-all shadow-xs cursor-pointer"
                >
                  {editingFaqIndex !== null ? 'Save FAQ Edits' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
