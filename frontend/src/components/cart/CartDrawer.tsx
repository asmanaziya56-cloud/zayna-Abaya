'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../providers/CartProvider';
import { formatINR } from '../../lib/utils/currency';

export function CartDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    items,
    subtotal,
    totalAmount,
    freeShippingRemaining,
    freeShippingThreshold,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    cart
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  if (!isDrawerOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      await applyCoupon(couponCode.trim().toUpperCase());
      setCouponCode('');
    } catch (err: any) {
      setCouponError(err.response?.data?.error?.message || 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dark overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-brand-cream shadow-2xl flex flex-col h-full z-10 border-l border-brand-border animate-slide-in">
        {/* Header */}
        <div className="p-5 border-b border-brand-border flex items-center justify-between bg-white/70">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-brand-mocha" />
            <h2 className="font-serif text-lg text-brand-noir tracking-wide">
              Your Bag ({items.reduce((s, i) => s + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            className="p-1.5 text-brand-noir/60 hover:text-brand-noir rounded-md transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="bg-brand-sand px-5 py-3 border-b border-brand-border">
          {freeShippingRemaining > 0 ? (
            <div>
              <p className="text-xs text-brand-noir/90 font-medium mb-1.5 flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold mr-1.5 shrink-0" />
                Add <span className="font-bold text-brand-mocha mx-1">{formatINR(freeShippingRemaining)}</span> more to unlock FREE express delivery!
              </p>
              <div className="w-full bg-brand-border rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-brand-mocha h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-emerald-800 font-semibold flex items-center">
              🎉 Congratulations! You have unlocked FREE Express Delivery.
            </p>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-brand-border">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-sand flex items-center justify-center text-brand-mocha">
                <ShoppingBag className="w-8 h-8 stroke-1" />
              </div>
              <h3 className="font-serif text-xl text-brand-noir">Your bag is empty</h3>
              <p className="text-xs text-brand-noir/60 max-w-xs leading-relaxed">
                Discover our hand-tailored modest collections and bespoke festive edits.
              </p>
              <Link
                href="/shop"
                onClick={closeDrawer}
                className="mt-2 inline-flex items-center px-6 py-2.5 bg-brand-mocha text-white text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-brand-mocha-dark transition-colors"
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item._id || `${item.productId}-${item.variantId}`} className="py-4 first:pt-0 flex space-x-4">
                <div className="w-20 h-24 relative bg-brand-sand rounded-md overflow-hidden shrink-0 border border-brand-border">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title || (item as any).name || 'Zayna Creation'}
                      fill
                      unoptimized
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-brand-noir/40">
                      No img
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif text-sm text-brand-noir font-medium line-clamp-1">
                        {item.title || (item as any).name || 'Zayna Creation'}
                      </h4>
                      <button
                        onClick={() => removeItem(item._id as string)}
                        className="text-brand-noir/40 hover:text-red-600 p-0.5 ml-2 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {(item.size || item.color) && (
                      <p className="text-[11px] text-brand-noir/60 mt-0.5">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.size && item.color && <span> • </span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-brand-border rounded bg-white">
                      <button
                        onClick={() => updateQuantity(item._id as string, item.quantity - 1)}
                        className="p-1 hover:bg-brand-sand text-brand-noir transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-brand-noir">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id as string, item.quantity + 1)}
                        className="p-1 hover:bg-brand-sand text-brand-noir transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-serif text-sm font-semibold text-brand-noir">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Checkout Action */}
        {items.length > 0 && (
          <div className="p-5 border-t border-brand-border bg-white/90 space-y-3">
            {/* Coupon Application */}
            {cart?.coupon ? (
              <div className="flex items-center justify-between bg-brand-sand/70 px-3 py-2 rounded text-xs">
                <div className="flex items-center text-brand-mocha font-semibold">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-gold" />
                  Code {cart.coupon.code} applied (-{cart.coupon.discountType === 'percentage' ? `${cart.coupon.discountValue}%` : formatINR(cart.coupon.discountValue)})
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code (e.g. EIDMUBARAK)"
                  className="flex-1 bg-white border border-brand-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-brand-mocha uppercase"
                />
                <button
                  type="submit"
                  disabled={applyingCoupon || !couponCode.trim()}
                  className="bg-brand-noir text-white px-3 py-1.5 text-xs font-semibold rounded hover:bg-brand-mocha transition-colors disabled:opacity-50"
                >
                  Apply
                </button>
              </form>
            )}
            {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}

            {/* Subtotal & Total */}
            <div className="space-y-1.5 text-xs text-brand-noir/80 pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-brand-noir">{formatINR(subtotal)}</span>
              </div>
              {cart?.discountAmount ? (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Discount</span>
                  <span>-{formatINR(cart.discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{freeShippingRemaining === 0 ? <span className="text-emerald-700 font-semibold">FREE</span> : 'Calculated at checkout'}</span>
              </div>
              <div className="flex justify-between text-sm font-serif font-bold text-brand-noir pt-2 border-t border-brand-border">
                <span>Estimated Total</span>
                <span>{formatINR(totalAmount || subtotal)}</span>
              </div>
            </div>

            {/* Primary Checkout Button */}
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="w-full flex items-center justify-center space-x-2 bg-brand-mocha text-white py-3 rounded-md text-xs font-semibold uppercase tracking-wider hover:bg-brand-mocha-dark transition-all shadow-md active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-center text-[10px] text-brand-noir/50">
              Tax included • 100% Secure Checkout with Razorpay
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
