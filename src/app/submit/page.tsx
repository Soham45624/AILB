import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCategories, getTags } from '@/lib/data';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SubmitToolForm } from '@/components/submit/SubmitToolForm';
import { Sparkles, ShieldCheck, HeartHandshake, Zap } from 'lucide-react';

export const revalidate = 0;

export default async function SubmitPage() {
  const supabase = await createClient();

  // Server-side authorization check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/submit');
  }

  const [categories, tags] = await Promise.all([getCategories(), getTags()]);

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#141613] selection:bg-[#ECE8DF] selection:text-[#141613] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EDF7EE] border border-[#CCE8CD] text-[#1E7E34] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Community Contributions
          </div>
          <h1 className="font-serif-heading text-3xl sm:text-5xl font-normal text-[#141613] tracking-tight">
            Submit an AI Tool
          </h1>
          <p className="text-xs sm:text-sm text-[#666B60] max-w-lg mx-auto leading-relaxed">
            Share an innovative AI application with developers, creators, and researchers.
            Submissions are reviewed by moderators before appearing live on AILIB.
          </p>

          {/* Submission Guidelines Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#666B60] bg-white px-3 py-1 rounded-full border border-[#EAE6DC] shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E7E34]" />
              <span>Moderated Review</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#666B60] bg-white px-3 py-1 rounded-full border border-[#EAE6DC] shadow-sm">
              <Zap className="w-3.5 h-3.5 text-[#D96B27]" />
              <span>Instant Tag Suggestions</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#666B60] bg-white px-3 py-1 rounded-full border border-[#EAE6DC] shadow-sm">
              <HeartHandshake className="w-3.5 h-3.5 text-[#5C42A6]" />
              <span>Contributor Credit</span>
            </div>
          </div>
        </div>

        {/* Submission Form Component */}
        <SubmitToolForm
          userEmail={user.email!}
          categories={categories}
          initialTags={tags}
        />
      </main>

      <Footer />
    </div>
  );
}
