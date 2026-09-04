'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Sparkles } from 'lucide-react';
import { settingsApi } from '../../lib/api/settings.api';
import { contentApi } from '../../lib/api/content.api';

export function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [bgColor, setBgColor] = useState('#8E6E53');
  const [textColor, setTextColor] = useState('#FAF7F2');
  const [fontFamily, setFontFamily] = useState('Cinzel, sans-serif');
  const [active, setActive] = useState(true);
  const [dismissible, setDismissible] = useState(true);
  const [isMovable, setIsMovable] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [textAlign, setTextAlign] = useState<'center' | 'left' | 'right'>('center');

  useEffect(() => {
    // Try settings API first for full design styling
    settingsApi
      .getPublicSettings()
      .then((settings) => {
        if (settings?.announcementBar) {
          const ab = settings.announcementBar;
          setActive(ab.active !== false);
          setAnnouncement(ab.message || null);
          setLink(ab.link || null);
          if (ab.bgColor) setBgColor(ab.bgColor);
          if (ab.textColor) setTextColor(ab.textColor);
          if (ab.fontFamily) setFontFamily(ab.fontFamily);
          if (typeof ab.dismissible === 'boolean') setDismissible(ab.dismissible);
          if (typeof ab.isMovable === 'boolean') setIsMovable(ab.isMovable);
          if (ab.scrollSpeed) setScrollSpeed(ab.scrollSpeed);
          if (ab.textAlign) setTextAlign(ab.textAlign);
        } else {
          // Fallback to content API
          fetchFromContentApi();
        }
      })
      .catch(() => {
        fetchFromContentApi();
      });

    function fetchFromContentApi() {
      contentApi
        .getHomepageContent()
        .then((data) => {
          if (data?.announcement && data.announcement.active) {
            setAnnouncement(data.announcement.message);
            if (data.announcement.link) setLink(data.announcement.link);
          } else {
            setAnnouncement('✨ Complimentary Luxury Keepsake Box & Free Express Shipping on orders above ₹2,999 | Code: EIDMUBARAK');
          }
        })
        .catch(() => {
          setAnnouncement('✨ Complimentary Luxury Keepsake Box & Free Express Shipping on orders above ₹2,999 | Code: EIDMUBARAK');
        });
    }
  }, []);

  if (dismissed || !active || !announcement) return null;

  const speedSeconds = scrollSpeed === 'slow' ? 34 : scrollSpeed === 'fast' ? 14 : 22;

  const itemContent = (
    <span className="inline-flex items-center mx-6 sm:mx-10 whitespace-nowrap shrink-0">
      <Sparkles className="w-3.5 h-3.5 mr-2 shrink-0 animate-pulse inline" style={{ color: textColor }} />
      {link ? (
        <Link
          href={link}
          className="hover:underline transition-opacity hover:opacity-85"
          style={{ color: textColor }}
        >
          {announcement}
        </Link>
      ) : (
        <span style={{ color: textColor }}>{announcement}</span>
      )}
    </span>
  );

  const staticAlignClass =
    textAlign === 'left'
      ? 'justify-start text-left pl-4 pr-10'
      : textAlign === 'right'
      ? 'justify-end text-right pr-12 pl-4'
      : 'justify-center text-center px-8';

  return (
    <div
      className="text-xs sm:text-sm py-2 transition-all relative border-b border-black/10 shadow-xs overflow-hidden"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: fontFamily
      }}
    >
      {isMovable ? (
        <div className="overflow-hidden w-full relative flex select-none py-0.5">
          <style jsx>{`
            @keyframes marqueeScroll {
              0% {
                transform: translateX(0%);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            .marquee-track {
              display: inline-flex;
              width: max-content;
              animation: marqueeScroll ${speedSeconds}s linear infinite;
              will-change: transform;
            }
            .marquee-track:hover {
              animation-play-state: paused;
            }
          `}</style>
          <div className="marquee-track">
            {itemContent}
            {itemContent}
            {itemContent}
            {itemContent}
          </div>
        </div>
      ) : (
        <div className={`max-w-7xl mx-auto flex items-center font-medium tracking-wide ${staticAlignClass}`}>
          <Sparkles className="w-3.5 h-3.5 mr-2 shrink-0 animate-pulse" style={{ color: textColor }} />
          {link ? (
            <Link
              href={link}
              className="hover:underline transition-opacity hover:opacity-80 truncate"
              style={{ color: textColor }}
            >
              {announcement}
            </Link>
          ) : (
            <span style={{ color: textColor }} className="truncate">
              {announcement}
            </span>
          )}
        </div>
      )}

      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-75 transition-opacity z-10 bg-black/10 rounded-full"
          style={{ color: textColor }}
          aria-label="Dismiss announcement"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
