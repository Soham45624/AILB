'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Tool } from '@/lib/types';

export interface LibraryTool extends Tool {
  saved_at: string; // favorites.created_at
}

export interface GetMyLibraryResult {
  tools: LibraryTool[];
  error?: string;
}

/**
 * Fetches all tools saved by the currently authenticated user,
 * with full category and tag joins. Only returns the calling user's
 * favorites — RLS enforces this at the database level.
 */
export async function getMyLibraryAction(): Promise<GetMyLibraryResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { tools: [], error: 'Unauthenticated' };
    }

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(
        `
        created_at,
        tool_id,
        tools (
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
            categories ( id, name, slug, icon, color )
          ),
          tags:tool_tags (
            tags ( id, name, slug )
          )
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getMyLibraryAction error:', error);
      return { tools: [], error: error.message };
    }

    // Normalize the nested join structure into flat Tool objects
    const tools: LibraryTool[] = (favorites || [])
      .filter((fav: any) => fav.tools)
      .map((fav: any) => {
        const t = fav.tools as any;
        return {
          ...t,
          saved_at: fav.created_at,
          // Flatten categories: tool_categories → categories
          categories: (t.categories || [])
            .map((tc: any) => tc.categories)
            .filter(Boolean),
          // Flatten tags: tool_tags → tags
          tags: (t.tags || [])
            .map((tt: any) => tt.tags)
            .filter(Boolean),
        } as LibraryTool;
      });

    return { tools };
  } catch (err: any) {
    console.error('Exception in getMyLibraryAction:', err);
    return { tools: [], error: err.message || 'Failed to load library' };
  }
}

/**
 * Removes a single tool from the current user's library (favorites).
 * Only deletes the favorite relationship — the tool itself is untouched.
 * RLS prevents users from deleting other users' favorites.
 */
export async function removeFromLibraryAction(
  toolId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Please sign in to manage your library.' };
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('tool_id', toolId);

    if (error) {
      console.error('removeFromLibraryAction error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/my-library');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (err: any) {
    console.error('Exception in removeFromLibraryAction:', err);
    return { success: false, error: err.message || 'Failed to remove tool from library' };
  }
}
