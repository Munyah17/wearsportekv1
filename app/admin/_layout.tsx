import React, { useEffect } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import {
  Image as ImageIcon, LayoutDashboard, LogOut, Package, Settings2,
  ShoppingCart, Tags, Truck, Wallet,
} from 'lucide-react-native';
import { colors } from '@/lib/theme';
import { useAuth } from '@/lib/hooks';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useTheme } from '@/lib/store';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/banners', label: 'Hero banners', icon: ImageIcon },
  { href: '/admin/delivery', label: 'Delivery zones', icon: Truck },
  { href: '/admin/payments', label: 'Payment methods', icon: Wallet },
  { href: '/admin/settings', label: 'Site settings', icon: Settings2 },
];

export default function AdminLayout() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  useEffect(() => {
    if (!loading && (!isSupabaseConfigured || !isAdmin)) {
      router.replace('/account');
    }
  }, [loading, isAdmin]);

  if (loading || !isAdmin) {
    return <View style={{ flex: 1, backgroundColor: colors.ink }} />;
  }

  const sidebar = (
    <View style={{
      width: isDesktop ? 220 : '100%',
      backgroundColor: colors.pitch,
      borderRightWidth: isDesktop ? 1 : 0,
      borderBottomWidth: isDesktop ? 0 : 1,
      borderColor: colors.line,
      padding: 14,
      flexDirection: isDesktop ? 'column' : 'row',
      gap: 6,
    }}>
      <ScrollView horizontal={!isDesktop} showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {NAV.map((n) => {
          const active = pathname === n.href;
          const Icon = n.icon;
          return (
            <Pressable
              key={n.href}
              onPress={() => router.push(n.href as any)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10,
                backgroundColor: active ? colors.lime : 'transparent',
              }}
            >
              <Icon size={16} color={active ? colors.ink : colors.mute} />
              <Text style={{ color: active ? colors.ink : colors.white, fontWeight: '700', fontSize: 13, whiteSpace: 'nowrap' } as any}>
                {n.label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={() => router.replace('/')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12 }}
        >
          <LogOut size={16} color={colors.mute} />
          <Text style={{ color: colors.mute, fontWeight: '600', fontSize: 13 }}>Storefront</Text>
        </Pressable>
      </ScrollView>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink, flexDirection: isDesktop ? 'row' : 'column' }}>
      {sidebar}
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ink } }} />
      </View>
    </View>
  );
}
