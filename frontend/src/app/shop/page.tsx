'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, SlidersHorizontal, ChevronDown, X, Sparkles } from 'lucide-react';
import { productsApi } from '../../lib/api/products.api';
import { IProduct, ICategory } from '../../types';
import { ProductCard } from '../../components/shop/ProductCard';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeCategory = searchParams.get('category') || '';
  const activeSort = searchParams.get('sort') || 'newest';
  const searchQuery = searchParams.get('q') || '';

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState<number>(1000000); // in paise (₹10,000)

  const availableSizes = ['52', '54', '56', '58', '60'];

  const loadShopData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        productsApi.getCategories(),
        productsApi.getProducts({
          category: activeCategory || undefined,
          sort: activeSort as any,
          q: searchQuery || undefined
        })
      ]);

      if (results[0].status === 'fulfilled') {
        setCategories(results[0].value);
      }

      if (results[1].status === 'fulfilled') {
        setProducts(results[1].value.products || []);
      } else {
        throw new Error('Unable to fetch products at this time');
      }
    } catch (err: any) {
      console.error('Failed to load catalog', err);
      setError(err?.message || 'We could not load our catalog. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeSort, searchQuery]);

  useEffect(() => {
    loadShopData();
  }, [loadShopData]);

  // Client-side filtering for size and price slider
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const price = p.salePrice || p.price;
      if (price > priceMax) return false;

      if (selectedSizes.length > 0) {
        const hasSize = p.variants?.some((v) => v.size && selectedSizes.includes(v.size));
        if (!hasSize) return false;
      }

      return true;
    });
  }, [products, selectedSizes, priceMax]);

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    router.push(`/shop?${params.toString()}`);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    router.push(`/shop?${params.toString()}`);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setPriceMax(1000000);
    router.push('/shop');
  };

  return (
    <div className="bg-brand-cream min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs & Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-semibold tracking-[0.25em] uppercase text-brand-mocha">
            {activeCategory ? activeCategory.replace('-', ' ') : 'The Complete Collection'}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-brand-noir font-normal">
            Bespoke Modest Silhouettes
          </h1>
          {searchQuery && (
            <p className="text-xs text-brand-noir/70">
              Showing search results for &ldquo;<span className="font-semibold">{searchQuery}</span>&rdquo;
            </p>
          )}
          <div className="w-12 h-0.5 bg-brand-gold mx-auto mt-2" />
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border border-brand-border rounded-lg p-4 mb-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-brand-noir bg-brand-sand px-3 py-2 rounded"
            >
              <Filter className="w-3.5 h-3.5 text-brand-mocha" />
              <span>Filters</span>
            </button>
            <span className="text-xs text-brand-noir/70">
              {loading ? (
                <span className="text-brand-mocha font-medium animate-pulse">Loading luxury creations...</span>
              ) : (
                <>Showing <span className="font-bold text-brand-noir">{filteredProducts.length}</span> creations</>
              )}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-brand-noir/60 hidden sm:inline">Sort by:</span>
            <select
              value={activeSort}
              onChange={handleSortChange}
              aria-label="Sort products"
              className="bg-brand-sand/60 border border-brand-border rounded px-3 py-1.5 text-xs text-brand-noir font-medium focus:outline-none focus:border-brand-mocha"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="bestseller">Bestsellers First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-8 bg-white p-6 rounded-lg border border-brand-border shadow-sm h-fit">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <h3 className="font-serif text-base text-brand-noir font-medium flex items-center">
                <SlidersHorizontal className="w-4 h-4 text-brand-mocha mr-2" />
                Refine Selection
              </h3>
              {(selectedSizes.length > 0 || activeCategory) && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] text-brand-mocha hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-serif uppercase tracking-wider font-semibold text-brand-noir mb-3">
                Categories
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`text-left w-full transition-colors ${
                      !activeCategory ? 'font-bold text-brand-mocha' : 'text-brand-noir/70 hover:text-brand-noir'
                    }`}
                  >
                    All Creations
                  </button>
                </li>
                {categories.map((c) => (
                  <li key={c._id}>
                    <button
                      onClick={() => handleCategoryChange(c.slug)}
                      className={`text-left w-full transition-colors ${
                        activeCategory === c.slug
                          ? 'font-bold text-brand-mocha'
                          : 'text-brand-noir/70 hover:text-brand-noir'
                      }`}
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sizes */}
            <div className="pt-4 border-t border-brand-border">
              <h4 className="text-xs font-serif uppercase tracking-wider font-semibold text-brand-noir mb-3">
                Abaya Length / Size
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sz) => {
                  const isSelected = selectedSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`w-10 h-8 rounded text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-brand-mocha text-white shadow-sm'
                          : 'bg-brand-sand text-brand-noir/80 hover:bg-brand-border'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trust Assurance in sidebar */}
            <div className="pt-4 border-t border-brand-border text-[11px] text-brand-noir/70 space-y-2 bg-brand-sand/50 p-3 rounded">
              <p className="font-semibold text-brand-noir flex items-center">
                <Sparkles className="w-3 h-3 text-brand-gold mr-1" />
                Complimentary Keepsake Box
              </p>
              <p>Every piece arrives in our bespoke magnetic gift box with matching silk sheyla.</p>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-lg p-3 border border-brand-border space-y-3 animate-pulse">
                    <div className="aspect-[3/4] bg-brand-sand rounded-md w-full" />
                    <div className="h-3.5 bg-brand-sand rounded w-3/4" />
                    <div className="h-3 bg-brand-sand/60 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg border border-brand-border p-12 text-center space-y-4 shadow-sm">
                <p className="font-serif text-xl text-brand-noir">Unable to Load Catalog</p>
                <p className="text-xs text-brand-noir/60 max-w-sm mx-auto">
                  {error}
                </p>
                <button
                  onClick={() => loadShopData()}
                  className="px-6 py-2 bg-brand-mocha text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-brand-mocha-dark transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg border border-brand-border p-12 text-center space-y-4">
                <p className="font-serif text-xl text-brand-noir">No matching creations found</p>
                <p className="text-xs text-brand-noir/60 max-w-sm mx-auto">
                  Try adjusting your filter selection or search query to explore more styles.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-brand-mocha text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-brand-mocha-dark transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="bg-white w-4/5 max-w-xs h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                <h3 className="font-serif text-lg text-brand-noir">Filter Catalog</h3>
                <button onClick={() => setMobileFilterOpen(false)} aria-label="Close filters">
                  <X className="w-5 h-5 text-brand-noir/60" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-serif uppercase tracking-wider font-semibold text-brand-noir mb-2">
                  Category
                </h4>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => { handleCategoryChange(''); setMobileFilterOpen(false); }}
                    className="block py-1 text-brand-mocha font-semibold"
                  >
                    All Collections
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => { handleCategoryChange(c.slug); setMobileFilterOpen(false); }}
                      className="block py-1 text-brand-noir/70 hover:text-brand-noir"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-xs font-serif uppercase tracking-wider font-semibold text-brand-noir mb-2">
                  Length / Size
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => toggleSize(sz)}
                      className={`w-9 h-8 rounded text-xs font-semibold ${
                        selectedSizes.includes(sz)
                          ? 'bg-brand-mocha text-white'
                          : 'bg-brand-sand text-brand-noir'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full mt-6 bg-brand-mocha text-white py-3 rounded text-xs font-semibold uppercase tracking-wider"
            >
              Apply Filters
            </button>
          </div>
          <div className="flex-1" onClick={() => setMobileFilterOpen(false)} />
        </div>
      )}
    </div>
  );
}

function ShopSkeleton() {
  return (
    <div className="bg-brand-cream min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2 animate-pulse">
          <div className="h-4 bg-brand-sand rounded w-32 mx-auto" />
          <div className="h-8 bg-brand-sand rounded w-64 mx-auto mt-2" />
          <div className="w-12 h-0.5 bg-brand-gold mx-auto mt-2" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-lg p-3 border border-brand-border space-y-3">
              <div className="aspect-[3/4] bg-brand-sand rounded-md w-full" />
              <div className="h-3.5 bg-brand-sand rounded w-3/4" />
              <div className="h-3 bg-brand-sand/60 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopContent />
    </Suspense>
  );
}
