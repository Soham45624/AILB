'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  approveSubmissionAction,
  requestChangesSubmissionAction,
  rejectSubmissionAction,
  updateAdminSubmissionAction,
} from '@/app/actions/admin';
import { Category, Tag } from '@/lib/types';
import {
  Check,
  X,
  AlertTriangle,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  Save,
  Layers,
  Tag as TagIcon,
  MessageSquareHeart,
  Calendar,
  Globe,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface AdminSubmissionsClientProps {
  initialSubmissions: any[];
  categories: Category[];
  tags: Tag[];
}

export function AdminSubmissionsClient({
  initialSubmissions,
  categories,
  tags,
}: AdminSubmissionsClientProps) {
  const [submissions, setSubmissions] = useState<any[]>(initialSubmissions);
  const [activeTab, setActiveTab] = useState<
    'pending' | 'changes_requested' | 'approved' | 'rejected' | 'all'
  >('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Selected Category & Tag IDs for approval
  const [selectedCats, setSelectedCats] = useState<Record<string, string[]>>({});
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>({});

  // Feedback modals state
  const [feedbackModal, setFeedbackModal] = useState<{
    subId: string;
    type: 'changes' | 'reject';
    toolName: string;
  } | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Edit modal state
  const [editingSub, setEditingSub] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editingSub || feedbackModal) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [editingSub, feedbackModal]);

  const filtered = submissions.filter((s) => {
    if (activeTab === 'all') return true;
    return s.status === activeTab;
  });

  const toggleCategory = (subId: string, catId: string) => {
    const cur = selectedCats[subId] || [];
    setSelectedCats({
      ...selectedCats,
      [subId]: cur.includes(catId) ? cur.filter((c) => c !== catId) : [...cur, catId],
    });
  };

  const toggleTag = (subId: string, tagId: string) => {
    const cur = selectedTags[subId] || [];
    setSelectedTags({
      ...selectedTags,
      [subId]: cur.includes(tagId) ? cur.filter((t) => t !== tagId) : [...cur, tagId],
    });
  };

  const handleApprove = async (sub: any) => {
    setProcessingId(sub.id);
    const catIds = selectedCats[sub.id] || (sub.category_id ? [sub.category_id] : []);
    const tagIds = selectedTags[sub.id] || [];

    const res = await approveSubmissionAction(sub.id, catIds, tagIds);
    if (res.success) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === sub.id ? { ...s, status: 'approved', tool_id: res.toolId } : s))
      );
    } else {
      alert(`Approval error: ${res.error}`);
    }
    setProcessingId(null);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackModal) return;
    setProcessingId(feedbackModal.subId);

    if (feedbackModal.type === 'changes') {
      const res = await requestChangesSubmissionAction(feedbackModal.subId, feedbackText);
      if (res.success) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === feedbackModal.subId
              ? { ...s, status: 'changes_requested', feedback: feedbackText }
              : s
          )
        );
      } else {
        alert(res.error);
      }
    } else {
      const res = await rejectSubmissionAction(feedbackModal.subId, feedbackText);
      if (res.success) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === feedbackModal.subId ? { ...s, status: 'rejected', feedback: feedbackText } : s
          )
        );
      } else {
        alert(res.error);
      }
    }

    setProcessingId(null);
    setFeedbackModal(null);
    setFeedbackText('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;

    setProcessingId(editingSub.id);
    const res = await updateAdminSubmissionAction(editingSub.id, editingSub);

    if (res.success) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === editingSub.id ? { ...s, ...editingSub } : s))
      );
      setEditingSub(null);
    } else {
      alert(`Update failed: ${res.error}`);
    }
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-900 pb-3 overflow-x-auto scrollbar-none">
        {[
          { key: 'pending', label: 'Pending Review', count: submissions.filter((s) => s.status === 'pending').length },
          { key: 'changes_requested', label: 'Changes Requested', count: submissions.filter((s) => s.status === 'changes_requested').length },
          { key: 'approved', label: 'Approved & Live', count: submissions.filter((s) => s.status === 'approved').length },
          { key: 'rejected', label: 'Rejected', count: submissions.filter((s) => s.status === 'rejected').length },
          { key: 'all', label: 'All Submissions', count: submissions.length },
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
      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-850 space-y-2">
          <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-200">No submissions found</h3>
          <p className="text-xs text-slate-400">
            {activeTab === 'pending'
              ? 'All community submissions are up to date!'
              : 'Try selecting another tab above.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((sub) => {
            const isProcessing = processingId === sub.id;
            const curCats = selectedCats[sub.id] || (sub.category_id ? [sub.category_id] : []);
            const curTags = selectedTags[sub.id] || [];

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
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-100">{sub.tool_name}</h3>
                        <a
                          href={sub.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Visit Website
                        </a>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>Submitted by <strong className="text-slate-300">{sub.submitter_name}</strong></span>
                        <span>•</span>
                        <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="uppercase text-[10px] font-bold px-2 py-0.2 rounded bg-slate-800 text-slate-300">
                          {sub.pricing}
                        </span>
                        <span>•</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            sub.contributor_feedback?.includes('AI Web Discovery')
                              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          Source: {sub.contributor_feedback?.includes('AI Web Discovery') ? 'AI Web Discovery' : 'Direct Submission'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Edit Button */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingSub(sub)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Edit Submission Info"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        sub.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : sub.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : sub.status === 'changes_requested'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {sub.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-850 leading-relaxed">
                  {sub.description || 'No description provided.'}
                </p>

                {/* Custom Tags */}
                {sub.tags && sub.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Submitted Tags:
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

                {/* Moderator Feedback */}
                {sub.feedback && (
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300">Moderator Note: </span>
                      <span>{sub.feedback}</span>
                    </div>
                  </div>
                )}

                {/* Moderation Controls (if Pending or Changes Requested) */}
                {(sub.status === 'pending' || sub.status === 'changes_requested') && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-3">
                    {/* Category Selection */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        Assign Categories:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {categories.map((c) => {
                          const isChecked = curCats.includes(c.id);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => toggleCategory(sub.id, c.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                isChecked
                                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                              }`}
                            >
                              {c.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tag Selection */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                        <TagIcon className="w-3.5 h-3.5 text-indigo-400" />
                        Assign Platform Tags:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((t) => {
                          const isChecked = curTags.includes(t.id);
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => toggleTag(sub.id, t.id)}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-all ${
                                isChecked
                                  ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                              }`}
                            >
                              {t.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-800/80 flex-wrap">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() =>
                          setFeedbackModal({ subId: sub.id, type: 'reject', toolName: sub.tool_name })
                        }
                        className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() =>
                          setFeedbackModal({ subId: sub.id, type: 'changes', toolName: sub.tool_name })
                        }
                        className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-blue-950/40 text-slate-400 hover:text-blue-400 border border-slate-800 hover:border-blue-500/30 text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        Request Changes
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleApprove(sub)}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all hover:scale-105 disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        {isProcessing ? 'Publishing...' : 'Approve & Publish to Directory'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Approved Link */}
                {sub.status === 'approved' && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>Tool is live in the public AI Directory.</span>
                    <Link
                      href="/tools"
                      className="flex items-center gap-1 text-cyan-400 hover:underline font-bold"
                    >
                      View Live Tool <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FEEDBACK MODAL (Reject or Request Changes) */}
      {mounted && feedbackModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">
              {feedbackModal.type === 'changes'
                ? `Request Revisions: ${feedbackModal.toolName}`
                : `Reject Submission: ${feedbackModal.toolName}`}
            </h3>
            <p className="text-xs text-slate-400">
              {feedbackModal.type === 'changes'
                ? 'Provide constructive feedback explaining what the contributor should adjust.'
                : 'Explain why this tool does not meet library guidelines.'}
            </p>

            <textarea
              rows={4}
              required
              placeholder="Enter moderator feedback..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFeedbackModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!feedbackText.trim() || processingId !== null}
                onClick={handleFeedbackSubmit}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-slate-950 transition-all ${
                  feedbackModal.type === 'changes'
                    ? 'bg-blue-400 hover:bg-blue-300'
                    : 'bg-rose-400 hover:bg-rose-300'
                }`}
              >
                Confirm {feedbackModal.type === 'changes' ? 'Request' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* EDIT SUBMISSION MODAL */}
      {mounted && editingSub && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setEditingSub(null)}
          />

          <form
            onSubmit={handleSaveEdit}
            className="relative z-10 w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 shrink-0 bg-slate-900">
              <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate pr-2">
                Edit Submission: {editingSub.tool_name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSub(null)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Tool Name</label>
                <input
                  type="text"
                  required
                  value={editingSub.tool_name}
                  onChange={(e) => setEditingSub({ ...editingSub, tool_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Website URL</label>
                <input
                  type="url"
                  required
                  value={editingSub.website_url}
                  onChange={(e) => setEditingSub({ ...editingSub, website_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Pricing</label>
                <select
                  value={editingSub.pricing}
                  onChange={(e) => setEditingSub({ ...editingSub, pricing: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="free_trial">Free Trial</option>
                  <option value="paid">Paid</option>
                  <option value="contact">Contact</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingSub.description || ''}
                  onChange={(e) => setEditingSub({ ...editingSub, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 resize-none focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-800 shrink-0 bg-slate-900">
              <button
                type="button"
                onClick={() => setEditingSub(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
}
