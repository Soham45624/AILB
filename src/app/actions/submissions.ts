'use server';

import { createClient } from '@/lib/supabase/server';

export interface SubmitToolResponse {
  success: boolean;
  submission?: any;
  error?: string;
}

export async function submitToolAction(formData: FormData): Promise<SubmitToolResponse> {
  try {
    const supabase = await createClient();

    // 1. Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.warn('Submission attempt rejected: User not authenticated');
      return {
        success: false,
        error: 'You must be signed in to submit an AI tool to the community library.',
      };
    }

    // 2. Validate form inputs
    const toolName = formData.get('name') as string;
    const websiteUrl = formData.get('url') as string;
    const description = formData.get('description') as string;
    const pricing = (formData.get('pricing') as string) || 'free';
    const tagsRaw = formData.get('tags') as string;

    if (!toolName || toolName.trim().length < 2) {
      return {
        success: false,
        error: 'Tool name is required and must be at least 2 characters.',
      };
    }

    if (!websiteUrl || !websiteUrl.trim()) {
      return {
        success: false,
        error: 'Website URL is required.',
      };
    }

    // Ensure valid URL format
    let formattedUrl = websiteUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      new URL(formattedUrl);
    } catch {
      return {
        success: false,
        error: 'Please enter a valid website URL (e.g. https://example.com).',
      };
    }

    // Parse and clean tags (strip leading # and clean whitespace)
    const cleanedTags: string[] = [];
    if (tagsRaw) {
      try {
        const parsed = JSON.parse(tagsRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((t: string) => {
            const clean = t.replace(/^#+/, '').trim();
            if (clean && !cleanedTags.includes(clean)) cleanedTags.push(clean);
          });
        }
      } catch {
        tagsRaw.split(',').forEach((t) => {
          const clean = t.replace(/^#+/, '').trim();
          if (clean && !cleanedTags.includes(clean)) cleanedTags.push(clean);
        });
      }
    }

    // 3. Insert into Supabase submissions table
    console.log(`Submitting tool "${toolName}" with tags [${cleanedTags.join(', ')}] for user ${user.id}...`);

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        tool_name: toolName.trim(),
        website_url: formattedUrl,
        description: description?.trim() || null,
        pricing: pricing.trim() || 'unknown',
        tags: cleanedTags,
        submitted_by: user.id,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase submissions insert error:', error);
      return {
        success: false,
        error: `Database Insert Error: ${error.message} (Code: ${error.code || 'UNKNOWN'})`,
      };
    }

    console.log('Successfully inserted submission with tags into Supabase:', data.id);

    return {
      success: true,
      submission: data,
    };
  } catch (err: any) {
    console.error('Exception in submitToolAction:', err);
    return {
      success: false,
      error: err.message || 'An unexpected server error occurred while processing the submission.',
    };
  }
}
