import { z } from 'zod';

export const announcementSchema = z.object({
  message: z.string().min(2).max(300),
  link: z.string().optional(),
  active: z.boolean().default(true),
  dismissible: z.boolean().default(true)
});

export const heroBannerSchema = z.object({
  title: z.string().min(2).max(100),
  subtitle: z.string().max(200).optional(),
  imageUrl: z.string().url(),
  mobileImageUrl: z.string().url().optional(),
  ctaText: z.string().max(50).default('Shop Now'),
  ctaLink: z.string().max(200).default('/shop'),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true)
});

export const instagramPostSchema = z.object({
  imageUrl: z.string().url(),
  caption: z.string().max(300).optional(),
  postUrl: z.string().url().optional(),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true)
});

export const faqSchema = z.object({
  question: z.string().min(5).max(300),
  answer: z.string().min(5).max(2000),
  category: z.string().max(100).default('General'),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true)
});
