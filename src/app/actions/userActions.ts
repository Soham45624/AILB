'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedActiveUser } from '@/lib/security';

/**
 * Toggles bookmark/favorite status of an AI tool for the authenticated user
 */
export async function toggleSaveToolAction(toolId: string): Promise<{
  success: boolean;
  isSaved?: boolean;
  savedCount?: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { user, profile, error: authError } = await getAuthenticatedActiveUser(supabase);

    if (authError || !user) {
      return { success: false, error: authError || 'Please sign in to save tools to your library.' };
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .maybeSingle();

    if (existing) {
      // Remove favorite
      await supabase.from('favorites').delete().eq('id', existing.id);
      await supabase.rpc('decrement_tool_saved_count', { p_tool_id: toolId });
    } else {
      // Add favorite
      await supabase.from('favorites').insert({ user_id: user.id, tool_id: toolId });
      await supabase.rpc('increment_tool_saved_count', { p_tool_id: toolId });
    }

    // Fetch updated count
    const { data: tool } = await supabase
      .from('tools')
      .select('saved_count')
      .eq('id', toolId)
      .single();

    revalidatePath('/tools');
    revalidatePath('/dashboard');

    return {
      success: true,
      isSaved: !existing,
      savedCount: tool?.saved_count || 0,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update favorite' };
  }
}

/**
 * Checks if current authenticated user has saved a tool
 */
export async function isToolSavedAction(toolId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .maybeSingle();

    return Boolean(data);
  } catch {
    return false;
  }
}

/**
 * Returns an array of tool IDs saved by the current authenticated user
 */
export async function getUserSavedToolIdsAction(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return [];

    const { data } = await supabase
      .from('favorites')
      .select('tool_id')
      .eq('user_id', user.id);

    return (data || []).map((f: any) => f.tool_id);
  } catch {
    return [];
  }
}

/**
 * Submits a community review and rating for a tool
 */
export async function submitReviewAction(
  toolId: string,
  rating: number,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { user, profile, error: authError } = await getAuthenticatedActiveUser(supabase);

    if (authError || !user) {
      return { success: false, error: authError || 'Please sign in to write a review.' };
    }

    if (!rating || rating < 1 || rating > 5) {
      return { success: false, error: 'Please select a rating between 1 and 5 stars.' };
    }

    if (content && content.trim().length > 1000) {
      return { success: false, error: 'Review content cannot exceed 1,000 characters.' };
    }

    // Rate Limiting: Max 15 review actions per hour per user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentReviewsCount } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('updated_at', oneHourAgo);

    if (recentReviewsCount && recentReviewsCount >= 15) {
      return { success: false, error: 'Review submission rate limit reached. Please try again later.' };
    }

    // Insert or update existing user review (1 active review per user per tool)
    const { error: reviewError } = await supabase
      .from('reviews')
      .upsert(
        {
          tool_id: toolId,
          user_id: user.id,
          rating: rating,
          content: content?.trim() || null,
          status: 'approved',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'tool_id,user_id' }
      );

    if (reviewError) throw reviewError;

    // Recalculate average rating & count
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('tool_id', toolId)
      .eq('is_deleted', false);

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / allReviews.length;
      await supabase
        .from('tools')
        .update({
          avg_rating: Math.round(avg * 10) / 10,
          review_count: allReviews.length,
        })
        .eq('id', toolId);
    }

    revalidatePath('/tools');
    revalidatePath('/admin/reviews');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit review' };
  }
}

/**
 * Submits an incident or flag report (tool, review, user)
 */
export async function submitReportAction(
  reportType: 'tool' | 'review' | 'user',
  targetId: string,
  reason: string,
  details?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { user, profile, error: authError } = await getAuthenticatedActiveUser(supabase);

    if (authError || !user) {
      return { success: false, error: authError || 'Please sign in to submit a report.' };
    }

    const cleanReason = reason?.trim();
    if (!cleanReason) {
      return { success: false, error: 'Please specify a reason for the report.' };
    }
    if (cleanReason.length > 200) {
      return { success: false, error: 'Reason cannot exceed 200 characters.' };
    }

    const cleanDetails = details?.trim() || null;
    if (cleanDetails && cleanDetails.length > 1000) {
      return { success: false, error: 'Details cannot exceed 1,000 characters.' };
    }

    // Rate Limiting: Max 5 reports per hour per user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentReportsCount } = await supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('reporter_id', user.id)
      .gte('created_at', oneHourAgo);

    if (recentReportsCount && recentReportsCount >= 5) {
      return {
        success: false,
        error: 'Report submission rate limit reached (maximum 5 reports per hour). Please try again later.',
      };
    }

    const payload: any = {
      reporter_id: user.id,
      report_type: reportType,
      reason: cleanReason,
      details: cleanDetails,
      status: 'open',
    };

    if (reportType === 'tool') payload.tool_id = targetId;
    if (reportType === 'review') payload.review_id = targetId;
    if (reportType === 'user') payload.reported_user_id = targetId;

    const { error } = await supabase.from('reports').insert(payload);
    if (error) throw error;

    revalidatePath('/admin/reports');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to submit report' };
  }
}

/**
 * Tracks external outbound click to a tool's website
 */
export async function trackToolClickAction(toolId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from('tool_clicks').insert({
      tool_id: toolId,
      user_id: user?.id || null,
    });

    await supabase.rpc('increment_tool_click_count', { p_tool_id: toolId });
  } catch (err) {
    console.error('Click tracking error:', err);
  }
}
