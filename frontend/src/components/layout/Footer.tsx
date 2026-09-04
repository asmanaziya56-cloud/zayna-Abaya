'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { settingsApi } from '../../lib/api/settings.api';
import { ISiteSettings, IFooterSettings } from '../../types';

export function Footer() {
  const [footerSettings, setFooterSettings] = useState<IFooterSettings>({
    bgColor: '#121212',
    textColor: '#FAF7F2',
    showValueBadges: true,
    showBrandStory: true,
    showCollections: true,
    showCustomerCare: true,
    showNewsletter: true,
    customCopyright: '',
    contactEmail: 'care@zaynaabaya.com',
    contactPhone: '+91 9876543210',
    contactAddress: 'Commercial Street, Bangalore, India'
  });
  const [brandName, setBrandName] = useState('ZAYNA');
  const [brandTagline, setBrandTagline] = useState('Redefining modest luxury. Inspired by Arab heritage and modern minimalist aesthetics, Zayna Abaya crafts bespoke silhouettes with unwavering commitment to grace, opacity, and timeless elegance.');
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/zaynaabaya');

  useEffect(() => {
    settingsApi
      .getPublicSettings()
      .then((settings: ISiteSettings) => {
        if (settings?.footer) {
          setFooterSettings((prev) => ({ ...prev, ...settings.footer }));
        }
        if (settings?.brand?.name) setBrandName(settings.brand.name.toUpperCase());
        if (settings?.brand?.tagline) setBrandTagline(settings.brand.tagline);
        if (settings?.social?.instagram) {
          const raw = settings.social.instagram.replace('@', '').replace('https://instagram.com/', '').replace('https://www.instagram.com/', '');
          setInstagramUrl('https://instagram.com/' + raw);
        }
        // Fallback contact from contact section
        if (!settings?.footer?.contactEmail && settings?.contact?.email) {
          setFooterSettings((prev) => ({ ...prev, contactEmail: settings.contact.email }));
        }
        if (!settings?.footer?.contactPhone && settings?.contact?.phone) {
          setFooterSettings((prev) => ({ ...prev, contactPhone: settings.contact.phone }));
        }
        if (!settings?.footer?.contactAddress && settings?.contact?.address) {
          setFooterSettings((prev) => ({ ...prev, contactAddress: settings.contact.address }));
        }
      })
      .catch(() => {});
  }, []);

  const bgColor = footerSettings.bgColor || '#121212';
  const textColor = footerSettings.textColor || '#FAF7F2';
  const headingColor = footerSettings.headingColor || '#C5A880';

  return (
    <footer
      className="border-t border-white/10 mt-20 transition-colors duration-300"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Value Badges Banner */}
      {footerSettings.showValueBadges && (
        <div className="border-b border-white/10 py-10 bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border" style={{ borderColor: `${headingColor}50`, backgroundColor: `${headingColor}15` }}>
                  <Sparkles className="w-6 h-6" style={{ color: headingColor }} />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold tracking-wide">Artisan Craftsmanship</h4>
                  <p className="text-xs opacity-75 mt-0.5">Hand-embroidered silks & pure Korean Nidha</p>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border" style={{ borderColor: `${headingColor}50`, backgroundColor: `${headingColor}15` }}>
                  <Truck className="w-6 h-6" style={{ color: headingColor }} />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold tracking-wide">Complimentary Shipping</h4>
                  <p className="text-xs opacity-75 mt-0.5">On all prepaid orders above ₹2,999</p>
                </div>
              </div>

              <div className="flex items-center justify-center md:justify-start space-x-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border" style={{ borderColor: `${headingColor}50`, backgroundColor: `${headingColor}15` }}>
                  <ShieldCheck className="w-6 h-6" style={{ color: headingColor }} />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold tracking-wide">Certified Modest Fit</h4>
                  <p className="text-xs opacity-75 mt-0.5">100% opaque, graceful tailored drape</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Manifesto */}
          {footerSettings.showBrandStory && (
            <div className="space-y-4">
              <h3 className="font-serif text-2xl tracking-widest" style={{ color: headingColor }}>{brandName}</h3>
              <p className="text-xs leading-relaxed opacity-75">
                {brandTagline}
              </p>
              <p className="text-xs opacity-60">
                {footerSettings.contactAddress || 'Commercial Street, Bangalore, India'}<br />
                {footerSettings.contactEmail || 'care@zaynaabaya.com'} • {footerSettings.contactPhone || '+91 9876543210'}
              </p>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs opacity-70 hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                <span>Follow us on Instagram</span>
              </a>
            </div>
          )}

          {/* Catalog Links */}
          {footerSettings.showCollections && (
            <div>
              <h4 className="font-serif text-sm uppercase tracking-wider mb-4" style={{ color: headingColor }}>Collections</h4>
              <ul className="space-y-2 text-xs opacity-80">
                <li><Link href="/shop?category=everyday-essentials" className="hover:opacity-100 transition-opacity">Everyday Essentials</Link></li>
                <li><Link href="/shop?category=luxury-occasion" className="hover:opacity-100 transition-opacity">Luxury Occasion Wear</Link></li>
                <li><Link href="/shop?category=open-front-kimonos" className="hover:opacity-100 transition-opacity">Open Front & Kimonos</Link></li>
                <li><Link href="/shop?category=eid-festive" className="hover:opacity-100 transition-opacity">Eid & Festive Edits</Link></li>
                <li><Link href="/shop?category=silk-chiffon-hijabs" className="hover:opacity-100 transition-opacity">Silk & Modal Sheylas</Link></li>
              </ul>
            </div>
          )}

          {/* Customer Care */}
          {footerSettings.showCustomerCare && (
            <div>
              <h4 className="font-serif text-sm uppercase tracking-wider mb-4" style={{ color: headingColor }}>Customer Care</h4>
              <ul className="space-y-2 text-xs opacity-80">
                <li><Link href="/track" className="hover:opacity-100 transition-opacity">Track Order</Link></li>
                <li><Link href="/account" className="hover:opacity-100 transition-opacity">My Account</Link></li>
                <li><Link href="/cart" className="hover:opacity-100 transition-opacity">Shopping Bag</Link></li>
                <li><Link href="/shop" className="hover:opacity-100 transition-opacity">Size Guide & Sizing Chart</Link></li>
                <li><Link href="/#faq" className="hover:opacity-100 transition-opacity">Shipping & Return FAQs</Link></li>
              </ul>
            </div>
          )}

          {/* VIP Newsletter */}
          {footerSettings.showNewsletter && (
            <div>
              <h4 className="font-serif text-sm uppercase tracking-wider mb-4" style={{ color: headingColor }}>VIP Cercle Privé</h4>
              <p className="text-xs opacity-75 leading-relaxed mb-3">
                Subscribe for private preview access to limited seasonal capsule drops and private client privileges.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for joining the VIP Circle.'); }} className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  required
                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-xs placeholder-white/50 focus:outline-none focus:border-brand-gold"
                  style={{ color: textColor }}
                />
                <button
                  type="submit"
                  className="w-full py-2 text-xs font-semibold uppercase tracking-wider rounded hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                  style={{ backgroundColor: headingColor, color: bgColor }}
                >
                  Join VIP Circle
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] opacity-60 space-y-4 sm:space-y-0">
          <p>{footerSettings.customCopyright || `© ${new Date().getFullYear()} ${brandName}. All rights reserved. Elegance Redefined.`}</p>
          <div className="flex space-x-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Shipping Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
