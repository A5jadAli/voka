import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { supabase } from '@/features/auth/supabase';

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;
    let authChanged = false;
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted || authChanged) return;
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => {
        if (mounted && !authChanged) setLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      authChanged = true;
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { loading, session };
}
