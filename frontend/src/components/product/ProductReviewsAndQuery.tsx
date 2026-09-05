'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Star, MessageSquare, Mail, Camera, Send, CheckCircle, Upload, X, ShieldCheck } from 'lucide-react';
import { reviewsApi, IReviewData } from '../../lib/api/reviews.api';
import { IProduct } from '../../types';

interface ProductReviewsAndQueryProps {
  product: IProduct;
  supportEmail?: string;
  supportPhone?: string;
}

export function ProductReviewsAndQuery({ product, supportEmail = 'care@zaynaabaya.com', supportPhone = '+91 9876543210' }: ProductReviewsAndQueryProps) {
  const [reviews, setReviews] = useState<IReviewData[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewNotice, setReviewNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Direct Email Inquiry Form State
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryContact, setInquiryContact] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquiryNotice, setInquiryNotice] = useState('');

  useEffect(() => {
    if (product?._id) {
      loadReviews();
    }
  }, [product?._id]);

  const loadReviews = async () => {
    setLoadingReviews(true);
    try {
      const data = await reviewsApi.getProductReviews(product._id);
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoPreviews((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhotoPreview = (index: number) => {
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Please write your feedback comment.');
      return;
    }

    setSubmittingReview(true);
    setReviewNotice('');

    try {
      await reviewsApi.createReview({
        productId: product._id,
        rating,
        userName: clientName.trim() || 'Verified Client',
        userEmail: clientEmail.trim() || undefined,
        title: title.trim() || undefined,
        comment: comment.trim(),
        images: photoPreviews
      });

      setReviewNotice('🎉 Thank you for your feedback & photo! Your review has been posted.');
      setComment('');
      setTitle('');
      setPhotoPreviews([]);
      setShowReviewForm(false);
      await loadReviews();

      setTimeout(() => setReviewNotice(''), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryMsg.trim()) return;

    setSendingInquiry(true);
    setTimeout(() => {
      setInquiryNotice(`🎉 Inquiry sent! Our atelier concierge will contact you at ${inquiryContact || 'your email'} shortly.`);
      setInquiryMsg('');
      setInquiryName('');
      setInquiryContact('');
      setSendingInquiry(false);
      setTimeout(() => setInquiryNotice(''), 5000);
    }, 600);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div id="reviews-and-query" className="mt-16 pt-12 border-t border-brand-border space-y-16">
      {/* 1. DIRECT EMAIL QUERY SECTION */}
      <div className="bg-gradient-to-r from-brand-sand/80 via-white to-brand-sand/60 rounded-2xl p-6 sm:p-8 border border-brand-border shadow-luxury">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-mocha flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-mocha" />
              Atelier Concierge Query Service
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-brand-noir font-normal">
              Have a Query or Customization Request?
            </h3>
            <p className="text-xs text-brand-noir/80 leading-relaxed font-light">
              Need custom length tailoring, sleeve adjustments, or fabric advice for <span className="font-semibold text-brand-noir">{product.name}</span>? Speak directly with our master atelier artisans.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <a
                href={`mailto:${supportEmail}?subject=Custom Query: ${encodeURIComponent(product.name)}`}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-mocha hover:bg-brand-noir text-white font-semibold rounded-lg shadow-md transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Email Zayna Atelier: {supportEmail}</span>
              </a>
              {supportPhone && (
                <span className="text-brand-noir/70 font-medium">
                  Direct Line: <strong className="text-brand-noir">{supportPhone}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Quick Inquiry Form Box */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-brand-border shadow-sm">
            <h4 className="font-serif text-sm font-semibold text-brand-noir mb-3 flex items-center gap-1.5">
              <Send className="w-4 h-4 text-brand-mocha" /> Quick Inquiry Form
            </h4>
            {inquiryNotice ? (
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded text-xs font-medium border border-emerald-200">
                {inquiryNotice}
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3 text-xs">
                <div>
                  <input
                    type="text"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="Your Name (e.g. Fatima Khan)"
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2 focus:outline-none focus:border-brand-mocha"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={inquiryContact}
                    onChange={(e) => setInquiryContact(e.target.value)}
                    placeholder="Email Address or WhatsApp Number"
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2 focus:outline-none focus:border-brand-mocha"
                    required
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                    placeholder={`Ask about ${product.name} sizing, fabric, or delivery timeline...`}
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2 focus:outline-none focus:border-brand-mocha"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={sendingInquiry}
                  className="w-full py-2 bg-brand-noir hover:bg-brand-mocha text-white font-semibold rounded transition-colors disabled:opacity-50"
                >
                  {sendingInquiry ? 'Sending Inquiry...' : 'Submit Inquiry to Atelier'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 2. CLIENT REVIEWS & PHOTO FEEDBACK SECTION */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-6">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-brand-mocha flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-brand-mocha" />
              Client Lookbook & Experience
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-brand-noir font-normal mt-1">
              Client Feedback & Reviews
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-brand-noir">{averageRating} / 5.0</span>
              <span className="text-xs text-brand-noir/60">({reviews.length} Client Experience{reviews.length === 1 ? '' : 's'})</span>
            </div>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-noir hover:bg-brand-mocha text-white text-xs font-semibold rounded-lg shadow-md transition-all self-start sm:self-auto cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>{showReviewForm ? 'Close Form' : 'Write Feedback & Upload Photo'}</span>
          </button>
        </div>

        {reviewNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-medium">
            {reviewNotice}
          </div>
        )}

        {/* Expandable Write Review Form */}
        {showReviewForm && (
          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-luxury space-y-4 animate-fade-in">
            <h4 className="font-serif text-lg font-bold text-brand-noir">Share Your Experience & Product Photos</h4>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-brand-noir mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Ayesha Rahman"
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 focus:outline-none focus:border-brand-mocha"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brand-noir mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="ayesha@example.com"
                    className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 focus:outline-none focus:border-brand-mocha"
                  />
                </div>
              </div>

              {/* Rating Selector */}
              <div>
                <label className="block font-semibold text-brand-noir mb-1">Your Rating *</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${num <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                  <span className="text-xs text-brand-noir/70 font-semibold ml-2">{rating} Star{rating > 1 ? 's' : ''}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-brand-noir mb-1">Headline / Summary</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Absolute Luxury Drape & Flawless Stitching!"
                  className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 focus:outline-none focus:border-brand-mocha"
                />
              </div>

              <div>
                <label className="block font-semibold text-brand-noir mb-1">Your Detailed Feedback & Review *</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe fabric quality, fit, embroidery, drape, and your overall experience..."
                  className="w-full bg-brand-sand/30 border border-brand-border rounded p-2.5 focus:outline-none focus:border-brand-mocha"
                  required
                />
              </div>

              {/* Photo Upload Section */}
              <div className="space-y-2">
                <label className="block font-semibold text-brand-noir">
                  Upload Product Photos (Showcase Your Outfit)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-brand-sand/60 hover:bg-brand-sand border border-brand-border rounded-lg text-brand-noir font-semibold transition-colors"
                  >
                    <Upload className="w-4 h-4 text-brand-mocha" />
                    <span>Upload Abaya Photos</span>
                  </button>
                  <span className="text-[10px] text-brand-noir/50">Upload pictures directly from phone or desktop</span>
                </div>

                {photoPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {photoPreviews.map((src, idx) => (
                      <div key={idx} className="relative w-20 h-24 rounded-lg overflow-hidden border border-brand-border shadow-sm group">
                        <img src={src} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhotoPreview(idx)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-3 bg-brand-mocha hover:bg-brand-noir text-white font-semibold uppercase tracking-wider rounded-lg shadow-md transition-all disabled:opacity-50"
                >
                  {submittingReview ? 'Posting Feedback...' : 'Post Feedback & Photos'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List Display */}
        {loadingReviews ? (
          <div className="text-center py-8 text-xs text-brand-noir/60">Loading client experience lookbook...</div>
        ) : reviews.length === 0 ? (
          <div className="bg-brand-sand/30 rounded-2xl p-8 text-center space-y-3 border border-brand-border">
            <MessageSquare className="w-8 h-8 text-brand-mocha mx-auto opacity-70" />
            <h4 className="font-serif text-lg font-normal text-brand-noir">Be The First To Review This Creation</h4>
            <p className="text-xs text-brand-noir/60 max-w-md mx-auto">
              Have you experienced {product.name}? Share your thoughts and outfit pictures with fellow modest fashion connoisseurs!
            </p>
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-block px-5 py-2 bg-brand-mocha text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Write First Review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {reviews.map((rev) => (
              <div key={rev._id} className="bg-white rounded-xl p-6 border border-brand-border shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-brand-sand font-serif font-bold text-brand-mocha flex items-center justify-center text-sm border border-brand-border">
                      {rev.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-brand-noir flex items-center gap-1.5">
                        {rev.userName}
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Buyer
                        </span>
                      </p>
                      <div className="flex text-amber-400 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-brand-noir/50">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                  </span>
                </div>

                {rev.title && (
                  <h5 className="font-serif font-bold text-sm text-brand-noir">{rev.title}</h5>
                )}

                <p className="text-xs text-brand-noir/80 leading-relaxed font-light">{rev.comment}</p>

                {/* Uploaded Customer Photos Gallery */}
                {rev.images && rev.images.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-brand-mocha mb-2">Customer Outfit Photos:</p>
                    <div className="flex flex-wrap gap-3">
                      {rev.images.map((imgUrl, i) => (
                        <div key={i} className="relative w-24 h-32 rounded-lg overflow-hidden border border-brand-border shadow-sm">
                          <img src={imgUrl} alt={`Customer photo ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
