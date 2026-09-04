'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';
import { authApi } from '../../../lib/api/auth.api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [devResetLink, setDevResetLink] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.forgotPassword(email);
      setSubmitted(true);
      setMessage(res.message || 'If that email address exists in our system, a password reset link has been sent to your Gmail inbox.');
      if (res.resetLink) {
        setDevResetLink(res.resetLink);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        'Unable to process password reset request. Please try again or contact concierge support.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-cream min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-xl border border-brand-border shadow-luxury space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-semibold tracking-[0.25em] text-brand-mocha">
            Account Security
          </span>
          <h1 className="font-serif text-3xl text-brand-noir font-normal">
            Reset Password
          </h1>
          <p className="text-xs text-brand-noir/60 leading-relaxed">
            Enter your registered email address below. We will send a secure password reset link directly to your Gmail inbox.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg text-brand-noir">Email Dispatched</h3>
              <p className="text-xs text-brand-noir/70 leading-relaxed">
                {message}
              </p>
              <p className="text-[11px] text-brand-noir/50 mt-2">
                Please check your inbox (and spam/promotions folder). The link will expire in 60 minutes.
              </p>
            </div>

            {devResetLink && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-left space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Direct Reset Link (Quick Access)</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  You can click below to open the reset password screen immediately:
                </p>
                <a
                  href={devResetLink}
                  className="inline-flex items-center space-x-1 text-xs font-medium text-brand-mocha hover:underline"
                >
                  <span>Open Password Reset Screen</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div className="pt-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-mocha hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Client Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-brand-noir/80 mb-1">
                Gmail or Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-brand-sand/30 border border-brand-border rounded pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-brand-mocha"
                />
                <Mail className="w-4 h-4 text-brand-noir/40 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-mocha hover:bg-brand-mocha-dark text-white py-3 rounded text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Sending Instructions...' : 'Send Reset Link to Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center space-x-1 text-xs text-brand-noir/60 hover:text-brand-mocha transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
