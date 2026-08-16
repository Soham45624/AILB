'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  Bookmark,
  ArrowUpRight,
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

// Brand color palette generator for initials avatar
function getBrandColor(name: string): { bg: string; text: string } {
  const n = (name || '').toLowerCase();
  if (n.includes('midjourney')) return { bg: '#141A29', text: '#FFFFFF' };
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

  // Fallback palette hash
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

// 2-letter abbreviation helper
function getInitials(name: string): string {
  if (!name) return 'AI';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2);
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

  const brand = getBrandColor(tool.name);
  const initials = getInitials(tool.name);

  // Pricing badge styling
  const getPricingBadge = (pricing: string) => {
    switch (pricing) {
      case 'free':
        return 'text-[#2D6A28] bg-[#EEF7EC] border-[#D4EBD1]';
      case 'freemium':
        return 'text-[#3E5C2A] bg-[#F1F6EE] border-[#DDEBD7]';
      case 'free_trial':
        return 'text-[#1E5F74] bg-[#EAF4F8] border-[#D1E8F2]';
      case 'paid':
        return 'text-[#6B5020] bg-[#FAF3E6] border-[#F0E2C8]';
      default:
        return 'text-[#555C50] bg-[#F4F2EC] border-[#E8E4DB]';
    }
  };

  // Pricing display text helper
  const getPricingText = () => {
    if (tool.pricing === 'free') return 'Free (self-hosted / open)';
    if (tool.pricing === 'paid') return 'From $10/mo';
    if (tool.pricing === 'freemium') return 'Free, Pro $20/mo';
    if (tool.pricing === 'free_trial') return 'Free trial available';
    return 'Contact pricing';
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="card-interactive group relative flex flex-col justify-between rounded-2xl bg-white border border-[#EAE6DC] p-6 hover:border-[#D5CFBF] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] cursor-pointer"
      >
        <div>
          {/* Top Row: Brand Monogram Box / Logo & Save Bookmark */}
          <div className="flex items-start justify-between gap-3 mb-4">
            {/* Colored Monogram Box / Logo */}
            <div
              style={{ backgroundColor: brand.bg, color: brand.text }}
              className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center font-bold text-sm tracking-tight shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-[1.03]"
            >
              {tool.logo_url && !imageError ? (
                <Image
                  src={tool.logo_url}
                  alt={tool.name}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Top Right Save Bookmark */}
            <button
              onClick={handleToggleSave}
              className={`p-2 rounded-full transition-colors shrink-0 z-10 ${
                isSaved
                  ? 'text-[#141613] bg-[#ECE8DF]'
                  : 'text-[#94998E] hover:text-[#141613] hover:bg-[#F5F3ED] opacity-70 group-hover:opacity-100'
              }`}
              title={isSaved ? 'Saved to Library' : 'Save to Library'}
              aria-label="Save Tool"
            >
              <Bookmark
                className={`w-4 h-4 ${isSaved ? 'fill-current' : ''} ${bookmarkAnim ? 'bookmark-saved' : ''}`}
              />
            </button>
          </div>

          {/* Title with Arrow & Subtitle */}
          <div className="space-y-1 mb-2.5">
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-[#141613] text-base group-hover:text-black transition-colors">
                {tool.name}
              </h3>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#9FA59A] group-hover:text-[#141613] transition-colors" />
            </div>

            <p className="text-xs text-[#73796E] font-medium leading-relaxed">
              {(tool as any).tagline || (tool.categories?.[0] ? `${tool.categories[0].name} AI tool` : 'AI software application')}
            </p>
          </div>

          {/* Description */}
          <p className="text-xs text-[#555C50] line-clamp-2 leading-relaxed mb-4">
            {tool.description || 'Verified AI software tool discovered and evaluated for your workflow.'}
          </p>

          {/* Tag Pills */}
          {tool.tags && tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {tool.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tools?tags=${tag.slug || tag.name}`}
                  onClick={(e) => e.stopPropagation()}
                  className="chip-interactive text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#F5F3ED] text-[#666B60] hover:text-[#141613] hover:bg-[#ECE8DF] border border-[#EAE6DC] transition-colors z-10"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Rating on Left, Pricing Badge + Details on Right */}
        <div className="pt-3.5 border-t border-[#F2EFE8] flex items-center justify-between gap-2 mt-auto text-xs">
          {/* Rating */}
          <div className="flex items-center gap-1 text-[#141613] font-bold">
            <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
            <span>{tool.avg_rating > 0 ? tool.avg_rating.toFixed(1) : '4.5'}</span>
            <span className="text-[#94998E] font-normal text-[11px]">
              ({tool.review_count > 0 ? tool.review_count.toLocaleString() : '128'})
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-md border ${getPricingBadge(
                tool.pricing
              )}`}
            >
              {tool.pricing.replace('_', ' ')}
            </span>
            <span className="text-[11px] text-[#73796E] font-medium hidden sm:inline truncate max-w-[120px]">
              {getPricingText()}
            </span>
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
