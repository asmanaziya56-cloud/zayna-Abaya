import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 10 for 10%, or 20000 for ₹200 (in paise)
  minOrderAmount?: number; // in smallest currency unit
  maxDiscountAmount?: number; // max cap for percentage discounts
  validFrom: Date;
  validUntil: Date;
  maxUses?: number;
  usedCount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  isValid(): { valid: boolean; reason?: string };
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    maxUses: { type: Number },
    usedCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

CouponSchema.methods.isValid = function (): { valid: boolean; reason?: string } {
  const now = new Date();
  if (!this.active) return { valid: false, reason: 'Coupon is inactive' };
  if (now < this.validFrom) return { valid: false, reason: 'Coupon is not yet active' };
  if (now > this.validUntil) return { valid: false, reason: 'Coupon has expired' };
  if (this.maxUses !== undefined && this.usedCount >= this.maxUses) {
    return { valid: false, reason: 'Coupon usage limit has been reached' };
  }
  return { valid: true };
};

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
