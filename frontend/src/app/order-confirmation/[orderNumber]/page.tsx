'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Truck, Package, ShieldCheck, Printer, Mail, Phone } from 'lucide-react';
import { ordersApi } from '../../../lib/api/orders.api';
import { settingsApi } from '../../../lib/api/settings.api';
import { IOrder, ISiteSettings, IInvoiceSettings } from '../../../types';
import { formatINR } from '../../../lib/utils/currency';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<IOrder | null>(null);
  const [settings, setSettings] = useState<ISiteSettings | null>(null);

  useEffect(() => {
    // Fetch site settings to apply custom invoice & confirmation styling
    settingsApi
      .getPublicSettings()
      .then(setSettings)
      .catch((err) => console.error('Failed to load settings', err));

    if (orderNumber) {
      ordersApi
        .trackOrder(orderNumber, '')
        .then(setOrder)
        .catch(() => {
          // Fallback if email query param not passed
        });
    }
  }, [orderNumber]);

  const inv: IInvoiceSettings = settings?.invoice || {};

  // Content defaults
  const badgeText = inv.badgeText || 'Order Confirmed';
  const badgeBg = inv.badgeBgColor || '#ECFDF5';
  const badgeTextColor = inv.badgeTextColor || '#047857';

  const title = inv.title || 'Thank You For Choosing Zayna';
  const subtitle =
    inv.subtitle ||
    'Your creation is being prepared with utmost care by our atelier artisans. An order receipt and live tracking updates have been dispatched to your email.';
  const deliveryText = inv.estimatedDeliveryText || '3 – 5 Business Days';

  const step1Title = inv.step1Title || '1. Atelier Packing';
  const step1Sub = inv.step1Subtitle || 'Luxury Gift Box';
  const step2Title = inv.step2Title || '2. Express Dispatch';
  const step2Sub = inv.step2Subtitle || 'Air Priority Cargo';
  const step3Title = inv.step3Title || '3. Doorstep Arrival';
  const step3Sub = inv.step3Subtitle || 'Hassle-free fit exchange';

  const btnTrackText = inv.btnTrackText || 'Track Delivery Timeline';
  const btnTrackBg = inv.btnTrackBgColor || '#FAF7F2';
  const btnTrackTextColor = inv.btnTrackTextColor || '#1A1A1A';
  const btnTrackLink = inv.btnTrackLink || `/track?order=${orderNumber}`;

  const btnContinueText = inv.btnContinueText || 'Continue Browsing';
  const btnContinueBg = inv.btnContinueBgColor || '#8E6E53';
  const btnContinueTextColor = inv.btnContinueTextColor || '#FFFFFF';
  const btnContinueLink = inv.btnContinueLink || '/shop';

  const showPrintBtn = inv.showPrintInvoiceBtn !== false;
  const printBtnText = inv.printInvoiceBtnText || 'Print / Download Official Invoice';
  const printBtnBg = inv.printInvoiceBtnBgColor || '#0B1B3D';
  const printBtnTextColor = inv.printInvoiceBtnTextColor || '#FFFFFF';

  const supportNote =
    inv.supportNote ||
    'Need concierge support regarding your fit or custom adjustments? Our atelier team is here to assist.';
  const supportEmail = inv.supportEmail || settings?.contact?.email || 'care@zaynaabaya.com';
  const supportPhone = inv.supportPhone || settings?.contact?.phone || '+91 9876543210';

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="bg-brand-cream min-h-screen py-12 px-4 print:bg-white print:py-4 print:px-0">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-brand-border shadow-luxury p-8 sm:p-12 text-center space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Printable Official Letterhead (visible on print or luxury display) */}
        <div className="hidden print:block text-center border-b border-stone-300 pb-4 mb-4">
          <h2 className="font-serif text-2xl font-bold tracking-widest text-brand-noir uppercase">
            {settings?.brand?.name || 'Zayna Haute Couture'}
          </h2>
          <p className="text-xs text-stone-500 uppercase tracking-widest">
            {settings?.brand?.tagline || 'Atelier Official Tax Invoice & Order Receipt'}
          </p>
        </div>

        {/* Checkmark Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 print:hidden">
          <CheckCircle className="w-9 h-9 stroke-[1.5]" />
        </div>

        {/* Header Badge, Title & Narrative */}
        <div className="space-y-2">
          <div className="inline-block">
            <span
              className="text-xs uppercase font-semibold tracking-[0.2em] px-3.5 py-1 rounded-full border border-emerald-200/60 inline-block transition-colors"
              style={{
                backgroundColor: badgeBg,
                color: badgeTextColor
              }}
            >
              {badgeText}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl text-brand-noir font-normal">
            {title}
          </h1>

          <p className="text-xs text-brand-noir/70 max-w-md mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Order Reference Card */}
        <div className="bg-brand-sand/60 rounded-lg p-5 border border-brand-border text-left space-y-3 print:bg-stone-50">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <span className="text-xs text-brand-noir/70 font-medium">Order Reference:</span>
            <span className="font-mono text-sm font-bold text-brand-mocha tracking-wider">
              {orderNumber}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-brand-noir/80">
            <span>Fulfillment Status:</span>
            <span className="capitalize font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
              {order?.fulfillmentStatus || 'Processing'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-brand-noir/80">
            <span>Estimated Delivery:</span>
            <span className="font-medium text-brand-noir">{deliveryText}</span>
          </div>

          {order && (
            <div className="pt-2 border-t border-brand-border flex justify-between text-xs font-semibold text-brand-noir">
              <span>Total Paid:</span>
              <span>{formatINR(order.pricing.totalAmount)}</span>
            </div>
          )}

          {/* Itemized Order Line Items for official invoice/receipt */}
          {order && order.items && order.items.length > 0 && (
            <div className="pt-3 border-t border-brand-border space-y-2">
              <div className="text-[11px] font-semibold tracking-wider text-brand-noir/70 uppercase">
                Purchased Pieces
              </div>
              <div className="space-y-1.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-brand-noir">
                    <span className="truncate max-w-[280px]">
                      {item.title} {item.size ? `(Size: ${item.size})` : ''} × {item.quantity}
                    </span>
                    <span className="font-mono text-brand-noir/90 font-medium">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Steps Timeline */}
        <div className="grid grid-cols-3 gap-2 pt-4 text-xs text-brand-noir/70">
          <div className="flex flex-col items-center space-y-1">
            <Package className="w-5 h-5 text-brand-mocha" />
            <span className="font-medium text-brand-noir">{step1Title}</span>
            <span className="text-[10px] text-brand-noir/50">{step1Sub}</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <Truck className="w-5 h-5 text-brand-gold" />
            <span className="font-medium text-brand-noir">{step2Title}</span>
            <span className="text-[10px] text-brand-noir/50">{step2Sub}</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <ShieldCheck className="w-5 h-5 text-brand-noir" />
            <span className="font-medium text-brand-noir">{step3Title}</span>
            <span className="text-[10px] text-brand-noir/50">{step3Sub}</span>
          </div>
        </div>

        {/* Concierge Support Note */}
        <div className="bg-amber-50/50 border border-amber-200/60 rounded-lg p-3.5 text-xs text-brand-noir/70 text-center space-y-1">
          <p className="font-serif italic text-brand-noir">{supportNote}</p>
          <div className="flex items-center justify-center gap-4 text-[11px] text-brand-mocha font-medium pt-1">
            <a href={`mailto:${supportEmail}`} className="inline-flex items-center gap-1 hover:underline">
              <Mail className="w-3.5 h-3.5" />
              <span>{supportEmail}</span>
            </a>
            <a href={`tel:${supportPhone}`} className="inline-flex items-center gap-1 hover:underline">
              <Phone className="w-3.5 h-3.5" />
              <span>{supportPhone}</span>
            </a>
          </div>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="pt-6 space-y-3 print:hidden">
          {showPrintBtn && (
            <button
              type="button"
              onClick={handlePrint}
              style={{ backgroundColor: printBtnBg, color: printBtnTextColor }}
              className="w-full py-3 px-6 rounded text-xs uppercase font-semibold tracking-wider flex items-center justify-center gap-2 shadow hover:opacity-90 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>{printBtnText}</span>
            </button>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={btnTrackLink}
              style={{ backgroundColor: btnTrackBg, color: btnTrackTextColor }}
              className="px-6 py-3 text-xs uppercase font-semibold tracking-wider rounded border border-brand-border/60 hover:opacity-90 transition-all inline-flex items-center justify-center text-center"
            >
              {btnTrackText}
            </Link>
            <Link
              href={btnContinueLink}
              style={{ backgroundColor: btnContinueBg, color: btnContinueTextColor }}
              className="px-8 py-3 text-xs uppercase font-semibold tracking-wider rounded shadow-md hover:opacity-90 transition-all inline-flex items-center justify-center text-center"
            >
              {btnContinueText}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
