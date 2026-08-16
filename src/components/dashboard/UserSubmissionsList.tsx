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
      <div className="flex items-center gap-2 border-b border-[#EAE6DC] pb-3 overflow-x-auto scrollbar-none">
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
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#141613] text-white shadow-sm'
                  : 'text-[#666B60] hover:text-[#141613] hover:bg-[#F5F3ED]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-white text-[#141613] font-bold' : 'bg-[#EAE6DC] text-[#666B60]'
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
        <div className="py-16 text-center rounded-3xl bg-white border border-[#EAE6DC] space-y-4 shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F5F3ED] text-[#73796E] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#141613]">No submissions in this view</h3>
            <p className="text-xs text-[#666B60] mt-1 max-w-sm mx-auto">
              {activeTab === 'all'
                ? "You haven't submitted any AI tools yet. Share a tool you've built or discovered!"
                : `No tools currently in "${activeTab.replace('_', ' ')}" status.`}
            </p>
          </div>
          {activeTab === 'all' && (
            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs shadow-sm transition-all"
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
                label: 'Pending Moderation',
                icon: Clock,
                bg: 'bg-[#FEF6E9]',
                text: 'text-[#8C4E05]',
                border: 'border-[#F9DEC2]',
              },
              approved: {
                label: 'Approved & Live',
                icon: CheckCircle2,
                bg: 'bg-[#EDF7EE]',
                text: 'text-[#1E7E34]',
                border: 'border-[#CCE8CD]',
              },
              rejected: {
                label: 'Declined',
                icon: XCircle,
                bg: 'bg-[#FDF0F2]',
                text: 'text-[#D73A49]',
                border: 'border-[#F8D2D7]',
              },
              changes_requested: {
                label: 'Action Required',
                icon: AlertTriangle,
                bg: 'bg-[#FEF6E9]',
                text: 'text-[#8C4E05]',
                border: 'border-[#F9DEC2]',
              },
            }[sub.status as 'pending' | 'approved' | 'rejected' | 'changes_requested'] || {
              label: sub.status,
              icon: Clock,
              bg: 'bg-[#F5F3ED]',
              text: 'text-[#666B60]',
              border: 'border-[#EAE6DC]',
            };

            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={sub.id}
                className="p-6 rounded-2xl bg-white border border-[#EAE6DC] space-y-4 shadow-sm hover:border-[#D0C9BA] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F2EFE8]">
                  <div>
                    <h3 className="font-extrabold text-base text-[#141613]">{sub.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-[#73796E] mt-0.5">
                      <a
                        href={sub.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0366D6] hover:underline flex items-center gap-1"
                      >
                        <span>{sub.website_url}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusConfig.label}</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#666B60] leading-relaxed line-clamp-2">
                  {sub.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-[#73796E]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#9FA59A]" />
                    <span>Submitted on {new Date(sub.created_at).toLocaleDateString()}</span>
                  </div>

                  {sub.status === 'approved' && sub.tool_slug && (
                    <Link
                      href={`/tools/${sub.tool_slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#141613] hover:underline"
                    >
                      <span>View Live Listing</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
