import { Request, Response, NextFunction } from 'express';
import { orderService } from './order.service.js';

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id;
      const sessionId =
        (req.headers['x-session-id'] as string) ||
        (req.query.sessionId as string) ||
        req.body?.sessionId;
      const order = await orderService.createOrder(req.body, userId, sessionId);
      res.status(201).json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await orderService.getMyOrders(req.user!._id);
      res.json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.role === 'admin' || req.user?.role === 'superadmin' ? undefined : req.user?._id;
      const order = await orderService.getOrderById(req.params.id as string, userId);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async trackOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = req.query.email as string | undefined;
      const order = await orderService.trackOrder(req.params.orderNumber as string, email);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.role === 'admin' || req.user?.role === 'superadmin' ? undefined : req.user?._id;
      const order = await orderService.cancelOrder(req.params.id as string, req.body.reason, userId);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  async listAdminOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await orderService.listAdminOrders(req.query);
      res.json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  async updateFulfillment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.updateFulfillment(req.params.id as string, req.body, req.user?._id);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }
}

export const orderController = new OrderController();
