'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../components/providers/AuthProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await register(name, email, password);
      setSuccess(res.message || 'Registration successful! Please check your email to verify your account.');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2500);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        'Unable to create account. Password must have at least 8 characters with upper, lower, number, and special character.'
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
            Join The Atelier
          </span>
          <h1 className="font-serif text-3xl text-brand-noir font-normal">
            Create Client Profile
          </h1>
          <p className="text-xs text-brand-noir/60 leading-relaxed">
            Register to enjoy bespoke order tracking, saved measurement profiles, and member-only drops.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success} Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand-noir/80 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fatima Khan"
                className="w-full bg-brand-sand/30 border border-brand-border rounded pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-brand-mocha"
              />
              <User className="w-4 h-4 text-brand-noir/40 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-noir/80 mb-1">
              Email Address *
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
            <label className="block text-xs font-medium text-brand-noir/80 mb-1">
              Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters with Aa1@"
                className="w-full bg-brand-sand/30 border border-brand-border rounded pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-brand-mocha"
              />
              <Lock className="w-4 h-4 text-brand-noir/40 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <span className="text-[10px] text-brand-noir/50 mt-1 block">
              Must include 1 uppercase, 1 lowercase, 1 number, and 1 symbol.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-mocha hover:bg-brand-mocha-dark text-white py-3 rounded text-xs font-semibold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Profile...' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-brand-border text-center">
          <p className="text-xs text-brand-noir/70">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand-mocha font-semibold hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
