import '../global.css';
import React, { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/lib/theme';
import { useCart, useSettings, useTheme } from '@/lib/store';
import { getSettings } from '@/lib/data';

export default function RootLayout() {
  const hydrate = useCart((s) => s.hydrate);
  const hydrateTheme = useTheme((s) => s.hydrate);
  const setSettings = useSettings((s) => s.setSettings);
  // subscribing here re-renders the whole tree on toggle — every inline
  // `colors.x` style resolves against the flipped palette automatically
  const mode = useTheme((s) => s.mode);

  useEffect(() => {
    hydrate();
    hydrateTheme();
    getSettings().then(setSettings).catch(() => {});
    if (Platform.OS === 'web') {
      document.title = 'WearSportek — Football Jerseys & Sports Gear';
    }
  }, []);

  // keep <html>, <body> and NativeWind's `dark` class in sync on web
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    document.documentElement.classList.toggle('dark', mode === 'dark');
    document.documentElement.classList.toggle('light', mode === 'light');
    document.documentElement.style.colorScheme = mode;
    document.body.style.backgroundColor = colors.ink;
  }, [mode]);

  return (
    <SafeAreaProvider>
      {/* height: '100vh' on web gives the flex chain a bounded height — without it
          ScrollView screens collapse to 0 and only the NavBar paints */}
      <View style={[{ flex: 1, backgroundColor: colors.ink },
        Platform.OS === 'web' && ({ height: '100vh' } as any)]}>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.ink, flex: 1 },
            animation: 'fade',
          }}
        />
      </View>
    </SafeAreaProvider>
  );
}
