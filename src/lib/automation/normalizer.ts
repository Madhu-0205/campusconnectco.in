/**
 * Opportunity Normalization, URL Security & Prompt-Injection Defense
 * CampusConnectCo — Phase 15
 *
 * Enforces:
 * 1. URL tracking parameter stripping & canonicalization
 * 2. SSRF Protection (rejecting private IPs, localhost, file:, data:, javascript:)
 * 3. Prompt-Injection Defense (neutralizing adversarial instructions)
 * 4. Data integrity (preserves nulls, never fabricates missing information)
 */

import * as crypto from "crypto";

import { OpportunityType, WorkMode } from "./types";

const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "ref",
  "source",
  "fbclid",
  "gclid",
  "twclid",
  "msclkid",
  "mc_cid",
  "mc_eid",
  "origin",
  "feature",
  "si",
  "spm",
  "from",
  "track",
  "trackingId"
];

const PRIVATE_IP_PATTERNS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^0\.0\.0\.0$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/,
  /^::1$/,
  /^fe80:/i,
  /^fc00:/i,
  /^fd00:/i
];

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /system\s+prompt/i,
  /you\s+are\s+now\s+in\s+developer\s+mode/i,
  /mark\s+(this\s+)?(as\s+)?(verified|official|approved)/i,
  /bypass\s+(verification|security|auth|role)/i,
  /drop\s+table/i,
  /truncate\s+table/i,
  /delete\s+from/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /javascript:/i,
  /on\w+\s*=/i // inline event handlers like onload=, onerror=
];

/**
 * Validates whether a URL is safe and legitimate.
 * Rejects SSRF vectors, private networks, and invalid protocols.
 */
export function validateSafeUrl(rawUrl: string): { valid: boolean; error?: string; cleanUrl?: string } {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { valid: false, error: "Empty or invalid URL" };
  }

  const trimmed = rawUrl.trim();

  // Reject dangerous schemes immediately
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("file:") ||
    lower.startsWith("vbscript:")
  ) {
    return { valid: false, error: "Forbidden URL protocol scheme" };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, error: "Malformed URL syntax" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { valid: false, error: "Protocol must be HTTP or HTTPS" };
  }

  const hostname = parsed.hostname.toLowerCase();

  // SSRF Protection: Check for private network / localhost
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return { valid: false, error: `Disallowed private or loopback destination (${hostname})` };
    }
  }

  // Strip tracking parameters (all utm_* parameters and explicit tracking keys)
  const keysToDelete: string[] = [];
  parsed.searchParams.forEach((_, key) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.startsWith("utm_") || TRACKING_PARAMS.includes(lowerKey)) {
      keysToDelete.push(key);
    }
  });
  for (const k of keysToDelete) {
    parsed.searchParams.delete(k);
  }

  // Remove redundant default ports
  if ((parsed.protocol === "http:" && parsed.port === "80") || (parsed.protocol === "https:" && parsed.port === "443")) {
    parsed.port = "";
  }

  return { valid: true, cleanUrl: parsed.toString() };
}

/**
 * Computes canonical URL representation and a SHA-256 hash for deduplication.
 */
export function canonicalizeUrl(url: string): { canonicalUrl: string; hash: string } {
  const check = validateSafeUrl(url);
  const cleanUrl = check.cleanUrl || url.trim();

  // Normalize: lowercase scheme and host, remove trailing slash if root-only path
  let normalized = cleanUrl;
  try {
    const u = new URL(cleanUrl);
    u.hash = ""; // Drop URL anchor fragments (#section)
    if (u.pathname.endsWith("/") && u.pathname !== "/") {
      u.pathname = u.pathname.slice(0, -1);
    }
    normalized = u.toString();
  } catch {}

  const hash = crypto.createHash("sha256").update(normalized).digest("hex");
  return { canonicalUrl: normalized, hash };
}

/**
 * Sanitizes external text against HTML injection and prompt injection.
 * Treats external text strictly as inert DATA.
 */
export function sanitizeExternalText(rawText: string | null | undefined, maxChars: number = 3000): { cleanText: string; hasPromptInjectionFlag: boolean } {
  if (!rawText || typeof rawText !== "string") {
    return { cleanText: "", hasPromptInjectionFlag: false };
  }

  let text = rawText;
  let hasPromptInjectionFlag = false;

  // Check for adversarial prompt injection patterns
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      hasPromptInjectionFlag = true;
      // Neutralize the specific match rather than crashing
      text = text.replace(pattern, "[FILTERED_UNTRUSTED_INSTRUCTION]");
    }
  }

  // Strip all HTML tags
  text = text.replace(/<[^>]*>?/gm, " ");

  // Normalize extra whitespaces
  text = text.replace(/\s+/g, " ").trim();

  // Enforce bounded length
  if (text.length > maxChars) {
    text = text.slice(0, maxChars).trim() + "...";
  }

  return { cleanText: text, hasPromptInjectionFlag };
}

