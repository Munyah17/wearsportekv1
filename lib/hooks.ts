import { useCallback, useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { BREAKPOINT } from './theme';
import { supabase, isSupabaseConfigured } from './supabase';
import type { Profile } from './types';

export function useIsDesktop() {
  const { width } = useWindowDimensions();
  return width >= BREAKPOINT;
}

interface AuthState {
  session: boolean;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  refresh: () => void;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<Omit<AuthState, 'refresh'>>({
    session: false, profile: null, isAdmin: false, loading: true,
  });

  const load = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setState({ session: false, profile: null, isAdmin: false, loading: false });
      return;
    }
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) {
      setState({ session: false, profile: null, isAdmin: false, loading: false });
      return;
    }
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setState({
      session: true,
      profile: (profile as Profile) ?? null,
      isAdmin: profile?.role === 'admin',
      loading: false,
    });
  }, []);

  useEffect(() => {
    load();
    if (!isSupabaseConfigured || !supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, [load]);

  return { ...state, refresh: load };
}
