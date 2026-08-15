'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { UserRole } from '@/lib/types';

export interface AdminUserSession {
  id: string;
  email: string;
  role: UserRole;
  username: string;
  isSuspended: boolean;
}

/**
 * Validates active session and confirms user has EDITOR or ADMIN role.
 * Throws or returns null if unauthorized.
 */
export async function verifyAdminOrEditor(requiredRole: 'editor' | 'admin' = 'editor'): Promise<AdminUserSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, username, is_suspended')
    .eq('id', user.id)
    .single();

  if (!profile || profile.is_suspended) {
    return null;
  }

  const userRole = (profile.role || 'user').toLowerCase() as UserRole;

  if (requiredRole === 'admin' && userRole !== 'admin') {
    return null;
  }

  if (userRole !== 'admin' && userRole !== 'editor') {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    role: userRole,
    username: profile.username || user.email!.split('@')[0],
    isSuspended: Boolean(profile.is_suspended),
  };
}

/**
 * Dashboard Metrics
 */
export async function getAdminMetricsAction() {
  const auth = await verifyAdminOrEditor();
  if (!auth) return { success: false, error: 'Unauthorized' };

  try {
    const supabase = await createClient();

    const [
      { count: totalTools },
      { count: pendingSubmissions },
      { count: changesRequestedSubmissions },
      { count: totalUsers },
      { count: totalReviews },
      { count: openReports },
      { data: toolsMetrics },
    ] = await Promise.all([
      supabase.from('tools').select('*', { count: 'exact', head: true }),
      supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'changes_requested'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('tools').select('view_count, click_count'),
    ]);

    const totalViews = (toolsMetrics || []).reduce((acc, t) => acc + (t.view_count || 0), 0);
    const totalClicks = (toolsMetrics || []).reduce((acc, t) => acc + (t.click_count || 0), 0);

    return {
      success: true,
      metrics: {
        totalTools: totalTools || 0,
        pendingSubmissions: pendingSubmissions || 0,
        changesRequestedSubmissions: changesRequestedSubmissions || 0,
        totalUsers: totalUsers || 0,
        totalReviews: totalReviews || 0,
        totalViews,
        totalClicks,
        openReports: openReports || 0,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Submissions Moderation Actions
 */
export async function getAdminSubmissionsAction(statusFilter: string = 'all') {
  const auth = await verifyAdminOrEditor();
  if (!auth) return { success: false, submissions: [], error: 'Unauthorized' };

  try {
    const supabase = await createClient();

    let query = supabase
      .from('submissions')
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: submissions, error } = await query;
    if (error) throw error;

    // Fetch submitter usernames
    const userIds = Array.from(new Set(submissions?.map((s) => s.submitted_by) || []));
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p.display_name || p.username]));

    const enriched = (submissions || []).map((s) => ({
      ...s,
      submitter_name: profileMap.get(s.submitted_by) || 'Community Member',
    }));

    return { success: true, submissions: enriched };
  } catch (err: any) {
    return { success: false, submissions: [], error: err.message };
  }
}

