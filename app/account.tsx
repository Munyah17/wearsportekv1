import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, Package, ShieldCheck, Truck, UserRound } from 'lucide-react-native';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Button, Field } from '@/components/ui';
import { colors, radii } from '@/lib/theme';
import { useAuth } from '@/lib/hooks';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getMyOrders } from '@/lib/data';
import { formatUSD } from '@/lib/seed';
import type { Order } from '@/lib/types';
import { useTheme } from '@/lib/store';

type Mode = 'signin' | 'signup' | 'reset';

const STATUS_TINT: Record<Order['status'], { bg: string; fg: string }> = {
  awaiting_payment: { bg: colors.gold + '1F', fg: colors.gold },
  paid: { bg: colors.success + '1F', fg: colors.success },
  processing: { bg: colors.lime + '1F', fg: colors.lime },
  shipped: { bg: colors.lime + '1F', fg: colors.lime },
  delivered: { bg: colors.success + '1F', fg: colors.success },
  failed: { bg: colors.danger + '1F', fg: colors.danger },
  cancelled: { bg: colors.danger + '1F', fg: colors.danger },
};

export default function Account() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const { session, profile, isAdmin, loading, refresh } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // profile editing
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // order history
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    setEditName(profile?.full_name ?? '');
    setEditPhone(profile?.phone ?? '');
  }, [profile]);

  useEffect(() => {
    if (!session) { setOrders([]); return; }
    setOrdersLoading(true);
    getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [session]);

  const submit = async () => {
    if (!supabase || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (error) throw error;
        setMsg({ text: 'Account created — check your email to confirm, then sign in.', ok: true });
      } else if (mode === 'reset') {
        const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/account` : undefined;
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
        if (error) throw error;
        setMsg({ text: 'Reset link sent — check your email (and spam folder).', ok: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (e: any) {
      setMsg({ text: e.message ?? 'Auth failed', ok: false });
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async () => {
    if (!supabase || !profile || saving) return;
    setSaving(true);
    setSavedMsg(null);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editName.trim(), phone: editPhone.trim() || null })
      .eq('id', profile.id);
    setSavedMsg(error ? error.message : 'Saved');
    if (!error) refresh();
    setSaving(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <NavBar />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{
          flex: 1, maxWidth: 480, alignSelf: 'center', width: '100%',
          paddingHorizontal: isDesktop ? 0 : 20, paddingTop: 48, paddingBottom: 40,
        }}>
          {!isSupabaseConfigured ? (
            <View style={{ alignItems: 'center', gap: 14, paddingTop: 48 }}>
              <UserRound size={44} color={colors.line} />
              <Text style={{ color: colors.white, fontSize: 20, fontWeight: '800' }}>Accounts ready — connect Supabase</Text>
              <Text style={{ color: colors.mute, fontSize: 14, textAlign: 'center', lineHeight: 22, maxWidth: 400 }}>
                Sign-in, order history and the admin portal go live as soon as the database is connected.
                You can still browse and order without an account.
              </Text>
              <View style={{ backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line, padding: 18, gap: 10, width: '100%' }}>
                {[
                  'Create a free project at supabase.com',
                  'Run supabase/schema.sql in the SQL editor',
                  'Copy .env.example to .env and fill in your keys',
                  "Set your user's role to 'admin' in the profiles table",
                  'Restart the Expo server',
                ].map((s, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                    <Text style={{ color: colors.lime, fontWeight: '800', fontSize: 13 }}>{i + 1}.</Text>
                    <Text style={{ color: colors.white, fontSize: 13, flex: 1, lineHeight: 19 }}>{s}</Text>
                  </View>
                ))}
              </View>
              <Button label="Back to shop" variant="outline" onPress={() => router.replace('/')} />
            </View>
          ) : session ? (
            <View style={{ gap: 20, paddingTop: 24, width: '100%' }}>
              {/* identity */}
              <View style={{ alignItems: 'center', gap: 12 }}>
                <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }}>
                  <UserRound size={32} color={colors.lime} />
                </View>
                <Text style={{ color: colors.white, fontSize: 22, fontWeight: '900' }}>
                  {profile?.full_name || 'Welcome back'}
                </Text>
                <Text style={{ color: colors.mute, fontSize: 14 }}>{profile?.email}</Text>
                {isAdmin && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.gold + '1A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 }}>
                    <ShieldCheck size={14} color={colors.gold} />
                    <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '800' }}>ADMIN</Text>
                  </View>
                )}
              </View>

              {isAdmin && (
                <Button label="Open admin portal" icon={<ShieldCheck size={15} color={colors.ink} />} onPress={() => router.push('/admin')} full />
              )}

              {/* editable details */}
              <View style={{ backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line, padding: 20 }}>
                <Text style={{ color: colors.white, fontWeight: '800', fontSize: 16, marginBottom: 14 }}>Your details</Text>
                <Field label="Full name" value={editName} onChangeText={setEditName} placeholder="Your name" />
                <Field label="Phone" value={editPhone} onChangeText={setEditPhone} placeholder="+263 77 …" keyboardType="phone-pad" />
                {savedMsg ? (
                  <Text style={{ color: savedMsg === 'Saved' ? colors.success : colors.danger, fontSize: 13, marginBottom: 10 }}>{savedMsg}</Text>
                ) : null}
                <Button label={saving ? 'Saving…' : 'Save details'} loading={saving} onPress={saveProfile} full variant="outline" />
              </View>

              {/* order history */}
              <View style={{ backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line, padding: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Package size={16} color={colors.lime} />
                  <Text style={{ color: colors.white, fontWeight: '800', fontSize: 16 }}>Order history</Text>
                </View>
                {ordersLoading ? (
                  <Text style={{ color: colors.mute, fontSize: 13 }}>Loading orders…</Text>
                ) : !orders.length ? (
                  <Text style={{ color: colors.mute, fontSize: 13, lineHeight: 20 }}>
                    No orders yet. Orders you place while signed in will appear here.
                  </Text>
                ) : (
                  <View style={{ gap: 10 }}>
                    {orders.map((o) => {
                      const tint = STATUS_TINT[o.status] ?? STATUS_TINT.processing;
                      const items = o.items ?? [];
                      const qty = items.reduce((n, i) => n + i.qty, 0);
                      return (
                        <View key={o.id} style={{ backgroundColor: colors.pitch, borderRadius: radii.md, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: colors.white, fontWeight: '700', fontSize: 13 }}>
                              {o.paynow_reference ?? `#${(o.id ?? '').slice(0, 8)}`}
                            </Text>
                            <View style={{ backgroundColor: tint.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                              <Text style={{ color: tint.fg, fontSize: 11, fontWeight: '800' }}>
                                {(o.status ?? '').replace(/_/g, ' ').toUpperCase()}
                              </Text>
                            </View>
                          </View>
                          <Text style={{ color: colors.mute, fontSize: 12 }}>
                            {o.created_at ? new Date(o.created_at).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                            {' · '}
                            {qty} item{qty === 1 ? '' : 's'}
                            {items[0] ? ` · ${items[0].product_name}${items.length > 1 ? ` +${items.length - 1} more` : ''}` : ''}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ color: colors.lime, fontWeight: '900', fontSize: 15 }}>{formatUSD(o.total)}</Text>
                            {(o.status === 'shipped' || o.status === 'delivered') && <Truck size={14} color={tint.fg} />}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>

              <Button
                label="Sign out"
                variant="outline"
                icon={<LogOut size={15} color={colors.white} />}
                onPress={() => supabase!.auth.signOut()}
                full
              />
            </View>
          ) : (
            <View style={{ backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line, padding: 24 }}>
              <Text style={{ color: colors.white, fontSize: 24, fontWeight: '900' }}>
                {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Reset password'}
              </Text>
              <Text style={{ color: colors.mute, fontSize: 13, marginTop: 6, marginBottom: 20 }}>
                {mode === 'reset'
                  ? "We'll email you a link to set a new password."
                  : 'Track orders and check out faster.'}
              </Text>
              {mode === 'signup' && (
                <Field label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
              )}
              <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
              {mode !== 'reset' && (
                <Field label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secure />
              )}
              {msg ? <Text style={{ color: msg.ok ? colors.success : colors.danger, fontSize: 13, marginBottom: 10 }}>{msg.text}</Text> : null}
              <Button
                label={busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Sign up' : 'Send reset link'}
                loading={busy}
                onPress={submit}
                full
              />
              <View style={{ marginTop: 14, gap: 10, alignItems: 'center' }}>
                {mode === 'signin' && (
                  <Text onPress={() => setMode('reset')} style={{ color: colors.mute, fontSize: 13 }}>
                    Forgot password?
                  </Text>
                )}
                <Text
                  onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  style={{ color: colors.lime, fontSize: 13, fontWeight: '700' }}
                >
                  {mode === 'signin' ? 'New here? Create an account' : 'Back to sign in'}
                </Text>
              </View>
            </View>
          )}
        </View>
        <Footer categories={[]} />
      </ScrollView>
    </View>
  );
}
