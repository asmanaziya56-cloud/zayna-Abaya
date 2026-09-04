import { Types } from 'mongoose';
import { Product } from '../products/product.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { logAuditEvent } from '../audit/audit.model.js';

export class InventoryService {
  async getLowStock(threshold = 5) {
    // Find products where overall stock <= threshold or any variant has stock <= threshold
    const lowStockProducts = await Product.find({
      isDeleted: { $ne: true },
      $or: [
        { stock: { $lte: threshold } },
        { 'variants.stock': { $lte: threshold } }
      ]
    }).select('name slug sku stock variants');

    return lowStockProducts;
  }

  async adjustStock(
    data: {
      productId: string;
      variantId?: string;
      quantityChange: number;
      reason: string;
      notes?: string;
    },
    actorUserId?: string
  ) {
    const product = await Product.findOne({
      _id: new Types.ObjectId(data.productId),
      isDeleted: { $ne: true }
    });

    if (!product) {
      throw new AppError({ message: 'Product not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    if (data.variantId) {
      const variant = product.variants.find((v) => v._id.toString() === data.variantId);
      if (!variant) {
        throw new AppError({ message: 'Variant not found', statusCode: 404, code: 'NOT_FOUND' });
      }

      const newStock = variant.stock + data.quantityChange;
      if (newStock < 0) {
        throw new AppError({
          message: `Insufficient stock. Current variant stock is ${variant.stock}`,
          statusCode: 400,
          code: 'INVALID_REQUEST'
        });
      }

      variant.stock = newStock;
      product.stock = product.variants.reduce((acc, v) => acc + v.stock, 0);
    } else {
      const newStock = product.stock + data.quantityChange;
      if (newStock < 0) {
        throw new AppError({
          message: `Insufficient stock. Current product stock is ${product.stock}`,
          statusCode: 400,
          code: 'INVALID_REQUEST'
        });
      }
      product.stock = newStock;
    }

    await product.save();

    await logAuditEvent({
      actor: actorUserId,
      action: 'INVENTORY_ADJUSTED',
      resource: 'Product',
      resourceId: product._id.toString(),
      metadata: {
        variantId: data.variantId,
        change: data.quantityChange,
        reason: data.reason,
        notes: data.notes
      }
    });

    return {
      productId: product._id,
      stock: product.stock,
      variants: product.variants
    };
  }
}

export const inventoryService = new InventoryService();
