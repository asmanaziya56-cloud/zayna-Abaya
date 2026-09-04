'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { IInstagramPost } from '../../types';
import { settingsApi } from '../../lib/api/settings.api';

interface InstagramFeedProps {
  posts: IInstagramPost[];
}

export function InstagramFeed({ posts }: InstagramFeedProps) {
  const [instagramHandle, setInstagramHandle] = useState('@zaynaabaya');
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/zaynaabaya');
  const [settingsPosts, setSettingsPosts] = useState<IInstagramPost[]>([]);

  useEffect(() => {
    settingsApi.getPublicSettings().then((s) => {
      if (s?.social?.instagram) {
        const handle = s.social.instagram.startsWith('@')
          ? s.social.instagram
          : '@' + s.social.instagram;
        setInstagramHandle(handle);
        const raw = s.social.instagram.replace('@', '').replace('https://instagram.com/', '').replace('https://www.instagram.com/', '');
        setInstagramUrl('https://instagram.com/' + raw);
      }
      if (s?.instagramPosts && s.instagramPosts.length > 0) {
        setSettingsPosts(s.instagramPosts);
      }
    }).catch(() => {});
  }, []);

  // Prefer: (1) settings posts, (2) prop posts, (3) fallback Unsplash images
  const items = settingsPosts.length > 0
    ? settingsPosts
    : posts && posts.length > 0
      ? posts
      : [
          { _id: '1', imageUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600&auto=format&fit=crop', caption: 'Everyday elegance', postUrl: instagramUrl },
          { _id: '2', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop', caption: 'Gold zari handcrafted cuffs', postUrl: instagramUrl },
          { _id: '3', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop', caption: 'Desert linen kimono drape', postUrl: instagramUrl },
          { _id: '4', imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=600&auto=format&fit=crop', caption: 'Pure modal silk sheylas', postUrl: instagramUrl }
        ];

  return (
    <section className="py-20 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-lg mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold tracking-[0.2em] uppercase text-brand-mocha">
            <Camera className="w-3.5 h-3.5 text-brand-gold" />
            <span>{instagramHandle}</span>
          </div>
          <h2 className="font-serif text-3xl text-brand-noir font-normal">
            The Zayna Journal
          </h2>
          <p className="text-xs text-brand-noir/70">
            Tag #ZaynaWoman to be featured in our seasonal client lookbook.
          </p>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-mocha hover:text-brand-mocha-light transition-colors mt-1"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
            </svg>
            <span>Follow on Instagram</span>
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {items.slice(0, 4).map((post, idx) => (
            <a
              key={post._id || idx}
              href={post.postUrl || instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-lg overflow-hidden bg-brand-sand border border-brand-border block"
            >
              <Image
                src={post.imageUrl}
                alt={post.caption || 'Zayna Abaya lookbook'}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 text-center">
                <div className="space-y-1">
                  <Camera className="w-6 h-6 text-white drop-shadow-md mx-auto" />
                  {post.caption && (
                    <p className="text-white text-[10px] leading-snug drop-shadow">{post.caption}</p>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
