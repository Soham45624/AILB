import { getAdminSubmissionsAction } from '@/app/actions/admin';
import { getCategories, getTags } from '@/lib/data';
import { AdminSubmissionsClient } from '@/components/admin/AdminSubmissionsClient';
import { Send, Sparkles } from 'lucide-react';

export const revalidate = 0;

export default async function AdminSubmissionsPage() {
  const [submissionsRes, categories, tags] = await Promise.all([
    getAdminSubmissionsAction('all'),
    getCategories(),
    getTags(),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-900">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Send className="w-3.5 h-3.5" /> Moderation Queue
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Tool Submissions Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review community submitted AI tools, request revisions, edit information, and approve for public catalog listing.
          </p>
        </div>
      </div>

      <AdminSubmissionsClient
        initialSubmissions={submissionsRes.submissions || []}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}
