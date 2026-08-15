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
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  X,
  RefreshCw,
  Loader2,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Info,
  Layers,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import {
  findAiToolsAction,
  FinderResponse,
  FinderRequirements,
  FinderToolMatch,
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
  'Realistic AI voice generator for YouTube voiceovers',
  'Text to image generator for visual design and art',
  'AI tool for SEO content optimization and research',
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
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [activeRequirements, setActiveRequirements] = useState<FinderRequirements | null>(null);
  const [latestMatches, setLatestMatches] = useState<FinderToolMatch[]>([]);
  const [outOfScopeMessage, setOutOfScopeMessage] = useState<string | null>(null);
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
    }

    // Smooth scroll down to results
    setTimeout(() => {
      resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const handleRemoveChip = async (chipType: 'category' | 'pricing' | 'feature' | 'platform', value: string) => {
    if (!activeRequirements) return;

    const updatedReqs: FinderRequirements = {
      ...activeRequirements,
      category: chipType === 'category' ? null : activeRequirements.category,
      pricing: chipType === 'pricing' ? null : activeRequirements.pricing,
      features: chipType === 'feature' ? activeRequirements.features.filter((f) => f !== value) : activeRequirements.features,
      platforms: chipType === 'platform' ? activeRequirements.platforms.filter((p) => p !== value) : activeRequirements.platforms,
    };

    setActiveRequirements(updatedReqs);

    // Re-run search with modified requirement keywords
    const syntheticPrompt = [
      updatedReqs.category ? `Category ${updatedReqs.category}` : '',
      updatedReqs.pricing ? `${updatedReqs.pricing} pricing` : '',
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
    setPrompt('');
    inputRef.current?.focus();
  };

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
          Describe your task, workflow, or requirements in plain English. AILIB Finder matches and ranks verified AI tools from our database.
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
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!prompt.trim() || loading}
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

        {/* Quick starter prompts (shown when conversation is fresh) */}
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

      {/* ── INTERPRETED REQUIREMENTS CHIPS ── */}
      {activeRequirements && (activeRequirements.category || activeRequirements.pricing || activeRequirements.features.length > 0 || activeRequirements.platforms.length > 0) && (
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
            {activeRequirements.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
                Category: {activeRequirements.category}
                <button
                  type="button"
                  onClick={() => handleRemoveChip('category', activeRequirements.category!)}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeRequirements.pricing && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold">
                Pricing: {activeRequirements.pricing}
                <button
                  type="button"
                  onClick={() => handleRemoveChip('pricing', activeRequirements.pricing!)}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

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
        <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start gap-3 animate-fade-in">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">Out-of-Scope Query</p>
            <p className="leading-relaxed">{outOfScopeMessage}</p>
          </div>
        </div>
      )}

      {/* ── CONVERSATION TURNS HISTORY (If refining) ── */}
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

      {/* ── RESULTS RECOMMENDATION CARDS ── */}
      {latestMatches.length > 0 && (
        <div className="space-y-4 pt-2 max-w-5xl mx-auto">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-base font-bold text-zinc-100">Top Recommended AI Tools</h2>
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {latestMatches.length} verified match{latestMatches.length !== 1 ? 'es' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestMatches.map(({ tool, matchPercentage, whyItMatches, matchedCriteria }) => {
              const isSaved = Boolean(savedToolMap[tool.id]);

              return (
                <div
                  key={tool.id}
                  onClick={() => router.push(`/tools/${tool.slug}`)}
                  className="card-interactive group relative flex flex-col justify-between rounded-2xl bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-600/80 p-5 hover:shadow-2xl cursor-pointer space-y-4 transition-all"
                >
                  {/* Top Header: Logo, Name, Match Score, Bookmark */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Logo */}
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

                      {/* Title & Pricing */}
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

                    {/* Match Score Badge & Bookmark */}
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

                  {/* Why it matches callout */}
                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-300 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Why It Matches:
                    </div>
                    <p className="leading-relaxed text-zinc-300 text-xs">{whyItMatches}</p>
                  </div>

                  {/* Tool Description */}
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {tool.description || 'No description provided.'}
                  </p>

                  {/* Tags */}
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

                  {/* Footer Bar: Rating & CTAs */}
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
        </div>
      )}

      {/* ── EMPTY STATE WHEN NO RESULTS FOUND ── */}
      {turns.length > 0 && latestMatches.length === 0 && !outOfScopeMessage && !loading && (
        <div className="text-center p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 max-w-lg mx-auto space-y-4 animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-100">No strong matches found in library</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We couldn&apos;t find an approved tool matching all your exact constraints. Try broadening your criteria or search for related capabilities.
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="btn-interactive px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
            >
              Reset Requirements
            </button>
            <Link
              href="/tools"
              className="btn-interactive px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold"
            >
              Browse Full Directory
            </Link>
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
