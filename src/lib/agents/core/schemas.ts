/**
 * Strict Zod Validation Schemas for AI Agent Outputs
 *
 * Invariant: Never trust raw LLM output. All agent JSON completions MUST pass
 * schema validation before being processed or persisted.
 */

import { z } from "zod";

export const OpportunityIntelligenceSchema = z.object({
  title: z.string().min(1).default("Opportunity"),
  organization: z.string().min(1).default("Organization"),
  opportunityType: z
    .enum([
      "INTERNSHIP",
      "JOB",
      "GIG",
      "HACKATHON",
      "FELLOWSHIP",
      "SCHOLARSHIP",
      "RESEARCH",
      "APPRENTICESHIP",
      "EVENT",
      "OTHER"
    ])
    .default("INTERNSHIP"),
  subtypes: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  eligibility: z
    .object({
      degrees: z.array(z.string()).default([]),
      branches: z.array(z.string()).default([]),
      graduationYears: z.array(z.number()).default([]),
      minGpa: z.number().nullable().default(null),
      rawText: z.string().nullable().default(null)
    })
    .default({ degrees: [], branches: [], graduationYears: [], minGpa: null, rawText: null }),
  experienceRequirements: z.string().nullable().default(null),
  location: z
    .object({
      city: z.string().nullable().default(null),
      state: z.string().nullable().default(null),
      country: z.string().nullable().default(null),
      isRemote: z.boolean().default(false)
    })
    .default({ city: null, state: null, country: null, isRemote: false }),
  workMode: z.enum(["remote", "hybrid", "on-site"]).default("remote"),
  compensation: z
    .object({
      stipend: z.number().nullable().default(null),
      currency: z.string().nullable().default(null),
      interval: z.enum(["monthly", "lump-sum", "weekly", "hourly"]).nullable().default(null),
      isUnpaid: z.boolean().default(false),
      rawText: z.string().nullable().default(null)
    })
    .default({ stipend: null, currency: null, interval: null, isUnpaid: false, rawText: null }),
  deadline: z.string().nullable().default(null),
  duration: z.string().nullable().default(null),
  applicationRequirements: z
    .object({
      requiresResume: z.boolean().default(true),
      requiresCoverLetter: z.boolean().default(false),
      requiresPortfolio: z.boolean().default(false),
      requiresGithub: z.boolean().default(false),
      applicationLink: z.string().nullable().default(null),
      otherRequirements: z.array(z.string()).default([])
    })
    .default({
      requiresResume: true,
      requiresCoverLetter: false,
      requiresPortfolio: false,
      requiresGithub: false,
      applicationLink: null,
      otherRequirements: []
    }),
  summary: z.string().default(""),
  extractedConfidence: z.number().min(0).max(1).default(0.7)
});

export const VerificationDecisionSchema = z.object({
  sourceTrust: z.enum(["UNKNOWN", "LOW", "MEDIUM", "HIGH"]).default("UNKNOWN"),
  opportunityAuthenticity: z.enum(["UNVERIFIED", "VERIFIED", "DISPUTED"]).default("UNVERIFIED"),
  applicationDestination: z.enum(["UNVERIFIED", "VERIFIED", "INVALID"]).default("UNVERIFIED"),
  overallVerified: z.boolean().default(false),
  confidenceScore: z.number().min(0).max(1).default(0.5),
  primaryEvidence: z.array(z.string()).default([]),
  disputeReasons: z.array(z.string()).optional(),
  destinationRiskFlags: z.array(z.string()).optional()
});

export const MatchDecisionSchema = z.object({
  matchScore: z.number().min(0).max(100).default(50),
  isEligible: z.boolean().default(true),
  matchReasons: z.array(z.string()).default([]),
  unmetRequirements: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  factors: z
    .object({
      skillScore: z.number().min(0).max(50).default(25),
      branchScore: z.number().min(0).max(20).default(10),
      workModeScore: z.number().min(0).max(15).default(10),
      locationScore: z.number().min(0).max(10).default(5),
      experienceScore: z.number().min(0).max(5).default(0)
    })
    .default({
      skillScore: 25,
      branchScore: 10,
      workModeScore: 10,
      locationScore: 5,
      experienceScore: 0
    }),
  summaryExplanation: z.string().default("")
});
