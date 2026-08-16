'use client';

import { useState, useEffect, KeyboardEvent, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Send,
  Globe,
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
  Hash,
} from 'lucide-react';
import { Category, Tag, PlatformType } from '@/lib/types';
import { submitToolAction, checkDuplicateToolAction } from '@/app/actions/submissions';

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

    suggested.add('free tier');
    suggested.add('productivity');

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

  const togglePlatform = (plat: PlatformType) => {
    if (selectedPlatforms.includes(plat)) {
      setSelectedPlatforms(selectedPlatforms.filter((p) => p !== plat));
    } else {
      setSelectedPlatforms([...selectedPlatforms, plat]);
    }
  };

  const handleAddPro = () => {
    if (!proInput.trim()) return;
    setPros([...pros, proInput.trim()]);
    setProInput('');
  };

  const handleAddCon = () => {
    if (!conInput.trim()) return;
    setCons([...cons, conInput.trim()]);
    setConInput('');
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
    if (contributorFeedback) formData.append('contributorFeedback', contributorFeedback);
    if (logoUrl) formData.append('logoUrl', logoUrl);
    if (screenshotUrl) formData.append('screenshotUrl', screenshotUrl);
    if (tags.length > 0) formData.append('tags', JSON.stringify(tags));
    if (selectedPlatforms.length > 0) formData.append('platforms', JSON.stringify(selectedPlatforms));
    if (pros.length > 0) formData.append('pros', JSON.stringify(pros));
    if (cons.length > 0) formData.append('cons', JSON.stringify(cons));

    const res = await submitToolAction(formData);
    setLoading(false);

    if (res.success) {
      setSuccessSubmission(res.submission);
    } else {
      setError(res.error || 'Failed to submit tool. Please try again.');
    }
  };

  if (successSubmission) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#EAE6DC] shadow-sm text-center space-y-6 animate-fade-in max-w-2xl mx-auto">
        <div className="w-14 h-14 rounded-full bg-[#EDF7EE] text-[#1E7E34] flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#141613]">
            Submission Received!
          </h2>
          <p className="text-xs sm:text-sm text-[#666B60] max-w-md mx-auto leading-relaxed">
            Thank you for contributing <strong className="text-[#141613]">{successSubmission.name}</strong> to AILIB. Your submission is queued for moderator review.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FBF9F5] border border-[#EAE6DC] text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="flex justify-between text-[#666B60]">
            <span>Initial Status:</span>
            <span className="font-bold text-[#8C4E05] uppercase tracking-wider">
              {successSubmission.status}
            </span>
          </div>
          <div className="flex justify-between text-[#666B60]">
            <span>Contributor:</span>
            <span className="text-[#141613]">{userEmail}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard/submissions"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs shadow-md transition-all"
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
              setPros([]);
              setCons([]);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-[#F5F3ED] text-[#141613] border border-[#EAE6DC] font-semibold text-xs transition-all"
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
      className="p-6 sm:p-10 rounded-3xl bg-white border border-[#EAE6DC] shadow-sm space-y-8 relative"
    >
      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-[#FDF0F2] border border-[#F8D2D7] text-[#D73A49] text-xs flex items-start gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Submission Alert</p>
            <p className="leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Duplicate Warning Alert */}
      {duplicateWarning?.isDuplicate && (
        <div className="p-4 rounded-2xl bg-[#FEF6E9] border border-[#F9DEC2] text-[#8C4E05] text-xs flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#C66100]" />
            <div className="space-y-1">
              <p className="font-bold">Duplicate Tool Detected</p>
              <p className="text-[#666B60]">
                This tool is already present in our library as{' '}
                <strong className="text-[#141613]">{duplicateWarning.existingTool?.name}</strong>.
              </p>
            </div>
          </div>
          {duplicateWarning.existingTool?.slug && (
            <Link
              href={`/tools/${duplicateWarning.existingTool.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#141613] text-white font-bold text-xs hover:bg-[#2A2E27] shrink-0 transition-colors"
            >
              <span>View Tool</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}

      {/* SECTION 1: CORE INFORMATION */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 border-b border-[#F2EFE8] pb-3">
          <Sparkles className="w-4 h-4 text-[#5A7840]" />
          <h2 className="text-xs font-extrabold text-[#141613] uppercase tracking-wider">
            1. Core Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Tool Name */}
          <div>
            <label className="block text-xs font-bold text-[#141613] uppercase tracking-wider mb-1.5">
              Tool Name <span className="text-[#D73A49]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Synthesia AI"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E2DDD2] text-sm text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613] transition-all"
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-xs font-bold text-[#141613] uppercase tracking-wider mb-1.5">
              Website URL <span className="text-[#D73A49]">*</span>
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-[#9FA59A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="https://synthesia.io"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E2DDD2] text-sm text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613] transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-[#141613] uppercase tracking-wider mb-1.5">
              Primary Category <span className="text-[#D73A49]">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E2DDD2] text-sm text-[#141613] focus:outline-none focus:border-[#141613] transition-all"
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
            <label className="block text-xs font-bold text-[#141613] uppercase tracking-wider mb-1.5">
              Pricing Model <span className="text-[#D73A49]">*</span>
            </label>
            <select
              value={pricing}
              onChange={(e) => setPricing(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E2DDD2] text-sm text-[#141613] focus:outline-none focus:border-[#141613] transition-all"
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
          <label className="block text-xs font-bold text-[#141613] uppercase tracking-wider mb-1.5">
            Tool Overview / Description <span className="text-[#D73A49]">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="Explain what the AI tool does, its main capability, and target audience..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E2DDD2] text-sm text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613] transition-all resize-none"
          />
        </div>
      </div>

      {/* SECTION 2: TAGS & KEYWORDS */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 border-b border-[#F2EFE8] pb-3">
          <Hash className="w-4 h-4 text-[#5A7840]" />
          <h2 className="text-xs font-extrabold text-[#141613] uppercase tracking-wider">
            2. Tags &amp; Discovery Keywords
          </h2>
        </div>

        {/* Selected Tags Chips */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EDF7EE] border border-[#CCE8CD] text-[#1E7E34] text-xs font-medium animate-fade-in"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-black"
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
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9FA59A] text-sm font-bold">
              #
            </span>
            <input
              type="text"
              placeholder="Type tag and press Enter"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="w-full pl-8 pr-4 py-2 rounded-xl bg-white border border-[#E2DDD2] text-xs text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613]"
            />
          </div>
          <button
            type="button"
            onClick={() => handleAddTag()}
            className="px-4 py-2 rounded-xl bg-[#F5F3ED] hover:bg-[#ECE8DF] text-[#141613] text-xs font-semibold border border-[#EAE6DC] transition-colors flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Tag</span>
          </button>
        </div>

        {/* Smart Tag Suggestions */}
        {smartSuggestions.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-[#FBF9F5] border border-[#EAE6DC] space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#73796E]">
              <Sparkles className="w-3.5 h-3.5 text-[#5A7840]" />
              <span>Smart Tag Suggestions (Click to Add):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {smartSuggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleAddTag(sug)}
                  className="px-3 py-1 rounded-full bg-white hover:bg-[#EDF7EE] border border-[#EAE6DC] hover:border-[#CCE8CD] text-[#666B60] hover:text-[#1E7E34] text-xs font-medium transition-all shadow-sm"
                >
                  +#{sug}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: CONTRIBUTOR FEEDBACK */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 border-b border-[#F2EFE8] pb-3">
          <Sparkles className="w-4 h-4 text-[#5A7840]" />
          <h2 className="text-xs font-extrabold text-[#141613] uppercase tracking-wider">
            3. Contributor Perspective <span className="text-[#73796E] font-normal normal-case text-xs">(Optional)</span>
          </h2>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#141613] uppercase tracking-wider mb-1.5">
            Your Personal Review &amp; Recommendation (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Share why you're submitting this tool, what makes it standout, or your real experience using it..."
            value={contributorFeedback}
            onChange={(e) => setContributorFeedback(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E2DDD2] text-sm text-[#141613] placeholder:text-[#94998E] focus:outline-none focus:border-[#141613] transition-all resize-none"
          />
        </div>
      </div>

      {/* SECTION 4: OPTIONAL DETAILS */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowOptional(!showOptional)}
          className="w-full py-3 px-4 rounded-2xl bg-[#FBF9F5] border border-[#EAE6DC] hover:border-[#D0C9BA] flex items-center justify-between text-[#141613] font-bold text-xs transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#5A7840]" />
            <span>Optional Details (Platforms, Pros, Cons, Logo URL)</span>
          </div>
          {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showOptional && (
          <div className="p-6 mt-3 rounded-2xl bg-[#FBF9F5] border border-[#EAE6DC] space-y-6 animate-fade-in">
            {/* Platforms */}
            <div>
              <label className="block text-xs font-bold text-[#141613] uppercase tracking-wider mb-2">
                Supported Platforms &amp; APIs
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_PLATFORMS.map((p) => {
                  const isChecked = selectedPlatforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isChecked
                          ? 'bg-[#141613] border-[#141613] text-white shadow-sm'
                          : 'bg-white border-[#EAE6DC] text-[#666B60] hover:border-[#D0C9BA]'
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
                <label className="block text-xs font-bold text-[#1E7E34] uppercase tracking-wider flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5" /> Key Pros / Strengths
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Ultra-fast generation"
                    value={proInput}
                    onChange={(e) => setProInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPro())}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#E2DDD2] text-xs text-[#141613] focus:outline-none focus:border-[#1E7E34]"
                  />
                  <button
                    type="button"
                    onClick={handleAddPro}
                    className="px-3 py-1.5 rounded-xl bg-[#EDF7EE] text-[#1E7E34] border border-[#CCE8CD] text-xs font-bold hover:bg-[#DDF0DE]"
                  >
                    Add
                  </button>
                </div>
                {pros.length > 0 && (
                  <div className="space-y-1">
                    {pros.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-[#1E7E34] bg-[#EDF7EE] px-2.5 py-1 rounded-lg border border-[#CCE8CD]"
                      >
                        <span>✓ {p}</span>
                        <button
                          type="button"
                          onClick={() => setPros(pros.filter((_, i) => i !== idx))}
                          className="text-[#9FA59A] hover:text-[#D73A49]"
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
                <label className="block text-xs font-bold text-[#D73A49] uppercase tracking-wider flex items-center gap-1.5">
                  <ThumbsDown className="w-3.5 h-3.5" /> Limitations / Cons
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Limited free exports"
                    value={conInput}
                    onChange={(e) => setConInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCon())}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#E2DDD2] text-xs text-[#141613] focus:outline-none focus:border-[#D73A49]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCon}
                    className="px-3 py-1.5 rounded-xl bg-[#FDF0F2] text-[#D73A49] border border-[#F8D2D7] text-xs font-bold hover:bg-[#FBE2E5]"
                  >
                    Add
                  </button>
                </div>
                {cons.length > 0 && (
                  <div className="space-y-1">
                    {cons.map((c, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-[#D73A49] bg-[#FDF0F2] px-2.5 py-1 rounded-lg border border-[#F8D2D7]"
                      >
                        <span>✕ {c}</span>
                        <button
                          type="button"
                          onClick={() => setCons(cons.filter((_, i) => i !== idx))}
                          className="text-[#9FA59A] hover:text-[#D73A49]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-xs font-bold text-[#141613] uppercase tracking-wider mb-1.5">
                Logo URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E2DDD2] text-xs text-[#141613] focus:outline-none focus:border-[#141613]"
              />
            </div>
          </div>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-4 border-t border-[#F2EFE8] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[#73796E]">
          Submitting as <strong className="text-[#141613]">{userEmail}</strong>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-interactive w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            'Submitting to Moderation Queue...'
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Tool to Moderation</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
