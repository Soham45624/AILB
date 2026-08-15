'use server';

import { createClient } from '@/lib/supabase/server';
import { Tool } from '@/lib/types';

export interface FinderRequirements {
  category: string | null;
  pricing: 'free' | 'freemium' | 'paid' | 'free_trial' | null;
  features: string[];
  platforms: string[];
  keywords: string[];
  use_case: string | null;
}

export interface FinderToolMatch {
  tool: Tool;
  matchPercentage: number;
  whyItMatches: string;
  matchedCriteria: string[];
}

export interface FinderResponse {
  success: boolean;
  inScope: boolean;
  intent: 'tool_search' | 'clarification_answer' | 'comparison' | 'out_of_scope' | 'greeting';
  message: string;
  requirements: FinderRequirements;
  matches: FinderToolMatch[];
  needsClarification: boolean;
  clarificationQuestion?: string | null;
  error?: string;
}

const OUT_OF_SCOPE_MESSAGE =
  "I'm AILIB Finder. I can help you discover, compare, and evaluate AI tools. What kind of AI tool are you looking for?";

/**
 * Calls Google Gemini (server-side only) to analyze the user's natural language input
 * and produce a validated, structured requirement object.
 */
async function analyzePromptWithGemini(
  prompt: string,
  previousRequirements?: FinderRequirements | null
): Promise<{
  inScope: boolean;
  intent: 'tool_search' | 'clarification_answer' | 'comparison' | 'out_of_scope' | 'greeting';
  requirements: FinderRequirements;
  needsClarification: boolean;
  clarificationQuestion?: string | null;
  message?: string;
}> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  // Fallback heuristic if API key is not configured in environment
  if (!apiKey) {
    return heuristicFallbackExtraction(prompt, previousRequirements);
  }

  const systemInstruction = `You are the requirement extraction engine for AILIB Finder, an AI tool discovery platform.
Your job is to analyze user search queries and extract structured requirements to search the AI software directory.
You MUST output ONLY valid JSON conforming to the requested schema.

SCOPE RULES:
- IN-SCOPE: Requests looking to discover AI tools, compare AI tools, search by pricing, features, categories, platforms, or use cases.
- OUT-OF-SCOPE: General chatbot queries, asking to write code directly (e.g. "write me a C++ program", "generate python code for fibonacci"), answering general knowledge/weather/math/jokes, drafting emails, etc.
- If out of scope, set "in_scope": false, "intent": "out_of_scope", and "message": "${OUT_OF_SCOPE_MESSAGE}".

CATEGORIES RECOGNIZED IN AILIB:
AI Assistant, Coding, Image Generation, Video Generation, Audio, Writing, Productivity, Marketing, Research, Education, Design, Automation, Business, Finance, Developer Tools, Presentation, SEO, Social Media.

PRICING RECOGNIZED:
"free", "freemium", "paid", "free_trial".

Return JSON with this exact structure:
{
  "in_scope": boolean,
  "intent": "tool_search" | "clarification_answer" | "comparison" | "out_of_scope" | "greeting",
  "requirements": {
    "category": string | null,
    "pricing": "free" | "freemium" | "paid" | "free_trial" | null,
    "features": string[],
    "platforms": string[],
    "keywords": string[],
    "use_case": string | null
  },
  "needs_clarification": boolean,
  "clarification_question": string | null,
  "message": string | null
}`;

  const promptContent = `User query: "${prompt}"
${previousRequirements ? `Previous extracted requirements context: ${JSON.stringify(previousRequirements)}` : ''}

Analyze and extract requirements:`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: promptContent }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      }
    );

    if (!res.ok) {
      console.warn(`Gemini API returned status ${res.status}, using heuristic analyzer.`);
      return heuristicFallbackExtraction(prompt, previousRequirements);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return heuristicFallbackExtraction(prompt, previousRequirements);
    }

    const parsed = JSON.parse(rawText);

    if (!parsed.in_scope) {
      return {
        inScope: false,
        intent: 'out_of_scope',
        requirements: {
          category: null,
          pricing: null,
          features: [],
          platforms: [],
          keywords: [],
          use_case: null,
        },
        needsClarification: false,
        message: OUT_OF_SCOPE_MESSAGE,
      };
    }

    // Merge with previous requirements if refining
    const mergedReqs: FinderRequirements = {
      category: parsed.requirements?.category || previousRequirements?.category || null,
      pricing: parsed.requirements?.pricing || previousRequirements?.pricing || null,
      features: Array.from(
        new Set([...(previousRequirements?.features || []), ...(parsed.requirements?.features || [])])
      ),
      platforms: Array.from(
        new Set([...(previousRequirements?.platforms || []), ...(parsed.requirements?.platforms || [])])
      ),
      keywords: Array.from(
        new Set([...(previousRequirements?.keywords || []), ...(parsed.requirements?.keywords || [])])
      ),
      use_case: parsed.requirements?.use_case || previousRequirements?.use_case || null,
    };

    return {
      inScope: Boolean(parsed.in_scope),
      intent: parsed.intent || (parsed.in_scope ? 'tool_search' : 'out_of_scope'),
      requirements: mergedReqs,
      needsClarification: Boolean(parsed.needs_clarification),
      clarificationQuestion: parsed.clarification_question || null,
      message: parsed.message || null,
    };
  } catch (err) {
    console.error('Error invoking Gemini API:', err);
    return heuristicFallbackExtraction(prompt, previousRequirements);
  }
}

