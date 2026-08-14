'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Plus,
  ArrowRight,
  Layers,
  Tag as TagIcon,
  MessageSquareHeart,
  Calendar,
} from 'lucide-react';

interface UserSubmissionsListProps {
  initialSubmissions: any[];
}

export function UserSubmissionsList({ initialSubmissions }: UserSubmissionsListProps) {
  const [activeTab, setActiveTab] = useState<
    'all' | 'pending' | 'approved' | 'rejected' | 'changes_requested'
  >('all');

  const counts = {
    all: initialSubmissions.length,
    pending: initialSubmissions.filter((s) => s.status === 'pending').length,
    approved: initialSubmissions.filter((s) => s.status === 'approved').length,
    rejected: initialSubmissions.filter((s) => s.status === 'rejected').length,
    changes_requested: initialSubmissions.filter((s) => s.status === 'changes_requested').length,
  };

  const filteredSubmissions = initialSubmissions.filter((s) => {
    if (activeTab === 'all') return true;
    return s.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-900 pb-3 overflow-x-auto scrollbar-none">
        {[
          { key: 'all', label: 'All Submissions', count: counts.all },
          { key: 'pending', label: 'Pending Review', count: counts.pending },
          { key: 'approved', label: 'Approved', count: counts.approved },
          { key: 'changes_requested', label: 'Changes Requested', count: counts.changes_requested },
          { key: 'rejected', label: 'Rejected', count: counts.rejected },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-cyan-500 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-850 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-200">No submissions in this view</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {activeTab === 'all'
                ? "You haven't submitted any AI tools yet. Share a tool you've built or discovered!"
                : `No tools currently in "${activeTab.replace('_', ' ')}" status.`}
            </p>
          </div>
          {activeTab === 'all' && (
            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Submit First Tool
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSubmissions.map((sub) => {
            const statusConfig = {
              pending: {
                label: 'Pending Review',
                badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                icon: Clock,
                desc: 'Submitted and awaiting moderator evaluation.',
              },
              approved: {
                label: 'Approved & Live',
                badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                icon: CheckCircle2,
                desc: 'Approved and discoverable in the public directory.',
              },
              rejected: {
                label: 'Rejected',
                badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                icon: XCircle,
                desc: 'Did not meet library listing criteria.',
              },
              changes_requested: {
                label: 'Changes Requested',
                badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                icon: AlertTriangle,
                desc: 'Moderator requested revisions before approval.',
              },
            }[sub.status as 'pending' | 'approved' | 'rejected' | 'changes_requested'] || {
              label: sub.status,
              badge: 'bg-slate-800 text-slate-300 border-slate-700',
              icon: Clock,
              desc: '',
            };

            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={sub.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg">
                      {sub.tool_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-100">{sub.tool_name}</h3>
                        <a
                          href={sub.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {sub.website_url.replace(/^https?:\/\//, '')}
                        </a>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                        {sub.category?.name && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Layers className="w-3 h-3 text-cyan-400" />
                            {sub.category.name}
                          </span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3" />
                          Submitted {new Date(sub.created_at).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span className="uppercase text-[10px] font-bold px-2 py-0.2 rounded bg-slate-800 text-slate-300">
                          {sub.pricing}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusConfig.badge}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-850 leading-relaxed">
                  {sub.description || 'No description provided.'}
                </p>

                {/* Tags */}
                {sub.tags && sub.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Tags:
                    </span>
                    {sub.tags.map((t: string) => (
                      <span
                        key={t}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Contributor Feedback */}
                {sub.contributor_feedback && (
                  <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2">
                    <MessageSquareHeart className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                    <div>
                      <span className="font-bold text-indigo-300">Contributor Note: </span>
                      <span>{sub.contributor_feedback}</span>
                    </div>
                  </div>
                )}

                {/* Admin Feedback (if rejected or changes requested) */}
                {sub.feedback && (
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300">Moderator Feedback: </span>
                      <span>{sub.feedback}</span>
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px] text-slate-500">
                    ID: {sub.id}
                  </span>

                  {sub.status === 'approved' && (
                    <Link
                      href="/tools"
                      className="flex items-center gap-1 text-cyan-400 hover:underline font-bold"
                    >
                      View Live in Directory <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
