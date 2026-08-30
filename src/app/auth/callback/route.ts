import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sanitizeRedirectUrl, createActiveSession, SESSION_COOKIE_NAME } from '@/lib/security';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = sanitizeRedirectUrl(searchParams.get('next'), '/dashboard');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_suspended')
          .eq('id', user.id)
          .single();

        if (profile?.is_suspended) {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/login?error=account_suspended`);
        }

        // Enforce 3-device limit on OAuth login
        const userAgent = request.headers.get('user-agent') || 'Unknown Device';
        const sessionRes = await createActiveSession(supabase, user.id, userAgent);

        if (!sessionRes.success) {
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/login?error=max_devices_reached`);
        }

        // Set session ID cookie
        if (sessionRes.sessionToken) {
          const cookieStore = await cookies();
          cookieStore.set(SESSION_COOKIE_NAME, sessionRes.sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions or home
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
