'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import {
  X,
  Send,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  UserCheck,
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
  'productivity',
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
    if (tags.length > 0) formData.append('tags', JSON.stringify(tags));

    const res = await submitToolAction(formData);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to submit tool.');
    } else {
      setSubmissionData({
        id: res.submission?.id,
        tool_name: name,
        status: res.submission?.status || 'pending',
        tags,
      });
    }
  };

  const handleReset = () => {
    setName('');
    setUrl('');
    setDescription('');
    setPricing('free');
    setTags([]);
    setError(null);
    setSubmissionData(null);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-lg rounded-3xl bg-[#FBF9F5] border border-[#EAE6DC] shadow-2xl p-6 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#EAE6DC]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-full bg-[#EDF7EE] text-[#1E7E34]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#141613]">Submit AI Tool</h3>
                <p className="text-xs text-[#73796E]">Share a tool with the AILIB directory</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#73796E] hover:text-[#141613] hover:bg-[#F5F3ED] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Auth Banner */}
          {!checkingAuth && (
            <div className="mt-4 p-3 rounded-xl bg-white border border-[#EAE6DC] flex items-center justify-between text-xs shadow-sm">
              {currentUser ? (
                <div className="flex items-center gap-2 text-[#1E7E34]">
                  <UserCheck className="w-4 h-4" />
                  <span>
                    Submitting as <strong className="text-[#141613]">{currentUser.email}</strong>
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="text-[#73796E]">Sign in to track your submissions:</span>
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-[#141613] font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-[#FDF0F2] border border-[#F8D2D7] text-[#D73A49] text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Submission Error</p>
                <p className="leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {submissionData ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#EDF7EE] text-[#1E7E34] flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-[#141613]">Tool Submitted!</h4>
              <p className="text-xs sm:text-sm text-[#666B60] max-w-sm mx-auto">
                Your submission for <strong className="text-[#141613]">{submissionData.tool_name}</strong> was recorded for moderator review.
              </p>

              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-full bg-[#141613] text-white text-xs font-bold shadow-md"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#73796E] uppercase tracking-wider mb-1">
                  Tool Name <span className="text-[#D73A49]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ChatCanvas AI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E2DDD2] text-xs text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#73796E] uppercase tracking-wider mb-1">
                  Website URL <span className="text-[#D73A49]">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E2DDD2] text-xs text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#73796E] uppercase tracking-wider mb-1">
                  Pricing Model
                </label>
                <select
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E2DDD2] text-xs text-[#141613] focus:outline-none focus:border-[#141613]"
                >
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="free_trial">Free Trial</option>
                  <option value="paid">Paid</option>
                  <option value="contact">Contact for Pricing</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#73796E] uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe what this AI tool does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E2DDD2] text-xs text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613] resize-none"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2 pt-1">
                <label className="block text-[11px] font-bold text-[#73796E] uppercase tracking-wider">
                  Tags &amp; Keywords
                </label>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EDF7EE] border border-[#CCE8CD] text-[#1E7E34] text-xs font-semibold"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-black"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9FA59A] text-xs font-bold">
                      #
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. image generator, copilot..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-white border border-[#E2DDD2] text-xs text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddTag()}
                    className="px-3.5 py-2 rounded-xl bg-[#F5F3ED] hover:bg-[#ECE8DF] text-[#141613] text-xs font-semibold border border-[#EAE6DC] transition-colors shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#EAE6DC]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full bg-[#F5F3ED] hover:bg-[#ECE8DF] text-[#141613] text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-interactive flex items-center gap-2 px-5 py-2 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Tool'}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

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
