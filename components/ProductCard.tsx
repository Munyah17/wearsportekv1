import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Badge } from './ui';
import { colors, radii } from '@/lib/theme';
import { formatUSD } from '@/lib/seed';
import type { Product } from '@/lib/types';

export function ProductCard({ product, width }: { product: Product; width?: number }) {
  const router = useRouter();
  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      style={({ pressed, hovered }: any) => ({
        width,
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: hovered ? colors.lime + '66' : colors.line,
        transform: [{ translateY: hovered ? -4 : pressed ? 1 : 0 }],
        transitionDuration: '160ms',
      } as any)}
    >
      <View style={{ aspectRatio: 0.9, backgroundColor: colors.pitch }}>
        <Image
          source={{ uri: product.images[0] }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        {product.badge ? (
          <View style={{ position: 'absolute', top: 10, left: 10 }}>
            <Badge label={product.badge} tone={product.badge === 'NEW' ? 'gold' : 'lime'} />
          </View>
        ) : null}
        {discount > 0 ? (
          <View style={{ position: 'absolute', top: 10, right: 10 }}>
            <Badge label={`-${discount}%`} tone="red" />
          </View>
        ) : null}
      </View>
      <View style={{ padding: 12, gap: 4 }}>
        <Text numberOfLines={1} style={{ color: colors.white, fontSize: 14, fontWeight: '700' }}>
          {product.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text style={{ color: colors.lime, fontSize: 15, fontWeight: '800' }}>
            {formatUSD(product.price)}
          </Text>
          {product.compare_at_price ? (
            <Text style={{ color: colors.mute, fontSize: 12, textDecorationLine: 'line-through' }}>
              {formatUSD(product.compare_at_price)}
            </Text>
          ) : null}
        </View>
        {product.is_customizable ? (
          <Text style={{ color: colors.mute, fontSize: 11 }}>
            {product.custom_fee != null ? `Name & number +${formatUSD(product.custom_fee)}` : 'Name + number available'}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
