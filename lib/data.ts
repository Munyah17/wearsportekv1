import { supabase, isSupabaseConfigured } from './supabase';
import {
  SEED_BANNERS,
  SEED_CATEGORIES,
  SEED_PAYMENT_METHODS,
  SEED_PRODUCTS,
  SEED_SETTINGS,
  SEED_ZONES,
} from './seed';
import {
  Banner,
  Category,
  DeliveryZone,
  Order,
  PaymentMethod,
  Product,
  SiteSettings,
} from './types';

// Every getter falls back to seed data so the app works before Supabase is wired up.

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return SEED_CATEGORIES;
  const { data, error } = await supabase!
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  return error || !data?.length ? SEED_CATEGORIES : (data as Category[]);
}

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  if (!isSupabaseConfigured) {
    return categorySlug ? SEED_PRODUCTS.filter((p) => p.category_slug === categorySlug) : SEED_PRODUCTS;
  }
  let q = supabase!.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false });
  if (categorySlug) q = q.eq('category_slug', categorySlug);
  const { data, error } = await q;
  const fallback = categorySlug ? SEED_PRODUCTS.filter((p) => p.category_slug === categorySlug) : SEED_PRODUCTS;
  return error || !data?.length ? fallback : (data as Product[]);
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured) return SEED_PRODUCTS.find((p) => p.id === id) ?? null;
  const { data, error } = await supabase!.from('products').select('*').eq('id', id).single();
  if (error || !data) return SEED_PRODUCTS.find((p) => p.id === id) ?? null;
  return data as Product;
}

export async function getBanners(): Promise<Banner[]> {
  if (!isSupabaseConfigured) return SEED_BANNERS;
  const { data, error } = await supabase!
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
    .limit(10);
  return error || !data?.length ? SEED_BANNERS : (data as Banner[]);
}

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  if (!isSupabaseConfigured) return SEED_ZONES;
  const { data, error } = await supabase!.from('delivery_zones').select('*').eq('is_active', true);
  return error || !data?.length ? SEED_ZONES : (data as DeliveryZone[]);
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  if (!isSupabaseConfigured) return SEED_PAYMENT_METHODS;
  const { data, error } = await supabase!
    .from('payment_methods')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  return error || !data?.length ? SEED_PAYMENT_METHODS : (data as PaymentMethod[]);
}

export async function getSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured) return SEED_SETTINGS;
  const { data, error } = await supabase!.from('site_settings').select('*').eq('id', 1).single();
  if (error || !data) return SEED_SETTINGS;
  return { ...SEED_SETTINGS, ...(data as Partial<SiteSettings>) };
}

export async function getMyOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase!
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((o: any) => ({ ...o, items: o.order_items ?? [] })) as Order[];
}

export async function createOrder(order: Order): Promise<{ id: string }> {
  if (!isSupabaseConfigured) return { id: `local-${Date.now()}` };
  const { items, ...rest } = order;
  const { data, error } = await supabase!.from('orders').insert(rest).select('id').single();
  if (error) throw error;
  const orderId = data.id as string;
  const rows = items.map((i) => ({ ...i, order_id: orderId }));
  const { error: itemErr } = await supabase!.from('order_items').insert(rows);
  if (itemErr) throw itemErr;
  return { id: orderId };
}
