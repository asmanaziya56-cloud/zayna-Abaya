import { Types } from 'mongoose';
import { Order, IOrder, IOrderItem } from './order.model.js';
import { Product } from '../products/product.model.js';
import { cartService } from '../cart/cart.service.js';
import { couponService } from '../coupons/coupon.service.js';
import { siteSettingsService } from '../settings/settings.service.js';
import { emailService } from '../../services/email.service.js';
import { AppError } from '../../middleware/errorHandler.js';
import { logAuditEvent } from '../audit/audit.model.js';
import { assertOwnership } from '../../utils/ownershipCheck.js';

export class OrderService {
  private generateOrderNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ZA-${dateStr}-${rand}`;
  }

  async createOrder(
    data: {
      items?: Array<{ productId: string; variantId?: string; quantity: number }>;
      shippingAddress: any;
      couponCode?: string;
      guestEmail?: string;
      guestPhone?: string;
      idempotencyKey?: string;
    },
    userId?: string,
    sessionId?: string
  ) {
    // 1. Check idempotency
    if (data.idempotencyKey) {
      const existing = await Order.findOne({ idempotencyKey: data.idempotencyKey });
      if (existing) {
        return existing;
      }
    }

    if (!userId && !data.guestEmail) {
      throw new AppError({
        message: 'Guest email is required for checkout without account',
        statusCode: 400,
        code: 'VALIDATION_ERROR'
      });
    }

    // Auto-retrieve items from cart if not provided in payload
    if (!data.items || data.items.length === 0) {
      try {
        const cart = await cartService.getCart(userId, sessionId);
        if (cart && cart.items && cart.items.length > 0) {
          data.items = cart.items.map((ci) => ({
            productId: ci.product.toString(),
            variantId: ci.variantId,
            quantity: ci.quantity
          }));
        }
      } catch {
        // proceed
      }
    }

    if (!data.items || data.items.length === 0) {
      throw new AppError({
        message: 'Order must contain at least one item',
        statusCode: 400,
        code: 'EMPTY_CART'
      });
    }

    // 2. Fetch products and calculate accurate server-side subtotal
    let subtotal = 0;
    const orderItems: IOrderItem[] = [];
    const stockDeductions: Array<{ productId: string; variantId?: string; quantity: number }> = [];

    for (const itemInput of data.items) {
      const product = await Product.findOne({
        _id: new Types.ObjectId(itemInput.productId),
        isDeleted: { $ne: true }
      });

      if (!product) {
        throw new AppError({
          message: `Product ${itemInput.productId} not found`,
          statusCode: 404,
          code: 'NOT_FOUND'
        });
      }

      let unitPrice = product.salePrice ?? product.price;
      let availableStock = product.stock;
      let sku = product.sku;
      let size: string | undefined;
      let color: string | undefined;

      if (itemInput.variantId) {
        const variant = product.variants.find((v) => v._id.toString() === itemInput.variantId);
        if (!variant) {
          throw new AppError({
            message: `Variant ${itemInput.variantId} not found on product ${product.name}`,
            statusCode: 404,
            code: 'NOT_FOUND'
          });
        }
        unitPrice = variant.salePrice ?? variant.price;
        availableStock = variant.stock;
        sku = variant.sku;
        size = variant.size;
        color = variant.color;
      }

      if (availableStock < itemInput.quantity) {
        throw new AppError({
          message: `Insufficient stock for ${product.name}. Only ${availableStock} left.`,
          statusCode: 400,
          code: 'INVALID_REQUEST'
        });
      }

      const itemTotal = unitPrice * itemInput.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id as any,
        variantId: itemInput.variantId,
        name: product.name,
        sku,
        size,
        color,
        price: unitPrice,
        quantity: itemInput.quantity,
        total: itemTotal
      });

      stockDeductions.push({
        productId: product._id.toString(),
        variantId: itemInput.variantId,
        quantity: itemInput.quantity
      });
    }

    // 3. Discount calculation via coupon
    let discountAmount = 0;
    let validCouponCode: string | undefined;

    if (data.couponCode) {
      try {
        const couponResult = await couponService.validateCoupon(data.couponCode, subtotal);
        discountAmount = couponResult.discountAmount;
        validCouponCode = couponResult.coupon.code;
      } catch (err: any) {
        throw new AppError({
          message: `Coupon error: ${err.message}`,
          statusCode: 400,
          code: 'INVALID_REQUEST'
        });
      }
    }

    // 4. Shipping & taxes from site settings
    const settings = await siteSettingsService.getSettings();
    let shippingAmount = settings.shipping?.flatShippingRate || 0;
    if (settings.shipping?.freeShippingThreshold && subtotal >= settings.shipping.freeShippingThreshold) {
      shippingAmount = 0;
    }

    let taxAmount = 0;
    if (settings.shipping?.taxRatePercent && settings.shipping.taxRatePercent > 0) {
      const taxableSubtotal = Math.max(0, subtotal - discountAmount);
      taxAmount = Math.round((taxableSubtotal * settings.shipping.taxRatePercent) / 100);
    }

    const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount + taxAmount);

    // 5. Deduct stock atomically
    for (const d of stockDeductions) {
      if (d.variantId) {
        await Product.updateOne(
          { _id: new Types.ObjectId(d.productId), 'variants._id': new Types.ObjectId(d.variantId) },
          {
            $inc: {
              'variants.$.stock': -d.quantity,
              stock: -d.quantity
            }
          }
        );
      } else {
        await Product.updateOne(
          { _id: new Types.ObjectId(d.productId) },
          { $inc: { stock: -d.quantity } }
        );
      }
    }

    // 6. Create order
    const orderNumber = this.generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      userId: userId ? new Types.ObjectId(userId) : undefined,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      items: orderItems,
      pricing: {
        subtotal,
        discountAmount,
        shippingAmount,
        taxAmount,
        totalAmount
      },
      shippingAddress: data.shippingAddress,
      couponCode: validCouponCode,
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
      idempotencyKey: data.idempotencyKey
    });

    // 7. Increment coupon used count if used
    if (validCouponCode) {
      const { Coupon } = await import('../coupons/coupon.model.js');
      await Coupon.updateOne({ code: validCouponCode }, { $inc: { usedCount: 1 } });
    }

    // 8. Log audit and send notification
    await logAuditEvent({
      actor: userId,
      actorEmail: data.guestEmail,
      action: 'ORDER_CREATED',
      resource: 'Order',
      resourceId: order._id.toString(),
      metadata: { orderNumber, totalAmount }
    });

    const recipientEmail = data.guestEmail || (userId ? (await import('../users/user.model.js')).User.findById(userId).then(u => u?.email) : null);
    if (recipientEmail && typeof recipientEmail === 'string') {
      await emailService.sendOrderConfirmationEmail(recipientEmail, orderNumber, totalAmount);
    }

    return order;
  }

  async getMyOrders(userId: string) {
    return Order.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
  }

  async getOrderById(orderId: string, userId?: string) {
    if (userId) {
      // Must belong to user (assertOwnership returns 404, never 403)
      return assertOwnership(Order, orderId, userId);
    }
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError({ message: 'Order not found', statusCode: 404, code: 'NOT_FOUND' });
    }
    return order;
  }

  async trackOrder(orderNumber: string, email?: string) {
    const query: Record<string, any> = { orderNumber };
    if (email) {
      query.$or = [{ guestEmail: email.toLowerCase() }];
    }

    const order = await Order.findOne(query).select(
      'orderNumber items pricing paymentStatus fulfillmentStatus tracking createdAt'
    );

    if (!order) {
      throw new AppError({ message: 'Order not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    return order;
  }

  async cancelOrder(orderId: string, reason: string, userId?: string) {
    let order: IOrder;
    if (userId) {
      order = await assertOwnership(Order, orderId, userId);
    } else {
      const found = await Order.findById(orderId);
      if (!found) throw new AppError({ message: 'Order not found', statusCode: 404, code: 'NOT_FOUND' });
      order = found;
    }

    if (order.fulfillmentStatus !== 'unfulfilled' || order.paymentStatus === 'refunded') {
      throw new AppError({
        message: 'Order cannot be cancelled in its current state',
        statusCode: 400,
        code: 'INVALID_REQUEST'
      });
    }

    order.fulfillmentStatus = 'cancelled';
    order.cancellationReason = reason;
    order.cancelledAt = new Date();
    await order.save();

    // Restore stock
    for (const item of order.items) {
      if (item.variantId) {
        await Product.updateOne(
          { _id: item.product, 'variants._id': new Types.ObjectId(item.variantId) },
          {
            $inc: {
              'variants.$.stock': item.quantity,
              stock: item.quantity
            }
          }
        );
      } else {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
      }
    }

    await logAuditEvent({
      actor: userId,
      action: 'ORDER_CANCELLED',
      resource: 'Order',
      resourceId: order._id.toString(),
      metadata: { reason }
    });

    return order;
  }

  async listAdminOrders(query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
    if (query.fulfillmentStatus) filter.fulfillmentStatus = query.fulfillmentStatus;
    if (query.search) {
      filter.$or = [
        { orderNumber: { $regex: query.search, $options: 'i' } },
        { guestEmail: { $regex: query.search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: query.search, $options: 'i' } }
      ];
    }

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async updateFulfillment(orderId: string, data: any, actorUserId?: string) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError({ message: 'Order not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    order.fulfillmentStatus = data.fulfillmentStatus;
    if (data.tracking) {
      order.tracking = { ...order.tracking, ...data.tracking };
    }
    await order.save();

    await logAuditEvent({
      actor: actorUserId,
      action: 'ORDER_FULFILLMENT_UPDATED',
      resource: 'Order',
      resourceId: order._id.toString(),
      metadata: { fulfillmentStatus: data.fulfillmentStatus }
    });

    return order;
  }
}

export const orderService = new OrderService();
