'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Eye, Sparkles, Heart } from 'lucide-react';
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

  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants?.[0]?.size || '54'
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

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      const variant = product.variants?.find((v) => v.size === selectedSize) || product.variants?.[0];
      await addItem({
        productId: product._id,
        variantId: variant?._id,
        quantity: 1
      });
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
            onClick={handleQuickAdd}
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
                Sizes: {product.variants.map((v) => v.size).join(', ')}
              </span>
            )}
          </div>

          {/* Visible Direct Add to Bag button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={adding}
            className="px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1 shadow-xs active:scale-95 cursor-pointer shrink-0 hover:opacity-90"
            style={{
              backgroundColor: btnSettings?.addToCartBgColor || '#0B1B3D',
              color: btnSettings?.addToCartTextColor || '#FFFFFF'
            }}
            title="Add to shopping bag"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{adding ? 'Adding...' : (btnSettings?.addToCartText ? btnSettings.addToCartText.replace(/add to shopping bag/i, 'Add to Bag') : 'Add to Bag')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
