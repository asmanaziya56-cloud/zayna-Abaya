'use client';

import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  if (!isOpen) return null;

  const sizeChart = [
    { size: '52', height: '5\'0" – 5\'2"', bust: '42 in', sleeve: '27 in', length: '52 in' },
    { size: '54', height: '5\'3" – 5\'4"', bust: '44 in', sleeve: '27.5 in', length: '54 in' },
    { size: '56', height: '5\'5" – 5\'6"', bust: '46 in', sleeve: '28 in', length: '56 in' },
    { size: '58', height: '5\'7" – 5\'8"', bust: '48 in', sleeve: '28.5 in', length: '58 in' },
    { size: '60', height: '5\'9" +', bust: '50 in', sleeve: '29 in', length: '60 in' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-brand-cream border border-brand-border rounded-xl shadow-2xl max-w-xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-brand-noir/60 hover:text-brand-noir p-1"
          aria-label="Close size guide"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-brand-mocha mb-3">
          <Ruler className="w-5 h-5" />
          <h3 className="font-serif text-xl text-brand-noir">Abaya Sizing Guide</h3>
        </div>

        <p className="text-xs text-brand-noir/70 leading-relaxed mb-6">
          Standard abaya sizes indicate garment length from top of the shoulder to hemline. For traditional floor-length modesty, choose the size matching your height. If you frequently wear high heels, we suggest sizing up.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-brand-noir border border-brand-border rounded-lg overflow-hidden">
            <thead className="bg-brand-sand font-serif uppercase tracking-wider text-brand-noir/80 border-b border-brand-border">
              <tr>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Your Height</th>
                <th className="py-2.5 px-3">Garment Length</th>
                <th className="py-2.5 px-3">Bust Width</th>
                <th className="py-2.5 px-3">Sleeve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border bg-white">
              {sizeChart.map((row) => (
                <tr key={row.size} className="hover:bg-brand-sand/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-brand-mocha">{row.size}</td>
                  <td className="py-2.5 px-3 font-medium">{row.height}</td>
                  <td className="py-2.5 px-3">{row.length}</td>
                  <td className="py-2.5 px-3">{row.bust}</td>
                  <td className="py-2.5 px-3">{row.sleeve}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 p-3.5 bg-brand-sand/60 rounded-lg text-[11px] text-brand-noir/80 space-y-1">
          <p className="font-semibold text-brand-noir">💡 Need Custom Tailoring?</p>
          <p>
            We offer bespoke sleeve and length alterations for our bridal and luxury edits. Contact our styling concierge at <span className="text-brand-mocha font-medium">care@zaynaabaya.com</span> with your order number.
          </p>
        </div>
      </div>
    </div>
  );
}
