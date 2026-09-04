import { z } from 'zod';

const shippingAddressSchema = z.object({
  fullName: z.string().min(1, 'Please enter recipient full name').max(150),
  phone: z.string().min(1, 'Please enter contact phone number').max(30),
  street: z.string().min(1, 'Please enter street address').max(300),
  apartment: z.string().optional().default(''),
  city: z.string().min(1, 'Please enter city').max(100),
  state: z.string().min(1, 'Please enter state').max(100),
  postalCode: z.string().min(1, 'Please enter postal code').max(30),
  country: z.string().max(100).default('India')
});

const orderItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).default(1)
});

export const createOrderSchema = z.object({
  items: z.array(orderItemInputSchema).optional(),
  shippingAddress: shippingAddressSchema,
  couponCode: z.string().optional().or(z.literal('')).or(z.null()),
  guestEmail: z.string().email('Invalid email address format').optional().or(z.literal('')).or(z.null()),
  guestPhone: z.string().optional().or(z.literal('')).or(z.null()),
  idempotencyKey: z.string().optional()
});

export const cancelOrderSchema = z.object({
  reason: z.string().min(3).max(250)
});

export const updateFulfillmentSchema = z.object({
  fulfillmentStatus: z.enum(['unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled']),
  tracking: z
    .object({
      courier: z.string().optional(),
      trackingNumber: z.string().optional(),
      trackingUrl: z.string().url().optional(),
      estimatedDelivery: z.string().transform((v) => new Date(v)).optional(),
      statusNotes: z.string().optional()
    })
    .optional()
});
