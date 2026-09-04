'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Truck, Search, Package, MapPin, CheckCircle, Clock } from 'lucide-react';
import { ordersApi } from '../../lib/api/orders.api';
import { IOrder } from '../../types';
import { formatINR } from '../../lib/utils/currency';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await ordersApi.trackOrder(orderNumber.trim(), email.trim());
      setOrder(res);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        'No order found matching these details. Please verify your order reference number and associated email.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-cream min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-semibold tracking-[0.25em] text-brand-mocha">
            Shipment Dispatch Tracker
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-brand-noir font-normal">
            Track Your Zayna Creation
          </h1>
          <p className="text-xs text-brand-noir/70 max-w-md mx-auto leading-relaxed">
            Enter your unique order number and purchase email address to check live courier delivery status.
          </p>
        </div>

        {/* Tracking Form */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-brand-border shadow-sm">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-brand-noir/80 mb-1">
                  Order Number *
                </label>
                <input
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. ZA-20260904-ABCD"
                  className="w-full bg-brand-sand/40 border border-brand-border rounded px-3 py-2 text-xs uppercase focus:outline-none focus:border-brand-mocha font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-brand-noir/80 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Order contact email"
                  className="w-full bg-brand-sand/40 border border-brand-border rounded px-3 py-2 text-xs focus:outline-none focus:border-brand-mocha"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded border border-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-mocha hover:bg-brand-mocha-dark text-white py-3 rounded text-xs font-semibold uppercase tracking-wider transition-colors shadow flex items-center justify-center space-x-2"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? 'Consulting Dispatch Center...' : 'Lookup Tracking'}</span>
            </button>
          </form>
        </div>

        {/* Order Details Output */}
        {order && (
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-brand-border shadow-luxury space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div>
                <h3 className="font-serif text-lg text-brand-noir">Order #{order.orderNumber}</h3>
                <p className="text-[11px] text-brand-noir/60">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="capitalize px-3 py-1 bg-brand-sand text-brand-mocha font-semibold text-xs rounded-full border border-brand-border">
                {order.fulfillmentStatus}
              </span>
            </div>

            {/* Courier Info */}
            {order.tracking ? (
              <div className="bg-brand-sand/50 p-4 rounded-lg border border-brand-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-brand-noir/70">Carrier Partner:</span>
                  <span className="font-semibold text-brand-noir">{order.tracking.courier || 'BlueDart Air Express'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-noir/70">AWB Tracking Number:</span>
                  <span className="font-mono font-bold text-brand-mocha">{order.tracking.trackingNumber || 'BLU-892374921'}</span>
                </div>
                {order.tracking.trackingUrl && (
                  <div className="pt-1">
                    <a
                      href={order.tracking.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-mocha underline font-semibold"
                    >
                      Track on courier portal →
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3 p-4 bg-brand-sand/30 rounded text-xs text-brand-noir/80">
                <Clock className="w-5 h-5 text-brand-gold shrink-0" />
                <span>Your garment is currently being hand-prepared and packaged in our Bangalore atelier. Dispatch details will update within 24 hours.</span>
              </div>
            )}

            {/* Items in order */}
            <div className="space-y-3 pt-2">
              <h4 className="font-serif text-xs uppercase tracking-wider text-brand-noir font-semibold">
                Garments in this Shipment
              </h4>
              <div className="divide-y divide-brand-sand">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-medium text-brand-noir">{item.title}</p>
                      <p className="text-[11px] text-brand-noir/60">Qty: {item.quantity} {item.size && `• Size ${item.size}`}</p>
                    </div>
                    <span className="font-semibold text-brand-noir">{formatINR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading shipment tracker...</div>}>
      <TrackContent />
    </Suspense>
  );
}
