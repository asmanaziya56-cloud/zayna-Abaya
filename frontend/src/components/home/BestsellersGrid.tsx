import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { IProduct } from '../../types';
import { ProductCard } from '../shop/ProductCard';

interface BestsellersGridProps {
  products: IProduct[];
}

export const defaultBestsellers: IProduct[] = [
  {
    _id: '6a9a73c1800bbe764b278b3b',
    name: 'Zahara Embroidered Silk Abaya',
    slug: 'zahara-embroidered-silk-abaya',
    price: 649900,
    salePrice: 549900,
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop'],
    stock: 25,
    category: { name: 'Luxury Occasion', slug: 'luxury-occasion' } as any,
    flags: { isBestseller: true, isFeatured: true }
  } as any,
  {
    _id: '6a9a73c1800bbe764b278b40',
    name: 'Layla Minimalist Linen Open-Front Abaya',
    slug: 'layla-minimalist-linen-open-front-abaya',
    price: 429900,
    salePrice: 379900,
    images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop'],
    stock: 22,
    category: { name: 'Everyday Essentials', slug: 'everyday-essentials' } as any,
    flags: { isBestseller: true }
  } as any,
  {
    _id: '6a9a73c1800bbe764b278b45',
    name: 'Amina Pleated Everyday Black Abaya',
    slug: 'amina-pleated-everyday-black-abaya',
    price: 349900,
    salePrice: 299900,
    images: ['https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1000&auto=format&fit=crop'],
    stock: 22,
    category: { name: 'Everyday Essentials', slug: 'everyday-essentials' } as any,
    flags: { isBestseller: true, isFeatured: true }
  } as any,
  {
    _id: '6a9a73c2800bbe764b278b53',
    name: 'Luxe Modal Silk Sheyla Hijab',
    slug: 'luxe-modal-silk-sheyla-hijab',
    price: 129900,
    salePrice: 99900,
    images: ['https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000&auto=format&fit=crop'],
    stock: 25,
    category: { name: 'Silk Chiffon Hijabs', slug: 'silk-chiffon-hijabs' } as any,
    flags: { isBestseller: true }
  } as any
];

export function BestsellersGrid({ products }: BestsellersGridProps) {
  const items = products && products.length > 0 ? products : defaultBestsellers;

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
          {items.slice(0, 4).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
