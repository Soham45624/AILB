'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import {
  X,
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Tag as TagIcon,
  Plus,
  Hash,
} from 'lucide-react';
import { submitToolAction } from '@/app/actions/submissions';
import { getCurrentUserAction } from '@/app/actions/auth';
import { AuthModal } from '../auth/AuthModal';

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SUGGESTED_TAGS = [
  'editing',
  'image generator',
  'coding ai',
  'presentation maker',
  'text-to-video',
  'video editor',
  'voice cloning',
  'open source',
  'api access',
  'workflow automation',
];

export function AddToolModal({ isOpen, onClose }: AddToolModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [pricing, setPricing] = useState('free');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionData, setSubmissionData] = useState<any>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check auth state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCheckingAuth(true);
      setError(null);
      getCurrentUserAction().then((res) => {
        if (res.success && res.user) {
          setCurrentUser(res.user);
        } else {
          setCurrentUser(null);
        }
        setCheckingAuth(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (tagToAdd?: string) => {
    const raw = (tagToAdd || tagInput).trim();
    if (!raw) return;

    // Clean leading # and spaces
    const cleanTag = raw.replace(/^#+/, '').trim();
    if (cleanTag && !tags.some((t) => t.toLowerCase() === cleanTag.toLowerCase())) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('url', url);
    formData.append('description', description);
    formData.append('pricing', pricing);
    formData.append('tags', JSON.stringify(tags));

    try {
      console.log('Dispatching submitToolAction with tags:', tags);
      const response = await submitToolAction(formData);

      if (!response.success) {
        console.error('Submission failed with error:', response.error);
        setError(response.error || 'Failed to submit tool. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Submission confirmed created in Supabase:', response.submission);
      setSubmissionData(response.submission);
      setLoading(false);
    } catch (err: any) {
      console.error('Client submission error:', err);
      setError(err.message || 'An unexpected error occurred during submission.');
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName('');
    setUrl('');
    setDescription('');
    setPricing('free');
    setTags([]);
    setTagInput('');
    setError(null);
    setSubmissionData(null);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 overflow-hidden my-8">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Submit an AI Tool</h3>
                <p className="text-xs text-slate-400">
                  Add a new AI project to the Supabase moderation queue
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Auth Status Banner */}
          {!checkingAuth && (
            <div className="mt-4">
              {currentUser ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>
                      Submitting as <strong className="font-semibold">{currentUser.email}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                    Authenticated
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Please sign in to submit a tool.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Real Error Message Banner */}
          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="space-y-1">
                <p className="font-bold text-rose-200">Submission Error</p>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {submissionData ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-slate-100">Tool Submitted to Supabase!</h4>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Your submission for <strong className="text-cyan-400">{submissionData.tool_name}</strong> was recorded in the database (Status: <span className="font-semibold text-amber-400">{submissionData.status}</span>).
              </p>

              {/* Tag confirmation chips */}
              {submissionData.tags && submissionData.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  {submissionData.tags.map((t: string) => (
                    <span key={t} className="text-xs px-2.5 py-0.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-xs text-slate-500 bg-slate-950 p-2.5 rounded-xl max-w-xs mx-auto border border-slate-800">
                Submission ID: {submissionData.id}
              </div>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tool Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ChatCanvas AI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Website URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Pricing Model
                </label>
                <select
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                >
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="free_trial">Free Trial</option>
                  <option value="paid">Paid</option>
                  <option value="contact">Contact for Pricing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe what this AI tool does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                />
              </div>

              {/* CUSTOM #TAGS INPUT SECTION */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-cyan-400" />
                    Custom Tags & Keywords
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Press Enter or comma to add
                  </span>
                </label>

                {/* Active Tag Chips */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold animate-fade-in"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="p-0.5 rounded hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-200 transition-colors"
                          title="Remove tag"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Input with Add button */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">
                      #
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. editing, image generator, copilot..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddTag()}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    Add Tag
                  </button>
                </div>

                {/* Suggested Tags Pill Bar */}
                <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-medium">Quick suggestions:</span>
                  {POPULAR_SUGGESTED_TAGS.map((sug) => {
                    const isAdded = tags.some((t) => t.toLowerCase() === sug.toLowerCase());
                    return (
                      <button
                        type="button"
                        key={sug}
                        disabled={isAdded}
                        onClick={() => handleAddTag(sug)}
                        className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                          isAdded
                            ? 'bg-slate-950 border-slate-850 text-slate-600 cursor-not-allowed'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40'
                        }`}
                      >
                        #{sug}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 transition-all disabled:opacity-50"
                >
                  {loading ? 'Submitting to Supabase...' : 'Submit Tool'}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Auth Modal if user needs to sign in */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          getCurrentUserAction().then((res) => {
            if (res.success && res.user) setCurrentUser(res.user);
          });
        }}
      />
    </>
  );
}
