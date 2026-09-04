import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service.js';

export class PaymentController {
  async createRazorpayOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id;
      const result = await paymentService.createRazorpayOrder(req.body.orderId, userId);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await paymentService.verifyPayment(req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);
      const result = await paymentService.handleWebhook(rawBody, signature, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async refundPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await paymentService.refundPayment(req.params.id as string, req.body, req.user?._id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const paymentController = new PaymentController();
