'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowLeft, Sparkles } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured by Zayna Error Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-brand-cream px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-brand-border shadow-luxury">
        <div className="w-12 h-12 rounded-full bg-brand-sand/70 text-brand-mocha flex items-center justify-center mx-auto border border-brand-border">
          <Sparkles className="w-6 h-6 text-brand-mocha" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-brand-mocha">
            Zayna Atelier Concierge
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-brand-noir font-normal">
            Momentary Interruption
          </h1>
          <p className="text-xs text-brand-noir/70 leading-relaxed font-light">
            We experienced a brief hiccup while tailoring this collection view. You can reload this page or return to our boutique catalog.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-brand-mocha hover:bg-brand-noir text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload View</span>
          </button>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-brand-sand/60 hover:bg-brand-sand text-brand-noir text-xs font-semibold uppercase tracking-wider rounded-lg transition-all border border-brand-border cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Browse Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
