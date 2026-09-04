import mongoose, { Schema, Document } from 'mongoose';

export interface IProductVariant {
  _id: mongoose.Types.ObjectId;
  size?: string;
  color?: string;
  sku: string;
  price: number; // in smallest currency unit (paise/cents)
  salePrice?: number;
  stock: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  images: string[];
  variants: IProductVariant[];
  sku: string;
  price: number; // Base display price in smallest currency unit
  salePrice?: number;
  stock: number; // Total stock calculated from variants or standalone
  category?: mongoose.Types.ObjectId;
  collectionId?: mongoose.Types.ObjectId;
  tags: string[];
  flags: {
    isBestseller: boolean;
    isFeatured: boolean;
    isNewArrival: boolean;
    isOnSale?: boolean;
  };
  fabricCare?: string;
  deliveryInfo?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  size: { type: String, trim: true },
  color: { type: String, trim: true },
  sku: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 }
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true },
    images: { type: [String], default: [] },
    variants: { type: [ProductVariantSchema], default: [] },
    sku: { type: String, required: true, trim: true, index: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collection', index: true },
    tags: { type: [String], default: [] },
    flags: {
      isBestseller: { type: Boolean, default: false, index: true },
      isFeatured: { type: Boolean, default: false, index: true },
      isNewArrival: { type: Boolean, default: true, index: true },
      isOnSale: { type: Boolean, default: false, index: true }
    },
    fabricCare: { type: String },
    deliveryInfo: { type: String },
    seo: {
      metaTitle: { type: String },
      metaDescription: { type: String },
      keywords: { type: [String], default: [] }
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date }
  },
  { timestamps: true }
);

// MongoDB text search index on title, description, tags, and SKU
ProductSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  sku: 'text'
});

ProductSchema.index({ price: 1, isDeleted: 1 });
ProductSchema.index({ createdAt: -1, isDeleted: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
