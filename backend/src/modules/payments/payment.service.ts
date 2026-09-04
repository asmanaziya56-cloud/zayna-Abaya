import { Types } from 'mongoose';
import { Payment } from './payment.model.js';
import { Order } from '../orders/order.model.js';
import { razorpayService } from '../../services/razorpay.service.js';
import { AppError } from '../../middleware/errorHandler.js';
import { logAuditEvent } from '../audit/audit.model.js';
import { assertOwnership } from '../../utils/ownershipCheck.js';

export class PaymentService {
  async createRazorpayOrder(orderId: string, userId?: string) {
    let order;
    if (userId) {
      order = await assertOwnership(Order, orderId, userId);
    } else {
      order = await Order.findById(orderId);
      if (!order) throw new AppError({ message: 'Order not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    if (order.paymentStatus === 'paid') {
      throw new AppError({ message: 'Order is already paid', statusCode: 400, code: 'INVALID_REQUEST' });
    }

    // Amount in paise
    const amountInPaise = Math.round(order.pricing.totalAmount);

    const rzpOrder = await razorpayService.createOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: { orderId: order._id.toString() }
    });

    let payment = await Payment.findOne({ orderId: order._id });
    if (!payment) {
      payment = await Payment.create({
        orderId: order._id,
        orderNumber: order.orderNumber,
        gateway: 'razorpay',
        razorpayOrderId: rzpOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        status: 'created'
      });
    } else {
      payment.razorpayOrderId = rzpOrder.id;
      payment.status = 'created';
      await payment.save();
    }

    return {
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      orderNumber: order.orderNumber
    };
  }

  async verifyPayment(params: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const isValid = razorpayService.verifyPaymentSignature({
      orderId: params.razorpayOrderId,
      paymentId: params.razorpayPaymentId,
      signature: params.razorpaySignature
    });

    const payment = await Payment.findOne({
      $or: [{ orderId: new Types.ObjectId(params.orderId) }, { razorpayOrderId: params.razorpayOrderId }]
    });

    if (!payment) {
      throw new AppError({ message: 'Payment record not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    if (!isValid) {
      payment.status = 'failed';
      payment.errorMessage = 'Signature verification failed';
      await payment.save();

      await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: 'failed' });

      throw new AppError({
        message: 'Invalid payment signature. Verification failed.',
        statusCode: 400,
        code: 'INVALID_REQUEST'
      });
    }

    // Signature is cryptographically authentic
    payment.status = 'captured';
    payment.razorpayPaymentId = params.razorpayPaymentId;
    payment.razorpaySignature = params.razorpaySignature;
    await payment.save();

    const order = await Order.findByIdAndUpdate(
      payment.orderId,
      { paymentStatus: 'paid', fulfillmentStatus: 'processing' },
      { new: true }
    );

    await logAuditEvent({
      action: 'PAYMENT_VERIFIED',
      resource: 'Payment',
      resourceId: payment._id.toString(),
      metadata: { orderId: payment.orderId, paymentId: params.razorpayPaymentId }
    });

    return {
      success: true,
      orderNumber: order?.orderNumber,
      paymentStatus: 'paid'
    };
  }

  async handleWebhook(rawBody: string | Buffer, signature: string, eventPayload: any) {
    // 1. Verify webhook signature
    const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new AppError({
        message: 'Invalid webhook signature',
        statusCode: 400,
        code: 'UNAUTHORIZED'
      });
    }

    const event = eventPayload.event;
    const eventId = eventPayload.id;

    // 2. Locate payment record
    const rzpOrderId = eventPayload.payload?.payment?.entity?.order_id;
    const rzpPaymentId = eventPayload.payload?.payment?.entity?.id;

    if (!rzpOrderId) {
      return { received: true, ignored: 'No order_id in payload' };
    }

    const payment = await Payment.findOne({ razorpayOrderId: rzpOrderId });
    if (!payment) {
      return { received: true, ignored: 'Payment not found' };
    }

    // 3. Idempotency check: event already processed?
    const alreadyProcessed = payment.webhookEvents.some((e) => e.eventId === eventId);
    if (alreadyProcessed) {
      return { received: true, duplicate: true };
    }

    payment.webhookEvents.push({
      event,
      eventId,
      receivedAt: new Date()
    });

    if (event === 'payment.captured' || event === 'order.paid') {
      payment.status = 'captured';
      payment.razorpayPaymentId = rzpPaymentId;
      await payment.save();
      await Order.findByIdAndUpdate(payment.orderId, {
        paymentStatus: 'paid',
        fulfillmentStatus: 'processing'
      });
    } else if (event === 'payment.failed') {
      payment.status = 'failed';
      payment.errorMessage = eventPayload.payload?.payment?.entity?.error_description || 'Payment failed';
      await payment.save();
      await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: 'failed' });
    }

    await payment.save();
    return { received: true, processed: event };
  }

  async refundPayment(paymentId: string, data: { amount?: number; reason: string }, actorUserId?: string) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new AppError({ message: 'Payment not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    if (payment.status !== 'captured' || !payment.razorpayPaymentId) {
      throw new AppError({
        message: 'Only captured payments with valid gateway reference can be refunded',
        statusCode: 400,
        code: 'INVALID_REQUEST'
      });
    }

    const refundRes = await razorpayService.refundPayment({
      paymentId: payment.razorpayPaymentId,
      amount: data.amount,
      notes: { reason: data.reason }
    });

    payment.status = 'refunded';
    payment.refunds.push({
      refundId: refundRes.id,
      amount: data.amount || payment.amount,
      reason: data.reason,
      createdAt: new Date()
    });
    await payment.save();

    await Order.findByIdAndUpdate(payment.orderId, {
      paymentStatus: 'refunded',
      fulfillmentStatus: 'cancelled'
    });

    await logAuditEvent({
      actor: actorUserId,
      action: 'PAYMENT_REFUNDED',
      resource: 'Payment',
      resourceId: payment._id.toString(),
      metadata: { refundId: refundRes.id, reason: data.reason }
    });

    return payment;
  }
}

export const paymentService = new PaymentService();
