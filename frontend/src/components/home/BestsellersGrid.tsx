import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { IProduct } from '../../types';
import { ProductCard } from '../shop/ProductCard';

interface BestsellersGridProps {
  products: IProduct[];
}

export function BestsellersGrid({ products }: BestsellersGridProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-20 bg-brand-cream/50 border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-brand-mocha">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              <span>Iconic Masterpieces</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-brand-noir tracking-wide font-normal">
              Most Coveted Silhouettes
            </h2>
          </div>

          <Link
            href="/shop"
            className="mt-4 md:mt-0 inline-flex items-center text-xs font-semibold tracking-widest uppercase text-brand-mocha hover:text-brand-dark transition-colors group"
          >
            <span>View All Creations</span>
            <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
