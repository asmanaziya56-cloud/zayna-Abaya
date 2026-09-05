import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  user?: mongoose.Types.ObjectId;
  userName: string;
  userEmail?: string;
  product: mongoose.Types.ObjectId;
  rating: number; // 1 - 5
  title?: string;
  comment: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    userName: { type: String, required: true },
    userEmail: { type: String },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    comment: { type: String, required: true, trim: true },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
      index: true
    }
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, status: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
