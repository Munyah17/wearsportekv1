import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import ChevronLeft from 'lucide-react-native/dist/esm/icons/chevron-left.mjs';
import ChevronRight from 'lucide-react-native/dist/esm/icons/chevron-right.mjs';
import { colors, radii } from '@/lib/theme';
import type { Banner } from '@/lib/types';

// 10-slide auto-playing hero. Crossfade + ken-burns zoom per slide, dots + arrows.
export function HeroCarousel({ banners }: { banners: Banner[] }) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const zoom = useRef(new Animated.Value(1)).current;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const nativeDriver = Platform.OS !== 'web'; // RN-web has no RCTAnimation — use JS driver
  const slides = banners.slice(0, 10);
  const isMobile = width < 768;
  const height = isMobile ? 380 : Math.min(520, width * 0.42);

  const go = useCallback(
    (next: number) => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 260, useNativeDriver: nativeDriver }),
        Animated.timing(zoom, { toValue: 1.06, duration: 260, useNativeDriver: nativeDriver }),
      ]).start(() => {
        setIndex(((next % slides.length) + slides.length) % slides.length);
        fade.setValue(0);
        Animated.parallel([
          Animated.timing(fade, { toValue: 1, duration: 480, useNativeDriver: nativeDriver }),
          Animated.timing(zoom, { toValue: 1, duration: 3200, useNativeDriver: nativeDriver }),
        ]).start();
      });
    },
    [slides.length, fade, zoom, nativeDriver]
  );

  useEffect(() => {
    if (slides.length < 2) return;
    timer.current = setInterval(() => go(index + 1), 5200);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [index, slides.length, go]);

  if (!slides.length) return null;
  const b = slides[index];

  return (
    <View style={{ width: '100%', height, backgroundColor: colors.pitch, position: 'relative', overflow: 'hidden' }}>
      <Animated.View style={{ flex: 1, opacity: fade, transform: [{ scale: zoom }] }}>
        <Image source={{ uri: b.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      </Animated.View>
      {/* gradient scrim */}
      <View
        style={{
          position: 'absolute', inset: 0 as any,
          backgroundColor: 'rgba(10,10,11,0.15)',
        }}
      />
      <View
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%',
          // fake vertical gradient that works on web + native
          backgroundColor: 'transparent',
        }}
        pointerEvents="none"
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(10,10,11,0.55)',
          ...( { maskImage: 'linear-gradient(to top, black, transparent)', WebkitMaskImage: 'linear-gradient(to top, black, transparent)' } as any),
        }} />
      </View>

      {/* copy */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: isMobile ? 20 : 48 }}>
        <View style={{ maxWidth: 640 }}>
          <Animated.View style={{ opacity: fade }}>
            <Text style={{
              color: '#FFFFFF', // over dark image scrim — stays white in both themes
              fontSize: isMobile ? 30 : 52,
              fontWeight: '900',
              letterSpacing: -1,
              lineHeight: isMobile ? 36 : 58,
            }}>
              {b.title}
            </Text>
            {b.subtitle ? (
              <Text style={{ color: '#D9D9DE', fontSize: isMobile ? 14 : 17, marginTop: 8 }}>
                {b.subtitle}
              </Text>
            ) : null}
            {b.cta_label ? (
              <Pressable
                onPress={() => router.push((b.cta_link || '/shop') as any)}
                style={({ pressed, hovered }: any) => ({
                  marginTop: 18,
                  alignSelf: 'flex-start',
                  backgroundColor: colors.lime,
                  borderRadius: 999,
                  paddingVertical: 12,
                  paddingHorizontal: 26,
                  transform: [{ scale: pressed ? 0.96 : hovered ? 1.04 : 1 }],
                  transitionDuration: '140ms',
                } as any)}
              >
                <Text style={{ color: colors.ink, fontWeight: '800', fontSize: 15 }}>{b.cta_label}</Text>
              </Pressable>
            ) : null}
          </Animated.View>
        </View>
      </View>

      {/* arrows — desktop only */}
      {!isMobile && slides.length > 1 && (
        <>
          <ArrowBtn side="left" onPress={() => go(index - 1)} />
          <ArrowBtn side="right" onPress={() => go(index + 1)} />
        </>
      )}

      {/* dots */}
      {slides.length > 1 && (
        <View style={{ position: 'absolute', top: isMobile ? 14 : 22, right: isMobile ? 16 : 28, flexDirection: 'row', gap: 6 }}>
          {slides.map((_, i) => (
            <Pressable key={i} onPress={() => go(i)}>
              <View
                style={{
                  width: i === index ? 22 : 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: i === index ? colors.lime : 'rgba(255,255,255,0.45)',
                }}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function ArrowBtn({ side, onPress }: { side: 'left' | 'right'; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }: any) => ({
        position: 'absolute',
        [side]: 24,
        top: '45%',
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: hovered ? 'rgba(10,10,11,0.8)' : 'rgba(10,10,11,0.5)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        transitionDuration: '140ms',
      } as any)}
    >
      {side === 'left' ? <ChevronLeft color="#fff" size={22} /> : <ChevronRight color="#fff" size={22} />}
    </Pressable>
  );
}
