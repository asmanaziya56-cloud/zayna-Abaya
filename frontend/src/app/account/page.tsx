'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Package,
  LogOut,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../../components/providers/AuthProvider';
import { ordersApi } from '../../lib/api/orders.api';
import { apiClient } from '../../lib/api/client';
import { IOrder } from '../../types';
import { formatINR } from '../../lib/utils/currency';

function Alert({ type, msg }: { type: 'success' | 'error'; msg: string }) {
  return (
    <div
      className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2.5 border ${
        type === 'success'
          ? 'bg-green-50 border-green-200 text-green-700'
          : 'bg-red-50 border-red-200 text-red-700'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      )}
      <span>{msg}</span>
    </div>
  );
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-semibold text-brand-noir/70 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pr-10 pl-3 py-2.5 border border-brand-border rounded-lg text-sm bg-white text-brand-noir focus:outline-none focus:ring-2 focus:ring-brand-mocha/30"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-noir/40 hover:text-brand-noir transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, isAdmin } = useAuth();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' });
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwOpen, setPwOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      setNameValue(user.name);
      ordersApi.getMyOrders().then(setOrders).finally(() => setOrdersLoading(false));
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleSaveName = async () => {
    if (!nameValue.trim() || nameValue.trim().length < 2) {
      setNameMsg({ type: 'error', text: 'Name must be at least 2 characters.' });
      return;
    }
    setNameSaving(true);
    setNameMsg(null);
    try {
      await apiClient.patch('/users/me', { name: nameValue.trim() });
      setNameMsg({ type: 'success', text: 'Name updated successfully!' });
      setEditingName(false);
    } catch (e: any) {
      setNameMsg({ type: 'error', text: e?.message || 'Failed to update name.' });
    } finally {
      setNameSaving(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.newEmail || !emailForm.currentPassword) {
      setEmailMsg({ type: 'error', text: 'Both fields are required.' });
      return;
    }
    setEmailSaving(true);
    setEmailMsg(null);
    try {
      await apiClient.patch('/users/me/email', emailForm);
      setEmailMsg({ type: 'success', text: 'Email changed! Logging you out — sign in with your new email.' });
      setEmailForm({ newEmail: '', currentPassword: '' });
      setTimeout(async () => {
        await logout();
        router.push('/auth/login');
      }, 2500);
    } catch (e: any) {
      setEmailMsg({ type: 'error', text: e?.message || 'Failed to change email.' });
    } finally {
      setEmailSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setPwMsg({ type: 'error', text: 'All fields are required.' });
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await apiClient.patch('/users/me/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      setPwMsg({ type: 'success', text: 'Password changed! Logging you out — sign in with your new password.' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(async () => {
        await logout();
        router.push('/auth/login');
      }, 2500);
    } catch (e: any) {
      setPwMsg({ type: 'error', text: e?.message || 'Failed to change password.' });
    } finally {
      setPwSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto py-24 text-center font-serif text-sm">
        Opening client dashboard...
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-brand-border shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-brand-sand border border-brand-gold/40 flex items-center justify-center font-serif text-2xl text-brand-mocha">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="border border-brand-border rounded-lg px-3 py-1.5 text-sm font-serif text-brand-noir focus:outline-none focus:ring-2 focus:ring-brand-mocha/30 w-48"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') { setEditingName(false); setNameValue(user.name); }
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={nameSaving}
                    className="p-1.5 rounded-lg bg-brand-mocha text-white hover:bg-brand-mocha-dark disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNameValue(user.name); setNameMsg(null); }}
                    className="p-1.5 rounded-lg border border-brand-border hover:bg-brand-sand text-brand-noir"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <h1 className="font-serif text-2xl text-brand-noir">{user.name}</h1>
                    {isAdmin && (
                      <span className="bg-brand-mocha text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                        Staff Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => { setEditingName(true); setNameMsg(null); }}
                    className="p-1 rounded hover:bg-brand-sand text-brand-noir/40 hover:text-brand-mocha transition-colors"
                    title="Edit name"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {nameMsg && <div className="mt-1"><Alert type={nameMsg.type} msg={nameMsg.text} /></div>}
              <p className="text-xs text-brand-noir/60 mt-0.5">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isAdmin && (
              <Link href="/admin" className="px-4 py-2 bg-brand-sand hover:bg-brand-border text-brand-noir text-xs uppercase font-semibold tracking-wider rounded transition-colors">
                Admin Backoffice
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-4 py-2 border border-brand-border hover:bg-red-50 text-brand-noir hover:text-red-700 text-xs font-semibold uppercase tracking-wider rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl border border-brand-border shadow-sm p-6 sm:p-8 space-y-5">
          <h2 className="font-serif text-xl text-brand-noir flex items-center gap-2 pb-4 border-b border-brand-border">
            <Lock className="w-5 h-5 text-brand-mocha" />
            Security &amp; Account Settings
          </h2>

          {/* Change Email */}
          <div className="rounded-lg border border-brand-border overflow-hidden">
            <button
              onClick={() => { setEmailOpen(!emailOpen); setEmailMsg(null); }}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-brand-sand/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-mocha" />
                <div>
                  <p className="text-sm font-semibold text-brand-noir">Change Email Address</p>
                  <p className="text-xs text-brand-noir/50">Current: {user.email}</p>
                </div>
              </div>
              <ArrowRight className={`w-4 h-4 text-brand-noir/40 transition-transform duration-200 ${emailOpen ? 'rotate-90' : ''}`} />
            </button>
            {emailOpen && (
              <form onSubmit={handleChangeEmail} className="px-4 pb-5 pt-2 space-y-4 border-t border-brand-border bg-brand-cream/30">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-brand-noir/70 uppercase tracking-wider">New Email Address</label>
                  <input
                    type="email"
                    value={emailForm.newEmail}
                    onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                    placeholder="new@example.com"
                    className="w-full px-3 py-2.5 border border-brand-border rounded-lg text-sm bg-white text-brand-noir focus:outline-none focus:ring-2 focus:ring-brand-mocha/30"
                    required
                  />
                </div>
                <PasswordInput
                  id="email-current-pw"
                  label="Confirm with Current Password"
                  value={emailForm.currentPassword}
                  onChange={(v) => setEmailForm({ ...emailForm, currentPassword: v })}
                  placeholder="Enter your current password"
                />
                {emailMsg && <Alert type={emailMsg.type} msg={emailMsg.text} />}
                <button type="submit" disabled={emailSaving} className="px-5 py-2.5 bg-brand-mocha text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-brand-mocha-dark disabled:opacity-50 transition-colors">
                  {emailSaving ? 'Updating...' : 'Update Email'}
                </button>
              </form>
            )}
          </div>

          {/* Change Password */}
          <div className="rounded-lg border border-brand-border overflow-hidden">
            <button
              onClick={() => { setPwOpen(!pwOpen); setPwMsg(null); }}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-brand-sand/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-brand-mocha" />
                <div>
                  <p className="text-sm font-semibold text-brand-noir">Change Password</p>
                  <p className="text-xs text-brand-noir/50">Set a new login password</p>
                </div>
              </div>
              <ArrowRight className={`w-4 h-4 text-brand-noir/40 transition-transform duration-200 ${pwOpen ? 'rotate-90' : ''}`} />
            </button>
            {pwOpen && (
              <form onSubmit={handleChangePassword} className="px-4 pb-5 pt-2 space-y-4 border-t border-brand-border bg-brand-cream/30">
                <PasswordInput
                  id="pw-current"
                  label="Current Password"
                  value={pwForm.currentPassword}
                  onChange={(v) => setPwForm({ ...pwForm, currentPassword: v })}
                  placeholder="Your current password"
                />
                <PasswordInput
                  id="pw-new"
                  label="New Password"
                  value={pwForm.newPassword}
                  onChange={(v) => setPwForm({ ...pwForm, newPassword: v })}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                />
                <PasswordInput
                  id="pw-confirm"
                  label="Confirm New Password"
                  value={pwForm.confirmPassword}
                  onChange={(v) => setPwForm({ ...pwForm, confirmPassword: v })}
                  placeholder="Repeat new password"
                />
                <p className="text-[11px] text-brand-noir/40">
                  Must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number.
                </p>
                {pwMsg && <Alert type={pwMsg.type} msg={pwMsg.text} />}
                <button type="submit" disabled={pwSaving} className="px-5 py-2.5 bg-brand-mocha text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-brand-mocha-dark disabled:opacity-50 transition-colors">
                  {pwSaving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-xl border border-brand-border shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-brand-border">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-brand-mocha" />
              <h2 className="font-serif text-xl text-brand-noir">Your Purchases &amp; Orders</h2>
            </div>
            <span className="text-xs text-brand-noir/60">{orders.length} orders recorded</span>
          </div>
          {ordersLoading ? (
            <p className="text-xs text-brand-noir/60 py-6 text-center">Loading order history...</p>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="font-serif text-base text-brand-noir">No orders placed yet</p>
              <p className="text-xs text-brand-noir/60 max-w-sm mx-auto">
                Explore our festive edits and everyday silhouettes to begin your modest wardrobe journey.
              </p>
              <Link href="/shop" className="inline-block mt-2 px-6 py-2.5 bg-brand-mocha text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-brand-mocha-dark transition-colors">
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-brand-border">
              {orders.map((order) => (
                <div key={order._id} className="py-5 first:pt-0 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-mono font-bold text-brand-mocha text-sm block sm:inline mr-3">#{order.orderNumber}</span>
                      <span className="text-brand-noir/50">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="capitalize font-semibold text-[11px] bg-brand-sand px-2.5 py-1 rounded-full text-brand-noir">{order.fulfillmentStatus}</span>
                      <span className="font-serif font-bold text-sm text-brand-noir">{formatINR(order.pricing.totalAmount)}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-brand-sand/30 p-3 rounded-lg border border-brand-sand">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="font-medium text-brand-noir truncate mr-2">{item.title} {item.size && `(Size ${item.size})`} x{item.quantity}</span>
                        <span className="text-brand-noir/70 shrink-0">{formatINR(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Link href={`/track?order=${order.orderNumber}`} className="text-xs font-semibold text-brand-mocha hover:underline inline-flex items-center">
                      <span>Track Shipment Status</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
