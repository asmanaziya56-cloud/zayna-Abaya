import { Coupon, ICoupon } from './coupon.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class CouponService {
  async ensureDefaultCoupons(): Promise<void> {
    try {
      const defaultCoupons = [
        {
          code: 'ZAYNA100',
          discountType: 'fixed' as const,
          discountValue: 10000, // ₹100 in paise
          minOrderAmount: 0,
          validFrom: new Date('2025-01-01'),
          validUntil: new Date('2030-01-01'),
          maxUses: 100000,
          active: true
        },
        {
          code: 'ZAYNA10',
          discountType: 'percentage' as const,
          discountValue: 10, // 10%
          minOrderAmount: 0,
          validFrom: new Date('2025-01-01'),
          validUntil: new Date('2030-01-01'),
          maxUses: 100000,
          active: true
        },
        {
          code: 'EIDMUBARAK',
          discountType: 'percentage' as const,
          discountValue: 15, // 15%
          minOrderAmount: 0,
          validFrom: new Date('2025-01-01'),
          validUntil: new Date('2030-01-01'),
          maxUses: 100000,
          active: true
        },
        {
          code: 'WELCOME500',
          discountType: 'fixed' as const,
          discountValue: 50000, // ₹500 in paise
          minOrderAmount: 0,
          validFrom: new Date('2025-01-01'),
          validUntil: new Date('2030-01-01'),
          maxUses: 100000,
          active: true
        }
      ];

      for (const item of defaultCoupons) {
        const found = await Coupon.findOne({ code: item.code });
        if (!found) {
          await Coupon.create(item);
        }
      }
    } catch (err) {
      console.warn('Coupon auto-seed skipped:', err);
    }
  }

  async validateCoupon(code: string, subtotal: number): Promise<{
    coupon: ICoupon;
    discountAmount: number;
  }> {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      throw new AppError({ message: 'Coupon code cannot be empty', statusCode: 400, code: 'INVALID_REQUEST' });
    }

    let coupon = await Coupon.findOne({ code: cleanCode });
    if (!coupon) {
      await this.ensureDefaultCoupons();
      coupon = await Coupon.findOne({ code: cleanCode });
    }

    if (!coupon) {
      throw new AppError({ message: `Coupon code "${cleanCode}" was not found or is invalid`, statusCode: 404, code: 'NOT_FOUND' });
    }

    const { valid, reason } = coupon.isValid();
    if (!valid) {
      throw new AppError({ message: reason || 'Coupon is not valid', statusCode: 400, code: 'INVALID_REQUEST' });
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      throw new AppError({
        message: `This coupon requires a minimum subtotal of ₹${(coupon.minOrderAmount / 100).toFixed(2)}`,
        statusCode: 400,
        code: 'INVALID_REQUEST'
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    return {
      coupon,
      discountAmount
    };
  }

  async getAllCoupons() {
    return Coupon.find().sort({ createdAt: -1 });
  }

  async createCoupon(data: any) {
    const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      throw new AppError({ message: 'Coupon with this code already exists', statusCode: 409, code: 'CONFLICT' });
    }
    return Coupon.create(data);
  }

  async updateCoupon(id: string, data: any) {
    const coupon = await Coupon.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!coupon) {
      throw new AppError({ message: 'Coupon not found', statusCode: 404, code: 'NOT_FOUND' });
    }
    return coupon;
  }

  async deleteCoupon(id: string) {
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      throw new AppError({ message: 'Coupon not found', statusCode: 404, code: 'NOT_FOUND' });
    }
    return { success: true };
  }
}

export const couponService = new CouponService();
