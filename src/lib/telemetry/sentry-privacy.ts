/**
 * Sentry Privacy & Data Redaction Sanitizer
 * 
 * Enforces strict compliance with privacy safeguards:
 * - Redacts sensitive URL query parameters (tokens, passwords, secrets, emails).
 * - Strips authentication headers, cookies, and bearer tokens.
 * - Recursively redacts sensitive payload keys in request bodies (objects and serialized JSON).
 * - Recursively redacts sensitive keys in Sentry event extra / context metadata.
 * - Sanitizes or drops sensitive breadcrumbs (e.g. ui.input).
 */

export const SENSITIVE_PARAM_KEYS = [
  'token',
  'access_token',
  'refresh_token',
  'id_token',
  'code',
  'password',
  'pass',
  'key',
  'apikey',
  'api_key',
  'secret',
  'client_secret',
  'email',
  'state',
  'auth',
];

export const SENSITIVE_HEADER_KEYS = [
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
  'x-supabase-auth',
  'x-api-key',
  'x-auth-token',
  'x-access-token',
];

export const SENSITIVE_BODY_KEYS = [
  'password',
  'token',
  'access_token',
  'refresh_token',
  'secret',
  'client_secret',
  'accnumber',
  'ifsccode',
  'upiid',
  'code',
  'apikey',
  'key',
  'cvv',
  'cardnumber',
  'pin',
  'ssn',
  'aadhaar',
  'email',
];

/**
 * Scrubs sensitive query parameters from a URL string.
 */
export function scrubUrlString(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl, 'http://localhost');
    let modified = false;

    for (const key of Array.from(parsed.searchParams.keys())) {
      if (SENSITIVE_PARAM_KEYS.includes(key.toLowerCase())) {
        parsed.searchParams.set(key, '[REDACTED]');
        modified = true;
      }
    }

    if (!modified) return rawUrl;

    // If original URL was relative, return relative path + query + hash
    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      return parsed.pathname + (parsed.search ? parsed.search : '') + (parsed.hash ? parsed.hash : '');
    }

    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

/**
 * Recursively redacts sensitive keys in an object or array.
 */
export function scrubObjectRecursively(target: any, depth = 0): void {
  if (!target || typeof target !== 'object' || depth > 10) return;

  if (Array.isArray(target)) {
    for (let i = 0; i < target.length; i++) {
      if (typeof target[i] === 'object' && target[i] !== null) {
        scrubObjectRecursively(target[i], depth + 1);
      }
    }
    return;
  }

  for (const key of Object.keys(target)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_BODY_KEYS.some((sensitive) => lowerKey.includes(sensitive));
    if (isSensitive) {
      target[key] = '[REDACTED]';
    } else if (typeof target[key] === 'object' && target[key] !== null) {
      scrubObjectRecursively(target[key], depth + 1);
    }
  }
}

/**
 * Sanitizes a Sentry Breadcrumb before it is recorded.
 */
export function sanitizeSentryBreadcrumb(breadcrumb: any): any {
  if (!breadcrumb) return null;

  // Drop user typing / form input breadcrumbs to prevent capturing keystrokes
  if (breadcrumb.category === 'ui.input') {
    return null;
  }

  // Scrub URL in breadcrumb data
  if (breadcrumb.data?.url && typeof breadcrumb.data.url === 'string') {
    breadcrumb.data.url = scrubUrlString(breadcrumb.data.url);
  }

  // Scrub data payload
  if (breadcrumb.data && typeof breadcrumb.data === 'object') {
    scrubObjectRecursively(breadcrumb.data);
  }

  return breadcrumb;
}

/**
 * Sanitizes a Sentry Event before transmission.
 */
export function sanitizeSentryEvent(event: any): any {
  if (!event) return event;

  // 1. Scrub Request Headers
  if (event.request?.headers) {
    for (const headerKey of Object.keys(event.request.headers)) {
      if (SENSITIVE_HEADER_KEYS.includes(headerKey.toLowerCase())) {
        delete event.request.headers[headerKey];
      }
    }
  }

  // 2. Scrub Request URL
  if (event.request?.url && typeof event.request.url === 'string') {
    event.request.url = scrubUrlString(event.request.url);
  }

  // 3. Scrub Request Data / Body (Object or Serialized JSON)
  if (event.request?.data) {
    if (typeof event.request.data === 'string') {
      try {
        const parsed = JSON.parse(event.request.data);
        scrubObjectRecursively(parsed);
        event.request.data = JSON.stringify(parsed);
      } catch {
        // Not JSON string; redact if it contains sensitive keyword markers
        for (const sensitive of SENSITIVE_BODY_KEYS) {
          if (event.request.data.toLowerCase().includes(sensitive)) {
            event.request.data = '[REDACTED_SENSITIVE_BODY]';
            break;
          }
        }
      }
    } else if (typeof event.request.data === 'object') {
      scrubObjectRecursively(event.request.data);
    }
  }

  // 4. Scrub Extra Metadata
  if (event.extra && typeof event.extra === 'object') {
    scrubObjectRecursively(event.extra);
  }

  // 5. Scrub Contexts
  if (event.contexts && typeof event.contexts === 'object') {
    scrubObjectRecursively(event.contexts);
  }

  // 6. Scrub Breadcrumbs attached to Event
  if (Array.isArray(event.breadcrumbs)) {
    event.breadcrumbs = event.breadcrumbs
      .map(sanitizeSentryBreadcrumb)
      .filter((b: any) => b !== null);
  }

  return event;
}
