'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ICart, ICartItem } from '../../types';
import { cartApi } from '../../lib/api/cart.api';

interface CartContextType {
  cart: ICart | null;
  items: ICartItem[];
  cartCount: number;
  subtotal: number;
  totalAmount: number;
  freeShippingRemaining: number;
  freeShippingThreshold: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (params: { productId: string; variantId?: string; quantity: number }) => Promise<void>;
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
  const [cart, setCart] = useState<ICart | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch {
      // If error, keep existing cart or fallback
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const addItem = async (params: { productId: string; variantId?: string; quantity: number }) => {
    setLoading(true);
    try {
      const updated = await cartApi.addItem(params);
      setCart(updated);
      setIsDrawerOpen(true); // Open drawer upon adding to cart
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
      setCart(updated);
    } catch (err) {
      console.error('Failed to update quantity', err);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const updated = await cartApi.removeItem(itemId);
      setCart(updated);
    } catch (err) {
      console.error('Failed to remove item', err);
    }
  };

  const applyCoupon = async (code: string) => {
    const updated = await cartApi.applyCoupon(code);
    setCart(updated);
  };

  const removeCoupon = async () => {
    const updated = await cartApi.removeCoupon();
    setCart(updated);
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
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
