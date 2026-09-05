import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { IProduct } from '../../types';
import { ProductCard } from '../shop/ProductCard';

interface BestsellersGridProps {
  products: IProduct[];
}

const defaultBestsellers: IProduct[] = [
  {
    _id: '6a9bdde913550629becd5c71',
    name: 'Embroidery Black Abaya',
    slug: 'embroidery-black-abaya-0990',
    price: 479900,
    salePrice: 419900,
    images: ['https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1200&auto=format&fit=crop'],
    stock: 25,
    flags: { isBestseller: true, isFeatured: true }
  } as any,
  {
    _id: '6a9bdb3652b47be6b17f36ed',
    name: 'Leaf Styled Abaya',
    slug: 'leaf-styled-abaya-9828',
    price: 399900,
    salePrice: 367400,
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1200&auto=format&fit=crop'],
    stock: 22,
    flags: { isBestseller: true }
  } as any,
  {
    _id: '6a9bdcd3400ebf19cb753fba',
    name: 'Stunning Black Abaya',
    slug: 'stunning-black-abaya-5309',
    price: 399900,
    salePrice: 350000,
    images: ['https://images.unsplash.com/photo-1518049362265-d5b2a6467637?q=80&w=1200&auto=format&fit=crop'],
    stock: 22,
    flags: { isBestseller: true }
  } as any,
  {
    _id: '6a9bdd4f52b47be6b17f370d',
    name: 'Slip Dress',
    slug: 'slip-dress-9712',
    price: 99900,
    salePrice: 89900,
    images: ['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop'],
    stock: 25,
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
