import { Request, Response, NextFunction } from 'express';
import { inventoryService } from './inventory.service.js';

export class InventoryController {
  async getLowStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const threshold = req.query.threshold ? Number(req.query.threshold) : 5;
      const items = await inventoryService.getLowStock(threshold);
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }

  async adjustStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await inventoryService.adjustStock(req.body, req.user?._id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const inventoryController = new InventoryController();
