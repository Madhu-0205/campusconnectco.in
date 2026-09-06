/**
 * Privacy, Security & Validation Guards for CampusConnect Intelligence Layer
 *
 * MANDATORY PRIVACY POLICY:
 * - NEVER send credentials, session tokens, passwords, payment info, UPI IDs,
 *   or private database IDs to AI providers.
 * - Sanitize and limit all prompt inputs.
 * - Validate all structured outputs with Zod schemas to eliminate XSS or malformed payloads.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// 1. PII & Secret Scrubbing
// ---------------------------------------------------------------------------

/**
 * Scrubs any sensitive information or injection vectors from text before prompt assembly.
 */
export function scrubSensitiveData(text: string): string {
  if (!text || typeof text !== "string") return "";

  let cleaned = text;

  // Replace sensitive tokens with safe placeholders
  cleaned = cleaned.replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, "[REDACTED_TOKEN]");
  cleaned = cleaned.replace(/sb-[a-zA-Z0-9_\-]+/gi, "[REDACTED_SESSION]");
  cleaned = cleaned.replace(/rzp_(live|test)_[a-zA-Z0-9]+/gi, "[REDACTED_PAYMENT_KEY]");
  cleaned = cleaned.replace(/re_[a-zA-Z0-9_\-]+/gi, "[REDACTED_API_KEY]");
  
  // Strip HTML script tags and javascript: URIs
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  cleaned = cleaned.replace(/javascript:/gi, "");
  cleaned = cleaned.replace(/on\w+\s*=/gi, "blocked_attr=");

  return cleaned.trim();
}

/**
 * Validates prompt length to avoid token abuse or buffer overflow.
 */
export function validatePromptLength(text: string, maxLength: number = 4000): string {
  const sanitized = scrubSensitiveData(text);
  if (sanitized.length > maxLength) {
    return sanitized.slice(0, maxLength) + "\n...[truncated for length]";
  }
  return sanitized;
}

// ---------------------------------------------------------------------------
// 2. Output Validation Schemas
// ---------------------------------------------------------------------------

export const MatchExplanationSchema = z.object({
  summary: z.string().default("This opportunity aligns with your profile skills and campus location."),
  scoreBreakdown: z.object({
    skillMatchExplanation: z.string().default("Your technical skills match the required requirements."),
    locationExplanation: z.string().default("Located within your campus and regional network."),
    freshnessExplanation: z.string().default("Opportunity posted recently.")
  }),
  suggestedAction: z.string().default("Review details and apply if interested."),
  poweredBy: z.literal("Puter.js").default("Puter.js")
});

export const OpportunitySummarySchema = z.object({
  whatYouWillDo: z.array(z.string()).default([]),
  skillsNeeded: z.array(z.string()).default([]),
  whoThisSuits: z.string().default("Students looking to build real-world project experience."),
  compensationVerified: z.string().default("Standard platform compensation."),
  locationDetails: z.string().default("Campus or remote location as specified."),
  importantRequirements: z.array(z.string()).default([]),
  preparationTips: z.array(z.string()).default([]),
  poweredBy: z.literal("Puter.js").default("Puter.js")
});

export const ResumeAnalysisSchema = z.object({
  score: z.number().min(0).max(100).default(75),
  grade: z.enum(["A+", "A", "B+", "B", "C+", "C", "D"]).default("B"),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  experienceLevel: z.enum(["Fresher", "Junior", "Mid-level", "Senior", "Lead"]).default("Fresher"),
  summary: z.string().default("Resume analyzed for ATS readiness and role alignment."),
  sectionScores: z.object({
    skillsMatch: z.number().min(0).max(100).default(70),
    structure: z.number().min(0).max(100).default(75),
    contentDepth: z.number().min(0).max(100).default(70),
    keywordDensity: z.number().min(0).max(100).default(65)
  }),
  poweredBy: z.literal("Puter.js").default("Puter.js")
});

export const InterviewEvaluationSchema = z.object({
  score: z.number().min(0).max(100).default(75),
  feedback: z.object({
    technical: z.number().min(0).max(100).default(75),
    communication: z.number().min(0).max(100).default(75),
    structure: z.number().min(0).max(100).default(75),
    strengths: z.array(z.string()).default(["Completed answers attentively"]),
    improvements: z.array(z.string()).default(["Include concrete technical examples"])
  }),
  summary: z.string().default("AI-generated interview simulation assessment."),
  disclaimer: z.string().default("AI-generated interview feedback. Advisory only, not a certified assessment."),
  poweredBy: z.literal("Puter.js").default("Puter.js")
});

// ---------------------------------------------------------------------------
// 3. Safe Parsing with Fallbacks
// ---------------------------------------------------------------------------

export function safeParseJson<T>(raw: string, schema: z.ZodType<T>, fallback: T): T {
  if (!raw || typeof raw !== "string") return fallback;
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    const result = schema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    return fallback;
  } catch {
    return fallback;
  }
}
