'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, CartItem } from './types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    { name: 'printpod-auth' }
  )
);

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.product_id === item.product_id && i.size === item.size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id && i.size === item.size
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product_id === productId && i.size === size)
          ),
        })),
      updateQuantity: (productId, size, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === productId && i.size === size
              ? { ...i, quantity }
              : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      total: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.selling_price * item.quantity,
          0
        ),
    }),
    { name: 'printpod-cart' }
  )
);
