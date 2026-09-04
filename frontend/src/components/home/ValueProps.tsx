import React from 'react';
import { Package, Truck, ShieldCheck, Sparkles } from 'lucide-react';

export function ValueProps() {
  const perks = [
    {
      icon: Package,
      title: 'Luxury Keepsake Packaging',
      description: 'Every abaya arrives nestled in our rigid gold-embossed boutique box & silk dust bag.'
    },
    {
      icon: Truck,
      title: 'Complimentary Express Delivery',
      description: 'Free tracked express shipping across India on all prepaid orders over ₹2,999.'
    },
    {
      icon: ShieldCheck,
      title: '100% Certified Modesty',
      description: 'Hand-selected Korean Nidha and Firdaus fabrics tested for complete opacity and fluid drape.'
    },
    {
      icon: Sparkles,
      title: 'Bespoke Size Concierge',
      description: 'Complimentary length and sleeve adjustments on our exclusive festive & bridal edits.'
    }
  ];

  return (
    <section className="bg-brand-sand/60 py-12 border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {perks.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <div key={i} className="flex items-start space-x-4">
                <div className="p-3 bg-white rounded-lg shadow-sm border border-brand-border/70 text-brand-mocha shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold text-brand-noir tracking-wide">
                    {perk.title}
                  </h4>
                  <p className="text-xs text-brand-noir/70 mt-1 leading-relaxed">
                    {perk.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
