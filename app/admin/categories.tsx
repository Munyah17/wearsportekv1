import React, { useEffect, useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import X from 'lucide-react-native/dist/esm/icons/x.mjs';
import { AddButton, AdminPage, Card, Empty, Input, Row, SaveBar, Toggle } from '@/components/admin';
import { colors, radii } from '@/lib/theme';
import { adminApi } from '@/lib/admin';
import type { Category } from '@/lib/types';
import { useTheme } from '@/lib/store';

const blank: Partial<Category> = { slug: '', name: '', tagline: '', image_url: '', sort_order: 0, is_active: true };

export default function AdminCategories() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const [items, setItems] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try { setItems((await adminApi.list('categories', 'sort_order')) as Category[]); }
    catch (e: any) { setError(e.message); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.name?.trim() || !editing?.slug?.trim()) { setError('Name and slug required'); return; }
    setSaving(true); setError(null);
    try {
      const row = {
        slug: editing.slug!.trim().toLowerCase().replace(/\s+/g, '-'),
        name: editing.name, tagline: editing.tagline || null,
        image_url: editing.image_url || null,
        sort_order: Number(editing.sort_order) || 0, is_active: editing.is_active,
      };
      if (editing.id && !String(editing.id).startsWith('c')) await adminApi.update('categories', editing.id, row);
      else await adminApi.insert('categories', row);
      setEditing(null); await load();
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const remove = async (c: Category) => {
    if (Platform.OS === 'web' && !window.confirm(`Delete category "${c.name}"?`)) return;
    try { await adminApi.remove('categories', c.id); await load(); } catch (e: any) { setError(e.message); }
  };

  return (
    <AdminPage title="Categories (first 5 show on homepage, in order)" action={<AddButton label="Add category" onPress={() => setEditing({ ...blank })} />}>
      <Text style={{ color: colors.mute, fontSize: 13, marginBottom: 14 }}>
        Sort order controls homepage section order — keep "Shirts / Jerseys" at 1.
      </Text>
      {error ? <Text style={{ color: colors.danger, marginBottom: 12 }}>{error}</Text> : null}
      <Card>
        {!items.length && <Empty text="No categories." />}
        {items.map((c) => (
          <Row key={c.id} onEdit={() => setEditing({ ...c })} onDelete={() => remove(c)}>
            <Image source={{ uri: c.image_url }} style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: colors.pitch }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14 }}>{c.name}</Text>
              <Text style={{ color: colors.mute, fontSize: 12 }}>
                /{c.slug} · order {c.sort_order}{!c.is_active ? ' · hidden' : ''}
              </Text>
            </View>
          </Row>
        ))}
      </Card>

      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line, width: '100%', maxWidth: 460 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: colors.line }}>
              <Text style={{ color: colors.white, fontWeight: '800', fontSize: 17 }}>{editing?.id ? 'Edit category' : 'New category'}</Text>
              <Pressable onPress={() => setEditing(null)} style={{ padding: 4 }}><X size={20} color={colors.mute} /></Pressable>
            </View>
            {editing && (
              <ScrollView contentContainerStyle={{ padding: 18 }}>
                <Input label="Name" value={editing.name ?? ''} onChange={(t) => setEditing({ ...editing, name: t })} placeholder="e.g. Soccer Boots" />
                <Input label="Slug" value={editing.slug ?? ''} onChange={(t) => setEditing({ ...editing, slug: t })} placeholder="e.g. boots" />
                <Input label="Tagline" value={editing.tagline ?? ''} onChange={(t) => setEditing({ ...editing, tagline: t })} />
                <Input label="Image URL" value={editing.image_url ?? ''} onChange={(t) => setEditing({ ...editing, image_url: t })} placeholder="https://…" />
                <Input label="Sort order" value={String(editing.sort_order ?? '')} numeric onChange={(t) => setEditing({ ...editing, sort_order: Number(t) })} />
                <Toggle label="Active" value={!!editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} />
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
