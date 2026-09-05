import { Types } from 'mongoose';
import { Cart, ICart } from './cart.model.js';
import { Product } from '../products/product.model.js';
import { couponService } from '../coupons/coupon.service.js';
import { AppError } from '../../middleware/errorHandler.js';

export class CartService {
  private async findOrCreateCart(userId?: string, sessionId?: string): Promise<ICart> {
    let cart: ICart | null = null;

    if (userId) {
      cart = await Cart.findOne({ userId: new Types.ObjectId(userId) });
      if (!cart) {
        cart = await Cart.create({ userId: new Types.ObjectId(userId), items: [], subtotal: 0 });
      }
      // Merge guest session cart if guest items exist
      if (sessionId) {
        const guestCart = await Cart.findOne({ sessionId });
        if (guestCart && guestCart.items && guestCart.items.length > 0) {
          for (const gItem of guestCart.items) {
            const existingIdx = cart.items.findIndex(
              (i) => i.product.toString() === gItem.product.toString() && i.variantId === gItem.variantId
            );
            if (existingIdx > -1) {
              cart.items[existingIdx]!.quantity += gItem.quantity;
              cart.items[existingIdx]!.total = cart.items[existingIdx]!.quantity * cart.items[existingIdx]!.price;
            } else {
              cart.items.push(gItem);
            }
          }
          await guestCart.deleteOne();
          await cart.save();
        }
      }
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
      if (!cart) {
        cart = await Cart.create({ sessionId, items: [], subtotal: 0 });
      }
    } else {
      throw new AppError({
        message: 'Either authentication or a guest sessionId is required to access the cart',
        statusCode: 400,
        code: 'INVALID_REQUEST'
      });
    }

    return cart;
  }

  async getCart(userId?: string, sessionId?: string) {
    const cart = await this.findOrCreateCart(userId, sessionId);
    await this.recalculateCart(cart);
    return cart;
  }

