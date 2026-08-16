import { notFound } from 'next/navigation';
import Link from 'next/link';
import { WriteReviewButton } from '@/components/tools/WriteReviewButton';
import { ReportButton } from '@/components/tools/ReportModal';
import Image from 'next/image';
import { getToolBySlug, getTools } from '@/lib/data';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToolCard } from '@/components/tools/ToolCard';
import { baseUrl } from '@/lib/config';
import {
  Star,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  Tag as TagIcon,
  MessageSquare,
  HeartHandshake,
  ThumbsUp,
  ThumbsDown,
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
    title: `${tool.name} — AI Tool Review & Pricing`,
    description: tool.description || `Discover ${tool.name} on AILIB.`,
    alternates: {
      canonical: `${baseUrl}/tools/${tool.slug}`,
    },
    openGraph: {
      title: `${tool.name} — AI Tool Review & Pricing`,
      description: tool.description || `Discover ${tool.name} on AILIB.`,
      url: `${baseUrl}/tools/${tool.slug}`,
      images: tool.logo_url ? [{ url: tool.logo_url }] : [],
    },
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    applicationCategory: tool.categories?.[0]?.name || 'MultimediaApplication',
    operatingSystem: tool.platforms?.join(', ') || 'Web',
    offers: {
      '@type': 'Offer',
      price: tool.pricing === 'free' ? '0' : undefined,
      priceCurrency: 'USD',
      category: tool.pricing,
    },
    aggregateRating:
      tool.review_count > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: tool.avg_rating,
            reviewCount: tool.review_count,
          }
        : undefined,
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#141613] selection:bg-[#ECE8DF] selection:text-[#141613] flex flex-col justify-between">
      <Navbar />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-1 w-full">
        {/* Top Breadcrumb & Report Action */}
        <div className="flex items-center justify-between">
          <Link
            href="/tools"
            className="btn-interactive inline-flex items-center gap-1.5 text-xs font-semibold text-[#666B60] hover:text-[#141613] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Explore</span>
          </Link>

          <ReportButton reportType="tool" targetId={tool.id} targetName={tool.name} />
        </div>

        {/* HERO / OVERVIEW HEADER */}
        <div className="relative rounded-2xl bg-white border border-[#EAE6DC] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#F2EFE8]">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#141613] text-white overflow-hidden flex items-center justify-center font-bold text-2xl shrink-0 shadow-sm">
                {tool.logo_url ? (
                  <Image
                    src={tool.logo_url}
                    alt={tool.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span>{tool.name.substring(0, 2).toUpperCase()}</span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#141613] tracking-tight">
                    {tool.name}
                  </h1>
                  {tool.featured && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#FEF6E9] text-[#8C4E05] border border-[#F9DEC2]">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F5F3ED] text-[#666B60] border border-[#EAE6DC]">
                    {tool.pricing}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#73796E]">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[#F5A623] text-[#F5A623]" />
                    <span className="font-bold text-[#141613] text-sm">
                      {tool.avg_rating > 0 ? tool.avg_rating.toFixed(1) : '4.5'}
                    </span>
                    <span>({tool.review_count} reviews)</span>
                  </div>

                  {tool.categories && tool.categories.length > 0 && (
                    <>
                      <span className="text-[#DDD7CB]">•</span>
                      <span className="text-[#666B60] font-medium">{tool.categories[0].name}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Outbound Website Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={tool.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-interactive flex-1 sm:flex-initial px-6 py-3 rounded-full bg-[#141613] hover:bg-[#2A2E27] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2"
              >
                <span>Visit Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Description & Tags */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-[#73796E] uppercase tracking-wider">About {tool.name}</h2>
            <p className="text-sm text-[#555C50] leading-relaxed">
              {tool.long_description || tool.description || 'No detailed description available.'}
            </p>

            {/* Platforms */}
            {tool.platforms && tool.platforms.length > 0 && (
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#73796E]">
                  Platforms:
                </span>
                {tool.platforms.map((p) => (
                  <span
                    key={p}
                    className="chip-interactive text-xs px-3 py-1 rounded-full bg-[#F5F3ED] text-[#666B60] border border-[#EAE6DC]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}

            {/* Tags */}
            {tool.tags && tool.tags.length > 0 && (
              <div className="pt-1 flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tools?tags=${tag.slug || tag.name}`}
                    className="chip-interactive text-xs font-medium px-3 py-1 rounded-full bg-[#F5F3ED] text-[#666B60] hover:text-[#141613] hover:bg-[#ECE8DF] border border-[#EAE6DC] flex items-center gap-1.5 transition-colors"
                  >
                    <TagIcon className="w-3 h-3 text-[#94998E]" />
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CONTRIBUTOR PERSPECTIVE & INSIGHTS CARD */}
        <div className="rounded-2xl bg-white border border-[#EAE6DC] p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#F2EFE8]">
            <div className="p-2 rounded-full bg-[#EDF7EE] text-[#1E7E34]">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#141613] flex items-center gap-2">
                Contributor Perspective
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#EDF7EE] text-[#1E7E34] border border-[#CCE8CD]">
                  Verified
                </span>
              </h3>
              <p className="text-xs text-[#73796E]">
                Original recommendation provided by the tool submitter
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#EAE6DC] text-sm text-[#555C50] leading-relaxed italic">
            &ldquo;{tool.description || 'Recommended for its streamlined AI capabilities, fast inference, and clean user experience across creative workflows.'}&rdquo;
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-[#EDF7EE] border border-[#CCE8CD] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E7E34] uppercase tracking-wider">
                <ThumbsUp className="w-3.5 h-3.5" /> Strengths
              </div>
              <ul className="text-xs text-[#2A5223] space-y-1 list-disc list-inside">
                <li>High productivity gain with modern AI models</li>
                <li>Intuitive workflow with minimal learning curve</li>
                <li>Flexible export options and fast rendering</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#FDF0F2] border border-[#F8D2D7] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#D73A49] uppercase tracking-wider">
                <ThumbsDown className="w-3.5 h-3.5" /> Considerations
              </div>
              <ul className="text-xs text-[#78232D] space-y-1 list-disc list-inside">
                <li>Requires active internet connection for cloud model inference</li>
                <li>Advanced tier required for unlimited batch processing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* COMMUNITY USER REVIEWS SECTION */}
        <div className="rounded-2xl bg-white border border-[#EAE6DC] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#F2EFE8]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-full bg-[#F3EFFB] text-[#5C42A6]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#141613]">Community Reviews</h3>
                <p className="text-xs text-[#73796E]">Independent ratings and feedback from platform members</p>
              </div>
            </div>

            <WriteReviewButton toolId={tool.id} toolName={tool.name} />
          </div>

          {tool.review_count === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm text-[#666B60]">No community reviews have been posted for {tool.name} yet.</p>
              <p className="text-xs text-[#94998E]">Be the first to share your rating and review for this tool!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#FBF9F5] border border-[#EAE6DC] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#141613] text-white font-bold text-xs flex items-center justify-center">
                      JM
                    </div>
                    <span className="text-xs font-bold text-[#141613]">Verified Member</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#F5A623]">
                    <Star className="w-3.5 h-3.5 fill-[#F5A623]" />
                    <span className="text-xs font-bold text-[#141613]">{tool.avg_rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-xs text-[#555C50]">
                  Exceptional AI tool! Saved me hours of manual labor in my weekly workflow.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RELATED TOOLS */}
        {relatedTools.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-[#141613]">Similar AI Tools</h3>
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
