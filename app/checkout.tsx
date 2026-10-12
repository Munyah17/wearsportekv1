import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Banknote from 'lucide-react-native/dist/esm/icons/banknote.mjs';
import CreditCard from 'lucide-react-native/dist/esm/icons/credit-card.mjs';
import Lock from 'lucide-react-native/dist/esm/icons/lock.mjs';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin.mjs';
import Smartphone from 'lucide-react-native/dist/esm/icons/smartphone.mjs';
import Truck from 'lucide-react-native/dist/esm/icons/truck.mjs';
import Wallet from 'lucide-react-native/dist/esm/icons/wallet.mjs';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Button, Field } from '@/components/ui';
import { colors, radii } from '@/lib/theme';
import { formatUSD } from '@/lib/seed';
import { useAuth } from '@/lib/hooks';
import { useCart , useTheme } from '@/lib/store';
import { createOrder, getDeliveryZones, getPaymentMethods } from '@/lib/data';
import { initPayment } from '@/lib/payments';
import type { DeliveryZone, PaymentMethod } from '@/lib/types';

const METHOD_ICONS: Record<string, any> = {
  ecocash: Smartphone, innbucks: Wallet, omari: Smartphone, onemoney: Smartphone,
  transfer: Banknote, visa_mc: CreditCard,
};

const MOBILE = new Set(['ecocash', 'innbucks', 'omari', 'onemoney']);

