'use server';

import { createClient } from '@/lib/supabase/server';
import { normalizeToolUrl } from '@/lib/urlHelper';
import { revalidatePath } from 'next/cache';

export interface SubmitToolResponse {
  success: boolean;
  submission?: any;
  duplicate?: boolean;
  existingTool?: {
    name: string;
    slug?: string;
    status: string;
  };
  error?: string;
}

export interface DuplicateCheckResponse {
  isDuplicate: boolean;
  existingTool?: {
    name: string;
    slug?: string;
    status: 'live' | 'pending' | 'rejected' | 'changes_requested';
  };
}

/**
 * Checks whether a tool with the same normalized URL or exact name already exists
 */
export async function checkDuplicateToolAction(rawUrl: string, toolName?: string): Promise<DuplicateCheckResponse> {
  const norm = normalizeToolUrl(rawUrl);
  if (!norm.isValid) {
    return { isDuplicate: false };
  }

  try {
    const supabase = await createClient();

    // 1. Check in live tools table
    const { data: liveTools } = await supabase
      .from('tools')
      .select('id, name, slug, website_url, status')
      .or(`website_url.ilike.%${norm.canonicalDomain}%,name.ilike.${toolName?.trim() || '___none___'}`);

    if (liveTools && liveTools.length > 0) {
      const match = liveTools.find(
        (t: any) =>
          normalizeToolUrl(t.website_url).canonicalDomain === norm.canonicalDomain ||
          (toolName && t.name.toLowerCase().trim() === toolName.toLowerCase().trim())
      );
      if (match) {
        return {
          isDuplicate: true,
          existingTool: {
            name: match.name,
            slug: match.slug,
            status: 'live',
          },
        };
      }
    }

    // 2. Check in pending submissions
    const { data: subTools } = await supabase
      .from('submissions')
      .select('id, tool_name, website_url, status')
      .in('status', ['pending', 'changes_requested'])
      .or(`website_url.ilike.%${norm.canonicalDomain}%,tool_name.ilike.${toolName?.trim() || '___none___'}`);

    if (subTools && subTools.length > 0) {
      const match = subTools.find(
        (t: any) =>
          normalizeToolUrl(t.website_url).canonicalDomain === norm.canonicalDomain ||
          (toolName && t.tool_name.toLowerCase().trim() === toolName.toLowerCase().trim())
      );
      if (match) {
        return {
          isDuplicate: true,
          existingTool: {
            name: match.tool_name,
            status: match.status as any,
          },
        };
      }
    }

    return { isDuplicate: false };
  } catch (err) {
    console.error('Error checking duplicate:', err);
    return { isDuplicate: false };
  }
}

/**
 * Server action to validate, rate-limit, and submit a new AI tool
 */
export async function submitToolAction(formData: FormData): Promise<SubmitToolResponse> {
  try {
    const supabase = await createClient();

    // 1. Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'You must be signed in to submit an AI tool to the community library.',
      };
    }

    // 2. Rate-limiting & Abuse Prevention: Max 10 submissions per user in the last 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentSubmissionsCount, error: countError } = await supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .eq('submitted_by', user.id)
      .gte('created_at', oneHourAgo);

    if (recentSubmissionsCount && recentSubmissionsCount >= 10) {
      return {
        success: false,
        error: 'Submission rate limit reached (maximum 10 submissions per hour). Please try again later.',
      };
    }

    // 3. Extract and validate required fields
    const toolName = (formData.get('name') as string)?.trim();
    const rawUrl = (formData.get('url') as string)?.trim();
    const description = (formData.get('description') as string)?.trim();
    const categoryId = (formData.get('categoryId') as string)?.trim();
    const pricing = (formData.get('pricing') as string)?.trim() || 'free';
    const contributorFeedback = (formData.get('contributorFeedback') as string)?.trim();

    if (!toolName || toolName.length < 2) {
      return { success: false, error: 'Tool name is required (minimum 2 characters).' };
    }

    if (!rawUrl) {
      return { success: false, error: 'Website URL is required.' };
    }

    const normUrl = normalizeToolUrl(rawUrl);
    if (!normUrl.isValid) {
      return { success: false, error: normUrl.error || 'Please enter a valid website URL.' };
    }

    if (!description || description.length < 10) {
      return { success: false, error: 'Please provide a descriptive overview (minimum 10 characters).' };
    }

    // 4. Check for duplicates before insert
    const dupCheck = await checkDuplicateToolAction(normUrl.normalizedUrl, toolName);
    if (dupCheck.isDuplicate && dupCheck.existingTool) {
      return {
        success: false,
        duplicate: true,
        existingTool: dupCheck.existingTool,
        error:
          dupCheck.existingTool.status === 'live'
            ? `This tool is already in the library as "${dupCheck.existingTool.name}".`
            : `A submission for "${dupCheck.existingTool.name}" is already pending moderation.`,
      };
    }

    // 5. Parse arrays and optional fields
    const tagsRaw = formData.get('tags') as string;
    const platformsRaw = formData.get('platforms') as string;
    const featuresRaw = formData.get('features') as string;
    const prosRaw = formData.get('pros') as string;
    const consRaw = formData.get('cons') as string;
    const logoUrl = (formData.get('logoUrl') as string)?.trim() || null;
    const screenshotUrl = (formData.get('screenshotUrl') as string)?.trim() || null;

    const parseStringArray = (input: string | null): string[] => {
      if (!input) return [];
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
      } catch {
        return input.split(',').map((s) => s.replace(/^#+/, '').trim()).filter(Boolean);
      }
      return [];
    };

    const tags = parseStringArray(tagsRaw);
    const platforms = parseStringArray(platformsRaw);
    const features = parseStringArray(featuresRaw);
    const pros = parseStringArray(prosRaw);
    const cons = parseStringArray(consRaw);

    // 6. Insert into Supabase submissions table
    const { data: newSubmission, error: insertError } = await supabase
      .from('submissions')
      .insert({
        tool_name: toolName,
        website_url: normUrl.normalizedUrl,
        description: description,
        category_id: categoryId || null,
        pricing: pricing,
        tags: tags,
        contributor_feedback: contributorFeedback || null,
        logo_url: logoUrl,
        screenshot_url: screenshotUrl,
        platforms: platforms.length > 0 ? platforms : ['Web'],
        features: features,
        pros: pros,
        cons: cons,
        submitted_by: user.id,
        status: 'pending',
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Supabase submissions insert error:', insertError);
      return {
        success: false,
        error: `Database Insert Error: ${insertError.message}`,
      };
    }

    revalidatePath('/dashboard/submissions');
    revalidatePath('/dashboard');

    return {
      success: true,
      submission: newSubmission,
    };
  } catch (err: any) {
    console.error('Exception in submitToolAction:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred while processing the submission.',
    };
  }
}
