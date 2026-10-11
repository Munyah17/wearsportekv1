import React, { useState } from 'react';
import { Image, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { colors } from '@/lib/theme';
import { useSettings , useTheme } from '@/lib/store';

export default function About() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const s = useSettings((st) => st.settings);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  // general branding banner — drop the poster into public/branding.png and it
  // appears here automatically; stays hidden while the file is missing
  const [brandFailed, setBrandFailed] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <NavBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ maxWidth: 860, alignSelf: 'center', width: '100%', paddingHorizontal: isDesktop ? 48 : 20, paddingTop: 48, paddingBottom: 40 }}>
          {!brandFailed && (
            <Image
              source={{ uri: '/branding.png' }}
              onError={() => setBrandFailed(true)}
              style={{ width: '100%', aspectRatio: 3, borderRadius: 16, marginBottom: 32 }}
              resizeMode="cover"
              accessibilityLabel={`${s.site_name} branding`}
            />
          )}
          <Text style={{ color: colors.lime, fontSize: 13, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' }}>
            About {s.site_name}
          </Text>
          <Text style={{ color: colors.white, fontSize: isDesktop ? 44 : 32, fontWeight: '900', letterSpacing: -1, marginTop: 10, lineHeight: isDesktop ? 52 : 40 }}>
            {s.about_title}
          </Text>
          {s.about_body.split('\n\n').map((p, i) => (
            <Text key={i} style={{ color: colors.mute, fontSize: 16, lineHeight: 27, marginTop: 22 }}>
              {p}
            </Text>
          ))}
        </View>
        <Footer categories={[]} />
      </ScrollView>
    </View>
  );
}
