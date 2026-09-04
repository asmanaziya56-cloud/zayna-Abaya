'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../components/providers/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { login, refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      await refreshUser();
      router.push('/account');
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        'Unable to sign in. Please verify your credentials or check if your account is locked.'
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
            Welcome to Zayna
          </span>
          <h1 className="font-serif text-3xl text-brand-noir font-normal">
            Client Sign In
          </h1>
          <p className="text-xs text-brand-noir/60 leading-relaxed">
            Access your saved sizing profiles, order history, and exclusive private previews.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand-noir/80 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-brand-sand/30 border border-brand-border rounded pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-brand-mocha"
              />
              <Mail className="w-4 h-4 text-brand-noir/40 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-brand-noir/80">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-[11px] text-brand-mocha hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-brand-sand/30 border border-brand-border rounded pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-brand-mocha"
              />
              <Lock className="w-4 h-4 text-brand-noir/40 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-mocha hover:bg-brand-mocha-dark text-white py-3 rounded text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-brand-border text-center space-y-2">
          <p className="text-xs text-brand-noir/70">
            Do not have an account yet?{' '}
            <Link href="/auth/register" className="text-brand-mocha font-semibold hover:underline">
              Create Client Account
            </Link>
          </p>
          <p className="text-[11px] text-brand-noir/50">
            Default Admin Login: admin@zaynaabaya.com (Password: Admin@Zayna2026)
          </p>
        </div>
      </div>
    </div>
  );
}
