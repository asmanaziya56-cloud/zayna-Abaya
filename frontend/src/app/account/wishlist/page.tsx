'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, X, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../../components/providers/WishlistProvider';
import { useCart } from '../../../components/providers/CartProvider';
import { formatINR } from '../../../lib/utils/currency';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddToBag = async (productId: string, variantId?: string) => {
    await addItem({ productId, variantId, quantity: 1 });
  };

  return (
    <div className="bg-brand-cream min-h-[70vh] py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-brand-mocha">
            <Heart className="w-3.5 h-3.5 text-brand-gold fill-brand-gold" />
            <span>Saved Creations</span>
          </div>
          <h1 className="font-serif text-3xl text-brand-noir font-normal">Your Personal Wishlist</h1>
          <p className="text-xs text-brand-noir/60 max-w-sm mx-auto">
            Save your desired silhouettes and bespoke edits for celebrations and seasonal drops.
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-xl border border-brand-border p-12 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-sand flex items-center justify-center mx-auto text-brand-mocha">
              <Heart className="w-8 h-8 stroke-1" />
            </div>
            <p className="font-serif text-lg text-brand-noir">Your Wishlist is Empty</p>
            <p className="text-xs text-brand-noir/60 max-w-xs mx-auto leading-relaxed">
              Click the heart icon on any creation to preserve it in your private wishlist.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center space-x-2 mt-2 px-6 py-2.5 bg-brand-mocha text-white text-xs uppercase font-semibold tracking-wider rounded hover:bg-brand-mocha-dark transition-colors"
            >
              <span>Explore Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <button
                onClick={clearWishlist}
                className="text-xs text-brand-noir/50 hover:text-red-500 transition-colors underline-offset-2 hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlist.map((product) => {
                const currentPrice = product.salePrice || product.price;
                const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=800&auto=format&fit=crop';
                const firstVariant = product.variants?.[0];
                return (
                  <div key={product._id} className="group relative flex flex-col bg-white rounded-lg overflow-hidden border border-brand-border/60 hover:border-brand-gold/40 hover:shadow-luxury transition-all duration-300">
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-brand-noir shadow flex items-center justify-center transition-all hover:text-red-500 cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <Link href={`/product/${product.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-brand-sand block">
                      <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </Link>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <Link href={`/product/${product.slug}`} className="block">
                        <h3 className="font-serif text-sm font-medium text-brand-noir group-hover:text-brand-mocha transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="font-serif text-sm font-bold text-brand-noir">
                          {formatINR(currentPrice)}
                        </span>
                        <button
                          onClick={() => handleAddToBag(product._id, firstVariant?._id)}
                          className="flex items-center space-x-1 px-2.5 py-1.5 bg-brand-mocha hover:bg-brand-mocha-dark text-white rounded text-[10px] font-semibold uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Add to Bag</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center space-x-2 text-xs text-brand-mocha hover:text-brand-mocha-dark font-semibold uppercase tracking-wider transition-colors"
              >
                <span>Continue Exploring</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
