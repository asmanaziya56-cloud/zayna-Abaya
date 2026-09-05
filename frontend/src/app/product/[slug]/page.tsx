'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  Sparkles,
  Ruler,
  Truck,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Heart,
  Share2,
  Check,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Film
} from 'lucide-react';
import { productsApi } from '../../../lib/api/products.api';
import { settingsApi } from '../../../lib/api/settings.api';
import { IProduct, IProductVariant } from '../../../types';
import { formatINR, calculateDiscountPercent } from '../../../lib/utils/currency';
import { useCart } from '../../../components/providers/CartProvider';
import { useWishlist } from '../../../components/providers/WishlistProvider';
import { SizeGuideModal } from '../../../components/product/SizeGuideModal';
import { ProductReviewsAndQuery } from '../../../components/product/ProductReviewsAndQuery';
import { ProductCard } from '../../../components/shop/ProductCard';

const COLOR_HEX_MAP: Record<string, string> = {
  'noir black': '#1A1A1A',
  'black': '#1A1A1A',
  'emerald green': '#0B3B24',
  'green': '#0B3B24',
  'deep wine': '#4A0E17',
  'maroon': '#4A0E17',
  'burgundy': '#4A0E17',
  'sand beige': '#C2A382',
  'beige': '#C2A382',
  'slate navy': '#1B263B',
  'navy': '#1B263B',
  'navy blue': '#1B263B',
  'rose taupe': '#8C5D63',
  'rose': '#8C5D63',
  'mocha brown': '#4A3728',
  'mocha': '#4A3728',
  'brown': '#4A3728',
  'olive green': '#3D4529',
  'olive': '#3D4529',
  'dusty lilac': '#7D6B7D',
  'lilac': '#7D6B7D',
  'pearl white': '#EAE6DF',
  'white': '#FFFFFF',
  'cream': '#FDFBF7',
  'grey': '#6B7280',
  'gray': '#6B7280',
  'silver': '#CBD5E1',
  'gold': '#D4AF37',
  'champagne': '#F7E7CE',
};

