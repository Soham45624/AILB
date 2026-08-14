import { getAdminReviewsAction } from '@/app/actions/admin';
import { AdminReviewsClient } from '@/components/admin/AdminReviewsClient';
import { MessageSquare } from 'lucide-react';

export const revalidate = 0;

export default async function AdminReviewsPage() {
  const { reviews } = await getAdminReviewsAction();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-900">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <MessageSquare className="w-3.5 h-3.5" /> Community Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Review Moderation
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review user feedback, moderate toxic or spam reviews, and restore justified community evaluations.
          </p>
        </div>
      </div>

      <AdminReviewsClient initialReviews={reviews || []} />
    </div>
  );
}
