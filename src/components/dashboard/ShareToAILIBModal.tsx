'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Loader2,
  Tag as TagIcon,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { LibraryTool } from '@/app/actions/library';
import { checkDuplicateToolAction, submitToolAction } from '@/app/actions/submissions';
import { Category, Tag, PricingType } from '@/lib/types';

interface ShareToAILIBModalProps {
  tool: LibraryTool;
  categories: Category[];
  allTags: Tag[];
  onClose: () => void;
  onSuccess?: () => void;
}

type ModalStep = 'form' | 'confirm' | 'success' | 'already_live' | 'already_pending';

export function ShareToAILIBModal({
  tool,
  categories,
  allTags,
  onClose,
  onSuccess,
}: ShareToAILIBModalProps) {
  const [step, setStep] = useState<ModalStep>('form');
  const [name, setName] = useState(tool.name);
  const [url, setUrl] = useState(tool.website_url);
  const [description, setDescription] = useState(tool.description || '');
  const [categoryId, setCategoryId] = useState(
    tool.categories?.[0]?.id || categories[0]?.id || ''
  );
  const [pricing, setPricing] = useState<PricingType>((tool.pricing as PricingType) || 'free');
  const [tags, setTags] = useState<string[]>(
    (tool.tags || []).map((t) => t.name)
  );
  const [tagInput, setTagInput] = useState('');
  const [contributorFeedback, setContributorFeedback] = useState('');

  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingToolSlug, setExistingToolSlug] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const addTag = (tag: string) => {
    const trimmed = tag.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const filteredTagSuggestions = allTags.filter(
    (t) =>
      tagInput.trim() &&
      t.name.toLowerCase().includes(tagInput.toLowerCase()) &&
      !tags.includes(t.name)
  ).slice(0, 5);

  const handleCheckAndProceed = async () => {
    if (!name.trim()) {
      setError('Tool name is required.');
      return;
    }
    if (!url.trim()) {
      setError('Website URL is required.');
      return;
    }

    setChecking(true);
    setError(null);

    const dupCheck = await checkDuplicateToolAction(url, name);
    setChecking(false);

    if (dupCheck.isDuplicate) {
      if (dupCheck.existingTool?.status === 'live') {
        setExistingToolSlug(dupCheck.existingTool.slug || null);
        setStep('already_live');
        return;
      }
      if (dupCheck.existingTool?.status === 'pending') {
        setStep('already_pending');
        return;
      }
    }

    setStep('confirm');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('url', url.trim());
    formData.append('description', description.trim());
    formData.append('categoryId', categoryId);
    formData.append('pricing', pricing);
    if (contributorFeedback.trim()) formData.append('contributorFeedback', contributorFeedback.trim());
    if (tags.length > 0) formData.append('tags', JSON.stringify(tags));

    const res = await submitToolAction(formData);
    setSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Failed to submit tool.');
    } else {
      setStep('success');
      onSuccess?.();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#141613]/25 backdrop-blur-[6px] animate-fade-in"
    >
      <div className="relative w-full sm:max-w-xl max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#FBF9F5] border border-[#EAE6DC] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-[#EAE6DC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EDF7EE] text-[#1E7E34] flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#141613]">Share to AILIB</h2>
              <p className="text-[11px] text-[#73796E]">Submit for community review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#73796E] hover:text-[#141613] hover:bg-[#F5F3ED]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── STEP: FORM ── */}
        {step === 'form' && (
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-[#FDF0F2] border border-[#F8D2D7] text-[#D73A49] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Tool Name */}
            <div>
              <label className="block text-[11px] font-bold text-[#73796E] uppercase tracking-wider mb-1.5">
                Tool Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Claude, Midjourney, Perplexity"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD2] text-sm text-[#141613] focus:outline-none focus:border-[#141613] transition-colors"
              />
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-[11px] font-bold text-[#73796E] uppercase tracking-wider mb-1.5">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9FA59A]" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E2DDD2] text-sm text-[#141613] focus:outline-none focus:border-[#141613] transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-bold text-[#73796E] uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this tool do? Who is it for?"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD2] text-sm text-[#141613] focus:outline-none focus:border-[#141613] transition-colors resize-none"
              />
            </div>

            {/* Category + Pricing row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#73796E] uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl bg-white border border-[#E2DDD2] text-sm text-[#141613] focus:outline-none focus:border-[#141613] transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9FA59A] pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#73796E] uppercase tracking-wider mb-1.5">
                  Pricing
                </label>
                <div className="relative">
                  <select
                    value={pricing}
                    onChange={(e) => setPricing(e.target.value as PricingType)}
                    className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl bg-white border border-[#E2DDD2] text-sm text-[#141613] focus:outline-none focus:border-[#141613] transition-colors"
                  >
                    <option value="free">Free</option>
                    <option value="freemium">Freemium</option>
                    <option value="paid">Paid</option>
                    <option value="free_trial">Free Trial</option>
                    <option value="contact">Contact</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9FA59A] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[11px] font-bold text-[#73796E] uppercase tracking-wider mb-1.5">
                Tags
              </label>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-white border border-[#E2DDD2] focus-within:border-[#141613] transition-colors min-h-[44px]">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EDF7EE] text-[#1E7E34] text-xs font-medium border border-[#CCE8CD]"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-black transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <div className="relative flex-1 min-w-[120px]">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="+ Add tag"
                    className="w-full bg-transparent text-xs text-[#141613] placeholder:text-[#94998E] focus:outline-none py-0.5"
                  />
                  {filteredTagSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-[#EAE6DC] rounded-xl shadow-xl overflow-hidden w-48">
                      {filteredTagSuggestions.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            addTag(t.name);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-[#141613] hover:bg-[#F5F3ED] transition-colors flex items-center gap-1.5"
                        >
                          <TagIcon className="w-3 h-3 text-[#9FA59A]" />
                          <span>{t.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Why recommend */}
            <div>
              <label className="block text-[11px] font-bold text-[#73796E] uppercase tracking-wider mb-1.5">
                Why do you recommend this tool?{' '}
                <span className="normal-case font-normal text-[#9FA59A]">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={contributorFeedback}
                onChange={(e) => setContributorFeedback(e.target.value)}
                placeholder="Share what makes this tool worth adding to AILIB..."
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD2] text-sm text-[#141613] focus:outline-none focus:border-[#141613] transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleCheckAndProceed}
              disabled={checking}
              className="btn-interactive w-full py-3 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {checking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Review &amp; Submit</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* ── STEP: CONFIRM ── */}
        {step === 'confirm' && (
          <div className="p-6 space-y-5">
            <div className="p-4 rounded-2xl bg-white border border-[#EAE6DC] space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#141613] text-white font-bold text-sm flex items-center justify-center">
                  {name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm text-[#141613]">{name}</p>
                  <p className="text-[11px] text-[#73796E]">{url.replace(/^https?:\/\//, '')}</p>
                </div>
              </div>
              <p className="text-xs text-[#666B60] leading-relaxed line-clamp-3">{description}</p>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#141613]">Submit this tool to AILIB?</h3>
              <p className="text-xs text-[#666B60] leading-relaxed">
                The tool will be reviewed by the moderation team before appearing in the public library.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep('form')}
                className="flex-1 py-2.5 rounded-full bg-[#F5F3ED] hover:bg-[#ECE8DF] text-[#141613] font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-interactive flex-1 py-2.5 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Submit for Review'
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: SUCCESS ── */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#EDF7EE] text-[#1E7E34] flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#141613]">Submitted for Review</h3>
              <p className="text-xs text-[#666B60] mt-1.5 leading-relaxed max-w-xs mx-auto">
                <strong className="text-[#141613]">{name}</strong> has been submitted. It will appear in the library once approved.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs shadow-md transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
