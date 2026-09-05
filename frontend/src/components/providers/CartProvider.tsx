'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { ICart, ICartItem } from '../../types';
import { cartApi } from '../../lib/api/cart.api';
import { tokenStore } from '../../lib/auth/tokenStore';

interface CartContextType {
  cart: ICart | null;
  items: ICartItem[];
  cartCount: number;
  subtotal: number;
  totalAmount: number;
  freeShippingRemaining: number;
  freeShippingThreshold: number;
  isDrawerOpen: boolean;
  isInitialized: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (params: { productId: string; variantId?: string; quantity: number }, shouldOpenDrawer?: boolean) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 299900; // ₹2,999 in paise

export function CartProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [cart, setCart] = useState<ICart | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Automatically close cart drawer whenever navigating to checkout or cart pages
  useEffect(() => {
    if (pathname === '/checkout' || pathname === '/cart') {
      setIsDrawerOpen(false);
    }
  }, [pathname]);

  const updateCartState = useCallback((newCart: ICart | null) => {
    setCart(newCart);
    try {
      if (typeof window !== 'undefined') {
        if (newCart) {
          localStorage.setItem('zayna_cart', JSON.stringify(newCart));
        } else {
          localStorage.removeItem('zayna_cart');
        }
      }
    } catch {}
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const data = await cartApi.getCart();
      if (data) {
        if (Array.isArray(data.items) && data.items.length > 0) {
          updateCartState(data);
        } else {
          // If server returns empty, check if we currently have valid items in memory or storage
          setCart((current) => {
            if (current && Array.isArray(current.items) && current.items.length > 0) {
              return current; // Retain active items so cart is never wiped unexpectedly
            }
            updateCartState(data);
            return data;
          });
        }
      }
    } catch {
      // If error, keep existing cart
    }
  }, [updateCartState]);

  useEffect(() => {
    // 1. Immediately hydrate from localStorage for 0ms delay
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('zayna_cart');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
            setCart(parsed);
          }
        }
      }
    } catch {}

    // 2. Fetch fresh cart from server
    refreshCart().finally(() => {
      setIsInitialized(true);
    });

    // 3. Re-fetch whenever user logs in or auth token updates
    const unsubscribe = tokenStore.subscribe((token) => {
      if (token) {
        refreshCart();
      }
    });
    return () => unsubscribe();
  }, [refreshCart]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const addItem = async (
    params: { productId: string; variantId?: string; quantity: number },
    shouldOpenDrawer: boolean = true
  ) => {
    setLoading(true);
    try {
      const updated = await cartApi.addItem(params);
      updateCartState(updated);
      if (shouldOpenDrawer) {
        setIsDrawerOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeItem(itemId);
        return;
      }
      const updated = await cartApi.updateQuantity(itemId, quantity);
      updateCartState(updated);
    } catch (err) {
      console.error('Failed to update quantity', err);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const updated = await cartApi.removeItem(itemId);
      updateCartState(updated);
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  const applyCoupon = async (code: string) => {
    const updated = await cartApi.applyCoupon(code);
    updateCartState(updated);
  };

  const removeCoupon = async () => {
    const updated = await cartApi.removeCoupon();
    updateCartState(updated);
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      updateCartState(null);
      await refreshCart();
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  const items = cart?.items || [];
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart?.subtotal || 0;
  const totalAmount = cart?.totalAmount || 0;
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        cartCount,
        subtotal,
        totalAmount,
        freeShippingRemaining,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        isDrawerOpen,
        isInitialized,
        openDrawer,
        closeDrawer,
        addItem,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        clearCart,
        refreshCart,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
