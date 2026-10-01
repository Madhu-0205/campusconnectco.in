/**
 * Web Tools for AI Agents
 *
 * Implements strict SSRF protection, URL safety checks, and untrusted content sanitization.
 * Reuses existing CampusConnectCo normalization & security layer.
 */

import { canonicalizeUrl, sanitizeExternalText, validateSafeUrl } from "@/lib/automation/normalizer";
import { ToolExecutionError } from "../core/errors";

export interface UrlCheckResult {
  valid: boolean;
  canonicalUrl: string;
  hash: string;
  error?: string;
  isPrivateOrLocal: boolean;
}

export interface WebPageContentResult {
  url: string;
  status: number;
  title: string | null;
  textContent: string;
  hasPromptInjectionFlag: boolean;
  contentLength: number;
}

/**
 * Validates a destination URL against SSRF and syntax rules.
 */
export async function checkUrlTool(rawUrl: string): Promise<UrlCheckResult> {
  if (!rawUrl || typeof rawUrl !== "string") {
    return {
      valid: false,
      canonicalUrl: "",
      hash: "",
      error: "URL is empty or not a string",
      isPrivateOrLocal: false
    };
  }

  const safetyCheck = validateSafeUrl(rawUrl);
  if (!safetyCheck.valid) {
    const isPrivate = safetyCheck.error?.includes("private or loopback") || false;
    return {
      valid: false,
      canonicalUrl: "",
      hash: "",
      error: safetyCheck.error,
      isPrivateOrLocal: isPrivate
    };
  }

  const { canonicalUrl, hash } = canonicalizeUrl(safetyCheck.cleanUrl || rawUrl);
  return {
    valid: true,
    canonicalUrl,
    hash,
    isPrivateOrLocal: false
  };
}

/**
 * Safely fetches a public web page with strict SSRF guard, timeout, and content sanitization.
 * Web content is treated strictly as UNTRUSTED DATA.
 */
export async function fetchPageTool(
  rawUrl: string,
  options?: { timeoutMs?: number; maxBytes?: number }
): Promise<WebPageContentResult> {
  let currentUrl = rawUrl;
  const timeoutMs = options?.timeoutMs || 6000;
  const maxBytes = options?.maxBytes || 200_000; // 200KB max to prevent memory exhaustion
  const maxRedirects = 3;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response: Response | null = null;
    let finalUrl = "";

    for (let hop = 0; hop <= maxRedirects; hop++) {
      const check = await checkUrlTool(currentUrl);
      if (!check.valid) {
        throw new ToolExecutionError("web.fetchPage", check.error || "Blocked unsafe URL destination");
      }
      finalUrl = check.canonicalUrl;

      response = await fetch(finalUrl, {
        method: "GET",
        signal: controller.signal,
        headers: {
          "User-Agent": "CampusConnectCo-Agent/1.0 (+https://campusconnectco.in)",
          Accept: "text/html,application/xhtml+xml,application/json"
        },
        redirect: "manual"
      });

      // Handle HTTP redirects (301, 302, 303, 307, 308)
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const locationHeader = response.headers.get("location");
        if (!locationHeader) {
          break; // Redirect with no location header
        }

        if (hop === maxRedirects) {
          throw new ToolExecutionError("web.fetchPage", "Exceeded maximum redirect hops (3)");
        }

        // Resolve relative redirects against current URL
        try {
          const resolvedNext = new URL(locationHeader, finalUrl).toString();
          currentUrl = resolvedNext;
          continue;
        } catch {
          throw new ToolExecutionError("web.fetchPage", `Invalid redirect URL in Location header: ${locationHeader}`);
        }
      }

      // Not a redirect; break loop to consume response
      break;
    }

    if (!response) {
      throw new ToolExecutionError("web.fetchPage", "No response received");
    }

    if (!response.ok) {
      return {
        url: finalUrl,
        status: response.status,
        title: null,
        textContent: `[HTTP Error ${response.status}]`,
        hasPromptInjectionFlag: false,
        contentLength: 0
      };
    }

    const rawBuffer = await response.arrayBuffer();
    const slicedBuffer = rawBuffer.slice(0, maxBytes);
    const htmlText = new TextDecoder("utf-8").decode(slicedBuffer);

    // Extract title if HTML
    let title: string | null = null;
    const titleMatch = htmlText.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
    }

    // Sanitize text and neutralize prompt injections
    const { cleanText, hasPromptInjectionFlag } = sanitizeExternalText(htmlText, 4000);

    return {
      url: finalUrl,
      status: response.status,
      title,
      textContent: cleanText,
      hasPromptInjectionFlag,
      contentLength: cleanText.length
    };
  } catch (err: any) {
    const isAbort = err?.name === "AbortError" || String(err?.message).toLowerCase().includes("abort");
    if (isAbort) {
      throw new ToolExecutionError("web.fetchPage", `Request timed out after ${timeoutMs}ms`);
    }
    throw new ToolExecutionError("web.fetchPage", err instanceof Error ? err.message : String(err));
  } finally {
    clearTimeout(timeoutId);
  }
}
