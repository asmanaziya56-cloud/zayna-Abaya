import { Request, Response, NextFunction } from 'express';
import { collectionService } from './collection.service.js';

export class CollectionController {
  async getActive(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collections = await collectionService.getActiveCollections();
      res.json({ success: true, data: collections });
    } catch (err) {
      next(err);
    }
  }

  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collections = await collectionService.getAllCollections();
      res.json({ success: true, data: collections });
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collection = await collectionService.getCollectionBySlug(req.params.slug as string);
      res.json({ success: true, data: collection });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collection = await collectionService.createCollection(req.body);
      res.status(201).json({ success: true, data: collection });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collection = await collectionService.updateCollection(req.params.id as string, req.body);
      res.json({ success: true, data: collection });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await collectionService.deleteCollection(req.params.id as string);
      res.json({ success: true, data: { message: 'Collection deleted' } });
    } catch (err) {
      next(err);
    }
  }
}

export const collectionController = new CollectionController();
