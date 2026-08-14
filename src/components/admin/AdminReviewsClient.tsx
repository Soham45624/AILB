'use client';

import { useState } from 'react';
import { moderateReviewAction } from '@/app/actions/admin';
import {
  Star,
  Trash2,
  RotateCcw,
  AlertOctagon,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

interface AdminReviewsClientProps {
  initialReviews: any[];
}

export function AdminReviewsClient({ initialReviews }: AdminReviewsClientProps) {
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'deleted'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filtered = reviews.filter((r) => {
    if (activeTab === 'active') return !r.is_deleted;
    if (activeTab === 'deleted') return r.is_deleted;
    return true;
  });

  const handleModerate = async (reviewId: string, action: 'remove' | 'restore') => {
    let reason = '';
    if (action === 'remove') {
      const input = prompt('Please enter the reason for removing this review:');
      if (input === null) return;
      reason = input || 'Violated community guidelines';
    }

    setProcessingId(reviewId);
    const res = await moderateReviewAction(reviewId, action, reason);

    if (res.success) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, is_deleted: action === 'remove', deleted_reason: reason || null }
            : r
        )
      );
    } else {
      alert(`Moderation failed: ${res.error}`);
    }
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
        {[
          { key: 'all', label: 'All Reviews', count: reviews.length },
          { key: 'active', label: 'Active', count: reviews.filter((r) => !r.is_deleted).length },
          { key: 'deleted', label: 'Removed by Moderators', count: reviews.filter((r) => r.is_deleted).length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Review Cards */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-850 space-y-2">
          <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-200">No reviews found</h3>
          <p className="text-xs text-slate-400">Try changing the status tab above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((rev) => (
            <div
              key={rev.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                rev.is_deleted
                  ? 'bg-rose-950/10 border-rose-500/30'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                    {(rev.profile?.display_name || rev.profile?.username || 'U')
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200 text-xs">
                        {rev.profile?.display_name || rev.profile?.username || 'Community Member'}
                      </span>
                      <span>•</span>
                      <span className="text-xs text-slate-400">Reviewed</span>
                      <Link
                        href={`/tools/${rev.tool?.slug}`}
                        target="_blank"
                        className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        {rev.tool?.name}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{rev.rating}.0</span>
                  </div>

                  {rev.is_deleted ? (
                    <button
                      type="button"
                      disabled={processingId === rev.id}
                      onClick={() => handleModerate(rev.id, 'restore')}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-emerald-950/40 text-emerald-400 border border-slate-800 hover:border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore Review
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={processingId === rev.id}
                      onClick={() => handleModerate(rev.id, 'remove')}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove Review
                    </button>
                  )}
                </div>
              </div>

              {/* Review Content */}
              <p className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-850 leading-relaxed">
                {rev.content || 'No text content provided.'}
              </p>

              {/* Deleted Reason Warning */}
              {rev.is_deleted && (
                <div className="text-[11px] text-rose-300 bg-rose-950/30 px-3 py-1.5 rounded-lg border border-rose-500/20 flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Removed by moderator: {rev.deleted_reason || 'Guidelines violation'}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
