import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '../components/providers/QueryProvider';
import { AuthProvider } from '../components/providers/AuthProvider';
import { CartProvider } from '../components/providers/CartProvider';
import { WishlistProvider } from '../components/providers/WishlistProvider';
import { AnnouncementBar } from '../components/layout/AnnouncementBar';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CartDrawer } from '../components/cart/CartDrawer';

export const metadata: Metadata = {
  title: 'Zayna Abaya | Luxury Modest Fashion & Designer Abayas',
  description: 'Handcrafted luxury abayas, festive kaftans, and fine silk sheylas. Tailored with Korean Nidha and Firdaus crepe for timeless modest elegance.',
  keywords: ['abaya', 'luxury abaya', 'modest fashion', 'eid collection', 'kaftan', 'hijab', 'sheyla'],
  other: {
    'color-scheme': 'light',
    'supported-color-schemes': 'light'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" style={{ colorScheme: 'light', forcedColorAdjust: 'none' }}>
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </head>
      <body style={{ colorScheme: 'light', forcedColorAdjust: 'none' }} className="min-h-screen flex flex-col antialiased selection:bg-brand-gold/30 selection:text-brand-noir bg-white text-[#1A1A1A]">
        <QueryProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <AnnouncementBar />
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
                <CartDrawer />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
