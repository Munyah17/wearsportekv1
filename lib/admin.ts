// Admin CRUD — all writes go through Supabase (RLS enforces role='admin').
import { supabase } from './supabase';

const req = () => {
  if (!supabase) throw new Error('Supabase not configured');
  return supabase;
};

export const adminApi = {
  // generic helpers
  list: async (table: string, order = 'created_at') => {
    const { data, error } = await req().from(table).select('*').order(order, { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
  insert: async (table: string, row: Record<string, any>) => {
    const { data, error } = await req().from(table).insert(row).select().single();
    if (error) throw error;
    return data;
  },
  update: async (table: string, id: string | number, patch: Record<string, any>) => {
    const { error } = await req().from(table).update(patch).eq('id', id);
    if (error) throw error;
  },
  remove: async (table: string, id: string | number) => {
    const { error } = await req().from(table).delete().eq('id', id);
    if (error) throw error;
  },
  saveSettings: async (patch: Record<string, any>) => {
    const { error } = await req().from('site_settings').update(patch).eq('id', 1);
    if (error) throw error;
  },
  ordersWithItems: async () => {
    const { data, error } = await req()
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  setOrderStatus: async (id: string, status: string) => {
    const { error } = await req().from('orders').update({ status }).eq('id', id);
    if (error) throw error;
  },
  uploadImage: async (file: { uri: string; name: string; type: string } | File, bucket = 'images') => {
    const sb = req();
    const name = `${Date.now()}-${(file as any).name ?? 'image.jpg'}`.replace(/\s+/g, '-');
    let body: any;
    if (typeof File !== 'undefined' && file instanceof File) {
      body = file;
    } else {
      const res = await fetch((file as any).uri);
      body = await res.blob();
    }
    const { error } = await sb.storage.from(bucket).upload(name, body, { upsert: false });
    if (error) throw error;
    const { data } = sb.storage.from(bucket).getPublicUrl(name);
    return data.publicUrl as string;
  },
};
