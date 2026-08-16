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
  Check,
  CheckSquare,
  Square,
  ArrowRight,
  MessageSquare,
  Trash2,
  Clock,
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

function getBrandPalette(name: string): { bg: string; text: string } {
  const n = (name || '').toLowerCase();
  if (n.includes('midjourney')) return { bg: '#2B3A4A', text: '#FFFFFF' };
  if (n.includes('cursor')) return { bg: '#0D1929', text: '#FFFFFF' };
  if (n.includes('perplexity')) return { bg: '#1D6D78', text: '#FFFFFF' };
  if (n.includes('notion')) return { bg: '#191919', text: '#FFFFFF' };
  if (n.includes('claude')) return { bg: '#855C3A', text: '#FFFFFF' };
  if (n.includes('kling')) return { bg: '#A61749', text: '#FFFFFF' };
  if (n.includes('github') || n.includes('copilot')) return { bg: '#1C2530', text: '#FFFFFF' };
  if (n.includes('runway')) return { bg: '#22252A', text: '#FFFFFF' };
  if (n.includes('gamma')) return { bg: '#6E3CE6', text: '#FFFFFF' };
  if (n.includes('eleven')) return { bg: '#E64A19', text: '#FFFFFF' };
  if (n.includes('chatgpt') || n.includes('openai')) return { bg: '#10A37F', text: '#FFFFFF' };
  if (n.includes('suno')) return { bg: '#1E1E1E', text: '#FFFFFF' };

  const colors = [
    { bg: '#141A29', text: '#FFFFFF' },
    { bg: '#2A4365', text: '#FFFFFF' },
    { bg: '#1D6D78', text: '#FFFFFF' },
    { bg: '#2D3748', text: '#FFFFFF' },
    { bg: '#6B46C1', text: '#FFFFFF' },
    { bg: '#855C3A', text: '#FFFFFF' },
    { bg: '#319795', text: '#FFFFFF' },
    { bg: '#C53030', text: '#FFFFFF' },
    { bg: '#5A7840', text: '#FFFFFF' },
    { bg: '#D97706', text: '#FFFFFF' },
  ];
  let hash = 0;
  for (let i = 0; i < n.length; i++) {
    hash = (hash + n.charCodeAt(i)) % colors.length;
  }
  return colors[hash];
}

