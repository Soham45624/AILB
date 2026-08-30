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

import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'ailib_session_id';
export const MAX_CONCURRENT_DEVICES = 3;
export const ROLLING_INACTIVITY_LIMIT_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generates a SHA-256 hash of a session token for secure database storage.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Creates a new active session for a user, enforcing the 3-device concurrent login limit.
 * If 3 devices are already active within the last 24h, blocks session creation.
 */
export async function createActiveSession(
  supabase: any,
  userId: string,
  userAgent?: string | null
): Promise<{
  success: boolean;
  sessionToken?: string;
  error?: string;
}> {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - ROLLING_INACTIVITY_LIMIT_MS).toISOString();

    // 1. Fetch currently active, unrevoked sessions within the rolling 24-hour window
    const { data: activeSessions, error: countError } = await supabase
      .from('user_sessions')
      .select('id, last_active_at')
      .eq('user_id', userId)
      .eq('is_revoked', false)
      .gte('last_active_at', twentyFourHoursAgo);

    if (countError) {
      console.warn('user_sessions table query error (table may need migration):', countError);
    }

    // 2. Enforce 3-device limit
    if (activeSessions && activeSessions.length >= MAX_CONCURRENT_DEVICES) {
      return {
        success: false,
        error:
          'You have reached the maximum limit of 3 active devices. To sign in on this device, please log out from one of your previous devices.',
      };
    }

    // 3. Generate 256-bit cryptographically secure token
    const sessionToken = crypto.randomUUID() + '-' + crypto.randomBytes(16).toString('hex');
    const tokenHash = hashSessionToken(sessionToken);

    // 4. Save session record with SHA-256 hash
    await supabase.from('user_sessions').insert({
      user_id: userId,
      session_token_hash: tokenHash,
      user_agent: userAgent ? userAgent.substring(0, 500) : null,
      last_active_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      is_revoked: false,
    });

    return { success: true, sessionToken };
  } catch (err: any) {
    console.error('Exception creating active session:', err);
    return { success: false, error: err.message || 'Failed to establish active device session.' };
  }
}

/**
 * Revokes a specific session (single-device logout).
 */
export async function revokeActiveSession(supabase: any, sessionToken: string): Promise<void> {
  if (!sessionToken) return;
  try {
    const tokenHash = hashSessionToken(sessionToken);
    await supabase
      .from('user_sessions')
      .update({ is_revoked: true, updated_at: new Date().toISOString() })
      .eq('session_token_hash', tokenHash);
  } catch (err) {
    console.error('Error revoking session:', err);
  }
}

/**
 * Verifies that the current request has an authenticated session, that the account is NOT suspended,
 * and that the rolling 24-hour Session ID is valid and active.
 *
 * - Resets the 24-hour inactivity timer on active usage (sliding window).
 * - Expires and signs out if idle for > 24 hours.
 */
export async function getAuthenticatedActiveUser(
  supabase: any,
  cookieToken?: string | null
): Promise<{
  user: any | null;
  profile: any | null;
  sessionToken?: string | null;
  error?: string;
  isExpired?: boolean;
}> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { user: null, profile: null, error: 'Please sign in to continue.' };
    }

    // Check account suspension status
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

    // If session token cookie is provided, validate rolling 24-hour activity
    if (cookieToken) {
      const tokenHash = hashSessionToken(cookieToken);
      const { data: session } = await supabase
        .from('user_sessions')
        .select('id, user_id, last_active_at, is_revoked')
        .eq('session_token_hash', tokenHash)
        .maybeSingle();

      if (session) {
        if (session.is_revoked) {
          await supabase.auth.signOut();
          return {
            user: null,
            profile: null,
            isExpired: true,
            error: 'Your session has been signed out on this device. Please sign in again.',
          };
        }

        const lastActiveMs = new Date(session.last_active_at).getTime();
        const nowMs = Date.now();

        // Expired after 24 hours of continuous inactivity
        if (nowMs - lastActiveMs > ROLLING_INACTIVITY_LIMIT_MS) {
          await supabase
            .from('user_sessions')
            .update({ is_revoked: true })
            .eq('id', session.id);
          await supabase.auth.signOut();

          return {
            user: null,
            profile: null,
            isExpired: true,
            error: 'Your session has expired due to 24 hours of inactivity. Please sign in again.',
          };
        }

        // Active within 24h -> Slide rolling window forward
        await supabase
          .from('user_sessions')
          .update({ last_active_at: new Date().toISOString() })
          .eq('id', session.id);
      }
    }

    return { user, profile, sessionToken: cookieToken };
  } catch (err: any) {
    return { user: null, profile: null, error: err?.message || 'An unexpected authentication error occurred.' };
  }
}

