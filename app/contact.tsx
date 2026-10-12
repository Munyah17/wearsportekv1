import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Mail from 'lucide-react-native/dist/esm/icons/mail.mjs';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin.mjs';
import MessageCircle from 'lucide-react-native/dist/esm/icons/message-circle.mjs';
import Phone from 'lucide-react-native/dist/esm/icons/phone.mjs';
import Send from 'lucide-react-native/dist/esm/icons/send.mjs';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Button, Field } from '@/components/ui';
import { colors, radii } from '@/lib/theme';
import { useSettings , useTheme } from '@/lib/store';

export default function Contact() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const s = useSettings((st) => st.settings);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  const wa = () => {
    const text = encodeURIComponent(`Hi ${s.site_name}! I'm ${name || 'a customer'}. ${msg}`);
    const num = s.contact_whatsapp.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${num}?text=${text}`);
    setSent(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <NavBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{
          maxWidth: 1280, alignSelf: 'center', width: '100%',
          paddingHorizontal: isDesktop ? 48 : 20, paddingTop: 40, paddingBottom: 30,
          flexDirection: isDesktop ? 'row' : 'column', gap: 32,
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.white, fontSize: isDesktop ? 38 : 28, fontWeight: '900', letterSpacing: -0.6 }}>
              Talk to us
            </Text>
            <Text style={{ color: colors.mute, fontSize: 15, marginTop: 10, lineHeight: 23 }}>
              Questions about sizing, stock, club kits or an order? We reply fast — WhatsApp is quickest.
            </Text>
            <View style={{ gap: 14, marginTop: 26 }}>
              {[
                { icon: <Phone size={18} color={colors.lime} />, label: 'Call us', value: s.contact_phone, href: `tel:${s.contact_phone}` },
                { icon: <MessageCircle size={18} color={colors.lime} />, label: 'WhatsApp', value: s.contact_whatsapp, href: `https://wa.me/${s.contact_whatsapp.replace(/\D/g, '')}` },
                { icon: <Mail size={18} color={colors.lime} />, label: 'Email', value: s.contact_email, href: `mailto:${s.contact_email}` },
                { icon: <MapPin size={18} color={colors.lime} />, label: 'Visit', value: s.address, href: undefined },
              ].map((r) => (
                <Pressable key={r.label} onPress={() => r.href && Linking.openURL(r.href)} disabled={!r.href}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }}>
                    {r.icon}
                  </View>
                  <View>
                    <Text style={{ color: colors.mute, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>{r.label}</Text>
                    <Text style={{ color: colors.white, fontSize: 15, fontWeight: '600', marginTop: 2 }}>{r.value}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{
            flex: 1, backgroundColor: colors.card, borderRadius: radii.lg,
            borderWidth: 1, borderColor: colors.line, padding: isDesktop ? 28 : 18,
          }}>
            <Text style={{ color: colors.white, fontWeight: '800', fontSize: 17, marginBottom: 16 }}>Send a message</Text>
            <Field label="Your name" value={name} onChangeText={setName} placeholder="Full name" />
            <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="+263 77 …" keyboardType="phone-pad" />
            <Field label="Message" value={msg} onChangeText={setMsg} placeholder="How can we help?" multiline />
            <Button
              label={sent ? 'Opening WhatsApp…' : 'Send via WhatsApp'}
              icon={<Send size={16} color={colors.ink} />}
              onPress={wa}
              full
            />
            <Text style={{ color: colors.mute, fontSize: 11, marginTop: 10, textAlign: 'center' }}>
              Messages open in WhatsApp — fastest way to reach us.
            </Text>
          </View>
        </View>
        <Footer categories={[]} />
      </ScrollView>
    </View>
  );
}
