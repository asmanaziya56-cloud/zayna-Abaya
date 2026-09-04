import { Request, Response, NextFunction } from 'express';
import { cartService } from './cart.service.js';

function extractSessionId(req: Request): string | undefined {
  return (
    (req.headers['x-session-id'] as string) ||
    (req.query.sessionId as string) ||
    req.body?.sessionId
  );
}

function formatCart(cart: any) {
  if (!cart) return cart;
  const obj = cart.toObject ? cart.toObject() : { ...cart };
  if (Array.isArray(obj.items)) {
    obj.items = obj.items.map((it: any) => ({
      ...it,
      title: it.title || it.name || 'Zayna Creation',
      productId: it.product ? it.product.toString() : (it.productId || it._id?.toString())
    }));
  }
  obj.subtotal = obj.subtotal || 0;
  obj.discountAmount = obj.discountAmount || 0;
  obj.shippingAmount = obj.shippingAmount || 0;
  obj.taxAmount = obj.taxAmount || 0;
  obj.totalAmount = obj.totalAmount !== undefined ? obj.totalAmount : Math.max(0, obj.subtotal - obj.discountAmount);
  return obj;
}

export class CartController {
  async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id;
      const sessionId = extractSessionId(req);
      const cart = await cartService.getCart(userId, sessionId);
      res.json({ success: true, data: formatCart(cart) });
    } catch (err) {
      next(err);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id;
      const sessionId = extractSessionId(req);
      const { productId, variantId, quantity } = req.body;
      const cart = await cartService.addItem({
        userId,
        sessionId,
        productId,
        variantId,
        quantity: Number(quantity) || 1
      });
      res.json({ success: true, data: formatCart(cart) });
    } catch (err) {
      next(err);
    }
  }

  async updateItemQuantity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id;
      const sessionId = extractSessionId(req);
      const { quantity } = req.body;
      const cart = await cartService.updateItemQuantity({
        userId,
        sessionId,
        itemId: req.params.itemId as string,
        quantity: Number(quantity)
      });
      res.json({ success: true, data: formatCart(cart) });
    } catch (err) {
      next(err);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id;
      const sessionId = extractSessionId(req);
      const cart = await cartService.removeItem({
        userId,
        sessionId,
        itemId: req.params.itemId as string
      });
      res.json({ success: true, data: formatCart(cart) });
    } catch (err) {
      next(err);
    }
  }

  async applyCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id;
      const sessionId = extractSessionId(req);
      const { code } = req.body;
      const cart = await cartService.applyCoupon({ userId, sessionId, code });
      res.json({ success: true, data: formatCart(cart) });
    } catch (err) {
      next(err);
    }
  }

  async removeCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id;
      const sessionId = extractSessionId(req);
      const cart = await cartService.removeCoupon({ userId, sessionId });
      res.json({ success: true, data: formatCart(cart) });
    } catch (err) {
      next(err);
    }
  }

  async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?._id;
      const sessionId = extractSessionId(req);
      const cart = await cartService.clearCart(userId, sessionId);
      res.json({ success: true, data: formatCart(cart) });
    } catch (err) {
      next(err);
    }
  }
}

export const cartController = new CartController();
