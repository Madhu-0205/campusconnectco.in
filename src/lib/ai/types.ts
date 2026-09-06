/**
 * TypeScript Interfaces for CampusConnect Intelligence Layer (Puter.js)
 *
 * SCOPE & BOUNDARIES:
 * - Puter.js is strictly an advisory/intelligence layer.
 * - Authoritative marketplace data, user identities, roles, and deterministic
 *   recommendation rankings originate solely from PostgreSQL & Prisma.
 */

export interface AIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CopilotContextData {
  user: {
    id: string;
    name?: string | null;
    branch?: string | null;
    year?: string | null;
    skills?: string | null;
    careerGoal?: string | null;
    collegeName?: string | null;
  };
  topRecommendations?: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    compensation?: string;
    matchScore: number;
    badges: string[];
    type: "gig" | "internship";
  }>;
}

export interface MatchExplanationInput {
  opportunityTitle: string;
  opportunityType: "gig" | "internship";
  companyName: string;
  deterministicScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  locationContext: {
    isNearby: boolean;
    distanceKm?: number | null;
    collegeName?: string | null;
    isRemote: boolean;
  };
  freshnessDays: number;
}

export interface MatchExplanationOutput {
  summary: string;
  scoreBreakdown: {
    skillMatchExplanation: string;
    locationExplanation: string;
    freshnessExplanation: string;
  };
  suggestedAction: string;
  poweredBy: "Puter.js";
}

export interface OpportunitySummaryInput {
  title: string;
  company: string;
  description: string;
  tags: string[];
  compensation?: string;
  location: string;
  deadline?: string | null;
  type: "gig" | "internship";
}

export interface OpportunitySummaryOutput {
  whatYouWillDo: string[];
  skillsNeeded: string[];
  whoThisSuits: string;
  compensationVerified: string;
  locationDetails: string;
  importantRequirements: string[];
  preparationTips: string[];
  poweredBy: "Puter.js";
}

export interface ResumeAnalysisOutput {
  score: number;
  grade: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D";
  strengths: string[];
  weaknesses: string[];
  skills: string[];
  missingSkills: string[];
  suggestions: string[];
  keywords: string[];
  experienceLevel: "Fresher" | "Junior" | "Mid-level" | "Senior" | "Lead";
  summary: string;
  sectionScores: {
    skillsMatch: number;
    structure: number;
    contentDepth: number;
    keywordDensity: number;
  };
  poweredBy: "Puter.js";
}

export interface InterviewQuestionInput {
  roleTitle: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  chatHistory: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface InterviewEvaluationOutput {
  score: number;
  feedback: {
    technical: number;
    communication: number;
    structure: number;
    strengths: string[];
    improvements: string[];
  };
  summary: string;
  disclaimer: string;
  poweredBy: "Puter.js";
}

export interface PuterAIAdapterOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}
