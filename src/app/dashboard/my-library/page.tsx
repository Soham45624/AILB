import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MyLibraryClient } from '@/components/dashboard/MyLibraryClient';
import { getMyLibraryAction } from '@/app/actions/library';

export const revalidate = 0;

export const metadata = {
  title: 'My Library — AILIB',
  description: 'Your personal collection of saved AI tools.',
};

export default async function MyLibraryPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login?redirect=/dashboard/my-library');
  }

  // Fetch the user's saved tools with full joins
  const { tools } = await getMyLibraryAction();

  // Fetch categories for filter UI
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug, description, icon, color, sort_order, created_at')
    .order('sort_order', { ascending: true });

  // Fetch all tags
  const { data: allTags } = await supabase
    .from('tags')
    .select('id, name, slug, created_at')
    .order('name', { ascending: true });

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#141613] selection:bg-[#ECE8DF] selection:text-[#141613] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <MyLibraryClient
          initialTools={tools}
          categories={categories || []}
          allTags={allTags || []}
        />
      </main>

      <Footer />
    </div>
  );
}
