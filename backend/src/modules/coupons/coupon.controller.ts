import { Request, Response, NextFunction } from 'express';
import { couponService } from './coupon.service.js';

export class CouponController {
  async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, subtotal } = req.body;
      const result = await couponService.validateCoupon(code, Number(subtotal));
      res.json({
        success: true,
        data: {
          code: result.coupon.code,
          discountType: result.coupon.discountType,
          discountValue: result.coupon.discountValue,
          discountAmount: result.discountAmount
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupons = await couponService.getAllCoupons();
      res.json({ success: true, data: coupons });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await couponService.createCoupon(req.body);
      res.status(201).json({ success: true, data: coupon });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await couponService.updateCoupon(req.params.id as string, req.body);
      res.json({ success: true, data: coupon });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await couponService.deleteCoupon(req.params.id as string);
      res.json({ success: true, data: { message: 'Coupon deleted' } });
    } catch (err) {
      next(err);
    }
  }
}

export const couponController = new CouponController();