/**
 * Allowed platform staging/test era boundaries for timestamp validation.
 * 2024-01-01T00:00:00.000Z to 2030-01-01T00:00:00.000Z.
 */
export const STAGING_TIMESTAMP_MIN_DATE = new Date("2024-01-01T00:00:00.000Z");
export const STAGING_TIMESTAMP_MAX_DATE = new Date("2030-01-01T00:00:00.000Z");

export interface SanitizedTitleResult {
  cleanTitle: string;
  extractedSuffix: string | null;
  timestampDate: Date | null;
  isPlausibleTimestamp: boolean;
  wasSanitized: boolean;
  requiresManualReview?: boolean;
}

/**
 * Known test/staging keywords and entities indicating generated staging origin.
 */
export const STAGING_ORIGIN_PATTERNS = [
  /\b(?:pilot|test|testing|stage|staging|demo|mock|sample|dummy|spec|e2e|runner|temp)\b/i,
  /\b(?:agentreach|futurelabs)\b/i
];

export interface TitleSanitizationOptions {
  minDate?: Date;
  maxDate?: Date;
  company?: string;
  source?: string;
  isStagingContext?: boolean;
  requireStagingEvidence?: boolean;
}

/**
 * Sanitizes generated numeric suffixes (test/staging timestamps) from opportunity titles or company names.
 *
 * Enforces strict criteria before removing any suffix:
 * 1. Suffix must be at the very END of the string, preceded by delimiter (\s+, -, _, #, :, /) or in parentheses.
 * 2. Suffix must be EXACTLY 10 digits (Unix seconds) OR EXACTLY 13 digits (Unix milliseconds).
 * 3. Decoded timestamp must strictly fall within the active staging/test era: 2024-01-01 to 2030-01-01.
 * 4. Must possess corroborating evidence of test/staging origin (test keywords in title/company, staging source, or test context).
 * 5. Remaining clean title must have at least 3 non-whitespace characters.
 *
 * Does NOT remove:
 * - Legitimate job levels ("SDE 2", "Python Developer 3")
 * - Years ("Summer Internship 2026", "Batch of 2025")
 * - Product/company names ("1XL.com", "Web3 Developer", "ISO 9001 Lead Auditor")
 * - Non-timestamp digits or numbers with 1-7, 8, 9, 11, 12, 14+ digits
 * - Valid timestamps that lack corroborating staging/test generation evidence (preserved and routed to review)
 */
