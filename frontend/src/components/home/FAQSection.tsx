'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { IFAQ } from '../../types';

interface FAQSectionProps {
  faqs: IFAQ[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const defaultFaqs = [
    {
      question: 'How do I choose the correct abaya size?',
      answer: 'Abaya sizing is primarily based on total body height from shoulder to floor. Size 52 corresponds to height 5\'0" - 5\'2", Size 54 is 5\'3" - 5\'4", Size 56 is 5\'5" - 5\'6", and Size 58 is 5\'7" - 5\'8". If you prefer wearing heels, we recommend choosing one size up. Check our interactive Size Guide on any product page for exact bust and sleeve measurements.'
    },
    {
      question: 'What premium fabrics do you use?',
      answer: 'We exclusively source genuine Korean Nidha, Japanese Firdaus Crepe, and Austrian Lenzing Modal Silk. All our textiles undergo rigorous opacity and breathability testing to ensure maximum modesty and comfort in all climates.'
    },
    {
      question: 'How long does shipping take and is it free?',
      answer: 'We offer complimentary express shipping on all orders over ₹2,999 across India. Orders are dispatched from Bangalore within 24-48 hours and arrive in 3-5 business days. Real-time tracking links are provided via SMS and email upon dispatch.'
    },
    {
      question: 'What is your return and exchange policy?',
      answer: 'We offer hassle-free 7-day exchanges for size and styling adjustments on unworn garments with original tags attached and in original packaging. Our courier partner arranges convenient doorstep pickup.'
    }
  ];

  const items = faqs && faqs.length > 0 ? faqs : defaultFaqs;

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-brand-sand/40 border-t border-brand-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-brand-mocha">
            <HelpCircle className="w-3.5 h-3.5 text-brand-gold" />
            <span>Client Concierge</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-noir font-normal">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-brand-noir/70 max-w-md mx-auto">
            Everything you need to know regarding sizes, fabrics, express shipping, and exchanges.
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-brand-border rounded-lg overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between font-serif text-sm sm:text-base text-brand-noir font-medium hover:text-brand-mocha transition-colors"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-brand-mocha shrink-0 ml-4 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-brand-gold' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-brand-noir/80 leading-relaxed border-t border-brand-sand/70 animate-fade-in">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
