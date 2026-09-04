import mongoose, { Schema, Document } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  slug: string;
  image?: string;
  bannerImage?: string;
  description?: string;
  sortOrder: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    image: { type: String },
    bannerImage: { type: String },
    description: { type: String },
    sortOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

CollectionSchema.index({ active: 1, sortOrder: 1 });

export const Collection = mongoose.model<ICollection>('Collection', CollectionSchema);
