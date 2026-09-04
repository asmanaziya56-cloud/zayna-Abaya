import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  _id: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  variantId?: string;
  name: string;
  slug: string;
  image?: string;
  size?: string;
  color?: string;
  price: number; // Stored price at time of fetch
  quantity: number;
  total: number;
}

export interface ICartCoupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

export interface ICart extends Document {
  userId?: mongoose.Types.ObjectId;
  sessionId?: string;
  items: ICartItem[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  coupon?: ICartCoupon;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: String },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String },
  size: { type: String },
  color: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true }
});

const CartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    sessionId: { type: String, index: true },
    items: { type: [CartItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    coupon: {
      code: { type: String },
      discountType: { type: String, enum: ['percentage', 'fixed'] },
      discountValue: { type: Number }
    }
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
