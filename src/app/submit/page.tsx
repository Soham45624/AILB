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
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Page Header */}
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Community Contributions
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Submit an AI Tool
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Share an innovative AI tool with thousands of developers, creators, and researchers.
            Submissions are reviewed by moderators before appearing live.
          </p>

          {/* Submission Guidelines Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Moderated Review</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Tag Suggestions</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
              <HeartHandshake className="w-3.5 h-3.5 text-indigo-400" />
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
