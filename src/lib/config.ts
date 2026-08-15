/**
 * Resolves the application's base URL dynamically.
 * Works seamlessly across:
 * 1. Local development (http://localhost:3000)
 * 2. Vercel Preview Deployments (https://*.vercel.app)
 * 3. Vercel Production Deployment
 * 4. Explicitly configured NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_APP_URL
 *
 * Guarantees to return a valid, absolute URL to prevent build-time crashes.
 */
export function getBaseUrl(): string {
  const tryParseUrl = (input: string | undefined): string | null => {
    if (!input) return null;
    let trimmed = input.trim();
    if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;

    // Ensure absolute protocol is present
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      // Vercel deployment URLs are always https
      trimmed = `https://${trimmed}`;
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol && parsed.hostname) {
        return parsed.toString();
      }
    } catch {
      // Invalid URL format
    }
    return null;
  };

  // 1. Try explicit URLs
  let resolved = 
    tryParseUrl(process.env.NEXT_PUBLIC_SITE_URL) || 
    tryParseUrl(process.env.NEXT_PUBLIC_APP_URL);

  // 2. Try Vercel environment variables
  if (!resolved) {
    resolved = 
      tryParseUrl(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL) || 
      tryParseUrl(process.env.NEXT_PUBLIC_VERCEL_URL) || 
      tryParseUrl(process.env.VERCEL_URL);
  }

  // 3. Fallback to localhost during development
  if (!resolved) {
    return 'http://localhost:3000';
  }

  // Strip trailing slash if present
  if (resolved.endsWith('/')) {
    resolved = resolved.slice(0, -1);
  }

  return resolved;
}

export const baseUrl = getBaseUrl();
