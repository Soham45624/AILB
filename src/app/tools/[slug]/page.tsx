import { notFound } from 'next/navigation';
import Link from 'next/link';
import { WriteReviewButton } from '@/components/tools/WriteReviewButton';
import Image from 'next/image';
import { getToolBySlug, getTools } from '@/lib/data';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToolCard } from '@/components/tools/ToolCard';
import {
  Star,
  ExternalLink,
  Bookmark,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Tag as TagIcon,
  MessageSquare,
  Globe,
  Share2,
} from 'lucide-react';

interface ToolDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ToolDetailPageProps) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return { title: 'Tool Not Found' };
  return {
    title: `${tool.name} - AI Tool Overview & Reviews`,
    description: tool.description || `Discover ${tool.name} on the AI Tool Discovery Platform.`,
  };
}

export default async function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  // Fetch related tools in same category
  const mainCatSlug = tool.categories?.[0]?.slug;
  const relatedTools = mainCatSlug
    ? (await getTools({ categorySlug: mainCatSlug, limit: 4 })).filter((t) => t.id !== tool.id)
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Back Link */}
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {/* HERO / OVERVIEW HEADER */}
        <div className="relative rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-2xl space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border border-slate-700/80 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                {tool.logo_url ? (
                  <Image
                    src={tool.logo_url}
                    alt={tool.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-cyan-400 font-bold text-2xl">
                    {tool.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                    {tool.name}
                  </h1>
                  {tool.featured && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {tool.pricing}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-200 text-sm">
                      {tool.avg_rating > 0 ? tool.avg_rating.toFixed(1) : 'New'}
                    </span>
                    <span>({tool.review_count} reviews)</span>
                  </div>

                  {tool.categories && tool.categories.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-slate-300 font-medium">{tool.categories[0].name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-2"
              >
                Visit Website
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Description & Metadata */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">About {tool.name}</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {tool.long_description || tool.description || 'No detailed description available.'}
            </p>

            {/* Tags */}
            {tool.tags && tool.tags.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1.5"
                  >
                    <TagIcon className="w-3 h-3 text-cyan-400" />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">User Reviews & Ratings</h3>
                <p className="text-xs text-slate-400">Community evaluations and feedback</p>
              </div>
            </div>

            <WriteReviewButton />
          </div>

          {tool.review_count === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm text-slate-400">No community reviews have been posted for {tool.name} yet.</p>
              <p className="text-xs text-slate-500">Be the first to share your experience with this tool!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Review card placeholder */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center">
                      JD
                    </div>
                    <span className="text-xs font-bold text-slate-200">John Doe</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-xs font-bold">5.0</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300">
                  Exceptional AI tool! Saved me hours of manual labor in my weekly content workflow.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RELATED TOOLS */}
        {relatedTools.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-100">Similar AI Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 3).map((relTool) => (
                <ToolCard key={relTool.id} tool={relTool} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
