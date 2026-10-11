import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, XCircle } from 'lucide-react-native';
import { NavBar } from '@/components/NavBar';
import { Button } from '@/components/ui';
import { colors } from '@/lib/theme';
import { checkPaymentStatus } from '@/lib/payments';
import { useTheme } from '@/lib/store';

// Paynow returnUrl lands here after hosted checkout.
export default function PaymentReturn() {
  useTheme((s) => s.mode); // re-render on theme toggle
  const params = useLocalSearchParams<{ pollUrl?: string; status?: string }>();
  const router = useRouter();
  const [state, setState] = useState<'checking' | 'paid' | 'failed'>('checking');

  useEffect(() => {
    (async () => {
      const url = params.pollUrl ? decodeURIComponent(params.pollUrl) : null;
      if (!url) { setState(params.status === 'paid' ? 'paid' : 'checking'); }
      try {
        const res = url ? await checkPaymentStatus(url) : { status: params.status };
        setState(res.status === 'paid' || (res as any).paid ? 'paid' : 'failed');
      } catch {
        setState('failed');
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <NavBar />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 }}>
        {state === 'checking' && (
          <>
            <ActivityIndicator size="large" color={colors.lime} />
            <Text style={{ color: colors.white, fontSize: 20, fontWeight: '800' }}>Confirming your payment…</Text>
            <Text style={{ color: colors.mute, fontSize: 13 }}>Hold tight, this takes a few seconds.</Text>
          </>
        )}
        {state === 'paid' && (
          <>
            <CheckCircle2 size={56} color={colors.success} />
            <Text style={{ color: colors.white, fontSize: 24, fontWeight: '900' }}>Payment received</Text>
            <Text style={{ color: colors.mute, fontSize: 14, textAlign: 'center', maxWidth: 420 }}>
              Order confirmed — we'll WhatsApp you delivery updates shortly.
            </Text>
            <Button label="Continue shopping" onPress={() => router.replace('/')} />
          </>
        )}
        {state === 'failed' && (
          <>
            <XCircle size={56} color={colors.danger} />
            <Text style={{ color: colors.white, fontSize: 24, fontWeight: '900' }}>Payment not completed</Text>
            <Text style={{ color: colors.mute, fontSize: 14, textAlign: 'center', maxWidth: 420 }}>
              No charge was made, or it's still processing. Try again or pick another method.
            </Text>
            <Button label="Back to checkout" onPress={() => router.replace('/checkout')} />
          </>
        )}
      </View>
    </View>
  );
}
