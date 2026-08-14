import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { Profile } from '@/lib/types';

export const revalidate = 0; // Dynamic server component

export default async function DashboardPage() {
  const supabase = await createClient();

  // Server-side authorization check
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login?redirect=/dashboard');
  }

  // Fetch user profile
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // If profile doesn't exist yet, auto-initialize
  if (!profile) {
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username: user.user_metadata?.username || `user_${user.id.substring(0, 8)}`,
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0],
        full_name: user.user_metadata?.display_name || user.email?.split('@')[0],
      })
      .select('*')
      .single();
    profile = newProfile;
  }

  // Fetch user submissions
  const { data: userSubmissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('submitted_by', user.id)
    .order('created_at', { ascending: false });

  // Fetch user favorites count
  const { count: favoritesCount } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Fetch user reviews count
  const { count: reviewsCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <DashboardClient
          user={{
            id: user.id,
            email: user.email!,
            created_at: user.created_at,
          }}
          profile={profile}
          submissions={userSubmissions || []}
          savedCount={favoritesCount || 0}
          reviewsCount={reviewsCount || 0}
        />
      </main>

      <Footer />
    </div>
  );
}
