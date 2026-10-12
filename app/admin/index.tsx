import React, { useEffect, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import ImageIcon from 'lucide-react-native/dist/esm/icons/image.mjs';
import Package from 'lucide-react-native/dist/esm/icons/package.mjs';
import ShoppingCart from 'lucide-react-native/dist/esm/icons/shopping-cart.mjs';
import Truck from 'lucide-react-native/dist/esm/icons/truck.mjs';
import Wallet from 'lucide-react-native/dist/esm/icons/wallet.mjs';
import { AdminPage, Card } from '@/components/admin';
import { colors } from '@/lib/theme';
import { adminApi } from '@/lib/admin';
import { formatUSD } from '@/lib/seed';
import { useTheme } from '@/lib/store';

export default function AdminDashboard() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, banners: 0, zones: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [products, orders, banners, zones] = await Promise.all([
          adminApi.list('products'), adminApi.ordersWithItems(), adminApi.list('banners'), adminApi.list('delivery_zones'),
        ]);
        setStats({
          products: products.length,
          orders: orders.length,
          revenue: orders.filter((o: any) => o.status === 'paid').reduce((s: number, o: any) => s + Number(o.total), 0),
          banners: banners.length,
          zones: zones.length,
        });
      } catch {}
    })();
  }, []);

  const cards = [
    { icon: <Package size={20} color={colors.lime} />, label: 'Products', value: String(stats.products) },
    { icon: <ShoppingCart size={20} color={colors.lime} />, label: 'Orders', value: String(stats.orders) },
    { icon: <Wallet size={20} color={colors.lime} />, label: 'Revenue (paid)', value: formatUSD(stats.revenue) },
    { icon: <ImageIcon size={20} color={colors.lime} />, label: 'Hero banners', value: String(stats.banners) },
    { icon: <Truck size={20} color={colors.lime} />, label: 'Delivery zones', value: String(stats.zones) },
  ];

  return (
    <AdminPage title="Dashboard">
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {cards.map((c) => (
          <Card key={c.label} style={{ flexGrow: 1, minWidth: isDesktop ? 180 : '45%', gap: 10 }}>
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: colors.pitch, alignItems: 'center', justifyContent: 'center' }}>
              {c.icon}
            </View>
            <Text style={{ color: colors.white, fontSize: 24, fontWeight: '900' }}>{c.value}</Text>
            <Text style={{ color: colors.mute, fontSize: 12 }}>{c.label}</Text>
          </Card>
        ))}
      </View>
      <Card style={{ marginTop: 20 }}>
        <Text style={{ color: colors.white, fontWeight: '800', fontSize: 15, marginBottom: 8 }}>Quick guide</Text>
        <Text style={{ color: colors.mute, fontSize: 13, lineHeight: 22 }}>
          Everything on the storefront is controlled from here: products, prices, images, hero banners,
          customisation fees, delivery zones & fees, payment methods, contact details, about page and footer.
          Changes go live instantly.
        </Text>
      </Card>
    </AdminPage>
  );
}
