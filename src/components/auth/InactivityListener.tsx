'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function InactivityListener() {
  const router = useRouter();
  const pathname = usePathname();
  const isLoggingOutRef = useRef<boolean>(false);

  useEffect(() => {
    // 1. Clean up any legacy localStorage keys so no data is exposed in DevTools
    try {
      localStorage.removeItem('ailb_last_activity');
    } catch {
      // Ignore in restricted environments
    }

    const supabase = createClient();

    // 2. Validate live session status (account suspension / active session)
    const checkLiveSession = async () => {
      if (isLoggingOutRef.current) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        // If user is suspended, immediately terminate session
        if (session.user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_suspended')
            .eq('id', session.user.id)
            .single();

          if (profile?.is_suspended) {
            isLoggingOutRef.current = true;
            await supabase.auth.signOut();
            router.push('/login?error=account_suspended');
            router.refresh();
          }
        }
      } catch (err) {
        console.error('Session validation error:', err);
      }
    };

    checkLiveSession();

    // Periodic heartbeat check every 60 seconds
    const intervalId = setInterval(checkLiveSession, 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [router, pathname]);

  return null;
}
