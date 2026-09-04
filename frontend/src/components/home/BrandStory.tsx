import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Scissors, Gem } from 'lucide-react';
import { IBrandStorySettings } from '../../types';

interface BrandStoryProps {
  story?: IBrandStorySettings;
}

export function BrandStory({ story }: BrandStoryProps) {
  const badge = story?.badgeText || 'Artisan Heritage';
  const title = story?.title || 'Where Modest Heritage Meets Modern Grandeur';
  const paragraph1 =
    story?.paragraph1 ||
    'Founded on the principle that modesty is the purest expression of luxury, Zayna Abaya merges centuries of Arab tailoring traditions with sharp, minimalist silhouettes designed for the contemporary woman.';
  const paragraph2 =
    story?.paragraph2 ||
    'Every garment in our atelier begins with ethically sourced textiles—whether custom-milled Korean Nidha, hand-woven organza, or liquid satin georgette. Our master artisans hand-stitch delicate gold-wire zari and French seams, ensuring every piece drapes with effortless distinction.';
  const stat1Value = story?.stat1Value || '100%';
  const stat1Label = story?.stat1Label || 'Opacity Tested';
  const stat2Value = story?.stat2Value || '35+';
  const stat2Label = story?.stat2Label || 'Hours Per Bridal Piece';
  const ctaText = story?.ctaText || 'Explore The Atelier';
  const ctaLink = story?.ctaLink || '/shop';
  const imageUrl =
    story?.imageUrl ||
    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1200&auto=format&fit=crop';
  const floatingCardTitle = story?.floatingCardTitle || 'Pure Korean Nidha';
  const floatingCardText =
    story?.floatingCardText ||
    'Featherweight, breathable, and woven with dense micro-fibers for 100% natural opacity without bulk.';

  return (
    <section className="py-24 bg-brand-sand/40 border-y border-brand-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Visual Image Montage */}
          <div className="relative">
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border border-brand-border">
              <Image
                src={imageUrl}
                alt="Zayna Artisan Craftsmanship"
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {/* Accent Floating Card */}
            <div className="absolute -bottom-6 -right-6 bg-white p-5 rounded-lg shadow-xl border border-brand-border max-w-xs hidden sm:block">
              <div className="flex items-center space-x-2 text-brand-gold mb-1">
                <Gem className="w-4 h-4" />
                <span className="font-serif text-xs font-bold uppercase tracking-wider text-brand-noir">
                  {floatingCardTitle}
                </span>
              </div>
              <p className="text-[11px] text-brand-noir/70 leading-relaxed">
                {floatingCardText}
              </p>
            </div>
          </div>

          {/* Editorial Text Story */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-[0.2em] uppercase text-brand-mocha">
              <Scissors className="w-3.5 h-3.5 text-brand-gold" />
              <span>{badge}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-light text-brand-noir leading-tight">
              {title}
            </h2>

            <p className="text-sm text-brand-noir/80 leading-relaxed font-light">
              {paragraph1}
            </p>

            <p className="text-sm text-brand-noir/80 leading-relaxed font-light">
              {paragraph2}
            </p>

            <div className="pt-4 grid grid-cols-2 gap-6 border-t border-brand-border">
              <div>
                <span className="font-serif text-3xl text-brand-mocha block font-normal">{stat1Value}</span>
                <span className="text-xs text-brand-noir/70 uppercase tracking-wider">{stat1Label}</span>
              </div>
              <div>
                <span className="font-serif text-3xl text-brand-mocha block font-normal">{stat2Value}</span>
                <span className="text-xs text-brand-noir/70 uppercase tracking-wider">{stat2Label}</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href={ctaLink}
                className="inline-flex items-center px-8 py-3.5 bg-brand-noir text-white text-xs uppercase tracking-widest font-semibold rounded-md hover:bg-brand-mocha transition-all duration-300 shadow-md"
              >
                {ctaText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
