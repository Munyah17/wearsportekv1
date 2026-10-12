import React from 'react';
import { Linking, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import AtSign from 'lucide-react-native/dist/esm/icons/at-sign.mjs';
import Camera from 'lucide-react-native/dist/esm/icons/camera.mjs';
import Mail from 'lucide-react-native/dist/esm/icons/mail.mjs';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin.mjs';
import MessageCircle from 'lucide-react-native/dist/esm/icons/message-circle.mjs';
import Music2 from 'lucide-react-native/dist/esm/icons/music-2.mjs';
import Phone from 'lucide-react-native/dist/esm/icons/phone.mjs';
import { colors } from '@/lib/theme';
import { useSettings } from '@/lib/store';
import { Logo } from './Logo';
import type { Category } from '@/lib/types';

// lucide removed brand glyphs — use closest generic icons, keyed by admin-editable social label
const SOCIAL_ICONS: Record<string, any> = {
  Instagram: Camera,
  Facebook: AtSign,
  WhatsApp: MessageCircle,
  TikTok: Music2,
};

export function Footer({ categories }: { categories: Category[] }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const s = useSettings((st) => st.settings);
  const router = useRouter();

  return (
    <View style={{ borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.pitch, marginTop: 40 }}>
      <View style={{
        maxWidth: 1280, alignSelf: 'center', width: '100%',
        paddingHorizontal: isDesktop ? 48 : 20, paddingVertical: 44,
        flexDirection: isDesktop ? 'row' : 'column', gap: 36,
      }}>
        {/* brand */}
        <View style={{ flex: 1.4, gap: 12 }}>
          <Logo height={26} />
          <Text style={{ color: colors.mute, fontSize: 13, lineHeight: 20, maxWidth: 300 }}>{s.tagline}.</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            {s.socials.map((so) => {
              const Icon = SOCIAL_ICONS[so.label] ?? MessageCircle;
              return (
                <Pressable
                  key={so.label}
                  onPress={() => Linking.openURL(so.url)}
                  style={({ hovered }: any) => ({
                    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card,
                    borderWidth: 1, borderColor: hovered ? colors.lime : colors.line,
                    alignItems: 'center', justifyContent: 'center',
                  } as any)}
                >
                  <Icon color={colors.white} size={16} />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* shop */}
        <View style={{ flex: 1, gap: 10 }}>
          <Text style={{ color: colors.white, fontWeight: '800', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Shop</Text>
          {categories.slice(0, 5).map((c) => (
            <Pressable key={c.id} onPress={() => router.push(`/category/${c.slug}` as any)}>
              <Text style={{ color: colors.mute, fontSize: 13 }}>{c.name}</Text>
            </Pressable>
          ))}
        </View>

        {/* help */}
        <View style={{ flex: 1, gap: 10 }}>
          <Text style={{ color: colors.white, fontWeight: '800', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Help</Text>
          {[['About us', '/about'], ['Contact', '/contact'], ['Delivery & returns', '/about'], ['Size guide', '/about'], ['Custom kits', '/category/custom-kits']].map(([label, href]) => (
            <Pressable key={label} onPress={() => router.push(href as any)}>
              <Text style={{ color: colors.mute, fontSize: 13 }}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {/* contact */}
        <View style={{ flex: 1.2, gap: 10 }}>
          <Text style={{ color: colors.white, fontWeight: '800', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Contact</Text>
          <Row icon={<Phone size={14} color={colors.lime} />} text={s.contact_phone} />
          <Row icon={<Mail size={14} color={colors.lime} />} text={s.contact_email} />
          <Row icon={<MapPin size={14} color={colors.lime} />} text={s.address} />
        </View>
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingVertical: 16, alignItems: 'center', paddingHorizontal: 16 }}>
        <Text style={{ color: colors.mute, fontSize: 12, textAlign: 'center' }}>{s.footer_text}</Text>
      </View>
    </View>
  );
}

function Row({ icon, text }: { icon: React.ReactNode; text?: string }) {
  if (!text) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {icon}
      <Text style={{ color: colors.mute, fontSize: 13, flexShrink: 1 }}>{text}</Text>
    </View>
  );
}
