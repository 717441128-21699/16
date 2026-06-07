import { create } from 'zustand';
import type { MarketItem, ItemPriceHistory } from '../data/market';
import { marketItems, priceHistory } from '../data/market';

export interface Order {
  id: string;
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
  type: 'buy' | 'sell';
  createdAt: number;
  status: 'active' | 'completed' | 'cancelled';
}

interface MarketState {
  items: MarketItem[];
  priceHistory: ItemPriceHistory[];
  myOrders: Order[];
}

interface MarketActions {
  listItem: (item: Omit<MarketItem, 'stock'> & { id?: string; listedAt?: number; quantity: number }) => void;
  buyItem: (itemId: string, quantity: number) => boolean;
  cancelListing: (orderId: string) => void;
  getPriceSuggestion: (itemId: string) => number;
}

export const useMarketStore = create<MarketState & MarketActions>((set, get) => ({
  items: marketItems,
  priceHistory,
  myOrders: [],

  listItem: (item) => {
    const order: Order = {
      id: `order-${Date.now()}`,
      itemId: item.id ?? `custom-${Date.now()}`,
      itemName: item.name,
      price: item.currentPrice,
      quantity: item.quantity,
      type: 'sell',
      createdAt: Date.now(),
      status: 'active',
    };
    set((state) => ({
      myOrders: [order, ...state.myOrders],
      items: item.id
        ? state.items
        : [
            ...state.items,
            {
              ...item,
              id: `custom-${Date.now()}`,
              listedAt: Date.now(),
              stock: item.quantity,
            },
          ],
    }));
  },

  buyItem: (itemId, quantity) => {
    const item = get().items.find((i) => i.id === itemId);
    if (!item || item.stock < quantity) return false;

    set((state) => ({
      items: state.items.map((i) => (i.id === itemId ? { ...i, stock: i.stock - quantity } : i)),
    }));
    return true;
  },

  cancelListing: (orderId) =>
    set((state) => ({
      myOrders: state.myOrders.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' as const } : o)),
    })),

  getPriceSuggestion: (itemId) => {
    const history = get().priceHistory.find((h) => h.itemId === itemId);
    if (!history || history.history.length === 0) {
      const item = get().items.find((i) => i.id === itemId);
      return item?.basePrice ?? 0;
    }
    const recent = history.history.slice(-3);
    return Math.round(recent.reduce((sum, r) => sum + r.price, 0) / recent.length);
  },
}));
