'use server';

import { createClient } from '@/lib/supabase/server';
import { Profile } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { baseUrl } from '@/lib/config';

export interface AuthResponse {
  success: boolean;
  user?: any;
  profile?: Profile | null;
  error?: string;
  url?: string;
}

export async function getCurrentUserAction(): Promise<AuthResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, user: null, profile: null };
    }

    // Fetch associated profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: profile?.username || user.user_metadata?.username || user.email?.split('@')[0],
      },
      profile: profile || null,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to get current user' };
  }
}

export async function signInAction(formData: FormData): Promise<AuthResponse> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      console.error('Supabase signIn error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  } catch (err: any) {
    console.error('Exception in signInAction:', err);
    return { success: false, error: err.message || 'An unexpected error occurred during sign-in.' };
  }
}

export async function signUpAction(formData: FormData): Promise<AuthResponse> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;
  const displayName = formData.get('displayName') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          username: username?.trim() || email.split('@')[0],
          display_name: displayName?.trim() || username?.trim() || email.split('@')[0],
        },
      },
    });

    if (error) {
      console.error('Supabase signUp error:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    };
  } catch (err: any) {
    console.error('Exception in signUpAction:', err);
    return { success: false, error: err.message || 'An unexpected error occurred during sign-up.' };
  }
}

export async function resetPasswordAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const email = formData.get('email') as string;

  if (!email) {
    return { success: false, error: 'Please enter your account email address.' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${baseUrl}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send password reset email.' };
  }
}

export async function updatePasswordAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const password = formData.get('password') as string;

  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update password.' };
  }
}

export async function updateProfileAction(formData: FormData): Promise<{
  success: boolean;
  profile?: Profile;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    const username = formData.get('username') as string;
    const displayName = formData.get('displayName') as string;
    const bio = formData.get('bio') as string;
    const website = formData.get('website') as string;
    const avatarUrl = formData.get('avatarUrl') as string;

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({
        username: username?.trim() || undefined,
        display_name: displayName?.trim() || null,
        full_name: displayName?.trim() || null,
        bio: bio?.trim() || null,
        website: website?.trim() || null,
        avatar_url: avatarUrl?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard');
    return { success: true, profile: updatedProfile };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update profile.' };
  }
}

export async function signOutAction(): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch (err) {
    console.error('SignOut error:', err);
    return { success: false };
  }
}
