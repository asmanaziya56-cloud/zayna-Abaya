'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Sparkles, ShieldCheck } from 'lucide-react';
import { useCart } from '../../components/providers/CartProvider';
import { formatINR } from '../../lib/utils/currency';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    totalAmount,
    freeShippingRemaining,
    freeShippingThreshold,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    cart,
    isInitialized,
    closeDrawer
  } = useCart();

  useEffect(() => {
    closeDrawer();
  }, [closeDrawer]);

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    setCouponError('');
    try {
      await applyCoupon(couponInput.trim().toUpperCase());
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err.response?.data?.error?.message || 'Invalid coupon code');
    } finally {
      setApplying(false);
    }
  };

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (!isInitialized) {
    return (
      <div className="bg-brand-cream min-h-[70vh] py-16 px-4 animate-pulse">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-8 bg-brand-sand w-48 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-brand-border h-72" />
            <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-brand-border h-72" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-brand-cream min-h-[70vh] flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-10 rounded-xl border border-brand-border shadow-sm">
          <div className="w-16 h-16 rounded-full bg-brand-sand flex items-center justify-center mx-auto text-brand-mocha">
            <ShoppingBag className="w-8 h-8 stroke-1" />
          </div>
          <h1 className="font-serif text-2xl text-brand-noir">Your Shopping Bag is Empty</h1>
          <p className="text-xs text-brand-noir/70 leading-relaxed">
            Discover our curated modest edits, hand-tailored kaftans, and luxury abayas.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center px-8 py-3 bg-brand-mocha text-white text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-brand-mocha-dark transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-brand-noir mb-8">
          Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
        </h1>

        {/* Free Shipping Meter Banner */}
        <div className="bg-white border border-brand-border rounded-lg p-4 mb-8 shadow-sm">
          {freeShippingRemaining > 0 ? (
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-brand-noir/90 font-medium flex items-center">
                <Sparkles className="w-4 h-4 text-brand-gold mr-2 shrink-0" />
                Add <span className="font-bold text-brand-mocha mx-1">{formatINR(freeShippingRemaining)}</span> more to your bag to enjoy complimentary express delivery!
              </p>
              <div className="w-full bg-brand-sand rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-mocha h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-emerald-800 font-semibold flex items-center">
              🎉 Complimentary Express Delivery has been unlocked for your order!
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Items Table */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-brand-border shadow-sm divide-y divide-brand-border overflow-hidden">
            <div className="p-4 bg-brand-sand/50 hidden sm:grid grid-cols-12 text-xs font-serif uppercase tracking-wider text-brand-noir/70 font-semibold">
              <div className="col-span-6">Creation</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Subtotal</div>
            </div>

            {items.map((item) => (
              <div key={item._id || `${item.productId}-${item.variantId}`} className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                {/* Product Info */}
                <div className="col-span-6 flex space-x-4 w-full">
                  <div className="relative w-20 h-24 rounded bg-brand-sand overflow-hidden shrink-0 border border-brand-border">
                    {item.image && (
                      <Image src={item.image} alt={item.title || (item as any).name || 'Zayna Creation'} fill unoptimized className="object-cover" />
                    )}
                  </div>
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-serif text-sm font-medium text-brand-noir line-clamp-1">
                        {item.title || (item as any).name || 'Zayna Creation'}
                      </h3>
                      {(item.size || item.color) && (
                        <p className="text-xs text-brand-noir/60 mt-0.5">
                          {item.size && <span>Length: {item.size}</span>}
                          {item.size && item.color && <span> • </span>}
                          {item.color && <span>{item.color}</span>}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-medium text-brand-noir sm:hidden">
                      {formatINR(item.price)} each
                    </span>
                    <button
                      onClick={() => removeItem(item._id as string)}
                      className="text-xs text-red-600 hover:underline flex items-center space-x-1 mt-2 sm:mt-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="col-span-3 flex justify-center w-full sm:w-auto">
                  <div className="flex items-center border border-brand-border rounded bg-brand-sand/40">
                    <button
                      onClick={() => updateQuantity(item._id as string, item.quantity - 1)}
                      className="p-1.5 hover:bg-brand-sand text-brand-noir"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id as string, item.quantity + 1)}
                      className="p-1.5 hover:bg-brand-sand text-brand-noir"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="col-span-3 text-right w-full sm:w-auto">
                  <span className="font-serif text-base font-bold text-brand-noir">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Box */}
          <div className="bg-white rounded-lg border border-brand-border shadow-sm p-6 space-y-6">
            <h2 className="font-serif text-lg text-brand-noir pb-3 border-b border-brand-border">
              Order Summary
            </h2>

            {/* Coupon Box */}
            <div>
              <label className="block text-xs font-medium text-brand-noir/80 mb-1.5">
                Have a promotional code?
              </label>
              {cart?.coupon ? (
                <div className="flex items-center justify-between bg-brand-sand px-3 py-2 rounded text-xs">
                  <span className="font-semibold text-brand-mocha">
                    Code {cart.coupon.code} active
                  </span>
                  <button onClick={removeCoupon} className="text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="e.g. EIDMUBARAK"
                    className="flex-1 bg-brand-sand/40 border border-brand-border rounded px-3 py-2 text-xs uppercase focus:outline-none focus:border-brand-mocha"
                  />
                  <button
                    type="submit"
                    disabled={applying || !couponInput.trim()}
                    className="bg-brand-noir text-white px-4 py-2 rounded text-xs font-semibold hover:bg-brand-mocha transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-red-600 mt-1">{couponError}</p>}
            </div>

            {/* Line Items */}
            <div className="space-y-2 text-xs text-brand-noir/80 pt-2 border-t border-brand-border">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-brand-noir">{formatINR(subtotal)}</span>
              </div>
              {cart?.discountAmount ? (
                <div className="flex justify-between text-emerald-700">
                  <span>Promotional Discount</span>
                  <span>-{formatINR(cart.discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span>{freeShippingRemaining === 0 ? <span className="text-emerald-700 font-semibold">FREE</span> : 'Calculated next'}</span>
              </div>
              <div className="flex justify-between text-base font-serif font-bold text-brand-noir pt-3 border-t border-brand-border">
                <span>Total Amount</span>
                <span>{formatINR(totalAmount || subtotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.href = '/checkout';
              }}
              className="w-full flex items-center justify-center space-x-2 bg-brand-mocha hover:bg-brand-mocha-dark text-white py-3.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center text-[11px] text-brand-noir/60 space-y-1">
              <p className="flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-gold mr-1" />
                Secured 256-bit Encrypted Checkout
              </p>
              <p>Complimentary luxury gift box with all orders.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
