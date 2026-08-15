'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Send,
  Star,
  ExternalLink,
  Bookmark,
  Search,
  SlidersHorizontal,
  X,
  RefreshCw,
  Loader2,
  HelpCircle,
  CheckCircle2,
  Info,
  Globe,
  PlusCircle,
  CheckSquare,
  Square,
  ArrowRight,
  MessageSquare,
  Layers,
  Trash2,
  ArrowLeft,
  ShieldAlert,
} from 'lucide-react';
import {
  findAiToolsAction,
  discoverWebToolsAction,
  submitWebDiscoveredToolsAction,
  FinderResponse,
  FinderRequirements,
  FinderToolMatch,
  WebDiscoveredTool,
} from '@/app/actions/finder';
import { toggleSaveToolAction } from '@/app/actions/userActions';
import {
  initSavedTools,
  isToolIdSaved,
  subscribeToSavedTools,
  setToolSavedState,
} from '@/lib/savedToolsStore';
import { AuthModal } from '@/components/auth/AuthModal';

const SAMPLE_PROMPTS = [
  'Free AI for creating presentations with slides',
  'AI code editor for pair programming and debugging',
  'AI tool for cybersecurity and penetration testing',
  'Realistic AI voice generator with API access',
  'Text to image generator for visual design and art',
  'Free AI with API access for developers',
];

interface ConversationTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  response?: FinderResponse;
  timestamp: string;
}

