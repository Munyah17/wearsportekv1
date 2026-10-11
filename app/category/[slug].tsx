import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { colors } from '@/lib/theme';
import { getCategories, getProducts } from '@/lib/data';
import type { Category, Product } from '@/lib/types';
import { useTheme } from '@/lib/store';

export default function CategoryPage() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  useEffect(() => {
    (async () => {
      const cats = await getCategories();
      setCategories(cats);
      setCategory(cats.find((c) => c.slug === slug) ?? null);
      setProducts(await getProducts(slug));
    })();
  }, [slug]);

  const cols = isDesktop ? 4 : width >= 640 ? 3 : 2;
  const pad = isDesktop ? 48 : 16;
  const gap = isDesktop ? 16 : 10;
  const cardW = (Math.min(width, 1280) - pad * 2 - (cols - 1) * gap) / cols;

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <NavBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* mini hero */}
        <View style={{ height: isDesktop ? 240 : 160, position: 'relative', overflow: 'hidden' }}>
          {category?.image_url ? (
            <Image source={{ uri: category.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : null}
          <View style={{ position: 'absolute', inset: 0 as any, backgroundColor: 'rgba(10,10,11,0.6)' }} />
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: isDesktop ? 48 : 20, maxWidth: 1280, alignSelf: 'center', width: '100%' }}>
            <Text style={{ color: '#FFFFFF', fontSize: isDesktop ? 38 : 28, fontWeight: '900', letterSpacing: -0.6 }}>
              {category?.name ?? 'Products'}
            </Text>
            {category?.tagline ? (
              <Text style={{ color: '#D9D9DE', fontSize: 14, marginTop: 4 }}>{category.tagline}</Text>
            ) : null}
          </View>
        </View>

        <View style={{
          maxWidth: 1280, alignSelf: 'center', width: '100%',
          paddingHorizontal: pad, paddingTop: 26, paddingBottom: 20,
          flexDirection: 'row', flexWrap: 'wrap', gap,
        }}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} width={cardW} />
          ))}
          {!products.length && (
            <View style={{ paddingVertical: 60, alignItems: 'center', width: '100%' }}>
              <Text style={{ color: colors.mute, fontSize: 15 }}>No products in this category yet.</Text>
            </View>
          )}
        </View>
        <Footer categories={categories} />
      </ScrollView>
    </View>
  );
}
