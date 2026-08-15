'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  Bookmark,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Tool } from '@/lib/types';
import { toggleSaveToolAction } from '@/app/actions/userActions';
import {
  initSavedTools,
  isToolIdSaved,
  subscribeToSavedTools,
  setToolSavedState,
} from '@/lib/savedToolsStore';
import { AuthModal } from '../auth/AuthModal';

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(() => isToolIdSaved(tool.id));
  const [savedCount, setSavedCount] = useState(tool.saved_count || 0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [bookmarkAnim, setBookmarkAnim] = useState(false);

  useEffect(() => {
    initSavedTools();
    setIsSaved(isToolIdSaved(tool.id));

    const unsubscribe = subscribeToSavedTools(() => {
      setIsSaved(isToolIdSaved(tool.id));
    });
    return unsubscribe;
  }, [tool.id]);

  const handleCardClick = () => {
    router.push(`/tools/${tool.slug}`);
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    setToolSavedState(tool.id, nextSaved);
    setSavedCount((prev) => (nextSaved ? prev + 1 : Math.max(0, prev - 1)));

    // Tactile bookmark animation on save
    if (nextSaved) {
      setBookmarkAnim(true);
      setTimeout(() => setBookmarkAnim(false), 350);
    }

    const res = await toggleSaveToolAction(tool.id);
    if (!res.success) {
      setIsSaved(!nextSaved);
      setToolSavedState(tool.id, !nextSaved);
      setSavedCount((prev) => (!nextSaved ? prev + 1 : Math.max(0, prev - 1)));
      if (res.error?.includes('sign in')) {
        setIsAuthOpen(true);
      }
    } else if (res.savedCount !== undefined) {
      setSavedCount(res.savedCount);
    }
  };

  const getPricingBadge = (pricing: string) => {
    switch (pricing) {
      case 'free':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'freemium':
        return 'text-zinc-300 bg-zinc-800/80 border-zinc-700/60';
      case 'free_trial':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'paid':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'contact':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-zinc-400 bg-zinc-900 border-zinc-800';
    }
  };

  const mainCategory = tool.categories && tool.categories.length > 0 ? tool.categories[0] : null;

  return (
    <>
      {/* Clicking anywhere on the card opens the tool detail page */}
      <div
        onClick={handleCardClick}
        className="card-interactive group relative flex flex-col justify-between rounded-2xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/70 hover:border-zinc-600/80 p-5 hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.6)] cursor-pointer"
      >
        <div>
          {/* Top Row: Logo, Title, Category, Bookmark */}
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-3 min-w-0">
              {/* Logo */}
              <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700/60 overflow-hidden flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-[1.03]">
                {tool.logo_url && !imageError ? (
                  <Image
                    src={tool.logo_url}
                    alt={tool.name}
                    width={44}
                    height={44}
                    className="object-cover w-full h-full"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-zinc-200 font-bold text-sm">
                    {tool.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Title & Category */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-zinc-100 text-sm hover:text-white truncate transition-colors">
                    {tool.name}
                  </h3>
                  {tool.featured && (
                    <span className="p-0.5 rounded text-amber-400 bg-amber-400/10 shrink-0" title="Featured Tool">
                      <Sparkles className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {mainCategory && (
                  <span className="text-xs text-zinc-400 font-medium block truncate">
                    {mainCategory.name}
                  </span>
                )}
              </div>
            </div>

            {/* Bookmark Action */}
            <button
              onClick={handleToggleSave}
              className={`btn-interactive p-2 rounded-xl transition-colors shrink-0 z-10 ${
                isSaved
                  ? 'text-white bg-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 opacity-60 group-hover:opacity-100'
              }`}
              title={isSaved ? 'Saved to Favorites' : 'Save Tool'}
              aria-label="Save Tool"
            >
              <Bookmark
                className={`w-4 h-4 ${isSaved ? 'fill-current' : ''} ${bookmarkAnim ? 'bookmark-saved' : ''}`}
              />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
            {tool.description || 'No description provided.'}
          </p>

          {/* Tags Pills */}
          {tool.tags && tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {tool.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tools?tags=${tag.slug || tag.name}`}
                  onClick={(e) => e.stopPropagation()}
                  className="chip-interactive text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 z-10"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Bar: Rating, Pricing, View link */}
        <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2 mt-auto text-xs">
          <div className="flex items-center gap-2">
            {/* Rating */}
            <div className="flex items-center gap-1 text-zinc-300 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{tool.avg_rating > 0 ? tool.avg_rating.toFixed(1) : 'New'}</span>
              {tool.review_count > 0 && (
                <span className="text-zinc-500 text-[11px]">({tool.review_count})</span>
              )}
            </div>

            {/* Pricing Pill */}
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPricingBadge(
                tool.pricing
              )}`}
            >
              {tool.pricing.replace('_', ' ')}
            </span>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-0.5 text-zinc-400 group-hover:text-white font-semibold transition-colors">
            <span>Overview</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => handleToggleSave({ preventDefault: () => {}, stopPropagation: () => {} } as any)}
      />
    </>
  );
}
