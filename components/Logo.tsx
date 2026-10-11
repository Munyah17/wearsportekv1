import React, { useState } from 'react';
import { Image, Text } from 'react-native';
import { colors } from '@/lib/theme';
import { useTheme } from '@/lib/store';

// Brand wordmark — swaps between the uploaded dark/light logo files.
// Served from /public on web:
//   public/logo-dark.png   white-text wordmark for dark mode
//   public/logo-light.png  black-text wordmark for light mode
// Transparent PNGs look best; a missing/failed file falls back to the
// text wordmark so the header never renders a broken image.
// For native builds move the files into assets/ and switch to require().
export function Logo({ height = 30 }: { height?: number }) {
  const mode = useTheme((s) => s.mode);
  const uri = mode === 'dark' ? '/logo-dark.png' : '/logo-light.png';
  const [failed, setFailed] = useState<string | null>(null);

  if (failed !== uri) {
    return (
      <Image
        source={{ uri }}
        onError={() => setFailed(uri)}
        style={{ height, width: height * 4 }}
        resizeMode="contain"
        accessible
        accessibilityLabel="WearSportek"
      />
    );
  }
  return (
    <Text style={{ color: colors.white, fontWeight: '900', fontSize: 18, letterSpacing: -0.5 }}>
      wear<Text style={{ color: colors.lime }}>sportek</Text>
    </Text>
  );
}
