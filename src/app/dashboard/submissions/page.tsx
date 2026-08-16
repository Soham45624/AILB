import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { UserSubmissionsList } from '@/components/dashboard/UserSubmissionsList';
import { Send, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function DashboardSubmissionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/dashboard/submissions');
  }

  // Fetch submissions submitted by this user with category
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .eq('submitted_by', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#141613] selection:bg-[#ECE8DF] selection:text-[#141613] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 md:pb-12 flex-1 w-full">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#EAE6DC]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#73796E] mb-2">
              <Link href="/dashboard" className="hover:text-[#141613] flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
              </Link>
              <span>/</span>
              <span className="text-[#141613] font-semibold">Submissions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141613] tracking-tight flex items-center gap-2.5">
              <Send className="w-6 h-6 text-[#5A7840]" />
              My Tool Submissions
            </h1>
            <p className="text-xs sm:text-sm text-[#666B60] mt-1">
              Track the moderation status of all AI tools you have submitted to AILIB.
            </p>
          </div>

          <Link
            href="/submit"
            className="btn-interactive inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Submit New Tool</span>
          </Link>
        </div>

        {/* Submissions List */}
        <UserSubmissionsList initialSubmissions={submissions || []} />
      </main>

      <Footer />
    </div>
  );
}
