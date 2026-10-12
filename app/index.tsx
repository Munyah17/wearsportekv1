import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import BadgeCheck from 'lucide-react-native/dist/esm/icons/badge-check.mjs';
import Paintbrush from 'lucide-react-native/dist/esm/icons/paintbrush.mjs';
import Shirt from 'lucide-react-native/dist/esm/icons/shirt.mjs';
import Truck from 'lucide-react-native/dist/esm/icons/truck.mjs';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { HeroCarousel } from '@/components/HeroCarousel';
import { CategorySection } from '@/components/CategorySection';
import { colors, radii } from '@/lib/theme';
import { getBanners, getCategories, getProducts } from '@/lib/data';
import type { Banner, Category, Product } from '@/lib/types';
import { useTheme } from '@/lib/store';

export default function Home() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [byCat, setByCat] = useState<Record<string, Product[]>>({});
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const [b, cats] = await Promise.all([getBanners(), getCategories()]);
      setBanners(b);
      setCategories(cats);
      const map: Record<string, Product[]> = {};
      await Promise.all(
        cats.slice(0, 6).map(async (c) => {
          map[c.slug] = await getProducts(c.slug);
        })
      );
      setByCat(map);
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <NavBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroCarousel banners={banners} />

        {/* trust strip */}
        <View style={{
          flexDirection: isDesktop ? 'row' : 'column',
          maxWidth: 1280, alignSelf: 'center', width: '100%',
          paddingHorizontal: isDesktop ? 48 : 16, paddingVertical: 20, gap: 12,
        }}>
          {[
            { icon: <BadgeCheck size={18} color={colors.lime} />, t: 'Authentic quality', d: 'Fan & player-grade gear' },
            { icon: <Paintbrush size={18} color={colors.lime} />, t: 'Name + number printing', d: 'Customise any jersey' },
            { icon: <Truck size={18} color={colors.lime} />, t: 'Nationwide delivery', d: 'Harare same-day available' },
            { icon: <Shirt size={18} color={colors.lime} />, t: 'Club kit supply', d: 'Design, supply & manufacture' },
          ].map((f) => (
            <View key={f.t} style={{
              flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12,
              backgroundColor: colors.card, borderRadius: radii.md, padding: 14,
              borderWidth: 1, borderColor: colors.line,
            }}>
              {f.icon}
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.white, fontSize: 13, fontWeight: '700' }}>{f.t}</Text>
                <Text style={{ color: colors.mute, fontSize: 12 }}>{f.d}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 5 category sections — Jerseys first */}
        {categories.slice(0, 6).map((c) => (
          <CategorySection key={c.id} category={c} products={byCat[c.slug] ?? []} />
        ))}

        {/* customisation CTA banner */}
        <View style={{
          maxWidth: 1280, alignSelf: 'center', width: '100%',
          paddingHorizontal: isDesktop ? 48 : 16, paddingVertical: 32,
        }}>
          <View style={{
            borderRadius: radii.xl, overflow: 'hidden', backgroundColor: colors.lime,
            padding: isDesktop ? 48 : 28, position: 'relative',
          }}>
            <Text style={{ color: colors.ink, fontSize: isDesktop ? 36 : 24, fontWeight: '900', letterSpacing: -0.8, maxWidth: 560 }}>
              Your name. Your number. Your shirt.
            </Text>
            <Text style={{ color: colors.ink + 'B3', fontSize: 15, marginTop: 8, maxWidth: 480 }}>
              Add professional name & number printing to any jersey at checkout — or let us design your whole club's kit.
            </Text>
            <Pressable
              onPress={() => router.push('/category/jerseys' as any)}
              style={({ pressed }: any) => ({
                marginTop: 20, alignSelf: 'flex-start', backgroundColor: colors.ink,
                borderRadius: 999, paddingVertical: 12, paddingHorizontal: 26,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              } as any)}
            >
              <Text style={{ color: colors.lime, fontWeight: '800', fontSize: 15 }}>Customise a jersey</Text>
            </Pressable>
          </View>
        </View>

        <Footer categories={categories} />
      </ScrollView>
    </View>
  );
}