export async function approveSubmissionAction(
  submissionId: string,
  categoryIds: string[] = [],
  tagIds: string[] = []
) {
  const auth = await verifyAdminOrEditor();
  if (!auth) return { success: false, error: 'Unauthorized' };

  try {
    const supabase = await createClient();

    const { data: toolId, error } = await supabase.rpc('approve_tool_submission', {
      p_submission_id: submissionId,
      p_category_ids: categoryIds.length > 0 ? categoryIds : null,
      p_tag_ids: tagIds.length > 0 ? tagIds : null,
    });

    if (error) throw error;

    revalidatePath('/tools');
    revalidatePath('/');
    revalidatePath('/admin/submissions');
    revalidatePath('/admin/tools');

    return { success: true, toolId };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function requestChangesSubmissionAction(submissionId: string, feedback: string) {
  const auth = await verifyAdminOrEditor();
  if (!auth) return { success: false, error: 'Unauthorized' };

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('submissions')
      .update({
        status: 'changes_requested',
        feedback: feedback || 'Please make the requested adjustments to your tool submission.',
        reviewed_by: auth.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (error) throw error;

    revalidatePath('/admin/submissions');
    revalidatePath('/dashboard/submissions');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function rejectSubmissionAction(submissionId: string, feedback: string) {
  const auth = await verifyAdminOrEditor();
  if (!auth) return { success: false, error: 'Unauthorized' };

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('submissions')
      .update({
        status: 'rejected',
        feedback: feedback || 'Submission does not meet community catalog guidelines.',
        reviewed_by: auth.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (error) throw error;

    revalidatePath('/admin/submissions');
    revalidatePath('/dashboard/submissions');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateAdminSubmissionAction(submissionId: string, updates: any) {
  const auth = await verifyAdminOrEditor();
  if (!auth) return { success: false, error: 'Unauthorized' };

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('submissions')
      .update({
        tool_name: updates.tool_name,
        website_url: updates.website_url,
        description: updates.description,
        pricing: updates.pricing,
        category_id: updates.category_id || null,
        tags: updates.tags || [],
        platforms: updates.platforms || ['Web'],
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (error) throw error;

    revalidatePath('/admin/submissions');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Tool Management Actions
 */
export async function getAdminToolsAction(search?: string, categorySlug?: string) {
  const auth = await verifyAdminOrEditor();
  if (!auth) return { success: false, tools: [], error: 'Unauthorized' };

  try {
    const supabase = await createClient();

    let query = supabase
      .from('tools')
      .select(`
        *,
        categories:tool_categories(
          category:categories(id, name, slug)
        ),
        tags:tool_tags(
          tag:tags(id, name, slug)
        )
      `)
      .order('created_at', { ascending: false });

    if (search) {
      const cleanSearch = search.trim();
      const numVal = parseInt(cleanSearch.replace(/^#/, ''), 10);
      if (!isNaN(numVal)) {
        query = query.or(`tool_code.eq.${numVal},name.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%`);
      } else {
        query = query.or(`name.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%`);
      }
    }

    const { data: tools, error } = await query;
    if (error) throw error;

    const flattened = (tools || []).map((t: any) => ({
      ...t,
      categories: (t.categories || []).map((c: any) => c.category).filter(Boolean),
      tags: (t.tags || []).map((tg: any) => tg.tag).filter(Boolean),
    }));

    return { success: true, tools: flattened };
  } catch (err: any) {
    return { success: false, tools: [], error: err.message };
  }
}

export async function updateAdminToolAction(toolId: string, updates: any) {
  const auth = await verifyAdminOrEditor();
  if (!auth) return { success: false, error: 'Unauthorized' };

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('tools')
      .update({
        name: updates.name,
        description: updates.description,
        website_url: updates.website_url,
        pricing: updates.pricing,
        featured: Boolean(updates.featured),
        trending: Boolean(updates.trending),
        status: updates.status || 'approved',
        platforms: updates.platforms || ['Web'],
        logo_url: updates.logo_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', toolId);

    if (error) throw error;

    // Update categories if provided
    if (updates.categoryId) {
      await supabase.from('tool_categories').delete().eq('tool_id', toolId);
      await supabase.from('tool_categories').insert({ tool_id: toolId, category_id: updates.categoryId });
    }

    revalidatePath('/tools');
    revalidatePath(`/tools/${updates.slug}`);
    revalidatePath('/admin/tools');
    revalidatePath('/');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteAdminToolAction(toolId: string) {
  const auth = await verifyAdminOrEditor();
  if (!auth) return { success: false, error: 'Unauthorized' };

  try {
    const supabase = await createClient();

    // Delete relation links first
    await supabase.from('tool_categories').delete().eq('tool_id', toolId);
    await supabase.from('tool_tags').delete().eq('tool_id', toolId);
    await supabase.from('favorites').delete().eq('tool_id', toolId);
    await supabase.from('reviews').delete().eq('tool_id', toolId);

    const { error } = await supabase.from('tools').delete().eq('id', toolId);
    if (error) throw error;

    revalidatePath('/tools');
    revalidatePath('/admin/tools');
    revalidatePath('/');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleToolFeaturedAction(toolId: string, featured: boolean) {
  const auth = await verifyAdminOrEditor();
  if (!auth) return { success: false, error: 'Unauthorized' };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('tools').update({ featured }).eq('id', toolId);
    if (error) throw error;

    revalidatePath('/tools');
    revalidatePath('/');
    revalidatePath('/admin/tools');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleToolTrendingAction(toolId: string, trending: boolean) {
  const auth = await verifyAdminOrEditor();
  if (!auth) return { success: false, error: 'Unauthorized' };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('tools').update({ trending }).eq('id', toolId);
    if (error) throw error;

    revalidatePath('/tools');
    revalidatePath('/');
    revalidatePath('/admin/tools');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Review Moderation Actions
 */
export async function getAdminReviewsAction() {
  const auth = await verifyAdminOrEditor();
  if (!auth) return { success: false, reviews: [], error: 'Unauthorized' };

  try {
    const supabase = await createClient();

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        tool:tools(id, name, slug),
        profile:profiles(id, username, display_name, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, reviews: reviews || [] };
  } catch (err: any) {
    return { success: false, reviews: [], error: err.message };
  }
}

export async function moderateReviewAction(
  reviewId: string,
  action: 'remove' | 'restore',
  reason?: string
) {
  const auth = await verifyAdminOrEditor();
  if (!auth) return { success: false, error: 'Unauthorized' };

  try {
    const supabase = await createClient();

    const isDeleted = action === 'remove';
    const { error } = await supabase
      .from('reviews')
      .update({
        is_deleted: isDeleted,
        deleted_reason: isDeleted ? reason || 'Violated community guidelines' : null,
      })
      .eq('id', reviewId);

    if (error) throw error;

    revalidatePath('/admin/reviews');
    revalidatePath('/tools');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * User Management Actions (Strictly ADMIN Role)
 */
export async function getAdminUsersAction(search?: string) {
  const auth = await verifyAdminOrEditor('admin');
  if (!auth) return { success: false, users: [], error: 'Admin privileges required' };

  try {
    const supabase = await createClient();

    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
    }

    const { data: profiles, error } = await query;
    if (error) throw error;

    // Get submission counts per user
    const { data: submissions } = await supabase.from('submissions').select('submitted_by');
    const subCountMap = new Map<string, number>();
    submissions?.forEach((s) => {
      subCountMap.set(s.submitted_by, (subCountMap.get(s.submitted_by) || 0) + 1);
    });

    const enriched = (profiles || []).map((p) => ({
      ...p,
      submission_count: subCountMap.get(p.id) || 0,
    }));

    return { success: true, users: enriched };
  } catch (err: any) {
    return { success: false, users: [], error: err.message };
  }
}

export async function updateUserRoleAction(userId: string, newRole: UserRole) {
  const auth = await verifyAdminOrEditor('admin');
  if (!auth) return { success: false, error: 'Admin privileges required to alter roles' };

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleUserSuspensionAction(userId: string, isSuspended: boolean) {
  const auth = await verifyAdminOrEditor('admin');
  if (!auth) return { success: false, error: 'Admin privileges required' };

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('profiles')
      .update({ is_suspended: isSuspended, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Reports Queue Actions
 */
export async function getAdminReportsAction(reportType: string = 'all', statusFilter: string = 'all') {
  const auth = await verifyAdminOrEditor();
  if (!auth) return { success: false, reports: [], error: 'Unauthorized' };

  try {
    const supabase = await createClient();

    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reports_reporter_id_fkey(id, username, display_name),
        tool:tools(id, name, slug),
        review:reviews(id, rating, content)
      `)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (reportType !== 'all') {
      query = query.eq('report_type', reportType);
    }

    const { data: reports, error } = await query;
    if (error) throw error;

    return { success: true, reports: reports || [] };
  } catch (err: any) {
    return { success: false, reports: [], error: err.message };
  }
}

export async function resolveReportAction(
  reportId: string,
  status: 'resolved' | 'dismissed',
  resolutionNotes?: string
) {
  const auth = await verifyAdminOrEditor();
  if (!auth) return { success: false, error: 'Unauthorized' };

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('reports')
      .update({
        status: status,
        resolved_by: auth.id,
      })
      .eq('id', reportId);

    if (error) throw error;

    revalidatePath('/admin/reports');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteUserAction(userId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminOrEditor('admin');
  if (!auth) return { success: false, error: 'Admin privileges required' };

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc('delete_user_by_id', { p_user_id: userId });
    
    if (error) throw error;

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting user:', err);
    return { success: false, error: err.message || 'Failed to delete user' };
  }
}