export default function Checkout() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const { items, subtotal, clear } = useCart();
  const { profile } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const pad = isDesktop ? 48 : 16;

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [method, setMethod] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobilePrompt, setMobilePrompt] = useState<{ instructions: string; pollUrl: string } | null>(null);

  useEffect(() => {
    getDeliveryZones().then((z) => { setZones(z); if (z.length) setZoneId(z[0].id); });
    getPaymentMethods().then((m) => { setMethods(m); if (m.length) setMethod(m[0].id); });
  }, []);

  // prefill contact details for signed-in customers
  useEffect(() => {
    if (!profile) return;
    setName((v) => v || profile.full_name || '');
    setEmail((v) => v || profile.email || '');
    setPhone((v) => v || profile.phone || '');
  }, [profile]);

  const zone = zones.find((z) => z.id === zoneId);
  const deliveryFee = zone?.fee ?? 0;
  const total = subtotal() + deliveryFee;

  const valid = useMemo(
    () =>
      items.length > 0 &&
      name.trim().length >= 2 &&
      /^\+?[0-9\s()-]{7,}$/.test(phone.trim()) &&
      zoneId && method && address.trim().length >= 5,
    [items, name, phone, zoneId, method, address]
  );

  const pay = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const orderRef = `WS-${Date.now().toString(36).toUpperCase()}`;
      const orderId = (
        await createOrder({
          user_id: profile?.id,
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_email: email.trim() || undefined,
          delivery_zone_id: zoneId!,
          delivery_address: address.trim(),
          delivery_fee: deliveryFee,
          subtotal: subtotal(),
          total,
          payment_method: method!,
          paynow_reference: orderRef,
          status: 'awaiting_payment',
          items: items.map((i) => ({
            product_id: i.product.id,
            product_name: i.product.name,
            size: i.size,
            qty: i.qty,
            unit_price: i.product.price,
            custom_name: i.customName,
            custom_number: i.customNumber,
            custom_fee: i.unitCustomFee,
          })),
        })
      ).id;

      const res = await initPayment({
        orderId,
        reference: orderRef,
        amount: Number(total.toFixed(2)),
        customerEmail: email.trim() || undefined,
        customerPhone: phone.replace(/\D/g, ''),
        method: method!,
        items: [
          ...items.map((i) => ({
            title: `${i.product.name}${i.customName ? ` (${i.customName} #${i.customNumber ?? ''})` : ''} x${i.qty}`,
            amount: Number(((i.product.price + i.unitCustomFee) * i.qty).toFixed(2)),
          })),
          ...(deliveryFee ? [{ title: `Delivery — ${zone?.name}`, amount: deliveryFee }] : []),
        ],
      });

      if (!res.ok) throw new Error(res.error || 'Payment could not be started');

      if (res.kind === 'redirect' && res.redirectUrl) {
        // hosted checkout (card, transfer, wallets)
        if (Platform.OS === 'web') window.location.href = res.redirectUrl;
        else Linking.openURL(res.redirectUrl);
        clear();
        return;
      }
      if (res.kind === 'mobile') {
        setMobilePrompt({ instructions: res.instructions ?? 'Approve the prompt on your phone.', pollUrl: res.pollUrl! });
        clear();
        return;
      }
      throw new Error('Unexpected payment response');
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  if (mobilePrompt) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink }}>
        <NavBar />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.lime + '22', alignItems: 'center', justifyContent: 'center' }}>
            <Smartphone size={30} color={colors.lime} />
          </View>
          <Text style={{ color: colors.white, fontSize: 22, fontWeight: '900', textAlign: 'center' }}>Approve on your phone</Text>
          <Text style={{ color: colors.mute, fontSize: 14, textAlign: 'center', maxWidth: 420, lineHeight: 21 }}>
            {mobilePrompt.instructions} Once approved, your order is confirmed automatically.
          </Text>
          <Button label="Back to shop" variant="outline" onPress={() => router.replace('/')} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <NavBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ maxWidth: 1280, alignSelf: 'center', width: '100%', paddingHorizontal: pad, paddingTop: 28, paddingBottom: 40 }}>
          <Text style={{ color: colors.white, fontSize: isDesktop ? 34 : 26, fontWeight: '900', letterSpacing: -0.6 }}>Checkout</Text>

          <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 28, marginTop: 24, alignItems: 'flex-start' }}>
            {/* form column */}
            <View style={{ flex: 1, width: '100%', gap: 20 }}>
              <Card title="Contact & delivery">
                <Field label="Full name" value={name} onChangeText={setName} placeholder="Tendai Moyo" />
                <Field label="Phone (for payment & delivery)" value={phone} onChangeText={setPhone} placeholder="+263 77 …" keyboardType="phone-pad" />
                <Field label="Email (optional)" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
                <Field label="Delivery address" value={address} onChangeText={setAddress} placeholder="Street, suburb, landmark" multiline />
                <Text style={{ color: colors.mute, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Delivery zone
                </Text>
                <View style={{ gap: 8 }}>
                  {zones.map((z) => (
                    <Pressable
                      key={z.id}
                      onPress={() => setZoneId(z.id)}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 10,
                        padding: 12, borderRadius: radii.md,
                        backgroundColor: colors.pitch,
                        borderWidth: 1, borderColor: zoneId === z.id ? colors.lime : colors.line,
                      }}
                    >
                      <Truck size={15} color={zoneId === z.id ? colors.lime : colors.mute} />
                      <Text style={{ color: colors.white, fontSize: 13, fontWeight: '600', flex: 1 }}>{z.name}</Text>
                      <Text style={{ color: colors.mute, fontSize: 12 }}>{z.eta}</Text>
                      <Text style={{ color: colors.lime, fontSize: 13, fontWeight: '800' }}>
                        {z.fee ? formatUSD(z.fee) : 'Free'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Card>

              <Card title="Payment method">
                <View style={{ gap: 8 }}>
                  {methods.map((m) => {
                    const Icon = METHOD_ICONS[m.id] ?? Wallet;
                    const selected = method === m.id;
                    return (
                      <Pressable
                        key={m.id}
                        onPress={() => setMethod(m.id)}
                        style={{
                          flexDirection: 'row', alignItems: 'center', gap: 12,
                          padding: 14, borderRadius: radii.md,
                          backgroundColor: selected ? colors.lime + '14' : colors.pitch,
                          borderWidth: 1.5, borderColor: selected ? colors.lime : colors.line,
                        }}
                      >
                        <View style={{
                          width: 38, height: 38, borderRadius: 10,
                          backgroundColor: selected ? colors.lime : colors.card,
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon size={18} color={selected ? colors.ink : colors.white} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14 }}>{m.label}</Text>
                          {m.hint ? <Text style={{ color: colors.mute, fontSize: 12 }}>{m.hint}</Text> : null}
                        </View>
                        <View style={{
                          width: 18, height: 18, borderRadius: 9,
                          borderWidth: 2, borderColor: selected ? colors.lime : colors.mute,
                          backgroundColor: selected ? colors.lime : 'transparent',
                        }} />
                      </Pressable>
                    );
                  })}
                </View>
                {method && MOBILE.has(method) && (
                  <Text style={{ color: colors.mute, fontSize: 12, marginTop: 10 }}>
                    A payment prompt will be pushed to {phone || 'your phone'} to approve.
                  </Text>
                )}
              </Card>
            </View>

            {/* summary column */}
            <View style={{
              width: isDesktop ? 360 : '100%', backgroundColor: colors.card,
              borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line, padding: 20, gap: 12,
            }}>
              <Text style={{ color: colors.white, fontWeight: '800', fontSize: 16 }}>Your order</Text>
              {items.map((it, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Image source={{ uri: it.product.images[0] }} style={{ width: 44, height: 50, borderRadius: 8 }} />
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={{ color: colors.white, fontSize: 13, fontWeight: '600' }}>{it.product.name}</Text>
                    <Text style={{ color: colors.mute, fontSize: 11 }}>
                      {it.size} · x{it.qty}{it.customName ? ` · ${it.customName} #${it.customNumber ?? ''}` : ''}
                    </Text>
                  </View>
                  <Text style={{ color: colors.white, fontSize: 13, fontWeight: '700' }}>
                    {formatUSD((it.product.price + it.unitCustomFee) * it.qty)}
                  </Text>
                </View>
              ))}
              <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 4 }} />
              <SummaryRow label="Subtotal" value={formatUSD(subtotal())} />
              <SummaryRow label={`Delivery — ${zone?.name ?? '…'}`} value={deliveryFee ? formatUSD(deliveryFee) : 'Free'} />
              <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 4 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.white, fontWeight: '800', fontSize: 16 }}>Total</Text>
                <Text style={{ color: colors.lime, fontWeight: '900', fontSize: 20 }}>{formatUSD(total)}</Text>
              </View>

              {error ? <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text> : null}

              <Button
                label={busy ? 'Starting payment…' : `Pay ${formatUSD(total)}`}
                icon={busy ? <ActivityIndicator color={colors.ink} /> : <Lock size={16} color={colors.ink} />}
                onPress={pay}
                disabled={!valid || busy}
                full
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <Lock size={11} color={colors.mute} />
                <Text style={{ color: colors.mute, fontSize: 11 }}>Secure payment — you'll never be charged twice</Text>
              </View>
            </View>
          </View>
        </View>
        <Footer categories={[]} />
      </ScrollView>
    </View>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line, padding: 20 }}>
      <Text style={{ color: colors.white, fontWeight: '800', fontSize: 16, marginBottom: 16 }}>{title}</Text>
      {children}
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: colors.mute, fontSize: 13, flexShrink: 1, paddingRight: 8 }} numberOfLines={1}>{label}</Text>
      <Text style={{ color: colors.white, fontSize: 13, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}
