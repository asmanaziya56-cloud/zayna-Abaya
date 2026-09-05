import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service.js';

export class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      const result = await productService.getProducts(req.query);
      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination
      });
    } catch (err) {
      next(err);
    }
  }

  async getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      const data = await productService.getProductBySlug(req.params.slug as string);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.createProduct(req.body, req.user?._id);
      res.status(201).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.updateProduct(req.params.id as string, req.body, req.user?._id);
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await productService.deleteProduct(req.params.id as string, req.user?._id);
      res.json({ success: true, data: { message: 'Product archived successfully' } });
    } catch (err) {
      next(err);
    }
  }
}

export const productController = new ProductController();
