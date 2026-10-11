import React, { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { ProductCard } from './ProductCard';
import { SectionHeader } from './ui';
import { colors } from '@/lib/theme';
import type { Category, Product } from '@/lib/types';

// Desktop: 4-col grid, one row. Mobile: single-column snap carousel.
export function CategorySection({ category, products }: { category: Category; products: Product[] }) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isDesktop = width >= 1024;
  const listRef = useRef<FlatList>(null);
  const [cardW, setCardW] = useState(0);
  const [scrollX, setScrollX] = useState(0);

  const pad = isDesktop ? 48 : 16;
  const shown = isDesktop ? products.slice(0, 4) : products;

  const cardWidth = isDesktop
    ? (Math.min(width, 1280) - pad * 2 - 3 * 16) / 4
    : Math.min(width - pad * 2 - 24, 320);

  const nudge = (dir: 1 | -1) => {
    const target = scrollX + dir * (cardWidth + 12);
    listRef.current?.scrollToOffset({ offset: Math.max(0, target), animated: true });
  };

  return (
    <View
      style={{
        width: '100%',
        maxWidth: 1280,
        alignSelf: 'center',
        paddingHorizontal: pad,
        paddingVertical: 28,
      }}
    >
      <SectionHeader
        title={category.name}
        subtitle={category.tagline}
        action={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {!isDesktop && shown.length > 1 && (
              <>
                <NavDot onPress={() => nudge(-1)}><ChevronLeft color={colors.white} size={18} /></NavDot>
                <NavDot onPress={() => nudge(1)}><ChevronRight color={colors.white} size={18} /></NavDot>
              </>
            )}
            <Pressable
              onPress={() => router.push(`/category/${category.slug}` as any)}
              style={({ hovered }: any) => ({
                flexDirection: 'row', alignItems: 'center', gap: 6,
                opacity: hovered ? 0.8 : 1,
              } as any)}
            >
              <Text style={{ color: colors.lime, fontSize: 13, fontWeight: '700' }}>View all</Text>
              <ArrowRight color={colors.lime} size={15} />
            </Pressable>
          </View>
        }
      />

      {isDesktop ? (
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {shown.map((p) => (
            <ProductCard key={p.id} product={p} width={cardWidth} />
          ))}
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={shown}
          keyExtractor={(p) => p.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + 12}
          decelerationRate="fast"
          contentContainerStyle={{ gap: 12 }}
          onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
          renderItem={({ item }) => <ProductCard product={item} width={cardWidth} />}
        />
      )}
    </View>
  );
}

function NavDot({ children, onPress }: { children: React.ReactNode; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }: any) => ({
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: pressed ? colors.line : colors.card,
        borderWidth: 1, borderColor: colors.line,
        alignItems: 'center', justifyContent: 'center',
      } as any)}
    >
      {children}
    </Pressable>
  );
}
