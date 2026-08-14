'use client';

import { useState, useEffect, KeyboardEvent, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Send,
  Globe,
  Tag as TagIcon,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Layers,
  Monitor,
  Image as ImageIcon,
  MessageSquareHeart,
  HelpCircle,
  Hash,
} from 'lucide-react';
import { Category, Tag, PlatformType } from '@/lib/types';
import { submitToolAction, checkDuplicateToolAction } from '@/app/actions/submissions';
import { normalizeToolUrl } from '@/lib/urlHelper';

interface SubmitToolFormProps {
  userEmail: string;
  categories: Category[];
  initialTags: Tag[];
}

const ALL_PLATFORMS: PlatformType[] = ['Web', 'macOS', 'Windows', 'Linux', 'iOS', 'Android', 'API'];

export function SubmitToolForm({
  userEmail,
  categories,
  initialTags,
}: SubmitToolFormProps) {
  const router = useRouter();

  // Required Fields
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [pricing, setPricing] = useState('free');
  const [contributorFeedback, setContributorFeedback] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');

  // Optional Fields
  const [showOptional, setShowOptional] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(['Web']);
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [proInput, setProInput] = useState('');
  const [cons, setCons] = useState<string[]>([]);
  const [conInput, setConInput] = useState('');

  // Status & Validation states
  const [duplicateWarning, setDuplicateWarning] = useState<{
    isDuplicate: boolean;
    existingTool?: any;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successSubmission, setSuccessSubmission] = useState<any>(null);

  // Live duplicate checking on URL blur or debounce
  useEffect(() => {
    if (!url.trim()) {
      setDuplicateWarning(null);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await checkDuplicateToolAction(url, name);
      if (res.isDuplicate) {
        setDuplicateWarning(res);
      } else {
        setDuplicateWarning(null);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [url, name]);

  // Compute Smart Suggested Tags based on chosen category and description keywords
  const smartSuggestions = useMemo(() => {
    const selectedCat = categories.find((c) => c.id === categoryId);
    const catName = (selectedCat?.name || '').toLowerCase();
    const desc = description.toLowerCase();

    const suggested = new Set<string>();

    if (catName.includes('code') || desc.includes('code') || desc.includes('developer') || desc.includes('python')) {
      suggested.add('coding ai');
      suggested.add('python');
      suggested.add('api access');
      suggested.add('open source');
    }
    if (catName.includes('video') || desc.includes('video') || desc.includes('cinematic') || desc.includes('motion')) {
      suggested.add('video editor');
      suggested.add('text-to-video');
      suggested.add('editing');
    }
    if (catName.includes('image') || desc.includes('image') || desc.includes('photo') || desc.includes('art') || desc.includes('drawing')) {
      suggested.add('image generator');
      suggested.add('editing');
      suggested.add('ui-ux design');
    }
    if (catName.includes('audio') || desc.includes('voice') || desc.includes('sound') || desc.includes('speech')) {
      suggested.add('voice cloning');
      suggested.add('editing');
    }
    if (catName.includes('presentation') || desc.includes('slide') || desc.includes('deck')) {
      suggested.add('presentation maker');
      suggested.add('slide decks');
    }
    if (catName.includes('seo') || desc.includes('seo') || desc.includes('marketing')) {
      suggested.add('seo tool');
      suggested.add('workflow automation');
    }

    // Always include top initial tags
    suggested.add('free tier');
    suggested.add('ai assistant');

    return Array.from(suggested).filter((t) => !tags.some((cur) => cur.toLowerCase() === t.toLowerCase()));
  }, [categoryId, description, categories, tags]);

  const handleAddTag = (tagText?: string) => {
    const clean = (tagText || customTagInput).replace(/^#+/, '').trim();
    if (!clean) return;
    if (!tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setTags([...tags, clean]);
    }
    setCustomTagInput('');
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const togglePlatform = (p: PlatformType) => {
    if (selectedPlatforms.includes(p)) {
      if (selectedPlatforms.length > 1) {
        setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
      }
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleAddPro = () => {
    if (proInput.trim() && !pros.includes(proInput.trim())) {
      setPros([...pros, proInput.trim()]);
      setProInput('');
    }
  };

  const handleAddCon = () => {
    if (conInput.trim() && !cons.includes(conInput.trim())) {
      setCons([...cons, conInput.trim()]);
      setConInput('');
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('url', url);
    formData.append('categoryId', categoryId);
    formData.append('description', description);
    formData.append('pricing', pricing);
    formData.append('contributorFeedback', contributorFeedback);
    formData.append('tags', JSON.stringify(tags));

    // Optional
    formData.append('logoUrl', logoUrl);
    formData.append('screenshotUrl', screenshotUrl);
    formData.append('platforms', JSON.stringify(selectedPlatforms));
    formData.append('features', JSON.stringify(features));
    formData.append('pros', JSON.stringify(pros));
    formData.append('cons', JSON.stringify(cons));

    try {
      const res = await submitToolAction(formData);

      if (!res.success) {
        setError(res.error || 'Failed to submit tool.');
        if (res.duplicate && res.existingTool) {
          setDuplicateWarning({ isDuplicate: true, existingTool: res.existingTool });
        }
        setLoading(false);
        return;
      }

      setSuccessSubmission(res.submission);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  if (successSubmission) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-100">
            Tool Successfully Submitted!
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Thank you for contributing <strong className="text-cyan-400">{successSubmission.tool_name}</strong> to the community library. Your submission has entered the moderation queue.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-sm mx-auto text-left space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Status:</span>
            <span className="font-bold text-amber-400 uppercase tracking-wider">
              {successSubmission.status}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Submission ID:</span>
            <span className="font-mono text-slate-300 truncate max-w-[180px]">
              {successSubmission.id}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Contributor:</span>
            <span className="text-slate-300">{userEmail}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard/submissions"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
          >
            Track My Submissions
          </Link>
          <button
            type="button"
            onClick={() => {
              setSuccessSubmission(null);
              setName('');
              setUrl('');
              setDescription('');
              setContributorFeedback('');
              setTags([]);
              setFeatures([]);
              setPros([]);
              setCons([]);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all"
          >
            + Submit Another Tool
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-8 backdrop-blur-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <div className="space-y-1">
            <p className="font-bold text-rose-200">Submission Alert</p>
            <p className="leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Duplicate Warning Alert */}
      {duplicateWarning?.isDuplicate && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
            <div className="space-y-1">
              <p className="font-bold text-amber-200">Duplicate Tool Detected</p>
              <p className="text-slate-300">
                This tool is already present in our library as{' '}
                <strong className="text-amber-300">{duplicateWarning.existingTool?.name}</strong>.
              </p>
            </div>
          </div>
          {duplicateWarning.existingTool?.slug && (
            <Link
              href={`/tools/${duplicateWarning.existingTool.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 shrink-0 transition-colors"
            >
              <span>View Tool</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}

      {/* SECTION 1: CORE INFORMATION */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            1. Core Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Tool Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Tool Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Synthesia AI"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Website URL <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="https://synthesia.io"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Domain will be normalized (tracking parameters and www stripped).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Primary Category <span className="text-rose-400">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Model */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Pricing Model <span className="text-rose-400">*</span>
            </label>
            <select
              value={pricing}
              onChange={(e) => setPricing(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            >
              <option value="free">Free (100% Free Forever)</option>
              <option value="freemium">Freemium (Free tier + Paid plans)</option>
              <option value="free_trial">Free Trial (Requires subscription after trial)</option>
              <option value="paid">Paid (Commercial license / paid only)</option>
              <option value="contact">Contact for Enterprise Pricing</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Tool Overview / Description <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="Explain what the AI tool does, its main capability, and target audience..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
          />
        </div>
      </div>

      {/* SECTION 2: TAGS & KEYWORDS */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Hash className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            2. Tags & Discovery Keywords
          </h2>
        </div>

        {/* Selected Tags Chips */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold animate-fade-in"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="p-0.5 rounded hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Custom Tag Input */}
        <div className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">
              #
            </span>
            <input
              type="text"
              placeholder="Type tag (e.g. editing, image generator) and press Enter"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <button
            type="button"
            onClick={() => handleAddTag()}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            Add Tag
          </button>
        </div>

        {/* Smart Tag Suggestions based on Category & Description */}
        {smartSuggestions.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart Tag Suggestions (Click to Add):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {smartSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleAddTag(sug)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-500/15 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-300 text-xs font-medium transition-all"
                >
                  +#{sug}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: CONTRIBUTOR FEEDBACK (OPTIONAL) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <MessageSquareHeart className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            3. Contributor Perspective / Review <span className="text-slate-500 font-normal normal-case text-xs">(Optional)</span>
          </h2>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Your Personal Review & Recommendation (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Share why you're submitting this tool, what makes it standout, or your real experience using it (optional)..."
            value={contributorFeedback}
            onChange={(e) => setContributorFeedback(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            If provided, this will be displayed on the tool overview page under Contributor Insights.
          </p>
        </div>
      </div>

      {/* SECTION 4: OPTIONAL DETAILS (Collapsible) */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowOptional(!showOptional)}
          className="w-full py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-slate-300 font-bold text-xs transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Optional Details (Platforms, Pros, Cons, Features, Assets)</span>
          </div>
          {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showOptional && (
          <div className="p-6 mt-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-6 animate-fade-in">
            {/* Platforms */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Supported Platforms & APIs
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_PLATFORMS.map((p) => {
                  const isChecked = selectedPlatforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isChecked
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Pros */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5" /> Key Pros / Strengths
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Ultra-fast generation"
                    value={proInput}
                    onChange={(e) => setProInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPro())}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddPro}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20"
                  >
                    Add
                  </button>
                </div>
                {pros.length > 0 && (
                  <div className="space-y-1">
                    {pros.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-emerald-300 bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                      >
                        <span>✓ {p}</span>
                        <button
                          type="button"
                          onClick={() => setPros(pros.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cons */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ThumbsDown className="w-3.5 h-3.5" /> Limitations / Cons
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Limited free exports"
                    value={conInput}
                    onChange={(e) => setConInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCon())}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-rose-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddCon}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-bold hover:bg-rose-500/20"
                  >
                    Add
                  </button>
                </div>
                {cons.length > 0 && (
                  <div className="space-y-1">
                    {cons.map((c, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-rose-300 bg-rose-950/20 px-2.5 py-1 rounded-lg border border-rose-500/20"
                      >
                        <span>✕ {c}</span>
                        <button
                          type="button"
                          onClick={() => setCons(cons.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Logo & Screenshot URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Screenshot URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/preview.png"
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          Submitting as <strong className="text-slate-200">{userEmail}</strong>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            'Submitting to Moderation Queue...'
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Tool to Moderation
            </>
          )}
        </button>
      </div>
    </form>
  );
}
