'use client';

import React, { useEffect, useState } from 'react';
import { HeroSlider } from '../components/home/HeroSlider';
import { ValueProps } from '../components/home/ValueProps';
import { CategoryBanners } from '../components/home/CategoryBanners';
import { BestsellersGrid } from '../components/home/BestsellersGrid';
import { BrandStory } from '../components/home/BrandStory';
import { InstagramFeed } from '../components/home/InstagramFeed';
import { FAQSection } from '../components/home/FAQSection';
import { contentApi, HomepageContent } from '../lib/api/content.api';
import { productsApi } from '../lib/api/products.api';
import { settingsApi } from '../lib/api/settings.api';
import { ICategory, IProduct, ISiteSettings, IHomepageSection } from '../types';

const defaultSections: IHomepageSection[] = [
  { id: 'hero', name: 'Hero Campaign (Image / Video)', enabled: true, order: 1 },
  { id: 'valueProps', name: 'Value Propositions', enabled: true, order: 2 },
  { id: 'categories', name: 'Curated Collections Showcase', enabled: true, order: 3 },
  { id: 'bestsellers', name: 'Coveted Bestsellers Grid', enabled: true, order: 4 },
  { id: 'brandStory', name: 'Atelier Craftsmanship Story', enabled: true, order: 5 },
  { id: 'instagram', name: 'Instagram Lookbook Journal', enabled: true, order: 6 },
  { id: 'faqs', name: 'Client Concierge & Sizing FAQs', enabled: true, order: 7 }
];

export default function HomePage() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [bestsellers, setBestsellers] = useState<IProduct[]>([]);
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [contentData, categoriesData, productsRes, settingsRes] = await Promise.allSettled([
          contentApi.getHomepageContent(),
          productsApi.getCategories(),
          productsApi.getProducts({ sort: 'bestseller', limit: 8 }),
          settingsApi.getPublicSettings()
        ]);

        if (contentData.status === 'fulfilled') {
          setContent(contentData.value);
        }
        if (categoriesData.status === 'fulfilled') {
          setCategories(categoriesData.value);
        }
        if (productsRes.status === 'fulfilled') {
          setBestsellers(productsRes.value.products);
        }
        if (settingsRes.status === 'fulfilled') {
          setSettings(settingsRes.value);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter out any duplicate announcement section since announcement bar is rendered globally above navbar
  const activeSections = (
    settings?.homepageSections && settings.homepageSections.length > 0
      ? settings.homepageSections.filter((sec) => sec.id !== 'announcement')
      : defaultSections
  ).sort((a, b) => a.order - b.order);

  const heroSlides = settings?.heroSection?.slides?.length
    ? settings.heroSection.slides
    : content?.banners || [];

  return (
    <div className="flex flex-col min-h-screen">
      {activeSections.map((sec) => {
        if (!sec.enabled) return null;

        switch (sec.id) {
          case 'hero':
            return <HeroSlider key="hero" banners={heroSlides} />;
          case 'valueProps':
            return <ValueProps key="valueProps" />;
          case 'categories':
            return (
              <CategoryBanners
                key="categories"
                categories={categories}
                sectionConfig={settings?.categoriesSection}
              />
            );
          case 'bestsellers':
            return <BestsellersGrid key="bestsellers" products={bestsellers} />;
          case 'brandStory':
            return <BrandStory key="brandStory" story={settings?.brandStory} />;
          case 'instagram':
            return (
              <InstagramFeed
                key="instagram"
                posts={settings?.instagramPosts?.length ? settings.instagramPosts : (content?.instagram || [])}
              />
            );
          case 'faqs':
            return (
              <FAQSection
                key="faqs"
                faqs={settings?.faqs?.length ? settings.faqs : (content?.faqs || [])}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
