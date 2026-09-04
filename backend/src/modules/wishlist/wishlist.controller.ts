import { Request, Response, NextFunction } from 'express';
import { wishlistService } from './wishlist.service.js';

export class WishlistController {
  async getWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const wishlist = await wishlistService.getWishlist(req.user!._id);
      res.json({ success: true, data: wishlist });
    } catch (err) {
      next(err);
    }
  }

  async addProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const wishlist = await wishlistService.addProduct(req.user!._id, req.body.productId);
      res.json({ success: true, data: wishlist });
    } catch (err) {
      next(err);
    }
  }

  async removeProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const wishlist = await wishlistService.removeProduct(req.user!._id, req.params.productId as string);
      res.json({ success: true, data: wishlist });
    } catch (err) {
      next(err);
    }
  }
}

export const wishlistController = new WishlistController();