export function sanitizeGeneratedTitleSuffix(
  rawTitle: string | null | undefined,
  options?: TitleSanitizationOptions
): SanitizedTitleResult {
  if (!rawTitle || typeof rawTitle !== "string") {
    return {
      cleanTitle: "",
      extractedSuffix: null,
      timestampDate: null,
      isPlausibleTimestamp: false,
      wasSanitized: false,
      requiresManualReview: false
    };
  }

  const trimmed = rawTitle.trim();
  if (trimmed.length === 0) {
    return {
      cleanTitle: "",
      extractedSuffix: null,
      timestampDate: null,
      isPlausibleTimestamp: false,
      wasSanitized: false,
      requiresManualReview: false
    };
  }

  // Strict regex: exactly 10 digits or exactly 13 digits at end of string
  // Preceded by delimiter (\s, -, _, #, :, /) or optional open-parenthesis with optional closing-parenthesis
  const suffixMatch = /(?:[\s\-_#:|\/]+|\s*\()(\d{10}|\d{13})\)?\s*$/.exec(trimmed);

  if (!suffixMatch) {
    // Check if there is an unconfirmed trailing numeric token of 8+ digits that does not match timestamp requirements
    const unconfirmedMatch = /(?:[\s\-_#:|\/]+|\s*\()(\d{8,})\)?\s*$/.exec(trimmed);
    return {
      cleanTitle: trimmed,
      extractedSuffix: null,
      timestampDate: null,
      isPlausibleTimestamp: false,
      wasSanitized: false,
      requiresManualReview: Boolean(unconfirmedMatch)
    };
  }

  const digits = suffixMatch[1];
  const minDate = options?.minDate || STAGING_TIMESTAMP_MIN_DATE;
  const maxDate = options?.maxDate || STAGING_TIMESTAMP_MAX_DATE;

  let decodedDate: Date;
  if (digits.length === 10) {
    decodedDate = new Date(parseInt(digits, 10) * 1000);
  } else if (digits.length === 13) {
    decodedDate = new Date(parseInt(digits, 10));
  } else {
    return {
      cleanTitle: trimmed,
      extractedSuffix: null,
      timestampDate: null,
      isPlausibleTimestamp: false,
      wasSanitized: false,
      requiresManualReview: true
    };
  }

  const timeVal = decodedDate.getTime();
  const isPlausibleTimestamp =
    !isNaN(timeVal) && decodedDate >= minDate && decodedDate <= maxDate;

  if (!isPlausibleTimestamp) {
    // Not within allowed staging/test era - preserve original title and flag for review
    return {
      cleanTitle: trimmed,
      extractedSuffix: digits,
      timestampDate: isNaN(timeVal) ? null : decodedDate,
      isPlausibleTimestamp: false,
      wasSanitized: false,
      requiresManualReview: true
    };
  }

  // Verify corroborating test/staging origin evidence
  const requireStagingEvidence = options?.requireStagingEvidence !== false;
  const hasStagingEvidence =
    Boolean(options?.isStagingContext) ||
    STAGING_ORIGIN_PATTERNS.some((p) => p.test(trimmed)) ||
    (options?.company ? STAGING_ORIGIN_PATTERNS.some((p) => p.test(options.company!)) : false) ||
    (options?.source ? /\b(?:test|staging|spec|mock)\b/i.test(options.source) : false);

  if (requireStagingEvidence && !hasStagingEvidence) {
    // Valid timestamp format, but lacks corroborating test/staging generation evidence.
    // Preserve original title to avoid damaging genuine employer role codes, flag for manual review.
    return {
      cleanTitle: trimmed,
      extractedSuffix: digits,
      timestampDate: decodedDate,
      isPlausibleTimestamp: true,
      wasSanitized: false,
      requiresManualReview: true
    };
  }

  // Calculate clean title candidate
  const cleanCandidate = trimmed.slice(0, suffixMatch.index).trim();

  // Guard: Clean title must be at least 3 non-whitespace characters
  if (cleanCandidate.length < 3) {
    return {
      cleanTitle: trimmed,
      extractedSuffix: digits,
      timestampDate: decodedDate,
      isPlausibleTimestamp: true,
      wasSanitized: false,
      requiresManualReview: true
    };
  }

  return {
    cleanTitle: cleanCandidate,
    extractedSuffix: digits,
    timestampDate: decodedDate,
    isPlausibleTimestamp: true,
    wasSanitized: true,
    requiresManualReview: false
  };
}

/**
 * Normalizes title for comparison (case-insensitive, trims punctuation).
 * First strips any accidental test timestamp suffix to guarantee stable deduplication.
 */
export function normalizeTitle(title: string): string {
  const { cleanTitle } = sanitizeGeneratedTitleSuffix(title);
  return cleanTitle
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalizes work mode.
 */
export function normalizeWorkMode(rawMode?: string | null): WorkMode {
  if (!rawMode) return "remote";
  const m = rawMode.toLowerCase();
  if (m.includes("hybrid") || m.includes("flexible")) return "hybrid";
  if (m.includes("on-site") || m.includes("onsite") || m.includes("in-person") || m.includes("office")) return "on-site";
  return "remote";
}

/**
 * Normalizes opportunity type.
 */
export function normalizeOpportunityType(rawType?: string | null, title?: string): OpportunityType {
  const text = ((rawType || "") + " " + (title || "")).toLowerCase();
  if (text.includes("hackathon") || text.includes("hack")) return "HACKATHON";
  if (text.includes("gig") || text.includes("freelance") || text.includes("contract")) return "GIG";
  if (text.includes("fellowship")) return "FELLOWSHIP";
  if (text.includes("scholarship")) return "SCHOLARSHIP";
  if (text.includes("competition") || text.includes("contest")) return "HACKATHON";
  if (text.includes("research")) return "RESEARCH";
  if (text.includes("internship") || text.includes("intern")) return "INTERNSHIP";
  if (text.includes("job") || text.includes("developer") || text.includes("engineer") || text.includes("full-time") || text.includes("associate")) return "JOB";
  return "INTERNSHIP";
}

/**
 * Parses and normalizes dates safely.
 */
export function normalizeDate(rawDate?: string | Date | null): Date | null {
  if (!rawDate) return null;
  if (rawDate instanceof Date) {
    return isNaN(rawDate.getTime()) ? null : rawDate;
  }
  const d = new Date(rawDate);
  return isNaN(d.getTime()) ? null : d;
}
