'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Globe,
  Tag as TagIcon,
  Plus,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { LibraryTool } from '@/app/actions/library';
import { Category, Tag } from '@/lib/types';
import { submitToolAction, checkDuplicateToolAction } from '@/app/actions/submissions';

interface ShareToAILIBModalProps {
  tool: LibraryTool | null;
  categories: Category[];
  allTags: Tag[];
  onClose: () => void;
}

type ModalStep = 'form' | 'confirm' | 'success' | 'already_live' | 'already_pending';

export function ShareToAILIBModal({ tool, categories, allTags, onClose }: ShareToAILIBModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Form state pre-filled from tool
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [pricing, setPricing] = useState('free');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [contributorFeedback, setContributorFeedback] = useState('');

  const [step, setStep] = useState<ModalStep>('form');
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingToolSlug, setExistingToolSlug] = useState<string | undefined>();

  // Pre-fill form from the tool whenever it changes
  useEffect(() => {
    if (!tool) return;
    setName(tool.name || '');
    setUrl(tool.website_url || '');
    setDescription(tool.description || '');
    setCategoryId(tool.categories?.[0]?.id || categories[0]?.id || '');
    setPricing(tool.pricing || 'free');
    setTags((tool.tags || []).map((t) => t.name));
    setContributorFeedback('');
    setStep('form');
    setError(null);
    setExistingToolSlug(undefined);
  }, [tool, categories]);

  if (!tool) return null;

  const filteredTagSuggestions = allTags
    .filter(
      (t) =>
        tagInput.length > 0 &&
        t.name.toLowerCase().includes(tagInput.toLowerCase()) &&
        !tags.includes(t.name)
    )
    .slice(0, 6);

  const addTag = (tagName: string) => {
    const cleaned = tagName.trim();
    if (cleaned && !tags.includes(cleaned) && tags.length < 10) {
      setTags((prev) => [...prev, cleaned]);
    }
    setTagInput('');
  };

  const removeTag = (tagName: string) => {
    setTags((prev) => prev.filter((t) => t !== tagName));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleCheckAndProceed = async () => {
    setError(null);
    if (!name.trim() || name.trim().length < 2) {
      setError('Tool name is required (min 2 characters).');
      return;
    }
    if (!url.trim()) {
      setError('Website URL is required.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError('Description is required (min 10 characters).');
      return;
    }

    setChecking(true);
    try {
      const dup = await checkDuplicateToolAction(url.trim(), name.trim());
      if (dup.isDuplicate && dup.existingTool) {
        setExistingToolSlug(dup.existingTool.slug);
        if (dup.existingTool.status === 'live') {
          setStep('already_live');
        } else {
          setStep('already_pending');
        }
        setChecking(false);
        return;
      }
    } catch (err: any) {
      // non-blocking — if check fails, let the submission handle duplicates
    }
    setChecking(false);
    setStep('confirm');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set('name', name.trim());
    formData.set('url', url.trim());
    formData.set('description', description.trim());
    formData.set('categoryId', categoryId);
    formData.set('pricing', pricing);
    formData.set('tags', JSON.stringify(tags));
    formData.set('contributorFeedback', contributorFeedback.trim());

    const res = await submitToolAction(formData);
    setSubmitting(false);

    if (!res.success) {
      if (res.duplicate && res.existingTool) {
        setExistingToolSlug(res.existingTool.slug);
        setStep(res.existingTool.status === 'live' ? 'already_live' : 'already_pending');
      } else {
        setError(res.error || 'Submission failed. Please try again.');
        setStep('form');
      }
      return;
    }

    setStep('success');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full sm:max-w-xl max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-zinc-950 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
              <Upload className="w-4 h-4 text-zinc-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Share to AILIB</h2>
              <p className="text-[11px] text-zinc-500">Submit for community review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-interactive p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── STEP: FORM ── */}
        {step === 'form' && (
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Tool Name */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Tool Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Claude, Midjourney, Perplexity"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this tool do? Who is it for?"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors resize-none"
              />
            </div>

            {/* Category + Pricing row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Pricing
                </label>
                <div className="relative">
                  <select
                    value={pricing}
                    onChange={(e) => setPricing(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors"
                  >
                    <option value="free">Free</option>
                    <option value="freemium">Freemium</option>
                    <option value="paid">Paid</option>
                    <option value="free_trial">Free Trial</option>
                    <option value="contact">Contact</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Tags
              </label>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-zinc-900 border border-zinc-800 focus-within:border-zinc-600 transition-colors min-h-[44px]">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-zinc-500 hover:text-zinc-200 transition-colors"
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
                    className="w-full bg-transparent text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none py-0.5"
                  />
                  {filteredTagSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 z-20 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden w-48">
                      {filteredTagSuggestions.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            addTag(t.name);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                        >
                          <TagIcon className="w-3 h-3 text-zinc-500" />
                          {t.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-1 text-[11px] text-zinc-600">
                Use existing AILIB tags. Type and press Enter or comma to add.
              </p>
            </div>

            {/* Why recommend */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Why do you recommend this tool?{' '}
                <span className="normal-case font-normal text-zinc-600">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={contributorFeedback}
                onChange={(e) => setContributorFeedback(e.target.value)}
                placeholder="Share what makes this tool worth adding to AILIB..."
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleCheckAndProceed}
              disabled={checking}
              className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-3">
                {tool.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tool.logo_url}
                    alt={name}
                    className="w-10 h-10 rounded-lg object-cover bg-zinc-800"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-sm">
                    {name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm text-zinc-100">{name}</p>
                  <p className="text-[11px] text-zinc-500 font-mono">{url.replace(/^https?:\/\//, '')}</p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{description}</p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.slice(0, 5).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-100">Submit this tool to AILIB?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The tool will be reviewed by the AILIB team before appearing in the public library.
                Approval is not guaranteed and may take some time.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setStep('form')}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Submitted for Review</h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                <strong className="text-zinc-200">{name}</strong> has been submitted to the AILIB
                team. It will appear in the public library once approved.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* ── STEP: ALREADY LIVE ── */}
        {step === 'already_live' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Already in AILIB</h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                <strong className="text-zinc-200">{name}</strong> is already in the public AILIB
                library.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-sm transition-colors"
              >
                Close
              </button>
              {existingToolSlug && (
                <a
                  href={`/tools/${existingToolSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Tool
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── STEP: ALREADY PENDING ── */}
        {step === 'already_pending' && (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Already Submitted</h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                <strong className="text-zinc-200">{name}</strong> has already been submitted and is
                awaiting review by the AILIB team.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-sm transition-colors"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
