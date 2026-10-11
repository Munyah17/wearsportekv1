import React from 'react';
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react-native';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui';
import { colors, radii } from '@/lib/theme';
import { formatUSD } from '@/lib/seed';
import { useCart , useTheme } from '@/lib/store';

export default function Cart() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const { items, setQty, remove, subtotal } = useCart();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const pad = isDesktop ? 48 : 16;

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <NavBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ maxWidth: 1280, alignSelf: 'center', width: '100%', paddingHorizontal: pad, paddingTop: 28, minHeight: 400 }}>
          <Text style={{ color: colors.white, fontSize: isDesktop ? 34 : 26, fontWeight: '900', letterSpacing: -0.6 }}>
            Your bag
          </Text>

          {!items.length ? (
            <View style={{ alignItems: 'center', paddingVertical: 80, gap: 16 }}>
              <ShoppingBag size={44} color={colors.line} />
              <Text style={{ color: colors.mute, fontSize: 15 }}>Your bag is empty.</Text>
              <Button label="Start shopping" onPress={() => router.push('/shop')} />
            </View>
          ) : (
            <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 28, marginTop: 24, alignItems: 'flex-start' }}>
              {/* items */}
              <View style={{ flex: 1, width: '100%', gap: 12 }}>
                {items.map((it, i) => (
                  <View key={i} style={{
                    flexDirection: 'row', gap: 14, backgroundColor: colors.card,
                    borderRadius: radii.lg, borderWidth: 1, borderColor: colors.line, padding: 12,
                  }}>
                    <Image source={{ uri: it.product.images[0] }} style={{ width: 84, height: 96, borderRadius: 10 }} />
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14 }} numberOfLines={2}>
                        {it.product.name}
                      </Text>
                      <Text style={{ color: colors.mute, fontSize: 12 }}>Size {it.size}</Text>
                      {(it.customName || it.customNumber) ? (
                        <Text style={{ color: colors.lime, fontSize: 12 }}>
                          Customised: {[it.customName, it.customNumber ? `#${it.customNumber}` : ''].filter(Boolean).join(' ')}
                          {it.unitCustomFee > 0 ? ` (+${formatUSD(it.unitCustomFee)})` : ''}
                        </Text>
                      ) : null}
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.pitch, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 4 }}>
                          <Pressable onPress={() => setQty(i, it.qty - 1)} style={{ padding: 4 }}>
                            <Minus size={14} color={colors.white} />
                          </Pressable>
                          <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14, minWidth: 18, textAlign: 'center' }}>{it.qty}</Text>
                          <Pressable onPress={() => setQty(i, it.qty + 1)} style={{ padding: 4 }}>
                            <Plus size={14} color={colors.white} />
                          </Pressable>
                        </View>
                        <Text style={{ color: colors.lime, fontWeight: '800', fontSize: 15 }}>
                          {formatUSD((it.product.price + it.unitCustomFee) * it.qty)}
                        </Text>
                      </View>
                    </View>
                    <Pressable onPress={() => remove(i)} style={{ padding: 4, alignSelf: 'flex-start' }}>
                      <Trash2 size={16} color={colors.mute} />
                    </Pressable>
                  </View>
                ))}
              </View>

              {/* summary */}
              <View style={{
                width: isDesktop ? 340 : '100%',
                backgroundColor: colors.card, borderRadius: radii.lg,
                borderWidth: 1, borderColor: colors.line, padding: 20, gap: 12,
              }}>
                <Text style={{ color: colors.white, fontWeight: '800', fontSize: 16 }}>Order summary</Text>
                <Row label="Subtotal" value={formatUSD(subtotal())} />
                <Row label="Delivery" value="At checkout" muted />
                <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 4 }} />
                <Row label="Total" value={formatUSD(subtotal())} strong />
                <Button label="Checkout" onPress={() => router.push('/checkout')} full />
                <Text style={{ color: colors.mute, fontSize: 11, textAlign: 'center' }}>
                  EcoCash · InnBucks · Omari · OneMoney · Transfer · Card
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

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: colors.mute, fontSize: strong ? 15 : 13 }}>{label}</Text>
      <Text style={{ color: strong ? colors.white : muted ? colors.mute : colors.white, fontWeight: strong ? '900' : '600', fontSize: strong ? 18 : 13 }}>
        {value}
      </Text>
    </View>
  );
}
