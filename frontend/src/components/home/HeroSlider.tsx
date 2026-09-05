'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, Play } from 'lucide-react';
import { IHeroBanner, IHeroSlide } from '../../types';
import initialSettings from '../../lib/constants/initialSettings.json';

interface HeroSliderProps {
  banners?: (IHeroBanner | IHeroSlide)[];
}

export function HeroSlider({ banners }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);

  // Use actual saved hero slides immediately
  const slides: any[] =
    banners && banners.length > 0
      ? banners
      : ((initialSettings.heroSection?.slides as any) || []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-[70vh] sm:h-[80vh] overflow-hidden bg-brand-dark">
      {slides.map((slide: any, idx: number) => {
        const rawUrl = (slide as any).mediaUrl || (slide as any).imageUrl || '';
        const isVideo =
          (slide as any).mediaType === 'video' ||
          /\.(mp4|webm|mov)(\?.*)?$/i.test(rawUrl) ||
          rawUrl.startsWith('data:video');

        return (
          <div
            key={(slide as any)._id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Media (Image or Autoplay Video) with luxury dark gradient vignette */}
            <div className="relative w-full h-full">
              {isVideo ? (
                <video
                  src={rawUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <Image
                  src={rawUrl || 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1800&auto=format&fit=crop'}
                  alt={slide.title}
                  fill
                  priority={idx === 0}
                  unoptimized
                  sizes="100vw"
                  className="object-cover object-center scale-105 transition-transform duration-[10000ms]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
            </div>

          {/* Hero Content Overlay */}
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-xl text-white space-y-4 sm:space-y-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-gold/20 border border-brand-gold/40 text-brand-gold text-xs tracking-widest uppercase font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{slide.badgeText || 'Boutique Haute Couture'}</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light tracking-wide leading-tight text-white drop-shadow-md">
                  {slide.title}
                </h1>

                <p className="text-sm sm:text-base text-brand-cream/85 font-light leading-relaxed max-w-lg">
                  {slide.subtitle}
                </p>

                <div className="pt-2 flex flex-wrap gap-4">
                  <Link
                    href={slide.ctaLink || '/shop'}
                    className="inline-flex items-center px-8 py-3.5 bg-brand-mocha hover:bg-brand-gold text-white font-semibold text-xs uppercase tracking-widest rounded-md transition-all duration-300 shadow-xl"
                  >
                    {slide.ctaText || 'Shop Collection'}
                  </Link>
                  {slide.secondaryCtaText !== '' && (
                    <Link
                      href={slide.secondaryCtaLink || '/shop'}
                      className="inline-flex items-center px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs uppercase tracking-widest rounded-md backdrop-blur-sm border border-white/20 transition-all duration-300"
                    >
                      {slide.secondaryCtaText || 'View Lookbook'}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })}

      {/* Slide Navigation Arrows */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white/80 hover:text-white transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white/80 hover:text-white transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Bottom slide indicator dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-8 h-1 rounded-full transition-all duration-300 ${
              i === current ? 'bg-brand-gold w-12' : 'bg-white/40'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
