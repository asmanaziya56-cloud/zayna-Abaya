'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { authApi } from '../../../lib/api/auth.api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Password reset token is missing. Please click the link in your email again.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long for security.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both fields.');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        'The password reset token is invalid or has expired. Please request a new one.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="font-serif text-xl text-brand-noir">Invalid Reset Link</h2>
        <p className="text-xs text-brand-noir/70 leading-relaxed">
          No reset token was found in the link. Please request a new link using your registered email address.
        </p>
        <Link
          href="/auth/forgot-password"
          className="inline-block bg-brand-mocha text-white text-xs font-semibold px-6 py-2.5 rounded-lg hover:bg-brand-mocha-dark transition-colors"
        >
          Request New Password Reset Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-serif text-2xl text-brand-noir">Password Successfully Reset!</h2>
          <p className="text-xs text-brand-noir/70 leading-relaxed">
            Your credentials have been updated securely. All previous active sessions have been signed out.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/auth/login')}
          className="w-full bg-brand-mocha hover:bg-brand-mocha-dark text-white py-3 rounded text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>Sign In With New Password</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-brand-noir/80 mb-1">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full bg-brand-sand/30 border border-brand-border rounded pl-9 pr-10 py-2.5 text-xs focus:outline-none focus:border-brand-mocha"
          />
          <Lock className="w-4 h-4 text-brand-noir/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-noir/40 hover:text-brand-noir cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-brand-noir/80 mb-1">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="w-full bg-brand-sand/30 border border-brand-border rounded pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-brand-mocha"
          />
          <Lock className="w-4 h-4 text-brand-noir/40 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="p-3 bg-brand-sand/20 rounded-lg border border-brand-border text-[11px] text-brand-noir/60 space-y-1">
        <div className="flex items-center space-x-1 font-semibold text-brand-noir/80">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-mocha" />
          <span>Security Requirements:</span>
        </div>
        <p>• Minimum 8 characters in length</p>
        <p>• Changing your password revokes old active sessions on other devices</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-mocha hover:bg-brand-mocha-dark text-white py-3 rounded text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
      >
        <span>{loading ? 'Updating Password...' : 'Save New Password & Sign In'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="pt-2 text-center">
        <Link
          href="/auth/login"
          className="text-xs text-brand-noir/60 hover:text-brand-mocha transition-colors"
        >
          Cancel and return to Sign In
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-brand-cream min-h-[80vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-xl border border-brand-border shadow-luxury space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-semibold tracking-[0.25em] text-brand-mocha">
            Atelier Account Protection
          </span>
          <h1 className="font-serif text-3xl text-brand-noir font-normal">
            Create New Password
          </h1>
          <p className="text-xs text-brand-noir/60 leading-relaxed">
            Please enter and confirm your new confidential credentials below.
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-6 text-xs text-brand-noir/60">Loading verification token...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
