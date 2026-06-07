import { create } from 'zustand';
import type { MarketItem, ItemPriceHistory } from '../data/market';
import { priceHistory } from '../data/market';
import { api } from '../lib/api';
import { adaptMarketItems, adaptMarketItem } from '../lib/adapters';

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
  loading: boolean;
  error: string | null;
}

interface MarketActions {
  fetchItems: (itemType?: string) => Promise<void>;
  listItemAsync: (data: Partial<MarketItem>) => Promise<void>;
  buyItemAsync: (itemId: string, buyerId: string) => Promise<void>;
  fetchOrdersAsync: (heroId: string) => Promise<void>;
  fetchPriceHistoryAsync: (itemType: string) => Promise<void>;
  listItem: (item: Omit<MarketItem, 'stock'> & { id?: string; listedAt?: number; quantity: number }) => void;
  buyItem: (itemId: string, quantity: number) => boolean;
  cancelListing: (orderId: string) => void;
  getPriceSuggestion: (itemId: string) => number;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useMarketStore = create<MarketState & MarketActions>((set, get) => ({
  items: [],
  priceHistory,
  myOrders: [],
  loading: false,
  error: null,

  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  fetchItems: async (itemType?: string) => {
    set({ loading: true, error: null });
    try {
      const items = await api.getMarketItems(itemType);
      const adapted = adaptMarketItems(items as any[]);
      set({ items: adapted, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取市场物品失败',
        loading: false,
      });
    }
  },

  listItemAsync: async (data: Partial<MarketItem>) => {
    set({ loading: true, error: null });
    try {
      const newItem = await api.listMarketItem(data);
      const adapted = adaptMarketItem(newItem);
      set((state) => ({
        items: [...state.items, adapted],
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '上架物品失败',
        loading: false,
      });
    }
  },

  buyItemAsync: async (itemId: string, buyerId: string) => {
    set({ loading: true, error: null });
    try {
      const updatedItem = await api.buyMarketItem(itemId, buyerId);
      const adapted = adaptMarketItem(updatedItem);
      set((state) => ({
        items: state.items.map((i) =>
          i.id === itemId ? adapted : i
        ),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '购买物品失败',
        loading: false,
      });
    }
  },

  fetchOrdersAsync: async (heroId: string) => {
    set({ loading: true, error: null });
    try {
      const orders = await api.getMyOrders(heroId);
      const adapted = adaptMarketItems(orders as any[]);
      const myOrders: Order[] = adapted.map((item) => ({
        id: `order-${item.id}`,
        itemId: item.id,
        itemName: item.name,
        price: item.currentPrice,
        quantity: item.stock,
        type: 'sell' as const,
        createdAt: item.listedAt ?? Date.now(),
        status: 'active' as const,
      }));
      set({ myOrders, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取订单列表失败',
        loading: false,
      });
    }
  },

  fetchPriceHistoryAsync: async (itemType: string) => {
    set({ loading: true, error: null });
    try {
      const history = await api.getPriceHistory(itemType);
      set((state) => {
        const existingIndex = state.priceHistory.findIndex(
          (h) => h.itemId === (history as ItemPriceHistory).itemId
        );
        const newHistory = [...state.priceHistory];
        if (existingIndex >= 0) {
          newHistory[existingIndex] = history as ItemPriceHistory;
        } else {
          newHistory.push(history as ItemPriceHistory);
        }
        return { priceHistory: newHistory, loading: false };
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取价格历史失败',
        loading: false,
      });
    }
  },

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