function getInitials(name: string): string {
  if (!name) return 'AI';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF7EE] border border-[#CCE8CD] text-xs font-semibold text-[#1E7E34]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Tool Discovery</span>
        </div>
        <h1 className="font-serif-heading text-3xl sm:text-5xl font-normal text-[#141613] tracking-tight">
          Tell AILIB what you need.
        </h1>
        <p className="text-xs sm:text-sm text-[#666B60] max-w-xl mx-auto leading-relaxed">
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
          className="relative flex items-center shadow-lg rounded-full bg-white border border-[#E2DDD2] p-2 hover:border-[#D0C9BA] transition-all"
        >
          <Search className="w-5 h-5 text-[#9FA59A] ml-3.5 shrink-0 pointer-events-none" />
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
            className="w-full px-3.5 py-2.5 bg-transparent text-xs sm:text-sm text-[#141613] placeholder:text-[#94998E] focus:outline-none"
            disabled={loading || webSearching}
          />

          <button
            type="submit"
            disabled={!prompt.trim() || loading || webSearching}
            className="btn-interactive px-5 py-2.5 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs flex items-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
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
            <span className="text-[#73796E] text-[11px] font-medium mr-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Try asking:
            </span>
            {SAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleSearch(p)}
                className="chip-interactive px-3 py-1 rounded-full bg-white hover:bg-[#F5F3ED] text-[#666B60] hover:text-[#141613] border border-[#EAE6DC] text-[11px] transition-colors shadow-sm"
              >
                &ldquo;{p}&rdquo;
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── CLARIFICATION PROMPT & CHIPS ── */}
      {clarificationQuestion && (
        <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-white border border-[#DDD2F5] shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#5C42A6]">
            <MessageSquare className="w-4 h-4" />
            <span>{clarificationQuestion}</span>
          </div>

          {clarificationOptions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {clarificationOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSearch(`AI tool for ${opt.toLowerCase()}`)}
                  className="chip-interactive px-3 py-1.5 rounded-full bg-[#F3EFFB] hover:bg-[#EAE2F7] text-[#5C42A6] border border-[#DDD2F5] text-xs font-semibold transition-colors"
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
          <div className="p-4 rounded-2xl bg-white border border-[#EAE6DC] space-y-2 animate-fade-in max-w-3xl mx-auto shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#73796E] uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Interpreted Requirements:
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-[#73796E] hover:text-[#141613] transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset Search
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {activeRequirements.categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EDF7EE] text-[#1E7E34] border border-[#CCE8CD] text-xs font-semibold"
                >
                  Category: {cat}
                  <button
                    type="button"
                    onClick={() => handleRemoveChip('category', cat)}
                    className="hover:text-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {activeRequirements.pricing.map((pr) => (
                <span
                  key={pr}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF3E6] text-[#6B5020] border border-[#F0E2C8] text-xs font-semibold"
                >
                  Pricing: {pr}
                  <button
                    type="button"
                    onClick={() => handleRemoveChip('pricing', pr)}
                    className="hover:text-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {activeRequirements.features.map((feat) => (
                <span
                  key={feat}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5F3ED] text-[#666B60] border border-[#EAE6DC] text-xs font-medium"
                >
                  Feature: {feat}
                  <button
                    type="button"
                    onClick={() => handleRemoveChip('feature', feat)}
                    className="hover:text-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {activeRequirements.platforms.map((plat) => (
                <span
                  key={plat}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EEF5FD] text-[#0366D6] border border-[#CDE0F9] text-xs font-medium"
                >
                  Platform: {plat}
                  <button
                    type="button"
                    onClick={() => handleRemoveChip('platform', plat)}
                    className="hover:text-black"
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
        <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-[#FEF6E9] border border-[#F9DEC2] text-[#8C4E05] text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#C66100] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-[#8C4E05]">Tool Discovery Guidance</p>
              <p className="leading-relaxed text-[#666B60]">{outOfScopeMessage}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleSearch('AI tools for cybersecurity and security testing')}
            className="btn-interactive px-3.5 py-2 rounded-full bg-[#141613] text-white text-xs font-semibold shrink-0 whitespace-nowrap"
          >
            Find Security Tools
          </button>
        </div>
      )}

      {/* ── CONVERSATION TURNS HISTORY ── */}
      {turns.length > 1 && (
        <div className="max-w-3xl mx-auto space-y-3 pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#73796E]">
            Search History &amp; Refinements:
          </span>
          <div className="space-y-2">
            {turns.slice(-4, -1).map((turn) => (
              <div
                key={turn.id}
                className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                  turn.role === 'user'
                    ? 'bg-white border border-[#EAE6DC] text-[#141613] shadow-sm'
                    : 'bg-[#F7F4EC] border border-[#EAE6DC] text-[#666B60]'
                }`}
              >
                <div className="font-bold text-[10px] uppercase tracking-wider text-[#73796E] shrink-0 mt-0.5">
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
          <div className="flex items-center justify-between border-b border-[#EAE6DC] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5A7840] animate-pulse" />
              <h2 className="text-lg font-bold text-[#141613] tracking-tight">AILIB Matches</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EDF7EE] text-[#1E7E34] border border-[#CCE8CD] text-[10px] font-extrabold uppercase tracking-wider">
                AILIB Library
              </span>
            </div>
            <span className="text-xs text-[#73796E]">
              {latestMatches.length} verified tool{latestMatches.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestMatches.map(({ tool, matchPercentage, whyItMatches }) => {
              const isSaved = Boolean(savedToolMap[tool.id]);
              const brand = getBrandPalette(tool.name);
              const initials = getInitials(tool.name);

              return (
                <div
                  key={tool.id}
                  onClick={() => router.push(`/tools/${tool.slug}`)}
                  className="card-interactive group relative flex flex-col justify-between rounded-2xl bg-white border border-[#EAE6DC] p-5 hover:border-[#D0C9BA] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] cursor-pointer space-y-4 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        style={{ backgroundColor: brand.bg, color: brand.text }}
                        className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center font-bold text-sm shrink-0 shadow-sm"
                      >
                        {tool.logo_url ? (
                          <Image
                            src={tool.logo_url}
                            alt={tool.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-[#141613] text-sm group-hover:text-black truncate">
                            {tool.name}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-xs">
                          <span className="text-[#666B60] font-medium">
                            {tool.categories?.[0]?.name || 'AI Tool'}
                          </span>
                          <span className="text-[#DDD7CB]">•</span>
                          <span className="uppercase text-[10px] font-bold px-2 py-0.2 rounded bg-[#F5F3ED] text-[#666B60]">
                            {tool.pricing}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#EDF7EE] text-[#1E7E34] border border-[#CCE8CD] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {matchPercentage}% Match
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(e, tool.id)}
                        className={`p-1.5 rounded-full transition-colors ${
                          isSaved
                            ? 'text-[#141613] bg-[#ECE8DF]'
                            : 'text-[#9FA59A] hover:text-[#141613] hover:bg-[#F5F3ED]'
                        }`}
                        title={isSaved ? 'Saved to Library' : 'Save Tool'}
                        aria-label="Save Tool"
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FBF9F5] border border-[#EAE6DC] text-xs text-[#141613] space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#1E7E34] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Why It Matches:
                    </div>
                    <p className="leading-relaxed text-[#666B60] text-xs">{whyItMatches}</p>
                  </div>

                  <p className="text-xs text-[#666B60] line-clamp-2 leading-relaxed">
                    {tool.description || 'No description provided.'}
                  </p>

                  <div className="pt-3 border-t border-[#F2EFE8] flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1 text-[#141613] font-bold">
                      <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
                      <span>{tool.avg_rating > 0 ? tool.avg_rating.toFixed(1) : '4.5'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={tool.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-full bg-[#F5F3ED] hover:bg-[#ECE8DF] border border-[#EAE6DC] text-[#141613] text-xs font-semibold transition-colors flex items-center gap-1"
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
                        className="btn-interactive px-3.5 py-1.5 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white text-xs font-bold transition-colors flex items-center gap-1"
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
            <div className="mt-6 p-5 rounded-2xl bg-white border border-[#EAE6DC] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm animate-fade-in">
              <div className="space-y-0.5 text-center sm:text-left">
                <p className="text-xs font-bold text-[#141613]">Want to see more options?</p>
                <p className="text-[11px] text-[#666B60]">
                  Search across the web for additional AI tools matching your requirements.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartWebDiscovery}
                className="btn-interactive px-4 py-2 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all shrink-0"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Search the Web</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── WEB SEARCHING LOADER ── */}
      {webSearching && (
        <div className="max-w-md mx-auto p-8 rounded-2xl bg-white border border-[#EAE6DC] text-center space-y-3 shadow-sm animate-fade-in">
          <Loader2 className="w-8 h-8 animate-spin text-[#5A7840] mx-auto" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-[#141613]">Searching the web for AI tools...</p>
            <p className="text-xs text-[#73796E]">Discovering authentic websites and verified pricing models.</p>
          </div>
        </div>
      )}

      {/* ── SECTION 2: MORE TOOLS FROM THE WEB ── */}
      {discoveredTools.length > 0 && (
        <div className="space-y-4 pt-4 max-w-5xl mx-auto animate-fade-in">
          {/* Section Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EAE6DC] pb-3 gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0366D6] animate-pulse" />
              <h2 className="text-lg font-bold text-[#141613] tracking-tight">More Tools From the Web</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EEF5FD] text-[#0366D6] border border-[#CDE0F9] text-[10px] font-bold uppercase tracking-wider">
                Web Discovery
              </span>
            </div>

            {/* Select All / Clear Selection Controls */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#73796E] font-medium mr-1">
                {selectedCandidateCount} of {discoveredTools.length} selected
              </span>

              <button
                type="button"
                onClick={handleSelectAll}
                className="px-3 py-1 rounded-full bg-white border border-[#EAE6DC] hover:bg-[#F5F3ED] text-[#141613] text-xs font-semibold transition-colors"
              >
                Select All
              </button>

              <button
                type="button"
                onClick={handleClearSelection}
                className="px-3 py-1 rounded-full bg-white border border-[#EAE6DC] hover:bg-[#F5F3ED] text-[#73796E] hover:text-[#141613] text-xs font-semibold transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Web Tool Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {discoveredTools.map((tool) => {
              const isSelected = Boolean(selectedWebToolIds[tool.id]);
              const webBrand = getBrandPalette(tool.name);
              const isPublished = Boolean(tool.is_in_library);
              const isPending = Boolean(tool.is_pending);
              const isBlocked = isPublished || isPending; // not selectable

              // Pick accent colour based on state
              const accentColor = isPublished ? '#1E7E34' : isPending ? '#B45309' : webBrand.bg;

              return (
                <div
                  key={tool.id}
                  onClick={() => !isBlocked && handleToggleSelectWebTool(tool.id)}
                  className={`relative flex flex-col justify-between rounded-2xl border overflow-hidden p-5 space-y-4 transition-all duration-200 ${
                    isPublished
                      ? 'bg-[#F7F9F7] border-[#C8E6C9] cursor-default'
                      : isPending
                      ? 'bg-[#FFFBF0] border-[#FCD34D] cursor-default'
                      : isSelected
                      ? 'bg-[#FAFCF9] border-[#A3D1A9] shadow-[0_12px_40px_rgba(0,0,0,0.09)] -translate-y-1 cursor-pointer'
                      : 'bg-white hover:border-[#D0C9BA] border-[#EAE6DC] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 cursor-pointer'
                  }`}
                >
                  {/* ── TOP ACCENT BAR ── */}
                  <div
                    style={{ backgroundColor: accentColor }}
                    className={`absolute inset-x-0 top-0 h-[3.5px] transition-opacity duration-200 ${isSelected || isBlocked ? 'opacity-100' : 'opacity-0'}`}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#141613] text-sm truncate">{tool.name}</h3>
                        {isPublished ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF7EE] text-[#1E7E34] border border-[#CCE8CD] shrink-0">
                            In AILIB
                          </span>
                        ) : isPending ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#B45309] border border-[#FCD34D] shrink-0">
                            Under Review
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF5FD] text-[#0366D6] border border-[#CDE0F9] shrink-0">
                            Web
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="text-[#666B60] font-medium">{tool.category_name}</span>
                        <span className="text-[#DDD7CB]">•</span>
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F3ED] text-[#666B60]">
                          {tool.pricing}
                        </span>
                      </div>
                    </div>

                    {/* TOP-RIGHT: status icon OR checkbox */}
                    {isPublished ? (
                      <div className="w-6 h-6 rounded-lg bg-[#1E7E34] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : isPending ? (
                      <div className="w-6 h-6 rounded-lg bg-[#FEF3C7] border border-[#FCD34D] text-[#B45309] flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelectWebTool(tool.id);
                        }}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                          isSelected
                            ? 'bg-[#1E7E34] text-white border-[#1E7E34] shadow-sm'
                            : 'bg-white text-transparent border-[#D0C9BA] hover:border-[#141613]'
                        }`}
                        title={isSelected ? 'Deselect Tool' : 'Select for Submission'}
                      >
                        <Check className={`w-3.5 h-3.5 stroke-[3] transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                      </button>
                    )}
                  </div>

                  {/* Status notice OR description */}
                  {isPublished ? (
                    <div className="p-3 rounded-xl bg-[#EDF7EE] border border-[#CCE8CD] flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#1E7E34] shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-[#1E7E34]">Already published in AILIB</p>
                        <p className="text-[11px] text-[#3D7A43] leading-relaxed">
                          This tool is live in our library. You can view it, save it, and leave a review.
                        </p>
                      </div>
                    </div>
                  ) : isPending ? (
                    <div className="p-3 rounded-xl bg-[#FEF3C7] border border-[#FCD34D] flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-[#92400E]">Already in the submission queue</p>
                        <p className="text-[11px] text-[#B45309] leading-relaxed">
                          This tool has already been submitted and is pending review by our team. No action needed!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#666B60] leading-relaxed line-clamp-3">{tool.description}</p>
                  )}

                  {!isBlocked && (
                    <div className="p-3 rounded-xl bg-[#FBF9F5] border border-[#EAE6DC] text-xs text-[#141613] space-y-0.5">
                      <span className="text-[10px] font-bold text-[#0366D6] uppercase tracking-wider block">
                        Why It Matches:
                      </span>
                      <p className="text-xs text-[#666B60] leading-relaxed">{tool.why_it_matches}</p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#F2EFE8] flex items-center justify-between text-xs">
                    {isPublished && tool.library_slug ? (
                      <Link
                        href={`/tools/${tool.library_slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-full bg-[#EDF7EE] hover:bg-[#DCF1DE] border border-[#CCE8CD] text-[#1E7E34] text-xs font-semibold flex items-center gap-1.5"
                      >
                        <span>View in AILIB</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      <a
                        href={tool.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-full bg-[#F5F3ED] hover:bg-[#ECE8DF] border border-[#EAE6DC] text-[#141613] text-xs font-semibold flex items-center gap-1.5"
                      >
                        <span>Visit Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <span className="text-[11px] text-[#94998E] truncate max-w-[180px]">
                      {tool.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </span>
                  </div>
                </div>
              );
            })}

          </div>

          {/* Submission Action Bar */}
          <div className="p-5 rounded-2xl bg-white border border-[#EAE6DC] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-center sm:text-left">
              <p className="text-sm font-bold text-[#141613]">
                {selectedCandidateCount} tool{selectedCandidateCount !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-[#73796E]">
                Selected tools will be reviewed before submission for authorization.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenReview}
              disabled={selectedCandidateCount === 0}
              className="btn-interactive px-6 py-3 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all"
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
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-[#EDF7EE] border border-[#CCE8CD] text-[#1E7E34] text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#1E7E34] shrink-0" />
            <p className="leading-relaxed font-medium">{submissionFeedback}</p>
          </div>
          <Link
            href="/dashboard/submissions"
            className="px-3 py-1.5 rounded-full bg-white border border-[#CCE8CD] text-[#1E7E34] text-xs font-bold whitespace-nowrap shadow-sm hover:bg-[#F4FAF4]"
          >
            My Submissions
          </Link>
        </div>
      )}

      {/* ── REVIEW BEFORE SUBMISSION MODAL ── */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-50 bg-[#141613]/25 backdrop-blur-[6px] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-[#EAE6DC] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[0_24px_80px_rgba(20,22,19,0.12)] overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#EAE6DC] bg-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#141613]">Review Your Submission</h3>
                <p className="text-xs text-[#73796E] mt-0.5">
                  Verify tool details before submitting for moderation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="p-2 rounded-full hover:bg-[#F5F3ED] text-[#73796E] hover:text-[#141613] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 divide-y divide-[#EAE6DC]">
              {toolsInReview.map((tool) => (
                <div key={tool.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-[#141613]">{tool.name}</h4>
                      <a
                        href={tool.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#0366D6] hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <span>{tool.website_url}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFromReview(tool.id)}
                      className="p-1.5 rounded-full text-[#D73A49] hover:bg-[#FDF0F2] transition-colors"
                      title="Remove from submission"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-[#666B60] leading-relaxed">{tool.description}</p>

                  <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                    <span className="px-2 py-0.5 rounded-full bg-[#F5F3ED] text-[#666B60] text-[11px] font-semibold">
                      {tool.category_name}
                    </span>
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F3ED] text-[#666B60]">
                      {tool.pricing}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#EAE6DC] bg-white space-y-4">
              <div className="p-3 rounded-xl bg-[#FEF6E9] border border-[#F9DEC2] text-xs text-[#8C4E05] flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#C66100]" />
                <p className="leading-relaxed">
                  These tools will be submitted for authorization. They will appear in the library once approved.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(false)}
                  className="px-4 py-2.5 rounded-full bg-[#F5F3ED] hover:bg-[#ECE8DF] text-[#141613] font-semibold text-xs transition-colors"
                >
                  Go Back
                </button>

                <button
                  type="button"
                  onClick={handleConfirmSubmission}
                  disabled={toolsInReview.length === 0 || submittingWebTools}
                  className="btn-interactive px-6 py-2.5 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 shadow-md"
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
