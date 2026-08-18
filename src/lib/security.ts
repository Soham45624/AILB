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
