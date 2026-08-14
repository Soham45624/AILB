import { getAdminToolsAction } from '@/app/actions/admin';
import { getCategories, getTags } from '@/lib/data';
import { AdminToolsClient } from '@/components/admin/AdminToolsClient';
import { SlidersHorizontal } from 'lucide-react';

export const revalidate = 0;

export default async function AdminToolsPage() {
  const [toolsRes, categories, tags] = await Promise.all([
    getAdminToolsAction(),
    getCategories(),
    getTags(),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-900">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Catalog Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Tool Directory Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Edit tool details, manage categories, feature/trending badges, update URLs, and curate the public directory.
          </p>
        </div>
      </div>

      <AdminToolsClient
        initialTools={toolsRes.tools || []}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}
