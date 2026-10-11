import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { AddButton, AdminPage, Card, Empty, Input, Row, SaveBar, Toggle } from '@/components/admin';
import { colors, radii } from '@/lib/theme';
import { formatUSD } from '@/lib/seed';
import { adminApi } from '@/lib/admin';
import type { DeliveryZone } from '@/lib/types';
import { useTheme } from '@/lib/store';

const blank: Partial<DeliveryZone> = { name: '', fee: 0, eta: '', is_active: true };

export default function AdminDelivery() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [editing, setEditing] = useState<Partial<DeliveryZone> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try { setZones((await adminApi.list('delivery_zones', 'name')) as DeliveryZone[]); }
    catch (e: any) { setError(e.message); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.name?.trim()) { setError('Name is required'); return; }
    setSaving(true); setError(null);
    try {
      const row = { name: editing.name, fee: Number(editing.fee) || 0, eta: editing.eta || null, is_active: editing.is_active };
      if (editing.id && !String(editing.id).startsWith('z')) await adminApi.update('delivery_zones', editing.id, row);
      else await adminApi.insert('delivery_zones', row);
      setEditing(null); await load();
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const remove = async (z: DeliveryZone) => {
    if (Platform.OS === 'web' && !window.confirm(`Delete zone "${z.name}"?`)) return;
    try { await adminApi.remove('delivery_zones', z.id); await load(); } catch (e: any) { setError(e.message); }
  };

  return (
    <AdminPage title="Delivery zones & fees" action={<AddButton label="Add zone" onPress={() => setEditing({ ...blank })} />}>
      {error ? <Text style={{ color: colors.danger, marginBottom: 12 }}>{error}</Text> : null}
      <Card>
        {!zones.length && <Empty text="No delivery zones." />}
        {zones.map((z) => (
          <Row key={z.id} onEdit={() => setEditing({ ...z })} onDelete={() => remove(z)}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14 }}>{z.name}</Text>
              <Text style={{ color: colors.mute, fontSize: 12 }}>{z.eta}{!z.is_active ? ' · hidden' : ''}</Text>
            </View>
            <Text style={{ color: colors.lime, fontWeight: '800' }}>{z.fee ? formatUSD(Number(z.fee)) : 'Free'}</Text>
          </Row>
        ))}
      </Card>

      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line, width: '100%', maxWidth: 460 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: colors.line }}>
              <Text style={{ color: colors.white, fontWeight: '800', fontSize: 17 }}>{editing?.id ? 'Edit zone' : 'New zone'}</Text>
              <Pressable onPress={() => setEditing(null)} style={{ padding: 4 }}><X size={20} color={colors.mute} /></Pressable>
            </View>
            {editing && (
              <View style={{ padding: 18 }}>
                <Input label="Zone name" value={editing.name ?? ''} onChange={(t) => setEditing({ ...editing, name: t })} placeholder="e.g. Harare CBD" />
                <Input label="Fee (USD)" value={String(editing.fee ?? '')} numeric onChange={(t) => setEditing({ ...editing, fee: Number(t) })} />
                <Input label="ETA" value={editing.eta ?? ''} onChange={(t) => setEditing({ ...editing, eta: t })} placeholder="e.g. Same day" />
                <Toggle label="Active" value={!!editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} />
                {error ? <Text style={{ color: colors.danger, marginTop: 8 }}>{error}</Text> : null}
                <SaveBar onSave={save} saving={saving} />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </AdminPage>
  );
}
