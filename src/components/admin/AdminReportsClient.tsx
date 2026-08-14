'use client';

import { useState } from 'react';
import { resolveReportAction } from '@/app/actions/admin';
import {
  AlertOctagon,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
  MessageSquare,
  User,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

interface AdminReportsClientProps {
  initialReports: any[];
}

export function AdminReportsClient({ initialReports }: AdminReportsClientProps) {
  const [reports, setReports] = useState<any[]>(initialReports);
  const [typeFilter, setTypeFilter] = useState<'all' | 'tool' | 'review' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved' | 'dismissed'>('open');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filtered = reports.filter((r) => {
    const matchesType = typeFilter === 'all' || (r.report_type || 'tool') === typeFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const handleResolve = async (reportId: string, status: 'resolved' | 'dismissed') => {
    setProcessingId(reportId);
    const res = await resolveReportAction(reportId, status);
    if (res.success) {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: status } : r))
      );
    } else {
      alert(`Report resolution failed: ${res.error}`);
    }
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-900 pb-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {[
            { key: 'open', label: 'Open Reports', count: reports.filter((r) => r.status === 'open').length },
            { key: 'resolved', label: 'Resolved', count: reports.filter((r) => r.status === 'resolved').length },
            { key: 'dismissed', label: 'Dismissed', count: reports.filter((r) => r.status === 'dismissed').length },
            { key: 'all', label: 'All', count: reports.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab.key
                  ? 'bg-rose-500/15 border border-rose-500/40 text-rose-300 shadow-sm'
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

        {/* Report Type Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-semibold">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Report Types</option>
            <option value="tool">Tool Reports</option>
            <option value="review">Review Reports</option>
            <option value="user">User Reports</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-850 space-y-2">
          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-200">No reports in this queue</h3>
          <p className="text-xs text-slate-400">All community incident reports are clear!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((rep) => {
            const isProcessing = processingId === rep.id;

            return (
              <div
                key={rep.id}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                      <AlertOctagon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">
                          Reason: {rep.reason}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {rep.report_type || 'Tool Report'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Reported by <strong className="text-slate-300">{rep.reporter?.username || 'Anonymous'}</strong> •{' '}
                        {new Date(rep.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                      rep.status === 'open'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : rep.status === 'resolved'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {rep.status}
                  </span>
                </div>

                {/* Target Entity Details */}
                {rep.tool && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-400">Target Tool:</span>
                      <strong className="text-slate-200">{rep.tool.name}</strong>
                    </div>
                    <Link
                      href={`/tools/${rep.tool.slug}`}
                      target="_blank"
                      className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Inspect Tool</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {rep.review && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      <span>Target Review (Rating: {rep.review.rating}★):</span>
                    </div>
                    <p className="text-slate-300 italic">&ldquo;{rep.review.content}&rdquo;</p>
                  </div>
                )}

                {/* Report Details text */}
                {rep.details && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                    <strong className="text-slate-400">Reporter Details: </strong>
                    {rep.details}
                  </p>
                )}

                {/* Action Buttons */}
                {rep.status === 'open' && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleResolve(rep.id, 'dismissed')}
                      className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      Dismiss Report
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleResolve(rep.id, 'resolved')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
