import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { ICategory, ICategoriesSectionSettings } from '../../types';

interface CategoryBannersProps {
  categories: ICategory[];
  sectionConfig?: ICategoriesSectionSettings;
}

export function CategoryBanners({ categories, sectionConfig }: CategoryBannersProps) {
  if (!categories || categories.length === 0) return null;

  const badge = sectionConfig?.badgeText || 'Curated Categories';
  const title = sectionConfig?.title || 'Designed for Every Occasion';

  return (
    <section className="py-20 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-mocha">
            {badge}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-noir tracking-wide font-normal">
            {title}
          </h2>
          <div className="w-12 h-0.5 bg-brand-gold mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, index) => (
            <Link
              key={cat._id}
              href={`/shop?category=${cat.slug}`}
              className={`group relative overflow-hidden rounded-lg aspect-[4/5] bg-brand-sand border border-brand-border/60 shadow-sm ${
                index === 0 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {cat.image && (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              )}
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Bottom Content */}
              <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-2">
                <h3 className="font-serif text-2xl font-light tracking-wide drop-shadow-md">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-brand-cream/80 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                )}
                <div className="pt-2 flex items-center text-xs font-semibold uppercase tracking-widest text-brand-gold group-hover:text-white transition-colors">
                  <span>Explore Edit</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
