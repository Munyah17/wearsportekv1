import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { AdminPage, Card, Empty } from '@/components/admin';
import { colors, radii } from '@/lib/theme';
import { formatUSD } from '@/lib/seed';
import { adminApi } from '@/lib/admin';
import { useTheme } from '@/lib/store';

const STATUSES = ['awaiting_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'failed'];
const STATUS_COLORS: Record<string, string> = {
  paid: colors.success, delivered: colors.success, shipped: colors.lime,
  processing: colors.gold, awaiting_payment: colors.gold, failed: colors.danger, cancelled: colors.mute,
};

export default function AdminOrders() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const [orders, setOrders] = useState<any[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const load = async () => setOrders(await adminApi.ordersWithItems());
  useEffect(() => { load().catch(() => {}); }, []);

  const setStatus = async (id: string, status: string) => {
    await adminApi.setOrderStatus(id, status);
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  return (
    <AdminPage title="Orders">
      {!orders.length && <Empty text="No orders yet." />}
      {orders.map((o) => {
        const expanded = open === o.id;
        return (
          <Card key={o.id} style={{ marginBottom: 12 }}>
            <Pressable onPress={() => setOpen(expanded ? null : o.id)} style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 10, alignItems: isDesktop ? 'center' : 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.white, fontWeight: '800', fontSize: 15 }}>
                  {o.paynow_reference || o.id.slice(0, 8)} — {o.customer_name}
                </Text>
                <Text style={{ color: colors.mute, fontSize: 12, marginTop: 3 }}>
                  {new Date(o.created_at).toLocaleString()} · {o.customer_phone} · {o.payment_method}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ color: colors.lime, fontWeight: '900', fontSize: 16 }}>{formatUSD(Number(o.total))}</Text>
                <View style={{ backgroundColor: (STATUS_COLORS[o.status] ?? colors.mute) + '22', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
                  <Text style={{ color: STATUS_COLORS[o.status] ?? colors.mute, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>
                    {o.status?.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            </Pressable>

            {expanded && (
              <View style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 14, gap: 10 }}>
                {(o.order_items ?? []).map((it: any) => (
                  <View key={it.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.white, fontSize: 13, flex: 1 }}>
                      {it.product_name} · {it.size} · x{it.qty}
                      {it.custom_name || it.custom_number ? `  (${it.custom_name ?? ''} ${it.custom_number ? '#' + it.custom_number : ''})` : ''}
                    </Text>
                    <Text style={{ color: colors.mute, fontSize: 13 }}>{formatUSD((Number(it.unit_price) + Number(it.custom_fee)) * it.qty)}</Text>
                  </View>
                ))}
                <Text style={{ color: colors.mute, fontSize: 12 }}>Delivery: {o.delivery_address} ({formatUSD(Number(o.delivery_fee))})</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {STATUSES.map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => setStatus(o.id, s)}
                      style={{
                        paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999,
                        backgroundColor: o.status === s ? colors.lime : colors.pitch,
                        borderWidth: 1, borderColor: colors.line,
                      }}
                    >
                      <Text style={{ color: o.status === s ? colors.ink : colors.white, fontSize: 11, fontWeight: '700' }}>
                        {s.replace('_', ' ')}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </Card>
        );
      })}
    </AdminPage>
  );
}