/**
 * Resilient heuristic extractor for when Gemini API key is missing or network times out
 */
function heuristicFallbackExtraction(
  prompt: string,
  prevReqs?: FinderRequirements | null
): {
  inScope: boolean;
  intent: 'tool_search' | 'clarification_answer' | 'comparison' | 'out_of_scope' | 'greeting';
  requirements: FinderRequirements;
  needsClarification: boolean;
  clarificationQuestion?: string | null;
} {
  const p = prompt.toLowerCase().trim();

  // Out of scope checks
  const outOfScopePatterns = [
    /\b(write|create|code|generate|build|compose|make)\s+(me\s+)?(a|an|the|some)?\s*(c\+\+|c#|python|javascript|typescript|java|rust|go|php|ruby|swift|kotlin|code|script|program|app|function|html|css|sql|algorithm)/i,
    /\b(how\s+do\s+i\s+(code|write|program|compile|debug)\s+(in|a)?)/i,
    /\b(what\s+is\s+the\s+weather|weather\s+today|weather\s+forecast|temperature)\b/i,
    /\b(tell\s+me\s+a\s+joke|make\s+me\s+laugh|funny\s+joke)\b/i,
    /\b(explain\s+(quantum|relativity|gravity|physics|biology|history|chemistry|calculus))\b/i,
    /\b(write|draft|compose)\s+(me\s+)?(an?\s+)?(email|letter|essay|poem|song|story|resume)\b/i,
    /\b(who\s+(won|is|was|invented|discovered)\s+)/i,
    /\b(solve|calculate|compute)\s+(\d+|[0-9x\+\-\*\/\^]+)/i,
  ];

  for (const pattern of outOfScopePatterns) {
    if (pattern.test(p)) {
      return {
        inScope: false,
        intent: 'out_of_scope',
        requirements: {
          category: null,
          pricing: null,
          features: [],
          platforms: [],
          keywords: [],
          use_case: null,
        },
        needsClarification: false,
      };
    }
  }

  // Pricing extraction
  let pricing: FinderRequirements['pricing'] = prevReqs?.pricing || null;
  if (/\bfree\b/i.test(p) && !/\bfreemium\b/i.test(p) && !/\bfree trial\b/i.test(p)) pricing = 'free';
  else if (/\bfreemium\b/i.test(p)) pricing = 'freemium';
  else if (/\bfree trial\b/i.test(p) || /\btrial\b/i.test(p)) pricing = 'free_trial';
  else if (/\bpaid\b/i.test(p) || /\bpremium\b/i.test(p) || /\bsubscription\b/i.test(p)) pricing = 'paid';

  // Category extraction with word boundaries
  let category: string | null = prevReqs?.category || null;
  const categoryPatterns: [string, RegExp][] = [
    ['presentation', /\b(presentation|presentations|slides?|pitch deck|deck|powerpoint|keynote)\b/i],
    ['coding', /\b(coding|programmer|programming|developer|developers|debugger|debugging|copilot|\bide\b|code editor)\b/i],
    ['video-generation', /\b(video|videos|youtube|avatar|avatars|dubbing|animation|render video)\b/i],
    ['audio', /\b(audio|voice|voices|speech|text-to-speech|tts|voiceover|voiceovers|sound|music)\b/i],
    ['image-generation', /\b(image|images|photo|photos|artwork|graphic|graphics|concept art|drawing|illustration)\b/i],
    ['writing', /\b(writing|article|articles|essay|essays|blog|copywriting|long-form)\b/i],
    ['productivity', /\b(productivity|notes|task management|workflow|meeting notes|organizer)\b/i],
    ['research', /\b(research|academic|papers?|literature review|scientific|study)\b/i],
    ['seo', /\b(seo|search engine optimization|ranking|keywords)\b/i],
    ['marketing', /\b(marketing|ad campaign|social media|advertising)\b/i],
  ];

  for (const [catName, pattern] of categoryPatterns) {
    if (pattern.test(p)) {
      category = catName;
      break;
    }
  }

  // Keywords extraction
  const stopWords = new Set([
    'i', 'need', 'a', 'an', 'the', 'for', 'to', 'that', 'with', 'and', 'or', 'in', 'of', 'ai', 'tool', 'tools', 'best', 'can', 'help', 'me', 'want', 'looking'
  ]);
  const words = p
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const mergedKeywords = Array.from(new Set([...(prevReqs?.keywords || []), ...words]));
  const features: string[] = prevReqs?.features || [];
  if (/\bvoiceovers?\b/i.test(p) || /\bvoice over\b/i.test(p)) features.push('voiceovers');
  if (/\byoutube\b/i.test(p)) features.push('YouTube video creation');
  if (/\bpowerpoint\b/i.test(p) || /\bppt\b/i.test(p)) features.push('PowerPoint export');
  if (/\bapi\b/i.test(p)) features.push('API access');

  const platforms: string[] = prevReqs?.platforms || [];
  if (/\bweb\b/i.test(p) || /\bbrowser\b/i.test(p)) platforms.push('Web');
  if (/\bmac\b/i.test(p) || /\bmacos\b/i.test(p)) platforms.push('macOS');
  if (/\bwindows\b/i.test(p)) platforms.push('Windows');
  if (/\bapi\b/i.test(p)) platforms.push('API');

  return {
    inScope: true,
    intent: 'tool_search',
    requirements: {
      category,
      pricing,
      features: Array.from(new Set(features)),
      platforms: Array.from(new Set(platforms)),
      keywords: mergedKeywords,
      use_case: prompt,
    },
    needsClarification: false,
  };
}

/**
 * Searches the Supabase database and ranks tools based on the extracted requirements
 */
export async function findAiToolsAction(
  prompt: string,
  previousRequirements?: FinderRequirements | null
): Promise<FinderResponse> {
  try {
    if (!prompt || !prompt.trim()) {
      return {
        success: false,
        inScope: true,
        intent: 'tool_search',
        message: 'Please tell me what kind of AI tool you are looking for.',
        requirements: previousRequirements || {
          category: null,
          pricing: null,
          features: [],
          platforms: [],
          keywords: [],
          use_case: null,
        },
        matches: [],
        needsClarification: false,
      };
    }

    // 1. Analyze prompt with Gemini
    const analysis = await analyzePromptWithGemini(prompt, previousRequirements);

    if (!analysis.inScope) {
      return {
        success: true,
        inScope: false,
        intent: 'out_of_scope',
        message: OUT_OF_SCOPE_MESSAGE,
        requirements: analysis.requirements,
        matches: [],
        needsClarification: false,
      };
    }

    // 2. Query the Supabase database for approved tools
    const supabase = await createClient();
    const { data: rawTools, error: dbError } = await supabase
      .from('tools')
      .select(
        `
        id,
        name,
        slug,
        description,
        long_description,
        website_url,
        logo_url,
        pricing,
        status,
        featured,
        trending,
        avg_rating,
        review_count,
        view_count,
        click_count,
        saved_count,
        platforms,
        features,
        pros,
        cons,
        created_at,
        updated_at,
        categories:tool_categories (
          categories ( id, name, slug )
        ),
        tags:tool_tags (
          tags ( id, name, slug )
        )
      `
      )
      .eq('status', 'approved');

    if (dbError || !rawTools) {
      console.error('Supabase tools query error:', dbError);
      return {
        success: false,
        inScope: true,
        intent: analysis.intent,
        message: 'Database query failed while searching for tools.',
        requirements: analysis.requirements,
        matches: [],
        needsClarification: false,
        error: dbError?.message || 'Failed to search tools in database',
      };
    }

    // Format tools with flat category and tag arrays
    const allTools: Tool[] = rawTools.map((t: any) => ({
      ...t,
      categories: (t.categories || []).map((tc: any) => tc.categories).filter(Boolean),
      tags: (t.tags || [])
        .map((tt: any) => tt.tags)
        .filter(Boolean),
    }));

    // 3. Multi-factor Scoring and Ranking Algorithm
    const reqs = analysis.requirements;
    const scoredTools: { tool: Tool; score: number; reasons: string[]; matchedCriteria: string[] }[] = [];

    for (const tool of allTools) {
      let score = 0;
      const reasons: string[] = [];
      const matchedCriteria: string[] = [];

      const toolText = [
        tool.name,
        tool.description || '',
        tool.long_description || '',
        ...(tool.features || []),
        ...(tool.platforms || []),
        ...(tool.categories?.map((c) => c.name) || []),
        ...(tool.tags?.map((t) => t.name) || []),
      ]
        .join(' ')
        .toLowerCase();

      // Category matching (+35 max)
      if (reqs.category) {
        const catNorm = reqs.category.toLowerCase().replace(/[-_]/g, ' ');
        const matchesCat = tool.categories?.some((c) => {
          const cName = c.name.toLowerCase().replace(/[-_]/g, ' ');
          const cSlug = c.slug.toLowerCase().replace(/[-_]/g, ' ');
          return cName.includes(catNorm) || catNorm.includes(cName) || cSlug.includes(catNorm);
        });

        if (matchesCat) {
          score += 35;
          matchedCriteria.push(`Category: ${tool.categories?.[0]?.name || reqs.category}`);
          reasons.push(`specialized in ${tool.categories?.[0]?.name || reqs.category}`);
        }
      }

      // Pricing matching (+25 max)
      if (reqs.pricing) {
        if (tool.pricing === reqs.pricing) {
          score += 25;
          matchedCriteria.push(`Pricing: ${reqs.pricing}`);
          reasons.push(`available with ${reqs.pricing} access`);
        } else if (reqs.pricing === 'free' && tool.pricing === 'freemium') {
          score += 20;
          matchedCriteria.push(`Pricing: Freemium with free plan`);
          reasons.push('offers a free plan tier');
        } else if (reqs.pricing === 'free' && tool.pricing === 'free_trial') {
          score += 10;
        } else if (reqs.pricing === 'freemium' && tool.pricing === 'free') {
          score += 20;
        }
      }

      // Keywords & Features matching (+30 max)
      let matchedKeywordCount = 0;
      for (const kw of reqs.keywords) {
        const kwLower = kw.toLowerCase();
        if (toolText.includes(kwLower)) {
          matchedKeywordCount++;
          if (matchedKeywordCount <= 3) {
            score += 10;
            matchedCriteria.push(`Keyword: ${kw}`);
          }
        }
      }

      for (const feature of reqs.features) {
        const featLower = feature.toLowerCase();
        if (toolText.includes(featLower)) {
          score += 15;
          reasons.push(`supports ${feature}`);
          matchedCriteria.push(`Feature: ${feature}`);
        }
      }

      // Platform matching (+10 max)
      if (reqs.platforms.length > 0) {
        const toolPlatforms = (tool.platforms || ['Web']).map((p) => p.toLowerCase());
        const hasPlatform = reqs.platforms.some((p) => toolPlatforms.includes(p.toLowerCase()));
        if (hasPlatform) {
          score += 10;
          matchedCriteria.push(`Platform: ${reqs.platforms.join(', ')}`);
        }
      }

      // Rating quality bonus (+10 max)
      const ratingBonus = ((tool.avg_rating || 0) / 5) * 6;
      const reviewBonus = Math.min(4, Math.log10((tool.review_count || 0) + 1) * 2);
      score += ratingBonus + reviewBonus;

      // Only include tools that have meaningful relevance (either matched category, keywords, or features)
      const hasDirectMatch = matchedCriteria.length > 0;
      if (hasDirectMatch && score > 20) {
        scoredTools.push({
          tool,
          score,
          reasons,
          matchedCriteria,
        });
      }
    }

    // Sort by score descending
    scoredTools.sort((a, b) => b.score - a.score);

    // If no strong matches found
    if (scoredTools.length === 0) {
      return {
        success: true,
        inScope: true,
        intent: 'tool_search',
        message: "I couldn't find a strong match in the AILIB library for those specific requirements.",
        requirements: reqs,
        matches: [],
        needsClarification: true,
        clarificationQuestion: 'Try adjusting your requirements or searching for a broader capability.',
      };
    }

    // Take top 3 to 5 results
    const topMatches = scoredTools.slice(0, 4);
    const maxScore = topMatches[0].score;

    const matches: FinderToolMatch[] = topMatches.map(({ tool, score, reasons, matchedCriteria }) => {
      // Calculate normalized match % between 82% and 98%
      const normalizedMatch = Math.min(
        98,
        Math.max(82, Math.round((score / Math.max(maxScore, 60)) * 96))
      );

      // Build factual "Why it matches"
      let why = '';
      if (reasons.length > 0) {
        why = `Matches your requirements: ${reasons.join(', ')}.`;
      } else {
        why = `Highly relevant for ${reqs.category || 'your AI workflow'} with strong community ratings (${tool.avg_rating || 5.0}★).`;
      }

      return {
        tool,
        matchPercentage: normalizedMatch,
        whyItMatches: why,
        matchedCriteria: matchedCriteria.slice(0, 4),
      };
    });

    const summaryMessage =
      matches.length === 1
        ? `Found 1 top tool in AILIB that matches your needs.`
        : `Found ${matches.length} top tools in AILIB matching your criteria:`;

    return {
      success: true,
      inScope: true,
      intent: 'tool_search',
      message: summaryMessage,
      requirements: reqs,
      matches,
      needsClarification: analysis.needsClarification,
      clarificationQuestion: analysis.clarificationQuestion,
    };
  } catch (err: any) {
    console.error('Exception in findAiToolsAction:', err);
    return {
      success: false,
      inScope: true,
      intent: 'tool_search',
      message: 'An unexpected error occurred while searching for tools.',
      requirements: previousRequirements || {
        category: null,
        pricing: null,
        features: [],
        platforms: [],
        keywords: [],
        use_case: null,
      },
      matches: [],
      needsClarification: false,
      error: err.message,
    };
  }
}
