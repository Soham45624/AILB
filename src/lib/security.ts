/**
 * Security & Input Sanitization Utilities for AILB
 */

/**
 * Ensures redirect URLs are strictly safe, relative internal paths.
 * Protects against Open Redirect vulnerabilities (CWE-601).
 *
 * Rejects:
 * - External absolute URLs (e.g., https://evil.com)
 * - Protocol-relative URLs (e.g., //evil.com)
 * - Windows slash anomalies (e.g., /\evil.com, \evil.com)
 * - Javascript URI schemes (e.g., javascript:alert(1))
 * - Control characters / CRLF injection (\r, \n, \t)
 */
export function sanitizeRedirectUrl(
  url: string | null | undefined,
  fallback = '/dashboard'
): string {
  if (!url || typeof url !== 'string') {
    return fallback;
  }

  const trimmed = url.trim();

  // Must begin with a single '/' and cannot begin with '//' or '/\'
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.startsWith('\\')) {
    return fallback;
  }

  // Block CRLF / tab control characters
  if (/[\r\n\t]/.test(trimmed)) {
    return fallback;
  }

  // Block dangerous pseudo-schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('javascript:') ||
    lower.includes('data:') ||
    lower.includes('vbscript:')
  ) {
    return fallback;
  }

  // Check if URL attempts to encode double-slash (e.g., /%2f, /%5c)
  if (lower.startsWith('/%2f') || lower.startsWith('/%5c')) {
    return fallback;
  }

  return trimmed;
}

/**
 * Sanitizes input values when building PostgREST .or() or .filter() query strings.
 * Strips special delimiter characters (commas, parentheses, quotes, colons, percent signs)
 * that could manipulate the PostgREST AST parser and query grouping.
 */
export function sanitizePostgrestFilter(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Strip characters that define PostgREST filter syntax: , ( ) " ' : \
  return input
    .replace(/[,()\\":%']/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Validates username format (alphanumeric and underscores only, 3-30 chars)
 */
export function validateUsername(username: string | null | undefined): { isValid: boolean; error?: string } {
  if (!username) {
    return { isValid: false, error: 'Username is required.' };
  }
  const clean = username.trim();
  if (clean.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long.' };
  }
  if (clean.length > 30) {
    return { isValid: false, error: 'Username cannot exceed 30 characters.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores.' };
  }
  return { isValid: true };
}

/**
 * Validates that an external URL begins with http:// or https:// and has a valid domain
 */
export function isValidHttpUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Verifies that the current request has an authenticated session AND that the account is NOT suspended.
 * If suspended, immediately terminates the session and returns a standardized error.
 */
export async function getAuthenticatedActiveUser(supabase: any): Promise<{
  user: any | null;
  profile: any | null;
  error?: string;
}> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { user: null, profile: null, error: 'Please sign in to continue.' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, display_name, role, is_suspended')
      .eq('id', user.id)
      .single();

    if (profile?.is_suspended) {
      await supabase.auth.signOut();
      return {
        user: null,
        profile: null,
        error: 'Your account has been suspended. Please contact the administrator for assistance.',
      };
    }

    return { user, profile };
  } catch {
    return { user: null, profile: null, error: 'An unexpected authentication error occurred.' };
  }
}

