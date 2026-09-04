import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  message: string;
  link?: string;
  active: boolean;
  dismissible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHeroBanner extends Document {
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInstagramPost extends Document {
  imageUrl: string;
  caption?: string;
  postUrl?: string;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    message: { type: String, required: true },
    link: { type: String },
    active: { type: Boolean, default: true },
    dismissible: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const HeroBannerSchema = new Schema<IHeroBanner>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    imageUrl: { type: String, required: true },
    mobileImageUrl: { type: String },
    ctaText: { type: String, default: 'Shop Now' },
    ctaLink: { type: String, default: '/shop' },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const InstagramPostSchema = new Schema<IInstagramPost>(
  {
    imageUrl: { type: String, required: true },
    caption: { type: String },
    postUrl: { type: String },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const FAQSchema = new Schema<IFAQ>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, default: 'General' },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
export const HeroBanner = mongoose.model<IHeroBanner>('HeroBanner', HeroBannerSchema);
export const InstagramPost = mongoose.model<IInstagramPost>('InstagramPost', InstagramPostSchema);
export const FAQ = mongoose.model<IFAQ>('FAQ', FAQSchema);
