'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const INACTIVITY_LIMIT_MS = 24 * 60 * 60 * 1000; // 24 Hours
const ACTIVITY_STORAGE_KEY = 'ailb_last_activity';
const THROTTLE_MS = 5000; // Throttle storage writes to max once per 5 seconds

export function InactivityListener() {
  const router = useRouter();
  const pathname = usePathname();
  const lastWriteRef = useRef<number>(0);
  const isLoggingOutRef = useRef<boolean>(false);

  useEffect(() => {
    const supabase = createClient();

    // Record user activity to localStorage (shared across tabs)
    const recordActivity = () => {
      const now = Date.now();
      if (now - lastWriteRef.current > THROTTLE_MS) {
        lastWriteRef.current = now;
        try {
          localStorage.setItem(ACTIVITY_STORAGE_KEY, now.toString());
        } catch {
          // Ignore potential localStorage quota or private-mode restrictions
        }
      }
    };

    // Evaluate if session has exceeded 24 hours of inactivity
    const checkInactivity = async () => {
      if (isLoggingOutRef.current) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // If user is not logged in, inactivity timeout does not apply
        if (!session) {
          return;
        }

        // Live check: if the active account is suspended, log out immediately
        if (session.user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_suspended')
            .eq('id', session.user.id)
            .single();

          if (profile?.is_suspended) {
            isLoggingOutRef.current = true;
            try {
              localStorage.removeItem(ACTIVITY_STORAGE_KEY);
            } catch {}

            await supabase.auth.signOut();
            router.push('/login?error=account_suspended');
            router.refresh();
            return;
          }
        }

        const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
        const now = Date.now();

        if (!stored) {
          // Initialize clock for an active session
          localStorage.setItem(ACTIVITY_STORAGE_KEY, now.toString());
          return;
        }

        const lastActivity = parseInt(stored, 10);
        if (Number.isNaN(lastActivity)) {
          localStorage.setItem(ACTIVITY_STORAGE_KEY, now.toString());
          return;
        }

        // Check if 24 hours elapsed without any activity
        if (now - lastActivity > INACTIVITY_LIMIT_MS) {
          isLoggingOutRef.current = true;
          try {
            localStorage.removeItem(ACTIVITY_STORAGE_KEY);
          } catch {}

          await supabase.auth.signOut();
          router.push('/login?reason=session_expired');
          router.refresh();
        }
      } catch (err) {
        console.error('Inactivity check error:', err);
      }
    };

    // Run initial activity stamp and validation on mount
    recordActivity();
    checkInactivity();

    // Listen to user interaction events (throttled)
    const userEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const onUserActivity = () => {
      recordActivity();
    };

    userEvents.forEach((evt) => {
      window.addEventListener(evt, onUserActivity, { passive: true });
    });

    // Synchronize clock across multiple browser tabs
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === ACTIVITY_STORAGE_KEY && e.newValue) {
        const val = parseInt(e.newValue, 10);
        if (!Number.isNaN(val)) {
          lastWriteRef.current = val;
        }
      }
    };
    window.addEventListener('storage', onStorageChange);

    // Periodic heartbeat check every 30 seconds
    const intervalId = setInterval(checkInactivity, 30 * 1000);

    return () => {
      userEvents.forEach((evt) => {
        window.removeEventListener(evt, onUserActivity);
      });
      window.removeEventListener('storage', onStorageChange);
      clearInterval(intervalId);
    };
  }, [router, pathname]);

  return null;
}
