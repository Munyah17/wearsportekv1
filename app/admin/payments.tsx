import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Banknote, CreditCard, Smartphone, Wallet, X } from 'lucide-react-native';
import { AddButton, AdminPage, Card, Empty, Input, Row, SaveBar, Toggle } from '@/components/admin';
import { colors, radii } from '@/lib/theme';
import { adminApi } from '@/lib/admin';
import type { PaymentMethod } from '@/lib/types';
import { useTheme } from '@/lib/store';

const ICONS: Record<string, any> = { ecocash: Smartphone, innbucks: Wallet, omari: Smartphone, onemoney: Smartphone, transfer: Banknote, visa_mc: CreditCard };
const blank: Partial<PaymentMethod> = { label: '', hint: '', is_active: true, sort_order: 0 };

export default function AdminPayments() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [editing, setEditing] = useState<Partial<PaymentMethod> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try { setMethods((await adminApi.list('payment_methods', 'sort_order')) as PaymentMethod[]); }
    catch (e: any) { setError(e.message); }
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.label?.trim()) { setError('Label is required'); return; }
    setSaving(true); setError(null);
    try {
      const row = { label: editing.label, hint: editing.hint || null, is_active: editing.is_active, sort_order: Number(editing.sort_order) || 0 };
      const isSeedId = ['ecocash', 'innbucks', 'omari', 'onemoney', 'transfer', 'visa_mc'].includes(String(editing.id));
      if (editing.id && !isSeedId) {
        await adminApi.update('payment_methods', editing.id, row);
      } else {
        // seed rows use string ids — upsert keyed on id
        const { error: e } = await (await import('@/lib/supabase')).supabase!
          .from('payment_methods').upsert({ id: editing.id, ...row });
        if (e) throw e;
      }
      setEditing(null); await load();
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const remove = async (m: PaymentMethod) => {
    if (Platform.OS === 'web' && !window.confirm(`Delete "${m.label}"?`)) return;
    try { await adminApi.remove('payment_methods', m.id); await load(); } catch (e: any) { setError(e.message); }
  };

  return (
    <AdminPage title="Payment methods" action={<AddButton label="Add method" onPress={() => setEditing({ ...blank, id: '' })} />}>
      <Text style={{ color: colors.mute, fontSize: 13, marginBottom: 14 }}>
        Customers see these names — Paynow runs underneath. Mobile methods (EcoCash, InnBucks, Omari, OneMoney) trigger a phone prompt; others open secure checkout.
      </Text>
      {error ? <Text style={{ color: colors.danger, marginBottom: 12 }}>{error}</Text> : null}
      <Card>
        {!methods.length && <Empty text="No payment methods." />}
        {methods.map((m) => {
          const Icon = ICONS[m.id] ?? Wallet;
          return (
            <Row key={m.id} onEdit={() => setEditing({ ...m })} onDelete={() => remove(m)}>
              <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: colors.pitch, alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={colors.lime} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14 }}>{m.label}</Text>
                <Text style={{ color: colors.mute, fontSize: 12 }}>{m.hint}{!m.is_active ? ' · hidden' : ''}</Text>
              </View>
            </Row>
          );
        })}
      </Card>

      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{ backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line, width: '100%', maxWidth: 460 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: colors.line }}>
              <Text style={{ color: colors.white, fontWeight: '800', fontSize: 17 }}>{editing?.id ? 'Edit method' : 'New method'}</Text>
              <Pressable onPress={() => setEditing(null)} style={{ padding: 4 }}><X size={20} color={colors.mute} /></Pressable>
            </View>
            {editing && (
              <View style={{ padding: 18 }}>
                <Input label="Label (what customers see)" value={editing.label ?? ''} onChange={(t) => setEditing({ ...editing, label: t })} placeholder="e.g. EcoCash" />
                <Input label="Hint" value={editing.hint ?? ''} onChange={(t) => setEditing({ ...editing, hint: t })} placeholder="e.g. Pay from your wallet" />
                <Input label="Sort order" value={String(editing.sort_order ?? '')} numeric onChange={(t) => setEditing({ ...editing, sort_order: Number(t) })} />
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
