import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  image: z.string().optional(),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional()
});

export const updateCategorySchema = createCategorySchema.partial();
