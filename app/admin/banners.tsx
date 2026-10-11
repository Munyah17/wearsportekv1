import React, { useEffect, useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { AddButton, AdminPage, Card, Empty, Input, Row, SaveBar, Toggle } from '@/components/admin';
import { colors, radii } from '@/lib/theme';
import { adminApi } from '@/lib/admin';
import type { Banner } from '@/lib/types';
import { useTheme } from '@/lib/store';

const blank: Partial<Banner> = { title: '', subtitle: '', cta_label: 'Shop now', cta_link: '/shop', image_url: '', sort_order: 1, is_active: true };

export default function AdminBanners() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try { setBanners((await adminApi.list('banners', 'sort_order')) as Banner[]); }
    catch (e: any) { setError(e.message); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.title?.trim()) { setError('Title is required'); return; }
    setSaving(true); setError(null);
    try {
      const row = { ...editing, sort_order: Number(editing.sort_order) || 0 };
      if (editing.id && !String(editing.id).startsWith('b')) {
        await adminApi.update('banners', editing.id, row);
      } else {
        delete (row as any).id;
        await adminApi.insert('banners', row);
      }
      setEditing(null);
      await load();
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const remove = async (b: Banner) => {
    if (Platform.OS === 'web' && !window.confirm(`Delete banner "${b.title}"?`)) return;
    try { await adminApi.remove('banners', b.id); await load(); } catch (e: any) { setError(e.message); }
  };

  return (
    <AdminPage title="Hero banners (max 10 slides)" action={<AddButton label="Add banner" onPress={() => setEditing({ ...blank })} />}>
      {error ? <Text style={{ color: colors.danger, marginBottom: 12 }}>{error}</Text> : null}
      <Card>
        {!banners.length && <Empty text="No banners — add slides for the homepage hero." />}
        {banners.map((b) => (
          <Row key={b.id} onEdit={() => setEditing({ ...b })} onDelete={() => remove(b)}>
            <Image source={{ uri: b.image_url }} style={{ width: 64, height: 40, borderRadius: 8, backgroundColor: colors.pitch }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14 }} numberOfLines={1}>{b.title}</Text>
              <Text style={{ color: colors.mute, fontSize: 12 }}>#{b.sort_order}{!b.is_active ? ' · hidden' : ''}</Text>
            </View>
          </Row>
        ))}
      </Card>

      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line, width: '100%', maxWidth: 520, maxHeight: '92%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: colors.line }}>
              <Text style={{ color: colors.white, fontWeight: '800', fontSize: 17 }}>{editing?.id ? 'Edit banner' : 'New banner'}</Text>
              <Pressable onPress={() => setEditing(null)} style={{ padding: 4 }}><X size={20} color={colors.mute} /></Pressable>
            </View>
            {editing && (
              <ScrollView contentContainerStyle={{ padding: 18 }}>
                <Input label="Title" value={editing.title ?? ''} onChange={(t) => setEditing({ ...editing, title: t })} />
                <Input label="Subtitle" value={editing.subtitle ?? ''} onChange={(t) => setEditing({ ...editing, subtitle: t })} />
                <Input label="Image URL" value={editing.image_url ?? ''} onChange={(t) => setEditing({ ...editing, image_url: t })} placeholder="https://…" />
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Input label="Button label" value={editing.cta_label ?? ''} onChange={(t) => setEditing({ ...editing, cta_label: t })} style={{ flex: 1 }} />
                  <Input label="Link" value={editing.cta_link ?? ''} onChange={(t) => setEditing({ ...editing, cta_link: t })} style={{ flex: 1 }} />
                </View>
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
