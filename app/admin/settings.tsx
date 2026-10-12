import React, { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import Plus from 'lucide-react-native/dist/esm/icons/plus.mjs';
import X from 'lucide-react-native/dist/esm/icons/x.mjs';
import { AdminPage, Card, Input, SaveBar } from '@/components/admin';
import { colors } from '@/lib/theme';
import { adminApi } from '@/lib/admin';
import { getSettings } from '@/lib/data';
import { useSettings , useTheme } from '@/lib/store';
import type { SiteSettings } from '@/lib/types';

export default function AdminSettings() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const [s, setS] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setLive = useSettings((st) => st.setSettings);

  useEffect(() => { getSettings().then(setS); }, []);
  if (!s) return <AdminPage title="Site settings"><View /></AdminPage>;

  const up = (patch: Partial<SiteSettings>) => setS({ ...s, ...patch });
  const save = async () => {
    setSaving(true); setSaved(false); setError(null);
    try { await adminApi.saveSettings(s); setLive(s); setSaved(true); }
    catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  return (
    <AdminPage title="Site settings">
      <View style={{ gap: 16 }}>
        <Card>
          <Text style={{ color: colors.white, fontWeight: '800', fontSize: 15, marginBottom: 12 }}>Store identity</Text>
          <Input label="Site name" value={s.site_name} onChange={(t) => up({ site_name: t })} />
          <Input label="Tagline" value={s.tagline} onChange={(t) => up({ tagline: t })} />
          <Input label="Announcement bar (empty to hide)" value={s.announcement ?? ''} onChange={(t) => up({ announcement: t })} />
          <Input label="Footer text" value={s.footer_text} onChange={(t) => up({ footer_text: t })} />
          <Input label="Currency" value={s.currency} onChange={(t) => up({ currency: t })} />
        </Card>

        <Card>
          <Text style={{ color: colors.white, fontWeight: '800', fontSize: 15, marginBottom: 12 }}>Contact details</Text>
          <Input label="Phone" value={s.contact_phone} onChange={(t) => up({ contact_phone: t })} />
          <Input label="WhatsApp" value={s.contact_whatsapp} onChange={(t) => up({ contact_whatsapp: t })} />
          <Input label="Email" value={s.contact_email} onChange={(t) => up({ contact_email: t })} />
          <Input label="Address" value={s.address} onChange={(t) => up({ address: t })} />
        </Card>

        <Card>
          <Text style={{ color: colors.white, fontWeight: '800', fontSize: 15, marginBottom: 4 }}>Jersey customisation fees (USD)</Text>
          <Text style={{ color: colors.mute, fontSize: 12, marginBottom: 12 }}>Charged per item at checkout when the customer adds printing.</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Input label="Base fee" value={String(s.customisation_fee)} numeric onChange={(t) => up({ customisation_fee: Number(t) })} style={{ flex: 1 }} />
            <Input label="Name fee" value={String(s.customisation_name_fee)} numeric onChange={(t) => up({ customisation_name_fee: Number(t) })} style={{ flex: 1 }} />
            <Input label="Number fee" value={String(s.customisation_number_fee)} numeric onChange={(t) => up({ customisation_number_fee: Number(t) })} style={{ flex: 1 }} />
          </View>
        </Card>

        <Card>
          <Text style={{ color: colors.white, fontWeight: '800', fontSize: 15, marginBottom: 12 }}>About page</Text>
          <Input label="Title" value={s.about_title} onChange={(t) => up({ about_title: t })} />
          <Input label="Body (blank line = new paragraph)" value={s.about_body} onChange={(t) => up({ about_body: t })} multiline />
        </Card>

        <Card>
          <Text style={{ color: colors.white, fontWeight: '800', fontSize: 15, marginBottom: 12 }}>Social links</Text>
          {s.socials.map((so, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
              <Input label="Label" value={so.label} onChange={(t) => up({ socials: s.socials.map((x, j) => (j === i ? { ...x, label: t } : x)) })} style={{ flex: 1 }} />
              <Input label="URL" value={so.url} onChange={(t) => up({ socials: s.socials.map((x, j) => (j === i ? { ...x, url: t } : x)) })} style={{ flex: 2 }} />
              <Pressable onPress={() => up({ socials: s.socials.filter((_, j) => j !== i) })} style={{ padding: 10 }}>
                <X size={16} color={colors.mute} />
              </Pressable>
            </View>
          ))}
          <Pressable
            onPress={() => up({ socials: [...s.socials, { label: '', url: '' }] })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}
          >
            <Plus size={14} color={colors.lime} />
            <Text style={{ color: colors.lime, fontSize: 13, fontWeight: '700' }}>Add social link</Text>
          </Pressable>
        </Card>

        {error ? <Text style={{ color: colors.danger }}>{error}</Text> : null}
        {!process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('http') && (
          <Text style={{ color: colors.gold, fontSize: 12 }}>
            Supabase isn't configured — changes won't persist. See .env.example.
          </Text>
        )}
        <SaveBar onSave={save} saving={saving} saved={saved} />
      </View>
    </AdminPage>
  );
}
