import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sanitizeRedirectUrl } from '@/lib/security';

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
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions or home
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
