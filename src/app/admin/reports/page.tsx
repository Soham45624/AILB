import { getAdminReportsAction } from '@/app/actions/admin';
import { AdminReportsClient } from '@/components/admin/AdminReportsClient';
import { AlertOctagon } from 'lucide-react';

export const revalidate = 0;

export default async function AdminReportsPage() {
  const { reports } = await getAdminReportsAction('all', 'all');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-900">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
            <AlertOctagon className="w-3.5 h-3.5" /> Incident Response
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Reports & Flags Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Investigate community flags on misleading tools, malicious content, spam reviews, or bad actors.
          </p>
        </div>
      </div>

      <AdminReportsClient initialReports={reports || []} />
    </div>
  );
}
