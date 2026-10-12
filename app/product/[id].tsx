import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Check from 'lucide-react-native/dist/esm/icons/check.mjs';
import Minus from 'lucide-react-native/dist/esm/icons/minus.mjs';
import Paintbrush from 'lucide-react-native/dist/esm/icons/paintbrush.mjs';
import Plus from 'lucide-react-native/dist/esm/icons/plus.mjs';
import ShoppingBag from 'lucide-react-native/dist/esm/icons/shopping-bag.mjs';
import Truck from 'lucide-react-native/dist/esm/icons/truck.mjs';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Badge, Button } from '@/components/ui';
import { ProductCard } from '@/components/ProductCard';
import { colors, radii } from '@/lib/theme';
import { formatUSD } from '@/lib/seed';
import { getCategories, getProduct, getProducts } from '@/lib/data';
import { useCart, useSettings , useTheme } from '@/lib/store';
import type { Category, Product } from '@/lib/types';

export default function ProductPage() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const add = useCart((s) => s.add);
  const settings = useSettings((s) => s.settings);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [wantCustom, setWantCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await getProduct(id!);
      setProduct(p);
      setCategories(await getCategories());
      if (p) setRelated((await getProducts(p.category_slug)).filter((x) => x.id !== p.id).slice(0, 4));
    })();
  }, [id]);

  const customFee = useMemo(() => {
    if (!wantCustom || !product?.is_customizable) return 0;
    // flat per-product fee (e.g. Warriors jerseys: name+number printed on the back)
    if (product.custom_fee != null) return product.custom_fee;
    let fee = 0;
    if (customName.trim()) fee += settings.customisation_name_fee;
    if (customNumber.trim()) fee += settings.customisation_number_fee;
    if (!customName.trim() && !customNumber.trim()) fee = settings.customisation_fee;
    return fee;
  }, [wantCustom, customName, customNumber, product, settings]);

  const total = product ? product.price + customFee : 0;
  // flat-fee customisation always means a back print — require the name
  const needsName = Boolean(wantCustom && product?.custom_fee != null);
  const canAdd = Boolean(product && size && (!needsName || customName.trim()));

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink }}>
        <NavBar />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.mute }}>Loading…</Text>
        </View>
      </View>
    );
  }

  const onAdd = () => {
    if (!size) return;
    add(
      product,
      size,
      wantCustom && customName.trim() ? customName.trim().toUpperCase() : undefined,
      wantCustom && customNumber.trim() ? customNumber.trim() : undefined,
      customFee
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <NavBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{
          maxWidth: 1280, alignSelf: 'center', width: '100%',
          paddingHorizontal: isDesktop ? 48 : 16, paddingTop: 24,
          flexDirection: isDesktop ? 'row' : 'column', gap: isDesktop ? 48 : 24,
        }}>
          {/* gallery */}
          <View style={{ flex: isDesktop ? 1 : 0 }}>
            <View style={{ borderRadius: radii.xl, overflow: 'hidden', backgroundColor: colors.pitch, aspectRatio: 0.92 }}>
              <Image source={{ uri: product.images[imgIdx] ?? product.images[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              {/* live name+number preview — sits where the back print goes */}
              {wantCustom && product.is_customizable ? (
                <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center' }}>
                  <Text style={{
                    marginTop: '19%',
                    color: '#fff', fontSize: isDesktop ? 24 : 18, fontWeight: '800', letterSpacing: 4,
                    textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
                    opacity: customName.trim() ? 1 : 0.4,
                    ...(Platform.OS === 'web' ? ({ WebkitTextStroke: '1px rgba(0,0,0,0.5)' } as any) : null),
                  }}>
                    {(customName.trim() || 'YOUR NAME').toUpperCase()}
                  </Text>
                  <Text style={{
                    marginTop: '3%',
                    color: '#fff', fontSize: isDesktop ? 130 : Math.min(130, width * 0.3), fontWeight: '900',
                    textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
                    opacity: customNumber.trim() ? 1 : 0.4,
                    ...(Platform.OS === 'web' ? ({ WebkitTextStroke: '2px rgba(0,0,0,0.5)' } as any) : null),
                  }}>
                    {customNumber.trim() || '9'}
                  </Text>
                </View>
              ) : null}
              {product.badge ? (
                <View style={{ position: 'absolute', top: 14, left: 14 }}><Badge label={product.badge} /></View>
              ) : null}
            </View>
            {product.images.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }} contentContainerStyle={{ gap: 8 }}>
                {product.images.map((uri, i) => (
                  <Pressable key={uri + i} onPress={() => setImgIdx(i)}>
                    <Image
                      source={{ uri }}
                      style={{
                        width: 64, height: 72, borderRadius: 10,
                        borderWidth: 2, borderColor: i === imgIdx ? colors.lime : colors.line,
                      }}
                    />
                  </Pressable>
                ))}
              </ScrollView>
            )}
            {wantCustom && product.is_customizable ? (
              <Text style={{ color: colors.mute, fontSize: 11, marginTop: 8 }}>
                Live preview — name &amp; number printed on the back
              </Text>
            ) : null}
          </View>

          {/* details */}
          <View style={{ flex: 1, gap: 18 }}>
            <View>
              <Text style={{ color: colors.mute, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                {categories.find((c) => c.slug === product.category_slug)?.name ?? product.category_slug}
              </Text>
              <Text style={{ color: colors.white, fontSize: isDesktop ? 34 : 26, fontWeight: '900', letterSpacing: -0.6, marginTop: 6 }}>
                {product.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
                <Text style={{ color: colors.lime, fontSize: 26, fontWeight: '900' }}>{formatUSD(product.price)}</Text>
                {product.compare_at_price ? (
                  <Text style={{ color: colors.mute, fontSize: 15, textDecorationLine: 'line-through' }}>
                    {formatUSD(product.compare_at_price)}
                  </Text>
                ) : null}
              </View>
            </View>

            {product.description ? (
              <Text style={{ color: colors.mute, fontSize: 14, lineHeight: 22 }}>{product.description}</Text>
            ) : null}

            {/* sizes */}
            <View>
              <Text style={{ color: colors.white, fontSize: 13, fontWeight: '700', marginBottom: 10 }}>
                Select size{!size ? ' *' : ` — ${size}`}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {product.sizes.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setSize(s)}
                    style={{
                      minWidth: 48, paddingVertical: 11, paddingHorizontal: 14,
                      borderRadius: radii.md, alignItems: 'center',
                      backgroundColor: size === s ? colors.lime : colors.card,
                      borderWidth: 1, borderColor: size === s ? colors.lime : colors.line,
                    }}
                  >
                    <Text style={{ color: size === s ? colors.ink : colors.white, fontWeight: '700', fontSize: 14 }}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* customisation — the USP */}
            {product.is_customizable && (
              <View style={{
                borderRadius: radii.lg, borderWidth: 1,
                borderColor: wantCustom ? colors.lime : colors.line,
                backgroundColor: colors.card, padding: 16, gap: 12,
              }}>
                <Pressable onPress={() => {
                  const next = !wantCustom;
                  setWantCustom(next);
                  // jump to the back image so the preview lands where the print goes
                  if (product.images.length > 1) setImgIdx(next ? product.images.length - 1 : 0);
                }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{
                    width: 22, height: 22, borderRadius: 6,
                    backgroundColor: wantCustom ? colors.lime : 'transparent',
                    borderWidth: 2, borderColor: wantCustom ? colors.lime : colors.mute,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {wantCustom && <Check size={14} color={colors.ink} strokeWidth={3} />}
                  </View>
                  <Paintbrush size={17} color={colors.lime} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.white, fontWeight: '800', fontSize: 14 }}>Add name & number</Text>
                    <Text style={{ color: colors.mute, fontSize: 12 }}>
                      {product.custom_fee != null
                        ? `+${formatUSD(product.custom_fee)} — printed on the back`
                        : `${formatUSD(settings.customisation_name_fee)} name · ${formatUSD(settings.customisation_number_fee)} number`}
                    </Text>
                  </View>
                </Pressable>
                {wantCustom && (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1.6 }}>
                      <TextInput
                        value={customName}
                        onChangeText={(t) => setCustomName(t.slice(0, 14))}
                        placeholder="NAME (e.g. MUSA)"
                        placeholderTextColor={colors.mute}
                        autoCapitalize="characters"
                        style={{
                          backgroundColor: colors.pitch, borderRadius: radii.md, borderWidth: 1, borderColor: colors.line,
                          color: colors.white, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14,
                          letterSpacing: 1, fontWeight: '700', outlineStyle: 'none',
                        } as any}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        value={customNumber}
                        onChangeText={(t) => setCustomNumber(t.replace(/[^0-9]/g, '').slice(0, 2))}
                        placeholder="NO."
                        placeholderTextColor={colors.mute}
                        keyboardType="number-pad"
                        style={{
                          backgroundColor: colors.pitch, borderRadius: radii.md, borderWidth: 1, borderColor: colors.line,
                          color: colors.white, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14,
                          fontWeight: '700', outlineStyle: 'none',
                        } as any}
                      />
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* add to cart */}
            <View style={{ gap: 10 }}>
              <Button
                label={added ? 'Added to bag ✓' : `Add to bag — ${formatUSD(total)}`}
                icon={added ? <Check size={18} color={colors.ink} /> : <ShoppingBag size={18} color={colors.ink} />}
                onPress={onAdd}
                disabled={!canAdd}
                full
              />
              {!size ? (
                <Text style={{ color: colors.mute, fontSize: 12, textAlign: 'center' }}>Pick a size to continue</Text>
              ) : needsName && !customName.trim() ? (
                <Text style={{ color: colors.mute, fontSize: 12, textAlign: 'center' }}>Type a name for the back print</Text>
              ) : null}
              {added && (
                <Button label="Go to bag" variant="outline" onPress={() => router.push('/cart')} full />
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Truck size={15} color={colors.mute} />
              <Text style={{ color: colors.mute, fontSize: 12 }}>
                {product.stock > 0 ? `${product.stock} in stock — ` : ''}nationwide delivery, fees shown at checkout
              </Text>
            </View>
          </View>
        </View>

        {/* related */}
        {related.length > 0 && (
          <View style={{ maxWidth: 1280, alignSelf: 'center', width: '100%', paddingHorizontal: isDesktop ? 48 : 16, paddingTop: 40 }}>
            <Text style={{ color: colors.white, fontSize: 20, fontWeight: '800', marginBottom: 16 }}>You may also like</Text>
            <ScrollView horizontal={!isDesktop} showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, flexDirection: 'row' }}
              style={{ flexDirection: 'row', flexWrap: isDesktop ? 'wrap' : 'nowrap', gap: 12 }}>
              {related.map((p) => (
                <ProductCard key={p.id} product={p} width={isDesktop ? (Math.min(width, 1280) - 96 - 36) / 4 : 220} />
              ))}
            </ScrollView>
          </View>
        )}

        <Footer categories={categories} />
      </ScrollView>
    </View>
  );
}
