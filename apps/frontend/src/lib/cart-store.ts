import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  subtotal: number;
  expressFee: number;
  total: number;
  lastUpdated: number;

  // Actions
  addItem: (product: Product, quantity: number, customizations: any, expressApplied: boolean) => void;
  updateItem: (itemId: string, updates: Partial<CartItem>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  applyExpressGlobal: (apply: boolean) => void;
  clear: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const calculateTotals = (items: CartItem[]): { subtotal: number; expressFee: number; total: number } => {
  let subtotal = 0;
  let expressFee = 0;

  items.forEach((item) => {
    subtotal += item.subtotal;
    expressFee += item.expressFee;
  });

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    expressFee: Math.round(expressFee * 100) / 100,
    total: Math.round((subtotal + expressFee) * 100) / 100,
  };
};

const generateCartItemId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      expressFee: 0,
      total: 0,
      lastUpdated: Date.now(),

      addItem: (product: Product, quantity: number, customizations: any, expressApplied: boolean) => {
        set((state) => {
          const unitPrice = product.price;
          const subtotal = unitPrice * quantity;
          const expressFee = expressApplied ? subtotal * 0.5 : 0;

          const newItem: CartItem = {
            id: generateCartItemId(),
            productId: product.id,
            product,
            quantity,
            unitPrice,
            expressApplied,
            customizations,
            subtotal: Math.round(subtotal * 100) / 100,
            expressFee: Math.round(expressFee * 100) / 100,
          };

          const newItems = [...state.items, newItem];
          const totals = calculateTotals(newItems);

          return {
            items: newItems,
            ...totals,
            lastUpdated: Date.now(),
          };
        });
      },

      updateItem: (itemId: string, updates: Partial<CartItem>) => {
        set((state) => {
          const newItems = state.items.map((item) =>
            item.id === itemId ? { ...item, ...updates } : item,
          );
          const totals = calculateTotals(newItems);

          return {
            items: newItems,
            ...totals,
            lastUpdated: Date.now(),
          };
        });
      },

      removeItem: (itemId: string) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== itemId);
          const totals = calculateTotals(newItems);

          return {
            items: newItems,
            ...totals,
            lastUpdated: Date.now(),
          };
        });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity < 1 || quantity > 100) return;

        set((state) => {
          const newItems = state.items.map((item) => {
            if (item.id === itemId) {
              const newSubtotal = item.unitPrice * quantity;
              const newExpressFee = item.expressApplied ? newSubtotal * 0.5 : 0;

              return {
                ...item,
                quantity,
                subtotal: Math.round(newSubtotal * 100) / 100,
                expressFee: Math.round(newExpressFee * 100) / 100,
              };
            }
            return item;
          });

          const totals = calculateTotals(newItems);

          return {
            items: newItems,
            ...totals,
            lastUpdated: Date.now(),
          };
        });
      },

      applyExpressGlobal: (apply: boolean) => {
        set((state) => {
          const newItems = state.items.map((item) => {
            const newSubtotal = item.unitPrice * item.quantity;
            const newExpressFee = apply ? newSubtotal * 0.5 : 0;

            return {
              ...item,
              expressApplied: apply,
              expressFee: Math.round(newExpressFee * 100) / 100,
            };
          });

          const totals = calculateTotals(newItems);

          return {
            items: newItems,
            ...totals,
            lastUpdated: Date.now(),
          };
        });
      },

      clear: () => {
        set({
          items: [],
          subtotal: 0,
          expressFee: 0,
          total: 0,
          lastUpdated: Date.now(),
        });
      },

      getTotal: () => {
        return get().total;
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'sweet-grace-cart',
      version: 1,
    },
  ),
);
