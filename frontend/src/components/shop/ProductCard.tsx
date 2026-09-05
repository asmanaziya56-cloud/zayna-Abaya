'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Eye, Sparkles, Heart, X, Ruler } from 'lucide-react';
import { IProduct, IButtonSettings } from '../../types';
import { formatINR, calculateDiscountPercent } from '../../lib/utils/currency';
import { useCart } from '../providers/CartProvider';
import { useWishlist } from '../providers/WishlistProvider';
import { settingsApi } from '../../lib/api/settings.api';

let cachedButtonSettings: IButtonSettings | null = null;
let settingsFetchPromise: Promise<any> | null = null;

interface ProductCardProps {
  product: IProduct;
  buttonSettings?: IButtonSettings;
}

export function ProductCard({ product, buttonSettings }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted: checkWishlisted, toggleWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const isWishlisted = checkWishlisted(product._id);
  const [btnSettings, setBtnSettings] = useState<IButtonSettings | undefined>(
    buttonSettings || cachedButtonSettings || undefined
  );

  useEffect(() => {
    if (buttonSettings) {
      setBtnSettings(buttonSettings);
      return;
    }
    if (cachedButtonSettings) {
      setBtnSettings(cachedButtonSettings);
      return;
    }
    if (!settingsFetchPromise) {
      settingsFetchPromise = settingsApi.getPublicSettings().then((s) => {
        cachedButtonSettings = s?.buttons || {};
        return cachedButtonSettings;
      }).catch(() => {});
    }
    settingsFetchPromise.then((b) => {
      if (b) setBtnSettings(b);
    });
  }, [buttonSettings]);

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(
    product.variants?.[0] || null
  );

  const discountPercent = calculateDiscountPercent(product.price, product.salePrice);
  const currentPrice = product.salePrice || product.price;
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=800&auto=format&fit=crop';
  const hoverImage = product.images?.[1] || mainImage;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleOpenOptions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowOptionsModal(true);
  };

  const handleConfirmAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await addItem({
        productId: product._id,
        variantId: selectedVariant?._id,
        quantity: 1
      });
      setShowOptionsModal(false);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group flex flex-col bg-white rounded-lg overflow-hidden border border-brand-border/60 hover:border-brand-gold/40 hover:shadow-luxury transition-all duration-300">
      {/* Image Container */}
      <Link href={`/product/${product.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-brand-sand block">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          unoptimized
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {(product.flags?.isOnSale || discountPercent > 0) && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase shadow-sm flex items-center gap-1">
              <span>SALE</span>
              {discountPercent > 0 && <span>-{discountPercent}%</span>}
            </span>
          )}
          {product.flags?.isBestseller && (
            <span className="bg-brand-mocha text-white text-[10px] font-semibold px-2 py-0.5 rounded tracking-wider uppercase">
              Bestseller
            </span>
          )}
          {product.flags?.isNewArrival && (
            <span className="bg-brand-noir text-white text-[10px] font-medium px-2 py-0.5 rounded tracking-wider uppercase">
              New Arrival
            </span>
          )}
        </div>

        {/* Floating Wishlist Heart Action Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-brand-noir shadow-md flex items-center justify-center transition-all duration-200 backdrop-blur-xs hover:scale-110 active:scale-95 cursor-pointer"
          title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
          aria-label="Save to Wishlist"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-brand-noir hover:text-red-500'
            }`}
          />
        </button>

        {/* Quick Add Overlay on Desktop Hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={handleOpenOptions}
            disabled={adding}
            className="w-full py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 shadow-md cursor-pointer hover:opacity-90 active:scale-[0.99]"
            style={{
              backgroundColor: btnSettings?.quickAddBgColor || '#FFFFFF',
              color: btnSettings?.quickAddTextColor || '#0A1128'
            }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{adding ? 'Adding...' : (btnSettings?.quickAddText || 'Quick Add to Bag')}</span>
          </button>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          <div className="flex items-center justify-between text-[11px] text-brand-noir/50 uppercase tracking-wider mb-1">
            <span>{product.category?.name || 'Abaya'}</span>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-amber-700 font-medium">Only {product.stock} left</span>
            )}
          </div>

          {/* Product Name */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-sm font-medium text-brand-noir group-hover:text-brand-mocha transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Direct Always-Visible Add to Cart Action */}
        <div className="mt-3 pt-3 border-t border-brand-border/60 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline space-x-1.5">
              <span className="font-serif text-sm font-bold text-brand-noir">
                {formatINR(currentPrice)}
              </span>
              {product.salePrice && product.salePrice < product.price && (
                <span className="text-[11px] text-brand-noir/40 line-through">
                  {formatINR(product.price)}
                </span>
              )}
            </div>
            {product.variants && product.variants.length > 0 && (
              <span className="text-[10px] text-brand-noir/50">
                Sizes: {product.variants.map((v) => v.size).filter(Boolean).join(', ')}
              </span>
            )}
          </div>

          {/* Visible Direct Add to Bag button */}
          <button
            type="button"
            onClick={handleOpenOptions}
            disabled={adding}
            className="px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1 shadow-xs active:scale-95 cursor-pointer shrink-0 hover:opacity-90"
            style={{
              backgroundColor: btnSettings?.addToCartBgColor || '#0B1B3D',
              color: btnSettings?.addToCartTextColor || '#FFFFFF'
            }}
            title="Select size & add to bag"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{adding ? 'Adding...' : (btnSettings?.addToCartText ? btnSettings.addToCartText.replace(/add to shopping bag/i, 'Add to Bag') : 'Add to Bag')}</span>
          </button>
        </div>
      </div>

      {/* Quick Size & Color Selector Modal */}
      {showOptionsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowOptionsModal(false);
          }}
        >
          <div
            className="bg-white rounded-xl max-w-sm w-full p-5 border border-brand-border shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowOptionsModal(false)}
              className="absolute top-3 right-3 text-brand-noir/40 hover:text-brand-noir p-1 rounded-full hover:bg-brand-sand/60"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-3 items-center pb-3 border-b border-brand-border">
              <div className="w-14 h-16 relative bg-brand-sand rounded-lg overflow-hidden shrink-0 border border-brand-border">
                <Image src={mainImage} alt={product.name} fill unoptimized className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-sm font-semibold text-brand-noir line-clamp-1">{product.name}</p>
                <p className="font-bold text-brand-mocha text-sm">{formatINR(selectedVariant?.salePrice || selectedVariant?.price || currentPrice)}</p>
                {selectedVariant?.color && (
                  <p className="text-[11px] text-brand-noir/60">Color: <strong>{selectedVariant.color}</strong></p>
                )}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-brand-noir uppercase tracking-wider text-[11px]">
                  Select Length / Size: <span className="text-brand-mocha font-bold">{selectedVariant?.size || 'Standard'}</span>
                </span>
                <Link href={`/product/${product.slug}`} className="text-[10px] text-brand-mocha hover:underline flex items-center gap-0.5">
                  <Ruler className="w-3 h-3" /> Size Guide
                </Link>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {product.variants?.map((v) => {
                  const isSelected = selectedVariant?._id === v._id || selectedVariant?.size === v.size;
                  return (
                    <button
                      key={v.sku || v.size}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`py-2 text-xs font-bold rounded-md transition-all ${
                        isSelected
                          ? 'bg-brand-mocha text-white shadow-sm ring-2 ring-brand-mocha/30'
                          : 'bg-brand-sand/50 text-brand-noir border border-brand-border hover:bg-brand-sand'
                      }`}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-brand-noir/50">
                {selectedVariant?.size === '52' && "Recommended for height 5'0\" - 5'2\""}
                {selectedVariant?.size === '54' && "Recommended for height 5'3\" - 5'4\""}
                {selectedVariant?.size === '56' && "Recommended for height 5'5\" - 5'6\""}
                {selectedVariant?.size === '58' && "Recommended for height 5'7\" - 5'8\""}
                {selectedVariant?.size === '60' && "Recommended for height 5'9\" and above"}
              </p>
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={handleConfirmAdd}
              disabled={adding}
              className="w-full py-3 rounded-lg text-xs font-bold uppercase tracking-widest bg-brand-mocha text-white hover:bg-brand-mocha-dark transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{adding ? 'Adding to Bag...' : `Add Size ${selectedVariant?.size || ''} to Bag`}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
