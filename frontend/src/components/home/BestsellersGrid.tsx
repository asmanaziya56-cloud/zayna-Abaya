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
    _id: 'prod_leaf_styled',
    name: 'Leaf Styled Abaya',
    slug: 'leaf-styled-abaya-2621',
    price: 399900,
    salePrice: 367400,
    images: [
      '/images/products/leaf-styled-abaya-2621-0.jpg',
      '/images/products/leaf-styled-abaya-2621-1.jpg'
    ],
    stock: 22,
    category: { name: 'Eid & Festive', slug: 'eid-festive' } as any,
    flags: { isBestseller: true, isFeatured: true }
  } as any,
  {
    _id: 'prod_stunning_black',
    name: 'Stunning Black Abaya',
    slug: 'stunning-black-abaya-5309',
    price: 399900,
    salePrice: 350000,
    images: [
      '/images/products/stunning-black-abaya-5309-0.jpg',
      '/images/products/stunning-black-abaya-5309-1.jpg'
    ],
    stock: 22,
    category: { name: 'Luxury Occasion', slug: 'luxury-occasion' } as any,
    flags: { isBestseller: true, isFeatured: true }
  } as any,
  {
    _id: 'prod_little_romance',
    name: 'A little romance',
    slug: 'a-little-romance-3685',
    price: 400000,
    salePrice: 360000,
    images: [
      '/images/products/a-little-romance-3685-0.jpg',
      '/images/products/a-little-romance-3685-1.jpg'
    ],
    stock: 25,
    category: { name: 'Luxury Occasion', slug: 'luxury-occasion' } as any,
    flags: { isBestseller: true, isFeatured: true }
  } as any,
  {
    _id: 'prod_navy_blue',
    name: 'Effortlessly elegant in Navy Blue. 💙✨',
    slug: 'effortlessly-elegant-in-navy-blue-5325',
    price: 350000,
    salePrice: 315000,
    images: [
      '/images/products/effortlessly-elegant-in-navy-blue-5325-0.jpg',
      '/images/products/effortlessly-elegant-in-navy-blue-5325-1.jpg'
    ],
    stock: 25,
    category: { name: 'Everyday Essentials', slug: 'everyday-essentials' } as any,
    flags: { isBestseller: true, isFeatured: true }
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