  async addItem(params: {
    userId?: string;
    sessionId?: string;
    productId: string;
    variantId?: string;
    quantity: number;
  }) {
    const product = await Product.findOne({
      _id: new Types.ObjectId(params.productId),
      isDeleted: { $ne: true }
    });

    if (!product) {
      throw new AppError({ message: 'Product not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    // Determine accurate unit price from variant or base product
    let unitPrice = product.salePrice ?? product.price;
    let availableStock = product.stock;
    let size: string | undefined;
    let color: string | undefined;

    if (params.variantId) {
      const variant = product.variants.find((v) => v._id.toString() === params.variantId);
      if (!variant) {
        throw new AppError({ message: 'Product variant not found', statusCode: 404, code: 'NOT_FOUND' });
      }
      unitPrice = variant.salePrice ?? variant.price;
      availableStock = variant.stock;
      size = variant.size;
      color = variant.color;
    }

    if (availableStock < params.quantity) {
      throw new AppError({
        message: `Only ${availableStock} unit(s) available in stock`,
        statusCode: 400,
        code: 'INVALID_REQUEST'
      });
    }

    const cart = await this.findOrCreateCart(params.userId, params.sessionId);

    // Look for existing item with same product and variant
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === params.productId &&
        (params.variantId ? item.variantId === params.variantId : !item.variantId)
    );

    if (existingIndex > -1) {
      const item = cart.items[existingIndex]!;
      const newQty = item.quantity + params.quantity;
      if (newQty > availableStock) {
        throw new AppError({
          message: `Cannot add more. Only ${availableStock} unit(s) available in stock.`,
          statusCode: 400,
          code: 'INVALID_REQUEST'
        });
      }
      item.quantity = newQty;
      item.price = unitPrice;
      item.total = item.quantity * unitPrice;
    } else {
      cart.items.push({
        _id: new Types.ObjectId(),
        product: product._id as any,
        variantId: params.variantId,
        name: product.name,
        slug: product.slug,
        image: product.images[0],
        size,
        color,
        price: unitPrice,
        quantity: params.quantity,
        total: params.quantity * unitPrice
      });
    }

    await this.recalculateCart(cart);
    return cart;
  }

  async updateItemQuantity(params: {
    userId?: string;
    sessionId?: string;
    itemId: string;
    quantity: number;
  }) {
    const cart = await this.findOrCreateCart(params.userId, params.sessionId);
    const itemIndex = cart.items.findIndex((i) => i._id.toString() === params.itemId);

    if (itemIndex === -1) {
      throw new AppError({ message: 'Cart item not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    if (params.quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const item = cart.items[itemIndex]!;
      // Re-verify stock
      const product = await Product.findById(item.product);
      if (product) {
        let availableStock = product.stock;
        if (item.variantId) {
          const variant = product.variants.find((v) => v._id.toString() === item.variantId);
          if (variant) availableStock = variant.stock;
        }
        if (params.quantity > availableStock) {
          throw new AppError({
            message: `Only ${availableStock} unit(s) in stock`,
            statusCode: 400,
            code: 'INVALID_REQUEST'
          });
        }
      }
      item.quantity = params.quantity;
      item.total = item.quantity * item.price;
    }

    await this.recalculateCart(cart);
    return cart;
  }

  async removeItem(params: { userId?: string; sessionId?: string; itemId: string }) {
    const cart = await this.findOrCreateCart(params.userId, params.sessionId);
    cart.items = cart.items.filter((i) => i._id.toString() !== params.itemId);
    await this.recalculateCart(cart);
    return cart;
  }

  async clearCart(userId?: string, sessionId?: string) {
    const cart = await this.findOrCreateCart(userId, sessionId);
    cart.items = [];
    cart.subtotal = 0;
    await cart.save();
    return cart;
  }

  // Recalculates subtotal based on current DB pricing
  private async recalculateCart(cart: ICart): Promise<void> {
    let subtotal = 0;
    for (const item of cart.items) {
      const product = await Product.findOne({ _id: item.product, isDeleted: { $ne: true } });
      if (product) {
        let currentPrice = product.salePrice ?? product.price;
        if (item.variantId) {
          const variant = product.variants.find((v) => v._id.toString() === item.variantId);
          if (variant) {
            currentPrice = variant.salePrice ?? variant.price;
          }
        }
        item.price = currentPrice;
        item.total = item.quantity * currentPrice;
        subtotal += item.total;
      }
    }
    cart.subtotal = subtotal;

    // Recalculate coupon discount if coupon is present
    if (cart.coupon?.code && subtotal > 0) {
      try {
        const couponResult = await couponService.validateCoupon(cart.coupon.code, subtotal);
        cart.discountAmount = couponResult.discountAmount;
        cart.coupon.discountType = couponResult.coupon.discountType;
        cart.coupon.discountValue = couponResult.coupon.discountValue;
        cart.totalAmount = Math.max(0, subtotal - couponResult.discountAmount);
      } catch {
        // If subtotal no longer satisfies coupon or coupon expired, reset discount
        cart.coupon = undefined;
        cart.discountAmount = 0;
        cart.totalAmount = subtotal;
      }
    } else {
      cart.coupon = undefined;
      cart.discountAmount = 0;
      cart.totalAmount = subtotal;
    }

    await cart.save();
  }

  async applyCoupon(params: { userId?: string; sessionId?: string; code: string }) {
    if (!params.code || !params.code.trim()) {
      throw new AppError({ message: 'Coupon code is required', statusCode: 400, code: 'INVALID_REQUEST' });
    }

    const cart = await this.findOrCreateCart(params.userId, params.sessionId);
    if (!cart.items || cart.items.length === 0) {
      throw new AppError({ message: 'Your shopping bag is empty', statusCode: 400, code: 'EMPTY_CART' });
    }

    // Refresh subtotal
    await this.recalculateCart(cart);

    const couponResult = await couponService.validateCoupon(params.code.trim(), cart.subtotal);

    cart.coupon = {
      code: couponResult.coupon.code,
      discountType: couponResult.coupon.discountType,
      discountValue: couponResult.coupon.discountValue
    };
    cart.discountAmount = couponResult.discountAmount;
    cart.totalAmount = Math.max(0, cart.subtotal - couponResult.discountAmount);

    await cart.save();
    return cart;
  }

  async removeCoupon(params: { userId?: string; sessionId?: string }) {
    const cart = await this.findOrCreateCart(params.userId, params.sessionId);
    cart.coupon = undefined;
    cart.discountAmount = 0;
    cart.totalAmount = cart.subtotal;
    await cart.save();
    return cart;
  }
}

export const cartService = new CartService();