export function FinderClient() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [webSearching, setWebSearching] = useState(false);
  const [submittingWebTools, setSubmittingWebTools] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [activeRequirements, setActiveRequirements] = useState<FinderRequirements | null>(null);
  const [latestMatches, setLatestMatches] = useState<FinderToolMatch[]>([]);
  const [outOfScopeMessage, setOutOfScopeMessage] = useState<string | null>(null);
  const [clarificationQuestion, setClarificationQuestion] = useState<string | null>(null);
  const [clarificationOptions, setClarificationOptions] = useState<string[]>([]);
  
  // Web Discovery State
  const [discoveredTools, setDiscoveredTools] = useState<WebDiscoveredTool[]>([]);
  const [selectedWebToolIds, setSelectedWebToolIds] = useState<Record<string, boolean>>({});
  
  // Review Before Submission Modal
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [toolsInReview, setToolsInReview] = useState<WebDiscoveredTool[]>([]);

  // Auth & Saved Tools
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeToolToSave, setActiveToolToSave] = useState<string | null>(null);
  const [savedToolMap, setSavedToolMap] = useState<Record<string, boolean>>({});

  const resultsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initSavedTools();
    const updateSavedMap = () => {
      const map: Record<string, boolean> = {};
      latestMatches.forEach((m) => {
        map[m.tool.id] = isToolIdSaved(m.tool.id);
      });
      setSavedToolMap(map);
    };

    updateSavedMap();
    const unsubscribe = subscribeToSavedTools(updateSavedMap);
    return unsubscribe;
  }, [latestMatches]);

  const handleSearch = async (queryToUse?: string) => {
    const textToSubmit = queryToUse !== undefined ? queryToUse : prompt;
    if (!textToSubmit.trim() || loading) return;

    // Check if user asked for more options via chat
    const isMoreOptionsQuery =
      textToSubmit.toLowerCase().includes('more options') ||
      textToSubmit.toLowerCase().includes('search web') ||
      textToSubmit.toLowerCase().includes('search the web');

    if (isMoreOptionsQuery && activeRequirements) {
      setPrompt('');
      handleStartWebDiscovery();
      return;
    }

    const userTurn: ConversationTurn = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSubmit.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTurns((prev) => [...prev, userTurn]);
    setPrompt('');
    setLoading(true);
    setOutOfScopeMessage(null);
    setClarificationQuestion(null);
    setClarificationOptions([]);
    setDiscoveredTools([]);
    setSelectedWebToolIds({});
    setSubmissionFeedback(null);

    const res = await findAiToolsAction(textToSubmit.trim(), activeRequirements);
    setLoading(false);

    const assistantTurn: ConversationTurn = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: res.message,
      response: res,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTurns((prev) => [...prev, assistantTurn]);

    if (!res.inScope) {
      setOutOfScopeMessage(res.message);
      setLatestMatches([]);
    } else {
      setActiveRequirements(res.requirements);
      setLatestMatches(res.matches);

      if (res.needsClarification && res.clarificationQuestion) {
        setClarificationQuestion(res.clarificationQuestion);
        setClarificationOptions(res.clarificationOptions || []);
      }
    }

    setTimeout(() => {
      resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleStartWebDiscovery = async () => {
    if (!activeRequirements) return;
    setWebSearching(true);
    setSubmissionFeedback(null);

    const res = await discoverWebToolsAction(activeRequirements);
    setWebSearching(false);

    if (res.success && res.discoveredTools.length > 0) {
      setDiscoveredTools(res.discoveredTools);
      // Select all by default
      const allSelected: Record<string, boolean> = {};
      res.discoveredTools.forEach((t) => {
        allSelected[t.id] = true;
      });
      setSelectedWebToolIds(allSelected);
    } else {
      setSubmissionFeedback(res.message || 'No additional tools found on the web.');
    }

    setTimeout(() => {
      resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleToggleSelectWebTool = (id: string) => {
    setSelectedWebToolIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = () => {
    const allSelected: Record<string, boolean> = {};
    discoveredTools.forEach((t) => {
      allSelected[t.id] = true;
    });
    setSelectedWebToolIds(allSelected);
  };

  const handleClearSelection = () => {
    setSelectedWebToolIds({});
  };

  const handleOpenReview = () => {
    const selected = discoveredTools.filter((t) => selectedWebToolIds[t.id]);
    if (selected.length === 0) return;
    setToolsInReview(selected);
    setIsReviewOpen(true);
  };

  const handleRemoveFromReview = (id: string) => {
    setToolsInReview((prev) => prev.filter((t) => t.id !== id));
    setSelectedWebToolIds((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  const handleConfirmSubmission = async () => {
    if (toolsInReview.length === 0) return;

    setSubmittingWebTools(true);
    const res = await submitWebDiscoveredToolsAction(toolsInReview);
    setSubmittingWebTools(false);

    if (res.success) {
      setIsReviewOpen(false);
      setSubmissionFeedback(res.message);
      setDiscoveredTools([]);
      setSelectedWebToolIds({});
      setToolsInReview([]);
    } else if (res.requireAuth) {
      setIsAuthOpen(true);
    } else {
      alert(res.error || 'Submission failed.');
    }
  };

  const handleRemoveChip = async (chipType: 'category' | 'pricing' | 'feature' | 'platform', value: string) => {
    if (!activeRequirements) return;

    const updatedReqs: FinderRequirements = {
      ...activeRequirements,
      categories: chipType === 'category' ? activeRequirements.categories.filter((c) => c !== value) : activeRequirements.categories,
      pricing: chipType === 'pricing' ? activeRequirements.pricing.filter((p) => p !== value) : activeRequirements.pricing,
      features: chipType === 'feature' ? activeRequirements.features.filter((f) => f !== value) : activeRequirements.features,
      platforms: chipType === 'platform' ? activeRequirements.platforms.filter((p) => p !== value) : activeRequirements.platforms,
    };

    setActiveRequirements(updatedReqs);

    const syntheticPrompt = [
      ...updatedReqs.categories,
      ...updatedReqs.pricing,
      ...updatedReqs.features,
      ...updatedReqs.platforms,
      ...updatedReqs.keywords,
    ]
      .filter(Boolean)
      .join(' ');

    if (syntheticPrompt.trim()) {
      handleSearch(syntheticPrompt);
    }
  };

  const handleToggleSave = async (e: React.MouseEvent, toolId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const currentlySaved = Boolean(savedToolMap[toolId]);
    const nextSaved = !currentlySaved;

    setSavedToolMap((prev) => ({ ...prev, [toolId]: nextSaved }));
    setToolSavedState(toolId, nextSaved);

    const res = await toggleSaveToolAction(toolId);
    if (!res.success) {
      setSavedToolMap((prev) => ({ ...prev, [toolId]: currentlySaved }));
      setToolSavedState(toolId, currentlySaved);
      if (res.error?.includes('sign in')) {
        setActiveToolToSave(toolId);
        setIsAuthOpen(true);
      }
    }
  };

  const handleReset = () => {
    setTurns([]);
    setActiveRequirements(null);
    setLatestMatches([]);
    setOutOfScopeMessage(null);
    setClarificationQuestion(null);
    setClarificationOptions([]);
    setDiscoveredTools([]);
    setSelectedWebToolIds({});
    setSubmissionFeedback(null);
    setIsReviewOpen(false);
    setToolsInReview([]);
    setPrompt('');
    inputRef.current?.focus();
  };

  const selectedCandidateCount = Object.values(selectedWebToolIds).filter(Boolean).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in pb-16">
      {/* ── HEADER / INTRO ── */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>AI-Powered Tool Discovery</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-100 tracking-tight">
          Tell AILIB what you need.
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Describe your task, workflow, or requirements in plain English. AILIB Finder searches our verified catalog and provides deep web discovery.
        </p>
      </div>

      {/* ── SEARCH INPUT BOX ── */}
      <div className="relative max-w-3xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative flex items-center shadow-2xl rounded-2xl bg-zinc-900 border border-zinc-850 focus-within:border-zinc-700 transition-all p-2"
        >
          <Search className="w-5 h-5 text-zinc-500 ml-3 shrink-0 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              turns.length > 0
                ? 'Refine your requirements (e.g., Must export to PowerPoint)...'
                : 'What are you trying to accomplish? (e.g. Free AI for creating presentations)'
            }
            className="w-full px-3.5 py-2.5 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            disabled={loading || webSearching}
          />

          <button
            type="submit"
            disabled={!prompt.trim() || loading || webSearching}
            className="btn-interactive px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Search</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick starter prompts */}
        {turns.length === 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-zinc-500 text-[11px] font-medium mr-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Try asking:
            </span>
            {SAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleSearch(p)}
                className="chip-interactive px-3 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-[11px] transition-colors"
              >
                &ldquo;{p}&rdquo;
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── CLARIFICATION PROMPT & CHIPS ── */}
      {clarificationQuestion && (
        <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-zinc-900 border border-indigo-500/30 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>{clarificationQuestion}</span>
          </div>

          {clarificationOptions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {clarificationOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSearch(`AI tool for ${opt.toLowerCase()}`)}
                  className="chip-interactive px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 text-xs font-medium transition-colors"
                >
                  +{opt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── INTERPRETED REQUIREMENTS CHIPS ── */}
      {activeRequirements &&
        (activeRequirements.categories.length > 0 ||
          activeRequirements.pricing.length > 0 ||
          activeRequirements.features.length > 0 ||
          activeRequirements.platforms.length > 0) && (
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2 animate-fade-in max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" /> Interpreted Requirements:
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset Search
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {activeRequirements.categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold"
                >
                  Category: {cat}
                  <button
                    type="button"
                    onClick={() => handleRemoveChip('category', cat)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {activeRequirements.pricing.map((pr) => (
                <span
                  key={pr}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold"
                >
                  Pricing: {pr}
                  <button
                    type="button"
                    onClick={() => handleRemoveChip('pricing', pr)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {activeRequirements.features.map((feat) => (
                <span
                  key={feat}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-medium"
                >
                  Feature: {feat}
                  <button
                    type="button"
                    onClick={() => handleRemoveChip('feature', feat)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {activeRequirements.platforms.map((plat) => (
                <span
                  key={plat}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 text-xs font-medium"
                >
                  Platform: {plat}
                  <button
                    type="button"
                    onClick={() => handleRemoveChip('platform', plat)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

      {/* ── OUT OF SCOPE WARNING ── */}
      {outOfScopeMessage && (
        <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-300">Tool Discovery Guidance</p>
              <p className="leading-relaxed text-zinc-300">{outOfScopeMessage}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSearch('AI tools for cybersecurity and security testing')}
            className="btn-interactive px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold shrink-0 whitespace-nowrap"
          >
            Find Security Tools
          </button>
        </div>
      )}

      {/* ── CONVERSATION TURNS HISTORY ── */}
      {turns.length > 1 && (
        <div className="max-w-3xl mx-auto space-y-3 pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Search History &amp; Refinements:
          </span>
          <div className="space-y-2">
            {turns.slice(-4, -1).map((turn) => (
              <div
                key={turn.id}
                className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                  turn.role === 'user'
                    ? 'bg-zinc-900/90 border border-zinc-800 text-zinc-300'
                    : 'bg-zinc-950 border border-zinc-850 text-zinc-400'
                }`}
              >
                <div className="font-bold text-[10px] uppercase tracking-wider text-zinc-500 shrink-0 mt-0.5">
                  {turn.role === 'user' ? 'You:' : 'AILIB:'}
                </div>
                <div className="flex-1 leading-relaxed">{turn.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 1: AILIB MATCHES (Database Tools) ── */}
      {latestMatches.length > 0 && (
        <div className="space-y-4 pt-2 max-w-5xl mx-auto">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-lg font-black text-zinc-100 tracking-tight">AILIB Matches</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
                AILIB Library
              </span>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {latestMatches.length} verified tool{latestMatches.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestMatches.map(({ tool, matchPercentage, whyItMatches }) => {
              const isSaved = Boolean(savedToolMap[tool.id]);

              return (
                <div
                  key={tool.id}
                  onClick={() => router.push(`/tools/${tool.slug}`)}
                  className="card-interactive group relative flex flex-col justify-between rounded-2xl bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-600/80 p-5 hover:shadow-2xl cursor-pointer space-y-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/80 overflow-hidden flex items-center justify-center shrink-0">
                        {tool.logo_url ? (
                          <Image
                            src={tool.logo_url}
                            alt={tool.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-zinc-200 font-bold text-base">
                            {tool.name.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-zinc-100 text-sm hover:text-white truncate">
                            {tool.name}
                          </h3>
                          {tool.featured && (
                            <span className="p-0.5 rounded text-amber-400 bg-amber-400/10 shrink-0" title="Featured Tool">
                              <Sparkles className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="text-zinc-400 font-medium">
                            {tool.categories?.[0]?.name || 'AI Tool'}
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span className="uppercase text-[10px] font-bold px-2 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {tool.pricing}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {matchPercentage}% Match
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(e, tool.id)}
                        className={`btn-interactive p-1.5 rounded-lg transition-colors ${
                          isSaved
                            ? 'text-white bg-zinc-700'
                            : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                        title={isSaved ? 'Saved to Favorites' : 'Save Tool'}
                        aria-label="Save Tool"
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-300 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Why It Matches:
                    </div>
                    <p className="leading-relaxed text-zinc-300 text-xs">{whyItMatches}</p>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {tool.description || 'No description provided.'}
                  </p>

                  {tool.tags && tool.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tool.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-950 text-zinc-400 border border-zinc-850"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1 text-zinc-300 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{tool.avg_rating > 0 ? tool.avg_rating.toFixed(1) : '5.0'}</span>
                      <span className="text-zinc-600 text-[11px]">({tool.review_count || 0})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={tool.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="btn-interactive px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <span>Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/tools/${tool.slug}`);
                        }}
                        className="btn-interactive px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <span>View Tool</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prompt banner to explore more on the web */}
          {discoveredTools.length === 0 && !webSearching && (
            <div className="mt-6 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
              <div className="space-y-0.5 text-center sm:text-left">
                <p className="text-xs font-bold text-zinc-200">Want to see more options?</p>
                <p className="text-[11px] text-zinc-400">
                  Search across the web for additional AI tools matching your requirements.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartWebDiscovery}
                className="btn-interactive px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all shrink-0"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Search the Web</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── NO AILIB MATCHES BANNER (Option to search web) ── */}
      {turns.length > 0 && latestMatches.length === 0 && discoveredTools.length === 0 && !outOfScopeMessage && !loading && !webSearching && (
        <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-4 animate-fade-in shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-300 flex items-center justify-center mx-auto">
            <Globe className="w-6 h-6 text-indigo-400" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-zinc-100">
              I couldn&apos;t find a strong match in the AILIB library.
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Would you like me to search the web for additional AI tools matching your requirements?
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleStartWebDiscovery}
              className="btn-interactive px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Globe className="w-4 h-4" />
              <span>Search the Web</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="btn-interactive px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors"
            >
              Reset Search
            </button>
          </div>
        </div>
      )}

      {/* ── WEB SEARCHING LOADER ── */}
      {webSearching && (
        <div className="max-w-md mx-auto p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center space-y-3 animate-fade-in">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-zinc-200">Searching the web for AI tools...</p>
            <p className="text-xs text-zinc-400">Discovering authentic websites and verified pricing models.</p>
          </div>
        </div>
      )}

      {/* ── SECTION 2: MORE TOOLS FROM THE WEB ── */}
      {discoveredTools.length > 0 && (
        <div className="space-y-4 pt-4 max-w-5xl mx-auto animate-fade-in">
          {/* Section Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
              <h2 className="text-lg font-black text-zinc-100 tracking-tight">More Tools From the Web</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider">
                Web Discovery
              </span>
            </div>

            {/* Select All / Clear Selection Controls */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-400 font-medium mr-1 font-mono">
                {selectedCandidateCount} of {discoveredTools.length} selected
              </span>

              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
              >
                Select All
              </button>

              <button
                type="button"
                onClick={handleClearSelection}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Web Tool Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discoveredTools.map((tool) => {
              const isSelected = Boolean(selectedWebToolIds[tool.id]);

              return (
                <div
                  key={tool.id}
                  onClick={() => handleToggleSelectWebTool(tool.id)}
                  className={`relative flex flex-col justify-between rounded-2xl border p-5 space-y-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-900 border-indigo-500/60 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800'
                  }`}
                >
                  {/* Top-Right Checkbox & Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-zinc-100 text-sm truncate">{tool.name}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                          Web Discovery
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="text-zinc-400 font-medium">{tool.category_name}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="uppercase text-[10px] font-bold px-2 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {tool.pricing}
                        </span>
                      </div>
                    </div>

                    {/* TOP-RIGHT CHECKBOX */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelectWebTool(tool.id);
                      }}
                      className={`p-1.5 rounded-lg border transition-all shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                      }`}
                      title={isSelected ? 'Deselect Tool' : 'Select for Submission'}
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{tool.description}</p>

                  {/* Why it matches callout */}
                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-850 text-xs text-zinc-300 space-y-0.5">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                      Why It Matches:
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">{tool.why_it_matches}</p>
                  </div>

                  {/* Tags */}
                  {tool.suggested_tags && tool.suggested_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tool.suggested_tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-950 text-zinc-400 border border-zinc-850"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Bar: Visit Website */}
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                    <a
                      href={tool.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="btn-interactive px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <span className="text-[11px] text-zinc-500 font-mono truncate max-w-[180px]">
                      {tool.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submission Action Bar */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-center sm:text-left">
              <p className="text-sm font-bold text-zinc-100">
                {selectedCandidateCount} tool{selectedCandidateCount !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-zinc-400">
                Selected tools will be reviewed before submission for authorization.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenReview}
              disabled={selectedCandidateCount === 0}
              className="btn-interactive px-6 py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>
                {selectedCandidateCount > 0
                  ? `Submit ${selectedCandidateCount} Tool${selectedCandidateCount !== 1 ? 's' : ''} to AILIB`
                  : 'Submit Selected Tools to AILIB'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── SUBMISSION FEEDBACK ALERT ── */}
      {submissionFeedback && (
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="leading-relaxed">{submissionFeedback}</p>
          </div>
          <Link
            href="/dashboard/submissions"
            className="btn-interactive px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold whitespace-nowrap"
          >
            My Submissions
          </Link>
        </div>
      )}

      {/* ── REVIEW BEFORE SUBMISSION MODAL ── */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-zinc-100 tracking-tight">Review Your Submission</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Verify tool details before submitting for moderation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Selected Tools List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 divide-y divide-zinc-800/80">
              {toolsInReview.map((tool) => (
                <div key={tool.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-100">{tool.name}</h4>
                      <a
                        href={tool.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span>{tool.website_url}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFromReview(tool.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove from submission"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">{tool.description}</p>

                  <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px] font-semibold">
                      {tool.category_name}
                    </span>
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {tool.pricing}
                    </span>
                    {tool.suggested_tags?.map((t) => (
                      <span key={t} className="text-[10px] text-zinc-500">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {toolsInReview.length === 0 && (
                <div className="text-center py-8 text-xs text-zinc-500">
                  No tools currently selected for review.
                </div>
              )}
            </div>

            {/* Modal Disclaimer & Action Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-950/60 space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <p className="leading-relaxed">
                  These tools will be submitted for authorization. They will not appear in the public AILIB library until approved.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(false)}
                  className="btn-interactive px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors"
                >
                  Go Back
                </button>

                <button
                  type="button"
                  onClick={handleConfirmSubmission}
                  disabled={toolsInReview.length === 0 || submittingWebTools}
                  className="btn-interactive px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 transition-all shadow-lg"
                >
                  {submittingWebTools ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Submit for Authorization</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={resultsEndRef} />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          if (activeToolToSave) {
            handleToggleSave({ preventDefault: () => {}, stopPropagation: () => {} } as any, activeToolToSave);
          }
        }}
      />
    </div>
  );
}
