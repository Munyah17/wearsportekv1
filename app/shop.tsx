import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Search from 'lucide-react-native/dist/esm/icons/search.mjs';
import SlidersHorizontal from 'lucide-react-native/dist/esm/icons/sliders-horizontal.mjs';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { colors, radii } from '@/lib/theme';
import { getCategories, getProducts } from '@/lib/data';
import type { Category, Product } from '@/lib/types';
import { useTheme } from '@/lib/store';

type Sort = 'new' | 'low' | 'high' | 'name';

export default function Shop() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const params = useLocalSearchParams<{ q?: string; cat?: string }>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState(params.q ?? '');
  const [cat, setCat] = useState<string>(params.cat ?? 'all');
  const [sort, setSort] = useState<Sort>('new');
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  useEffect(() => {
    getCategories().then(setCategories);
    getProducts().then(setProducts);
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (cat !== 'all') list = list.filter((p) => p.category_slug === cat);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(needle));
    }
    const sorted = [...list];
    if (sort === 'low') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'high') sorted.sort((a, b) => b.price - a.price);
    if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [products, cat, q, sort]);

  const cols = isDesktop ? 4 : width >= 640 ? 3 : 2;
  const pad = isDesktop ? 48 : 16;
  const gap = isDesktop ? 16 : 10;
  const cardW = (Math.min(width, 1280) - pad * 2 - (cols - 1) * gap) / cols;

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <NavBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ maxWidth: 1280, alignSelf: 'center', width: '100%', paddingHorizontal: pad, paddingTop: 28 }}>
          <Text style={{ color: colors.white, fontSize: isDesktop ? 34 : 26, fontWeight: '900', letterSpacing: -0.6 }}>
            Shop everything
          </Text>
          <Text style={{ color: colors.mute, fontSize: 14, marginTop: 6 }}>{filtered.length} products</Text>

          {/* search + sort */}
          <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 10, marginTop: 18 }}>
            <View style={{
              flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
              backgroundColor: colors.card, borderRadius: radii.md, borderWidth: 1, borderColor: colors.line,
              paddingHorizontal: 14,
            }}>
              <Search size={17} color={colors.mute} />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search jerseys, boots, kits…"
                placeholderTextColor={colors.mute}
                style={{ flex: 1, color: colors.white, paddingVertical: 12, fontSize: 15, outlineStyle: 'none' } as any}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <SlidersHorizontal size={15} color={colors.mute} />
              {([['new', 'Newest'], ['low', 'Price ↑'], ['high', 'Price ↓'], ['name', 'A–Z']] as [Sort, string][]).map(([v, label]) => (
                <Pressable
                  key={v}
                  onPress={() => setSort(v)}
                  style={{
                    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999,
                    backgroundColor: sort === v ? colors.lime : colors.card,
                    borderWidth: 1, borderColor: colors.line,
                  }}
                >
                  <Text style={{ color: sort === v ? colors.ink : colors.mute, fontSize: 12, fontWeight: '700' }}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* category pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }} contentContainerStyle={{ gap: 8 }}>
            {[{ id: 'all', slug: 'all', name: 'All' } as Category, ...categories].map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setCat(c.slug)}
                style={{
                  paddingVertical: 9, paddingHorizontal: 16, borderRadius: 999,
                  backgroundColor: cat === c.slug ? colors.white : colors.card,
                  borderWidth: 1, borderColor: cat === c.slug ? colors.white : colors.line,
                }}
              >
                <Text style={{ color: cat === c.slug ? colors.ink : colors.white, fontSize: 13, fontWeight: '700' }}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, marginTop: 22, paddingBottom: 20 }}>
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} width={cardW} />
            ))}
            {!filtered.length && (
              <View style={{ paddingVertical: 60, alignItems: 'center', width: '100%' }}>
                <Text style={{ color: colors.mute, fontSize: 15 }}>No products match your search.</Text>
              </View>
            )}
          </View>
        </View>
        <Footer categories={categories} />
      </ScrollView>
    </View>
  );
}
