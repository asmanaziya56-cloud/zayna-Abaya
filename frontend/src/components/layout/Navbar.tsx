'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, Heart, X, User, ArrowRight } from 'lucide-react';
import { useCart } from '../providers/CartProvider';
import { useAuth } from '../providers/AuthProvider';
import { useWishlist } from '../providers/WishlistProvider';
import { settingsApi } from '../../lib/api/settings.api';
import { ISiteSettings } from '../../types';

export function Navbar() {
  const router = useRouter();
  const { cartCount, openDrawer } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin } = useAuth();
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState<ISiteSettings | null>(null);

  useEffect(() => {
    settingsApi.getPublicSettings().then((s) => {
      if (s) setSettings(s);
    }).catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const defaultNavLinks = [
    { name: 'Shop All Collections', href: '/shop', highlight: false },
    { name: 'Everyday Essentials', href: '/shop?category=everyday-essentials', highlight: false },
    { name: 'Luxury Occasion Wear', href: '/shop?category=luxury-occasion', highlight: false },
    { name: 'Open Front & Kimonos', href: '/shop?category=open-front-kimonos', highlight: false },
    { name: 'Eid & Festive Edits ✨', href: '/shop?category=eid-festive', highlight: true },
    { name: 'Silk & Chiffon Hijabs', href: '/shop?category=silk-chiffon-hijabs', highlight: false }
  ];

  const drawerLinks = settings?.navbar?.drawerLinks && settings.navbar.drawerLinks.length > 0
    ? settings.navbar.drawerLinks
    : defaultNavLinks;

  const bgColor = settings?.navbar?.bgColor || '#FFFFFF';
  const textColor = settings?.navbar?.textColor || '#1A1A1A';
  const borderColor = settings?.navbar?.borderColor || '#E5E0D8';
  const drawerBgColor = settings?.navbar?.drawerBgColor || '#1A2F5A';
  const drawerTextColor = settings?.navbar?.drawerTextColor || '#FFFFFF';
  const drawerAccentColor = settings?.navbar?.drawerAccentColor || '#C5A880';
  const isWhiteNav = bgColor.toUpperCase() === '#FFFFFF' || bgColor.toLowerCase() === 'white';

  return (
    <>
      <header
        className="sticky top-0 z-40 transition-colors duration-300 backdrop-blur-md shadow-xs"
        style={{
          backgroundColor: bgColor,
          color: textColor,
          borderBottom: `1px solid ${borderColor}`
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Minimalist Staggered Menu Button (=_) */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setMenuDrawerOpen(true)}
                className="p-2 transition-colors flex flex-col justify-center items-start space-y-1.5 group cursor-pointer"
                style={{ color: textColor }}
                aria-label="Open navigation menu"
                title="Menu"
              >
                {/* Top line */}
                <span
                  className="w-5 h-[2px] transition-colors rounded-full block group-hover:bg-brand-mocha"
                  style={{ backgroundColor: textColor }}
                />
                {/* Bottom line - staggered shorter to mimic '=_' */}
                <span
                  className="w-3.5 h-[2px] transition-colors rounded-full block group-hover:bg-brand-mocha"
                  style={{ backgroundColor: textColor }}
                />
              </button>
            </div>

            {/* Center: Brand Logo */}
            <div className="flex-1 flex justify-center items-center">
              <Link href="/" className="inline-block py-1 group">
                <Image
                  src={settings?.brand?.logoUrl || '/logo.jpg'}
                  alt={settings?.brand?.name || 'Zayna Abaya'}
                  width={200}
                  height={75}
                  priority
                  unoptimized
                  className="h-12 sm:h-14 w-auto object-contain transition-opacity duration-300 group-hover:opacity-90"
                />
              </Link>
            </div>

            {/* Right: Search, Wishlist, and Cart options */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Option */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-2 transition-colors cursor-pointer hover:text-brand-mocha"
                style={{ color: textColor }}
                aria-label="Search collection"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Option */}
              <Link
                href="/account/wishlist"
                className="relative p-2 transition-colors cursor-pointer hover:text-brand-mocha"
                style={{ color: textColor }}
                aria-label="Wishlist"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-brand-gold text-brand-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Option */}
              <button
                type="button"
                onClick={openDrawer}
                className="relative p-2 transition-colors cursor-pointer hover:text-brand-mocha"
                style={{ color: textColor }}
                aria-label="Shopping bag"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-brand-gold text-brand-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Live Search Modal Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="bg-brand-cream border border-brand-border rounded-xl shadow-2xl w-full max-w-2xl p-6 relative animate-fade-in text-brand-noir">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute right-4 top-4 text-brand-noir/60 hover:text-brand-noir p-1"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl text-brand-noir mb-4">Search Zayna Boutique</h3>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search abayas, silks, nidha, festive collections..."
                autoFocus
                className="w-full bg-white border border-brand-border rounded-lg pl-12 pr-24 py-3 text-sm focus:outline-none focus:border-brand-mocha focus:ring-1 focus:ring-brand-mocha text-brand-noir"
              />
              <Search className="w-5 h-5 text-brand-noir/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-mocha text-white px-4 py-1.5 rounded-md text-xs font-semibold hover:bg-brand-mocha-dark transition-colors"
              >
                Search
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-brand-noir/70">
              <span className="font-semibold text-brand-noir">Popular searches:</span>
              <button
                onClick={() => {
                  router.push('/shop?category=everyday-essentials');
                  setSearchOpen(false);
                }}
                className="hover:underline text-brand-mocha"
              >
                Everyday Black Abaya
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  router.push('/shop?category=eid-festive');
                  setSearchOpen(false);
                }}
                className="hover:underline text-brand-mocha"
              >
                Gold Kaftan
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  router.push('/shop?category=open-front-kimonos');
                  setSearchOpen(false);
                }}
                className="hover:underline text-brand-mocha"
              >
                Linen Kimono
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Navigation Menu Drawer (opened by '=') */}
      {menuDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex">
          <div
            className="w-4/5 max-w-sm h-full shadow-2xl flex flex-col justify-between p-6 sm:p-8 animate-slide-in border-r"
            style={{
              backgroundColor: drawerBgColor,
              color: drawerTextColor,
              borderColor: 'rgba(255, 255, 255, 0.12)'
            }}
          >
            <div>
              {/* Header with Logo and Close button */}
              <div className="flex items-center justify-between pb-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}>
                <Image
                  src={settings?.brand?.logoUrl || '/logo.jpg'}
                  alt="Zayna Abaya"
                  width={150}
                  height={56}
                  className="h-9 w-auto object-contain"
                />
                <button
                  onClick={() => setMenuDrawerOpen(false)}
                  className="p-1.5 opacity-70 hover:opacity-100 rounded-md transition-opacity cursor-pointer"
                  style={{ color: drawerTextColor }}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Category Links (Fully customizable from Admin) */}
              <div className="mt-8 flex flex-col space-y-4 font-serif text-lg">
                {drawerLinks.map((link, idx) => {
                  const isHighlight = Boolean(link.highlight);
                  return (
                    <Link
                      key={idx}
                      href={link.href}
                      onClick={() => setMenuDrawerOpen(false)}
                      className="transition-colors flex items-center justify-between group py-1.5"
                      style={{
                        color: isHighlight ? drawerAccentColor : drawerTextColor
                      }}
                    >
                      <span className={`tracking-wide ${isHighlight ? 'font-medium' : ''}`}>
                        {link.name}
                      </span>
                      <ArrowRight
                        className={`w-4 h-4 transition-all ${
                          isHighlight
                            ? 'opacity-100 translate-x-0'
                            : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'
                        }`}
                        style={{ color: drawerAccentColor }}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Client & Account Links */}
            <div className="pt-6 border-t space-y-3.5 text-xs opacity-90" style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}>
              {user ? (
                <Link
                  href="/account"
                  onClick={() => setMenuDrawerOpen(false)}
                  className="flex items-center hover:opacity-100 transition-opacity"
                  style={{ color: drawerTextColor }}
                >
                  <User className="w-4 h-4 mr-2 shrink-0" style={{ color: drawerAccentColor }} />
                  <span>My Client Profile ({user.name})</span>
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMenuDrawerOpen(false)}
                  className="flex items-center hover:opacity-100 transition-opacity"
                  style={{ color: drawerTextColor }}
                >
                  <User className="w-4 h-4 mr-2 shrink-0" style={{ color: drawerAccentColor }} />
                  <span>Sign In / Register</span>
                </Link>
              )}

              <Link
                href="/track"
                onClick={() => setMenuDrawerOpen(false)}
                className="block hover:opacity-100 transition-opacity"
                style={{ color: drawerTextColor }}
              >
                Track Shipment Status
              </Link>

              <Link
                href="/cart"
                onClick={() => setMenuDrawerOpen(false)}
                className="block hover:opacity-100 transition-opacity"
                style={{ color: drawerTextColor }}
              >
                Shopping Bag ({cartCount})
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuDrawerOpen(false)}
                  className="inline-block mt-1 px-3 py-1 rounded font-semibold text-[11px] uppercase tracking-wider hover:opacity-90 transition-opacity shadow-xs"
                  style={{
                    backgroundColor: drawerAccentColor,
                    color: drawerBgColor
                  }}
                >
                  Atelier Backoffice
                </Link>
              )}

              <div className="pt-2 text-[10px] opacity-50" style={{ color: drawerTextColor }}>
                {settings?.footer?.contactEmail || 'care@zaynaabaya.com'} • {settings?.footer?.contactAddress || 'Commercial St, Bangalore'}
              </div>
            </div>
          </div>
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setMenuDrawerOpen(false)} />
        </div>
      )}
    </>
  );
}