function getColorHex(name?: string): string {
  if (!name) return '#1A1A1A';
  const clean = name.toLowerCase().trim();
  if (COLOR_HEX_MAP[clean]) return COLOR_HEX_MAP[clean];
  for (const [key, val] of Object.entries(COLOR_HEX_MAP)) {
    if (clean.includes(key)) return val;
  }
  return '#8E6E53';
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { addItem, closeDrawer } = useCart();
  const { isWishlisted: checkWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedVariant, setSelectedVariant] = useState<IProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('Noir Black');
  const [selectedSize, setSelectedSize] = useState<string>('54');
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [copied, setCopied] = useState(false);

  // Accordion state
  const [openTab, setOpenTab] = useState<'fabric' | 'shipping' | 'packaging' | null>('fabric');

  // Derive available colors and sizes across variants
  const availableColors = React.useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return [];
    const colors: string[] = [];
    product.variants.forEach((v) => {
      if (v.color && !colors.includes(v.color)) {
        colors.push(v.color);
      }
    });
    return colors;
  }, [product]);

  const availableSizes = React.useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return [];
    const sizes: string[] = [];
    product.variants.forEach((v) => {
      if (v.size && !sizes.includes(v.size)) {
        sizes.push(v.size);
      }
    });
    return sizes;
  }, [product]);

  const handleSelectColor = (colorName: string) => {
    setSelectedColor(colorName);
    if (!product?.variants) return;
    // Find matching variant with selected color and current size
    const exactMatch = product.variants.find(
      (v) => v.color?.toLowerCase() === colorName.toLowerCase() && v.size === selectedSize
    );
    if (exactMatch) {
      setSelectedVariant(exactMatch);
    } else {
      // Fallback to first variant of this color
      const colorMatch = product.variants.find(
        (v) => v.color?.toLowerCase() === colorName.toLowerCase()
      );
      if (colorMatch) {
        setSelectedVariant(colorMatch);
        if (colorMatch.size) setSelectedSize(colorMatch.size);
      }
    }
  };

  const handleSelectSize = (sizeVal: string) => {
    setSelectedSize(sizeVal);
    if (!product?.variants) return;
    // Find matching variant with selected size and current color
    const exactMatch = product.variants.find(
      (v) => v.size === sizeVal && v.color?.toLowerCase() === selectedColor.toLowerCase()
    );
    if (exactMatch) {
      setSelectedVariant(exactMatch);
    } else {
      // Fallback to first variant of this size
      const sizeMatch = product.variants.find((v) => v.size === sizeVal);
      if (sizeMatch) {
        setSelectedVariant(sizeMatch);
        if (sizeMatch.color) setSelectedColor(sizeMatch.color);
      }
    }
  };

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const [prod, settingsRes] = await Promise.allSettled([
          productsApi.getProductBySlug(slug),
          settingsApi.getPublicSettings()
        ]);

        if (settingsRes.status === 'fulfilled') {
          setSettings(settingsRes.value);
        }

        if (prod.status === 'fulfilled' && prod.value) {
          const productData = (prod.value as any)?.product || prod.value;
          setProduct(productData);
          if (productData.variants && productData.variants.length > 0) {
            const first = productData.variants[0];
            setSelectedVariant(first);
            if (first.color) setSelectedColor(first.color);
            if (first.size) setSelectedSize(first.size);
          }
          // Unblock main product view immediately
          setLoading(false);

          // Load related items in background without blocking page render
          const relatedItems = (prod.value as any)?.related;
          if (Array.isArray(relatedItems) && relatedItems.length > 0) {
            setRelatedProducts(relatedItems.filter((p: any) => p._id !== productData._id));
          } else {
            productsApi.getProducts({ limit: 8 }).then((relatedRes) => {
              setRelatedProducts(relatedRes.products.filter((p) => p._id !== productData._id));
            }).catch(() => {});
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load product', err);
        setLoading(false);
      }
    }

    if (slug) {
      loadProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-brand-cream min-h-screen py-10 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-4 w-48 bg-brand-sand rounded mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
              <div className="flex md:flex-col gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-16 h-20 bg-brand-sand rounded-lg" />
                ))}
              </div>
              <div className="flex-1 aspect-[3/4] bg-brand-sand rounded-xl" />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="h-4 w-32 bg-brand-sand rounded" />
              <div className="h-8 w-3/4 bg-brand-sand rounded" />
              <div className="h-6 w-24 bg-brand-sand rounded" />
              <div className="h-20 w-full bg-brand-sand rounded-lg" />
              <div className="h-12 w-full bg-brand-sand rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl text-brand-noir">Product Not Found</h2>
        <p className="text-xs text-brand-noir/60">This creation may have moved or been retired from the collection.</p>
        <Link href="/shop" className="inline-block px-6 py-2 bg-brand-mocha text-white text-xs uppercase font-semibold rounded">
          Browse Catalog
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.salePrice || selectedVariant?.price || product.salePrice || product.price;
  const originalPrice = selectedVariant?.price || product.price;
  const discountPercent = calculateDiscountPercent(originalPrice, currentPrice);
  // Unified Media Items (Images + Instagram Reels / Videos)
  const mediaItems: Array<{ type: 'image' | 'video'; url: string }> = React.useMemo(() => {
    if (!product) return [];
    const items: Array<{ type: 'image' | 'video'; url: string }> = [];

    // Add direct product images
    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img && typeof img === 'string' && img.trim()) {
          const isVid = /\.(mp4|webm|mov|ogg)($|\?)/i.test(img) || img.startsWith('data:video/');
          items.push({ type: isVid ? 'video' : 'image', url: img });
        }
      });
    }

    // Add product videos (ensure no duplicate URLs)
    if (Array.isArray(product.videos) && product.videos.length > 0) {
      product.videos.forEach((vid) => {
        if (vid && typeof vid === 'string' && vid.trim() && !items.some((i) => i.url === vid)) {
          items.push({ type: 'video', url: vid });
        }
      });
    }

    if (items.length === 0) {
      items.push({
        type: 'image',
        url: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1200&auto=format&fit=crop'
      });
    }

    return items;
  }, [product]);

  const activeMedia = mediaItems[selectedMediaIndex] || mediaItems[0];

  const handleSelectMedia = (idx: number) => {
    setSelectedMediaIndex(idx);
    setIsVideoPlaying(true);
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVideoMuted((prev) => !prev);
  };

  const handleAddToCart = async (shouldOpenDrawer: boolean = true) => {
    setAddingToCart(true);
    try {
      await addItem({
        productId: product._id,
        variantId: selectedVariant?._id,
        quantity
      }, shouldOpenDrawer);
      return true;
    } catch (err: any) {
      console.error('Failed to add item to bag', err);
      alert(err?.response?.data?.error?.message || 'Failed to add item to bag. Please try again.');
      return false;
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    closeDrawer();
    if (typeof window !== 'undefined' && product) {
      const buyNowItem = {
        _id: selectedVariant?._id || product._id,
        productId: product._id,
        variantId: selectedVariant?._id,
        title: product.name,
        name: product.name,
        slug: product.slug,
        price: selectedVariant?.salePrice || selectedVariant?.price || product.salePrice || product.price,
        image: (product.images && product.images[0]) || '',
        size: selectedVariant?.size || selectedSize,
        color: selectedVariant?.color || selectedColor,
        quantity: quantity || 1
      };
      sessionStorage.setItem('zayna_buynow', JSON.stringify(buyNowItem));
    }
    handleAddToCart(false).catch(() => {});
    router.push('/checkout');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-brand-cream min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="text-xs text-brand-noir/60 mb-8 flex items-center space-x-2">
          <Link href="/" className="hover:text-brand-mocha">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-brand-mocha">Catalog</Link>
          <span>/</span>
          {product.category && (
            <>
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-brand-mocha">
                {product.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-brand-noir font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Main Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            {/* Primary High-Res View / Instagram Reel Player */}
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-brand-sand border border-brand-border shadow-luxury">
              {activeMedia?.type === 'video' ? (
                <div
                  className="relative w-full h-full bg-black cursor-pointer group select-none"
                  onClick={toggleVideoPlay}
                >
                  <video
                    ref={videoRef}
                    src={activeMedia.url}
                    autoPlay
                    loop
                    playsInline
                    muted={isVideoMuted}
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                    className="w-full h-full object-cover"
                  />

                  {/* Instagram Reel Badge */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow border border-white/10 pointer-events-none">
                    <Film className="w-3.5 h-3.5 text-brand-gold" />
                    <span>REEL / VIDEO</span>
                  </div>

                  {/* Audio Mute/Unmute Toggle (Instagram Style) */}
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isVideoMuted ? 'Unmute audio' : 'Mute audio'}
                    className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 text-white flex items-center justify-center transition-all shadow border border-white/10 cursor-pointer"
                  >
                    {isVideoMuted ? (
                      <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-white animate-pulse" />
                    )}
                  </button>

                  {/* Play/Pause Center Indicator */}
                  {!isVideoPlaying && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                      <div className="w-16 h-16 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl">
                        <Play className="w-7 h-7 fill-white translate-x-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Bottom Subtitle / Tap hint */}
                  <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none text-white/80 text-[10px] bg-gradient-to-t from-black/70 to-transparent pt-4 pb-1 px-2 rounded-b-lg">
                    <span>{isVideoPlaying ? 'Tap to pause' : 'Tap to play'}</span>
                    <span>{isVideoMuted ? 'Muted · Tap speaker for sound' : 'Sound active'}</span>
                  </div>
                </div>
              ) : (
                <Image
                  src={activeMedia?.url || 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1200&auto=format&fit=crop'}
                  alt={product.name}
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              )}

              {(product.flags?.isOnSale || discountPercent > 0) && (
                <div
                  className={`absolute ${
                    activeMedia?.type === 'video' ? 'top-14 left-4' : 'top-4 left-4'
                  } z-10 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded shadow-md tracking-wider uppercase flex items-center gap-1.5 pointer-events-none`}
                >
                  <span>SALE</span>
                  {discountPercent > 0 && <span>-{discountPercent}%</span>}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {mediaItems.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {mediaItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectMedia(idx)}
                    className={`relative w-20 h-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      selectedMediaIndex === idx
                        ? 'border-brand-mocha shadow-md scale-105'
                        : 'border-brand-border/60 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <div className="relative w-full h-full bg-brand-noir">
                        <video
                          src={item.url}
                          muted
                          playsInline
                          className="w-full h-full object-cover pointer-events-none opacity-80"
                        />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1">
                          <div className="w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white">
                            <Play className="w-3 h-3 fill-white translate-x-0.5" />
                          </div>
                          <span className="text-[9px] font-bold text-white tracking-wider uppercase bg-black/60 px-1 rounded">
                            REEL
                          </span>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={item.url}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold tracking-[0.2em] text-brand-mocha">
                  {product.category?.name || 'Exclusive Edition'}
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center text-xs text-brand-noir/60 hover:text-brand-mocha p-1"
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl text-brand-noir font-normal mt-1 leading-snug">
                {product.name}
              </h1>

              <p className="text-xs text-brand-noir/50 mt-1">SKU: {selectedVariant?.sku || product.sku}</p>
            </div>

            {/* Price block */}
            <div className="flex items-center flex-wrap gap-3 pt-2">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-brand-noir">
                {formatINR(currentPrice)}
              </span>
              {originalPrice > currentPrice && (
                <span className="text-base text-brand-noir/40 line-through">
                  {formatINR(originalPrice)}
                </span>
              )}
              {(product.flags?.isOnSale || discountPercent > 0) && (
                <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded tracking-wider uppercase shadow-sm">
                  SALE {discountPercent > 0 ? `-${discountPercent}%` : ''}
                </span>
              )}
              <span className="text-xs text-emerald-700 font-medium">Taxes included</span>
            </div>

            <p className="text-xs sm:text-sm text-brand-noir/80 leading-relaxed font-light">
              {product.description}
            </p>

            {/* Color Radio Selector */}
            {availableColors.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-brand-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-semibold text-brand-noir tracking-wide uppercase">
                    Select Color: <span className="font-bold text-brand-mocha">{selectedColor}</span>
                  </span>
                  <span className="text-[11px] text-brand-noir/60">
                    {availableColors.length} {availableColors.length === 1 ? 'Color' : 'Colors'} Available
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Abaya Color Selection">
                  {availableColors.map((colorName) => {
                    const isSelected = selectedColor?.toLowerCase() === colorName.toLowerCase();
                    const swatchHex = getColorHex(colorName);
                    return (
                      <label
                        key={colorName}
                        onClick={() => handleSelectColor(colorName)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer border transition-all select-none ${
                          isSelected
                            ? 'border-brand-mocha bg-brand-sand/60 text-brand-noir ring-2 ring-brand-mocha/30 shadow-sm font-bold'
                            : 'border-brand-border bg-white text-brand-noir hover:bg-brand-sand/40 hover:border-brand-border/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name="product-color-choice"
                          value={colorName}
                          checked={isSelected}
                          onChange={() => handleSelectColor(colorName)}
                          className="w-3.5 h-3.5 text-brand-mocha focus:ring-brand-mocha accent-[#8E6E53] cursor-pointer"
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-inner shrink-0"
                          style={{ backgroundColor: swatchHex }}
                          aria-hidden="true"
                        />
                        <span>{colorName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Variant Picker & Size Guide */}
            {(availableSizes.length > 0 || (product.variants && product.variants.length > 0)) && (
              <div className="space-y-3 pt-4 border-t border-brand-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-semibold text-brand-noir tracking-wide uppercase">
                    Select Length / Size: <span className="font-bold text-brand-mocha">{selectedSize || selectedVariant?.size}</span>
                  </span>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="flex items-center space-x-1 text-brand-mocha font-medium hover:underline"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Abaya Length Guide</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {(availableSizes.length > 0 ? availableSizes : product.variants.map((v) => v.size)).map((sz) => {
                    if (!sz) return null;
                    const isSelected = (selectedSize || selectedVariant?.size) === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleSelectSize(sz)}
                        className={`min-w-[48px] h-10 px-3 rounded text-xs font-semibold uppercase transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand-mocha text-white shadow-md'
                            : 'bg-white border border-brand-border text-brand-noir hover:bg-brand-sand'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>

                {/* Live Stock availability pill */}
                {selectedVariant && (
                  <div className="text-xs flex items-center pt-1">
                    {selectedVariant.stock > 5 ? (
                      <span className="text-emerald-700 flex items-center font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 mr-2 animate-pulse" />
                        In Stock — Ships within 24 hours
                      </span>
                    ) : selectedVariant.stock > 0 ? (
                      <span className="text-amber-800 font-semibold flex items-center">
                        <span className="w-2 h-2 rounded-full bg-amber-600 mr-2" />
                        Limited Stock — Only {selectedVariant.stock} remaining in {selectedColor} / size {selectedVariant.size}
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">Out of stock in {selectedColor} / size {selectedVariant.size || selectedSize}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quantity and Primary Call-to-Actions */}
            <div className="pt-6 border-t border-brand-border space-y-3">
              <div className="flex gap-4">
                {/* Quantity selector */}
                <div className="flex items-center border border-brand-border rounded bg-white px-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2 py-2 text-brand-noir hover:text-brand-mocha"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-semibold text-brand-noir">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-2 py-2 text-brand-noir hover:text-brand-mocha"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={addingToCart || (selectedVariant ? selectedVariant.stock === 0 : false)}
                  className="flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-md text-xs font-semibold uppercase tracking-widest transition-all shadow-md disabled:opacity-50 hover:opacity-90 cursor-pointer"
                  style={{
                    backgroundColor: settings?.buttons?.addToCartBgColor || '#0B1B3D',
                    color: settings?.buttons?.addToCartTextColor || '#FFFFFF'
                  }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{addingToCart ? 'Adding to Bag...' : (settings?.buttons?.addToCartText || 'Add to Shopping Bag')}</span>
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => product && toggleWishlist(product)}
                  className={`px-4 py-3.5 border rounded-md transition-all flex items-center justify-center cursor-pointer ${
                    product && checkWishlisted(product._id)
                      ? 'border-red-500 bg-red-50 text-red-500'
                      : 'border-brand-border bg-white text-brand-noir hover:text-red-500 hover:border-red-300'
                  }`}
                  title={product && checkWishlisted(product._id) ? 'Saved in Wishlist' : 'Save to Wishlist'}
                  aria-label="Toggle Wishlist"
                >
                  <Heart className={`w-5 h-5 ${product && checkWishlisted(product._id) ? 'fill-red-500' : ''}`} />
                </button>
              </div>

              {/* Instant Buy Now Button */}
              <button
                onClick={handleBuyNow}
                disabled={selectedVariant ? selectedVariant.stock === 0 : false}
                className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-md text-xs font-semibold uppercase tracking-widest transition-all shadow-lg active:scale-[0.99] disabled:opacity-50 hover:opacity-90 cursor-pointer"
                style={{
                  backgroundColor: settings?.buttons?.buyNowBgColor || '#0B1B3D',
                  color: settings?.buttons?.buyNowTextColor || '#FFFFFF'
                }}
              >
                <span>{settings?.buttons?.buyNowText || 'Instant Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trust Strip */}
            <div className="bg-brand-sand/50 rounded-lg p-4 border border-brand-border grid grid-cols-2 gap-3 text-xs text-brand-noir/80">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-brand-mocha shrink-0" />
                <span>Free Express Delivery (₹2,999+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-brand-gold shrink-0" />
                <span>Complimentary Keepsake Box</span>
              </div>
            </div>

            {/* Details Accordion */}
            <div className="pt-4 border-t border-brand-border divide-y divide-brand-border">
              {/* Fabric & Care */}
              <div>
                <button
                  onClick={() => setOpenTab(openTab === 'fabric' ? null : 'fabric')}
                  className="w-full py-3 flex items-center justify-between text-xs uppercase font-serif font-semibold text-brand-noir tracking-wide hover:text-brand-mocha"
                >
                  <span>Fabric Specifications & Care</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openTab === 'fabric' ? 'rotate-180' : ''}`} />
                </button>
                {openTab === 'fabric' && (
                  <div className="pb-4 text-xs text-brand-noir/80 leading-relaxed font-light space-y-2">
                    <p>{product.fabricCare || 'Premium Korean Nidha & Silk blend. Featherweight opacity with fluid drape.'}</p>
                    <p>• Dry clean recommended or delicate hand wash in cold water with abaya wash liquid.</p>
                    <p>• Hang dry in shade. Low steam iron inside-out.</p>
                  </div>
                )}
              </div>

              {/* Delivery & Shipping */}
              <div>
                <button
                  onClick={() => setOpenTab(openTab === 'shipping' ? null : 'shipping')}
                  className="w-full py-3 flex items-center justify-between text-xs uppercase font-serif font-semibold text-brand-noir tracking-wide hover:text-brand-mocha"
                >
                  <span>Shipping & Hassle-Free Returns</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openTab === 'shipping' ? 'rotate-180' : ''}`} />
                </button>
                {openTab === 'shipping' && (
                  <div className="pb-4 text-xs text-brand-noir/80 leading-relaxed font-light space-y-2">
                    <p>{product.deliveryInfo || 'Dispatches within 24-48 hours. Delivered across India in 3-5 business days.'}</p>
                    <p>• 7-Day exchange guarantee for size and length adjustments.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews & Q&A */}
        {product && (
          <div className="mt-16 pt-12 border-t border-brand-border">
            <ProductReviewsAndQuery product={product} />
          </div>
        )}

        {/* Related Creations */}
        {settings?.productPage?.showYouMayAlsoAdmire !== false && relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-brand-border">
            <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-mocha">
                {settings?.productPage?.youMayAlsoAdmireSubtitle || 'Complete The Look'}
              </span>
              <h3 className="font-serif text-3xl text-brand-noir font-normal">
                {settings?.productPage?.youMayAlsoAdmireTitle || 'You May Also Admire'}
              </h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, settings?.productPage?.itemCount || 4).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sizing Modal */}
      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
}
