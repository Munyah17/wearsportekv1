import React, { useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import HeartHandshake from 'lucide-react-native/dist/esm/icons/heart-handshake.mjs';
import Menu from 'lucide-react-native/dist/esm/icons/menu.mjs';
import Moon from 'lucide-react-native/dist/esm/icons/moon.mjs';
import Search from 'lucide-react-native/dist/esm/icons/search.mjs';
import Shield from 'lucide-react-native/dist/esm/icons/shield.mjs';
import ShoppingBag from 'lucide-react-native/dist/esm/icons/shopping-bag.mjs';
import Sun from 'lucide-react-native/dist/esm/icons/sun.mjs';
import User from 'lucide-react-native/dist/esm/icons/user.mjs';
import X from 'lucide-react-native/dist/esm/icons/x.mjs';
import { colors } from '@/lib/theme';
import { useCart, useSettings, useTheme } from '@/lib/store';
import { useAuth } from '@/lib/hooks';
import { Logo } from './Logo';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/category/custom-kits', label: 'Custom Kits' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function NavBar() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isDesktop = width >= 1024;
  const [open, setOpen] = useState(false);
  const count = useCart((s) => s.count());
  const settings = useSettings((s) => s.settings);
  const { isAdmin } = useAuth();
  const mode = useTheme((s) => s.mode);
  const toggleTheme = useTheme((s) => s.toggle);

  return (
    <>
      {/* announcement bar */}
      {settings.announcement ? (
        <View style={{ backgroundColor: colors.lime, paddingVertical: 7, paddingHorizontal: 16 }}>
          <Text style={{ color: colors.ink, fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
            {settings.announcement}
          </Text>
        </View>
      ) : null}

      <View
        style={{
          position: 'sticky' as any,
          top: 0,
          zIndex: 50,
          backgroundColor: colors.nav,
          borderBottomWidth: 1,
          borderBottomColor: colors.line,
          paddingHorizontal: isDesktop ? 40 : 16,
          paddingVertical: 12,
          backdropFilter: 'blur(12px)',
        } as any}
      >
        <View style={{ maxWidth: 1280, alignSelf: 'center', width: '100%', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {/* logo */}
          <Link href="/" asChild>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Logo height={30} />
            </Pressable>
          </Link>

          {/* desktop links */}
          {isDesktop && (
            <View style={{ flexDirection: 'row', gap: 26, marginLeft: 32, flex: 1, justifyContent: 'flex-end' }}>
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href as any} asChild>
                  <Pressable style={({ hovered }: any) => ({ opacity: hovered ? 0.7 : 1 } as any)}>
                    <Text style={{ color: colors.white, fontSize: 14, fontWeight: '600' }}>{l.label}</Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          )}

          <View style={{ flex: isDesktop ? 0 : 1 }} />

          {/* actions */}
          <NavIcon onPress={() => router.push('/shop')} label="Search">
            <Search color={colors.white} size={20} />
          </NavIcon>
          {isAdmin && (
            <NavIcon onPress={() => router.push('/admin')} label="Admin">
              <Shield color={colors.gold} size={20} />
            </NavIcon>
          )}
          <NavIcon onPress={() => router.push('/account')} label="Account">
            <User color={colors.white} size={20} />
          </NavIcon>
          <NavIcon onPress={() => router.push('/cart')} label="Cart">
            <View>
              <ShoppingBag color={colors.white} size={20} />
              {count > 0 && (
                <View style={{
                  position: 'absolute', top: -6, right: -8, minWidth: 16, height: 16,
                  borderRadius: 8, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
                }}>
                  <Text style={{ color: colors.ink, fontSize: 10, fontWeight: '800' }}>{count}</Text>
                </View>
              )}
            </View>
          </NavIcon>
          <NavIcon onPress={toggleTheme} label={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
            {mode === 'dark'
              ? <Sun color={colors.white} size={20} />
              : <Moon color={colors.white} size={20} />}
          </NavIcon>
          {!isDesktop && (
            <NavIcon onPress={() => setOpen(!open)} label="Menu">
              {open ? <X color={colors.white} size={22} /> : <Menu color={colors.white} size={22} />}
            </NavIcon>
          )}
        </View>
      </View>

      {/* mobile drawer */}
      {!isDesktop && open && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
          backgroundColor: colors.scrim,
          paddingTop: 80, paddingHorizontal: 24,
        } as any}>
          <Pressable onPress={() => setOpen(false)} style={{ position: 'absolute', top: 18, right: 18, padding: 8 }}>
            <X color={colors.white} size={26} />
          </Pressable>
          {LINKS.map((l) => (
            <Pressable
              key={l.href}
              onPress={() => { setOpen(false); router.push(l.href as any); }}
              style={{ paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.line }}
            >
              <Text style={{ color: colors.white, fontSize: 22, fontWeight: '700' }}>{l.label}</Text>
            </Pressable>
          ))}
          <View style={{ marginTop: 28, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <HeartHandshake color={colors.lime} size={16} />
            <Text style={{ color: colors.mute, fontSize: 13 }}>{settings.tagline}</Text>
          </View>
        </View>
      )}
    </>
  );
}

function NavIcon({ children, onPress, label }: { children: React.ReactNode; onPress: () => void; label: string }) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={({ hovered }: any) => ({ padding: 8, opacity: hovered ? 0.7 : 1 } as any)}
    >
      {children}
    </Pressable>
  );
}
