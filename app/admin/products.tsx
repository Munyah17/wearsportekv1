import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, View, useWindowDimensions, Platform } from 'react-native';
import { Pencil, X } from 'lucide-react-native';
import { AddButton, AdminPage, Card, Empty, Input, Row, SaveBar, Toggle } from '@/components/admin';
import { colors, radii } from '@/lib/theme';
import { formatUSD } from '@/lib/seed';
import { adminApi } from '@/lib/admin';
import { getCategories } from '@/lib/data';
import type { Category, Product } from '@/lib/types';
import { useTheme } from '@/lib/store';

const blank: Partial<Product> = {
  name: '', category_slug: 'jerseys', price: 0, compare_at_price: undefined,
  images: [''], sizes: ['S', 'M', 'L', 'XL'], stock: 0, description: '',
  is_featured: false, is_customizable: true, is_active: true, badge: '',
};

export default function AdminProducts() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const load = async () => {
    try {
      setProducts((await adminApi.list('products')) as Product[]);
      setCategories(await getCategories());
    } catch (e: any) { setError(e.message); }
  };
  useEffect(() => { load(); }, []);

  const open = (p?: Product) => {
    setEditing(p ? { ...p, images: [...p.images] } : { ...blank });
    setError(null);
  };

  const save = async () => {
    if (!editing?.name?.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError(null);
    try {
      const row = {
        ...editing,
        price: Number(editing.price) || 0,
        compare_at_price: editing.compare_at_price ? Number(editing.compare_at_price) : null,
        custom_fee: editing.custom_fee ? Number(editing.custom_fee) : null,
        stock: Number(editing.stock) || 0,
        images: (editing.images ?? []).filter(Boolean),
        sizes: (editing.sizes ?? []).filter(Boolean),
        badge: editing.badge || null,
      };
      if (editing.id && !String(editing.id).startsWith('p')) {
        await adminApi.update('products', editing.id, row);
      } else {
        delete (row as any).id;
        delete (row as any).created_at;
        await adminApi.insert('products', row);
      }
      setEditing(null);
      await load();
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const remove = async (p: Product) => {
    if (Platform.OS === 'web' && !window.confirm(`Delete "${p.name}"?`)) return;
    try { await adminApi.remove('products', p.id); await load(); } catch (e: any) { setError(e.message); }
  };

  const pickImage = async () => {
    if (Platform.OS !== 'web') return; // native picker needs expo-image-picker (installed for native builds)
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const url = await adminApi.uploadImage(file);
        setEditing((e) => e && { ...e, images: [...(e.images ?? []), url].filter(Boolean) });
      } catch (e: any) { setError('Upload failed: ' + e.message); }
    };
    input.click();
  };

  return (
    <AdminPage title="Products" action={<AddButton label="Add product" onPress={() => open()} />}>
      {error ? <Text style={{ color: colors.danger, marginBottom: 12 }}>{error}</Text> : null}
      <Card>
        {!products.length && <Empty text="No products yet — add your first jersey." />}
        {products.map((p) => (
          <Row key={p.id} onEdit={() => open(p)} onDelete={() => remove(p)}>
            <Image source={{ uri: p.images?.[0] }} style={{ width: 44, height: 50, borderRadius: 8, backgroundColor: colors.pitch }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14 }} numberOfLines={1}>{p.name}</Text>
              <Text style={{ color: colors.mute, fontSize: 12 }}>
                {p.category_slug} · stock {p.stock}{!p.is_active ? ' · hidden' : ''}
              </Text>
            </View>
            <Text style={{ color: colors.lime, fontWeight: '800', fontSize: 14 }}>{formatUSD(Number(p.price))}</Text>
          </Row>
        ))}
      </Card>

      {/* editor modal */}
      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{
            backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line,
            width: '100%', maxWidth: 640, maxHeight: '92%',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: colors.line }}>
              <Text style={{ color: colors.white, fontWeight: '800', fontSize: 17 }}>
                {editing?.id ? 'Edit product' : 'New product'}
              </Text>
              <Pressable onPress={() => setEditing(null)} style={{ padding: 4 }}><X size={20} color={colors.mute} /></Pressable>
            </View>
            {editing && (
              <ScrollView contentContainerStyle={{ padding: 18 }}>
                <Input label="Name" value={editing.name ?? ''} onChange={(t) => setEditing({ ...editing, name: t })} placeholder="e.g. Arsenal Home 25/26" />
                <Text style={{ color: colors.mute, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 12 }}>
                  {categories.map((c) => (
                    <Pressable key={c.id} onPress={() => setEditing({ ...editing, category_slug: c.slug })}
                      style={{
                        paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999,
                        backgroundColor: editing.category_slug === c.slug ? colors.lime : colors.pitch,
                        borderWidth: 1, borderColor: colors.line,
                      }}>
                      <Text style={{ color: editing.category_slug === c.slug ? colors.ink : colors.white, fontSize: 12, fontWeight: '700' }}>{c.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Input label="Price (USD)" value={String(editing.price ?? '')} numeric onChange={(t) => setEditing({ ...editing, price: Number(t) })} style={{ flex: 1 }} />
                  <Input label="Compare-at price" value={String(editing.compare_at_price ?? '')} numeric onChange={(t) => setEditing({ ...editing, compare_at_price: Number(t) })} style={{ flex: 1 }} />
                  <Input label="Stock" value={String(editing.stock ?? '')} numeric onChange={(t) => setEditing({ ...editing, stock: Number(t) })} style={{ flex: 1 }} />
                </View>
                <Input label="Description" value={editing.description ?? ''} onChange={(t) => setEditing({ ...editing, description: t })} multiline />
                <Input label="Sizes (comma separated)" value={(editing.sizes ?? []).join(', ')} onChange={(t) => setEditing({ ...editing, sizes: t.split(',').map((s) => s.trim()) })} placeholder="S, M, L, XL" />
                <Input label="Badge (optional)" value={editing.badge ?? ''} onChange={(t) => setEditing({ ...editing, badge: t })} placeholder="NEW / HOT / -20%" />

                {/* images */}
                <Text style={{ color: colors.mute, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Images</Text>
                {(editing.images ?? []).map((uri, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <Input value={uri} onChange={(t) => setEditing({ ...editing, images: editing.images!.map((u, j) => (j === i ? t : u)) })} placeholder="https://…" style={{ flex: 1, marginBottom: 0 }} />
                    <Pressable onPress={() => setEditing({ ...editing, images: editing.images!.filter((_, j) => j !== i) })} style={{ padding: 6 }}>
                      <X size={16} color={colors.mute} />
                    </Pressable>
                  </View>
                ))}
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                  <Pressable onPress={() => setEditing({ ...editing, images: [...(editing.images ?? []), ''] })}
                    style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.line }}>
                    <Text style={{ color: colors.white, fontSize: 12, fontWeight: '700' }}>+ Image URL</Text>
                  </Pressable>
                  {Platform.OS === 'web' && (
                    <Pressable onPress={pickImage}
                      style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.line }}>
                      <Text style={{ color: colors.lime, fontSize: 12, fontWeight: '700' }}>Upload image</Text>
                    </Pressable>
                  )}
                </View>

                <Toggle label="Customisable (name & number)" value={!!editing.is_customizable} onChange={(v) => setEditing({ ...editing, is_customizable: v })} />
                {editing.is_customizable ? (
                  <Input label="Flat custom fee (USD — blank = per-field fees)" value={editing.custom_fee != null ? String(editing.custom_fee) : ''} numeric onChange={(t) => setEditing({ ...editing, custom_fee: t === '' ? undefined : Number(t) })} placeholder="e.g. 10" />
                ) : null}
                <Toggle label="Featured" value={!!editing.is_featured} onChange={(v) => setEditing({ ...editing, is_featured: v })} />
                <Toggle label="Active (visible in shop)" value={!!editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} />

                {error ? <Text style={{ color: colors.danger, marginTop: 8 }}>{error}</Text> : null}
                <SaveBar onSave={save} saving={saving} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </AdminPage>
  );
}
