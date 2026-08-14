export interface NormalizedUrlResult {
  isValid: boolean;
  rawUrl: string;
  normalizedUrl: string;
  canonicalDomain: string;
  displayUrl: string;
  error?: string;
}

/**
 * Normalizes a website URL by:
 * 1. Adding https:// if missing
 * 2. Lowercasing hostname
 * 3. Removing www.
 * 4. Removing tracking params (utm_*, ref, gclid, etc.)
 * 5. Removing hash fragments
 * 6. Stripping trailing slashes
 */
export function normalizeToolUrl(inputUrl: string): NormalizedUrlResult {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return {
      isValid: false,
      rawUrl: inputUrl || '',
      normalizedUrl: '',
      canonicalDomain: '',
      displayUrl: '',
      error: 'URL cannot be empty',
    };
  }

  let raw = inputUrl.trim();

  // Prepend https:// if protocol is missing
  if (!/^https?:\/\//i.test(raw)) {
    raw = `https://${raw}`;
  }

  try {
    const parsed = new URL(raw);

    // Hostname normalization: lowercase and remove leading www.
    let hostname = parsed.hostname.toLowerCase();
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }

    // Filter out marketing/tracking query parameters
    const trackingParams = new Set([
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'ref',
      'ref_src',
      'source',
      'fbclid',
      'gclid',
      'gad_source',
      'mc_cid',
      'mc_eid',
    ]);

    const cleanSearchParams = new URLSearchParams();
    parsed.searchParams.forEach((val, key) => {
      if (!trackingParams.has(key.toLowerCase()) && !key.toLowerCase().startsWith('utm_')) {
        cleanSearchParams.set(key, val);
      }
    });

    const searchString = cleanSearchParams.toString();
    const searchPart = searchString ? `?${searchString}` : '';

    // Pathname normalization: strip trailing slash unless it's root '/'
    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    if (pathname === '/') {
      pathname = '';
    }

    const normalizedUrl = `https://${hostname}${pathname}${searchPart}`;
    const canonicalDomain = hostname;
    const displayUrl = `${hostname}${pathname}`;

    return {
      isValid: true,
      rawUrl: inputUrl,
      normalizedUrl,
      canonicalDomain,
      displayUrl,
    };
  } catch (err: any) {
    return {
      isValid: false,
      rawUrl: inputUrl,
      normalizedUrl: '',
      canonicalDomain: '',
      displayUrl: '',
      error: 'Please enter a valid website URL',
    };
  }
}
