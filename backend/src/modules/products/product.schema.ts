import { z } from 'zod';

const variantSchema = z.object({
  size: z.string().optional(),
  color: z.string().optional(),
  sku: z.string().min(2).max(50),
  price: z.number().int().nonnegative('Price must be non-negative in smallest currency unit'),
  salePrice: z.number().int().nonnegative().optional(),
  stock: z.number().int().nonnegative('Stock cannot be negative').default(0)
});

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  description: z.string().min(5),
  images: z.array(z.string()).default([]),
  videos: z.array(z.string()).default([]),
  variants: z.array(variantSchema).default([]),
  sku: z.string().min(2).max(50),
  price: z.number().int().nonnegative('Base price must be a non-negative integer'),
  salePrice: z.number().int().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  category: z.string().optional(),
  collectionId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  flags: z
    .object({
      isBestseller: z.boolean().default(false),
      isFeatured: z.boolean().default(false),
      isNewArrival: z.boolean().default(true),
      isOnSale: z.boolean().default(false)
    })
    .default({
      isBestseller: false,
      isFeatured: false,
      isNewArrival: true,
      isOnSale: false
    }),
  fabricCare: z.string().optional(),
  deliveryInfo: z.string().optional(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      keywords: z.array(z.string()).optional()
    })
    .optional()
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  category: z.string().optional(),
  collection: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  bestseller: z.string().transform((v) => v === 'true').optional(),
  featured: z.string().transform((v) => v === 'true').optional(),
  newArrival: z.string().transform((v) => v === 'true').optional(),
  inStock: z.string().transform((v) => v === 'true').optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'bestseller']).default('newest')
});
