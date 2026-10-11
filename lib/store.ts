import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { CartItem, Product, SiteSettings } from './types';
import { SEED_SETTINGS } from './seed';
import { applyMode, ThemeMode } from './theme';

const storage = {
  async get(key: string) {
    if (Platform.OS === 'web') return window.localStorage.getItem(key);
    return AsyncStorage.getItem(key);
  },
  async set(key: string, value: string) {
    if (Platform.OS === 'web') { window.localStorage.setItem(key, value); return; }
    return AsyncStorage.setItem(key, value);
  },
};

interface CartState {
  items: CartItem[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  add: (product: Product, size: string, customName?: string, customNumber?: string, fee?: number) => void;
  remove: (index: number) => void;
  setQty: (index: number, qty: number) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
}

const key = (i: CartItem) =>
  `${i.product.id}|${i.size}|${i.customName ?? ''}|${i.customNumber ?? ''}`;

export const useCart = create<CartState>((set, get) => ({
  items: [],
  hydrated: false,
  hydrate: async () => {
    const raw = await storage.get('ws_cart');
    if (raw) {
      try { set({ items: JSON.parse(raw), hydrated: true }); return; } catch {}
    }
    set({ hydrated: true });
  },
  add: (product, size, customName, customNumber, fee = 0) => {
    const next = [...get().items];
    const candidate: CartItem = { product, size, qty: 1, customName, customNumber, unitCustomFee: fee };
    const idx = next.findIndex((i) => key(i) === key(candidate));
    if (idx >= 0) next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
    else next.push(candidate);
    set({ items: next });
    storage.set('ws_cart', JSON.stringify(next));
  },
  remove: (index) => {
    const next = get().items.filter((_, i) => i !== index);
    set({ items: next });
    storage.set('ws_cart', JSON.stringify(next));
  },
  setQty: (index, qty) => {
    const next = get().items.map((it, i) => (i === index ? { ...it, qty: Math.max(1, qty) } : it));
    set({ items: next });
    storage.set('ws_cart', JSON.stringify(next));
  },
  clear: () => {
    set({ items: [] });
    storage.set('ws_cart', '[]');
  },
  subtotal: () =>
    get().items.reduce((sum, i) => sum + (i.product.price + i.unitCustomFee) * i.qty, 0),
  count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
}));

interface SettingsState {
  settings: SiteSettings;
  setSettings: (s: SiteSettings) => void;
}

export const useSettings = create<SettingsState>((set) => ({
  settings: SEED_SETTINGS,
  setSettings: (settings) => set({ settings }),
}));

interface ThemeState {
  mode: ThemeMode;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

export const useTheme = create<ThemeState>((set, get) => ({
  mode: 'dark',
  hydrated: false,
  hydrate: async () => {
    const raw = await storage.get('ws_theme');
    const mode: ThemeMode = raw === 'light' ? 'light' : 'dark';
    applyMode(mode);
    set({ mode, hydrated: true });
  },
  setMode: (mode) => {
    applyMode(mode);
    set({ mode });
    storage.set('ws_theme', mode);
  },
  toggle: () => get().setMode(get().mode === 'dark' ? 'light' : 'dark'),
}));
