/**
 * Deterministic Opportunity Classifier
 * CampusConnectCo — Phase 16
 *
 * Maps external, source, and text signals into the canonical 10-type taxonomy
 * and extracts relevant subtypes and domain tags without synthetic inference.
 */

import { OpportunityType, OpportunitySubtype, WorkMode } from "./types";

export interface ClassificationResult {
  opportunityType: OpportunityType;
  subtypes: OpportunitySubtype[];
  tags: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
}

interface ClassificationInput {
  title: string;
  description?: string;
  sourceCategory?: string;
  sourceUrl?: string;
  applicationUrl?: string;
  existingType?: string;
  workMode?: WorkMode | string | null;
  rawTags?: string[];
}

const CANONICAL_TYPES: Set<OpportunityType> = new Set([
  "INTERNSHIP",
  "JOB",
  "GIG",
  "HACKATHON",
  "FELLOWSHIP",
  "SCHOLARSHIP",
  "RESEARCH",
  "APPRENTICESHIP",
  "EVENT",
  "OTHER",
]);

export function classifyOpportunity(input: ClassificationInput): ClassificationResult {
  const title = (input.title || "").toLowerCase();
  const desc = (input.description || "").toLowerCase();
  const url = `${input.sourceUrl || ""} ${input.applicationUrl || ""}`.toLowerCase();
  const text = `${title} ${desc.slice(0, 500)}`;

  const subtypes = new Set<OpportunitySubtype>();
  const tags = new Set<string>();

  // Add raw tags if present
  if (input.rawTags && Array.isArray(input.rawTags)) {
    for (const t of input.rawTags) {
      if (typeof t === "string" && t.trim().length > 0) {
        tags.add(t.trim().toLowerCase());
      }
    }
  }

  // Work mode subtype resolution
  if (input.workMode === "remote" || /\b(remote|work\s+from\s+home|anywhere)\b/i.test(text)) {
    subtypes.add("REMOTE");
  }
  if (input.workMode === "hybrid" || /\b(hybrid)\b/i.test(text)) {
    subtypes.add("HYBRID");
  }
  if (input.workMode === "on-site" || /\b(on[- ]site|in[- ]office)\b/i.test(text)) {
    subtypes.add("ON_SITE");
  }

  // Additional Subtypes
  if (/\b(full[- ]time|fte)\b/i.test(text)) subtypes.add("FULL_TIME");
  if (/\b(part[- ]time)\b/i.test(text)) subtypes.add("PART_TIME");
  if (/\b(students?|work[- ]study|campus\s+ambassador|campus\s+rep)\b/i.test(text)) {
    subtypes.add("STUDENT_JOB");
    subtypes.add("CAMPUS");
  }
  if (/\b(startups?|founding|early[- ]stage|y[- ]combinator|yc)\b/i.test(text)) subtypes.add("STARTUP");
  if (/\b(freelance|contractor|bounty|project[- ]based)\b/i.test(text)) subtypes.add("FREELANCE");
  if (
    input.existingType === "HACKATHON" ||
    input.sourceCategory === "HACKATHONS" ||
    /\b(hackathons?|devfolio)\b/i.test(url)
  ) {
    subtypes.add("COMPETITION");
  }

  // If already a valid canonical type and high confidence source category
  if (input.existingType && CANONICAL_TYPES.has(input.existingType as OpportunityType)) {
    return {
      opportunityType: input.existingType as OpportunityType,
      subtypes: Array.from(subtypes),
      tags: Array.from(tags),
      confidence: "HIGH",
    };
  }

  // Priority 1: Source category override
  if (input.sourceCategory === "HACKATHONS" || /\b(hackathons?|devfolio)\b/i.test(url)) {
    subtypes.add("COMPETITION");
    return {
      opportunityType: "HACKATHON",
      subtypes: Array.from(subtypes),
      tags: Array.from(tags),
      confidence: "HIGH",
    };
  }

  // Priority 2: Hackathon signals in title
  if (/\b(hackathon|codefest|hackday|datathon|ideathon|gamejam)\b/i.test(title)) {
    subtypes.add("COMPETITION");
    return {
      opportunityType: "HACKATHON",
      subtypes: Array.from(subtypes),
      tags: Array.from(tags),
      confidence: "HIGH",
    };
  }

  // Priority 3: Apprenticeship (e.g. "Graduate Apprenticeship", "Software Engineering Apprentice")
  if (/\b(apprentice|apprenticeship|cadetship)\b/i.test(title)) {
    if (/\b(graduate|grad)\b/i.test(title)) subtypes.add("FULL_TIME");
    if (/\b(student|undergrad)\b/i.test(title)) subtypes.add("STUDENT_JOB");
    tags.add("apprenticeship");
    return {
      opportunityType: "APPRENTICESHIP",
      subtypes: Array.from(subtypes),
      tags: Array.from(tags),
      confidence: "HIGH",
    };
  }

  // Priority 4: Undergraduate / Summer Research Program / SURF / Research Assistant
  if (
    /\b(summer\s+(?:undergraduate\s+)?research|research\s+program|research\s+intern|research\s+assistant|research\s+experience|undergraduate\s+research|phd\s+intern|postdoc|researcher|surf)\b/i.test(title) ||
    (input.sourceCategory === "UNIVERSITY" && /\bresearch\b/i.test(text))
  ) {
    tags.add("research");
    if (/\b(fellowship|fellow)\b/i.test(title)) tags.add("fellowship");
    subtypes.add("STUDENT_JOB");
    return {
      opportunityType: "RESEARCH",
      subtypes: Array.from(subtypes),
      tags: Array.from(tags),
      confidence: "HIGH",
    };
  }

  // Priority 5: Fellowship (e.g. "Research Fellowship", "Ph.D. Fellowship", "Young India Fellowship")
  if (/\b(fellowship|fellow)\b/i.test(title)) {
    tags.add("fellowship");
    if (/\b(research)\b/i.test(title)) tags.add("research");
    return {
      opportunityType: "FELLOWSHIP",
      subtypes: Array.from(subtypes),
      tags: Array.from(tags),
      confidence: "HIGH",
    };
  }

  // Priority 6: Scholarship (e.g. "Student Scholarship", "Endowment", "Bursary", "Dissertation Grant")
  if (/\b(scholarship|bursary|endowment|grant)\b/i.test(title)) {
    tags.add("scholarship");
    return {
      opportunityType: "SCHOLARSHIP",
      subtypes: Array.from(subtypes),
      tags: Array.from(tags),
      confidence: "HIGH",
    };
  }

  // Priority 7: Event (e.g. "Developer Conference", "Tech Summit", "Symposium", "Workshop")
  if (
    /\b(conference|workshop|webinar|summit|meetup|symposium|convention|forum|devcon|tech\s+event|career\s+fair)\b/i.test(title) ||
    input.sourceCategory === "EVENTS"
  ) {
    tags.add("event");
    return {
      opportunityType: "EVENT",
      subtypes: Array.from(subtypes),
      tags: Array.from(tags),
      confidence: "HIGH",
    };
  }

  // Priority 8: Gig / Freelance / Project-based (e.g. "Freelance Developer", "Bug Bounty", "Contractor")
  if (
    /\b(gig|freelance|bounty|contractor|project[- ]based|short[- ]term|quick\s+task)\b/i.test(title) ||
    subtypes.has("FREELANCE")
  ) {
    tags.add("gig");
    subtypes.add("FREELANCE");
    return {
      opportunityType: "GIG",
      subtypes: Array.from(subtypes),
      tags: Array.from(tags),
      confidence: "HIGH",
    };
  }

  // Priority 9: Internship / Student Work (e.g. "Software Engineer Intern", "Co-op", "Summer Analyst")
  if (
    /\b(intern|internship|co[- ]?op|trainee|summer\s+analyst|student\s+associate|student\s+worker|work[- ]study)\b/i.test(title) ||
    input.sourceCategory === "INTERNSHIPS" ||
    (/\b(intern|internship)\b/i.test(desc) && (subtypes.has("STUDENT_JOB") || subtypes.has("CAMPUS")))
  ) {
    tags.add("internship");
    if (!subtypes.has("STUDENT_JOB")) subtypes.add("STUDENT_JOB");
    return {
      opportunityType: "INTERNSHIP",
      subtypes: Array.from(subtypes),
      tags: Array.from(tags),
      confidence: "HIGH",
    };
  }

  // Priority 10: Standard Job
  if (
    /\b(engineer|developer|designer|manager|specialist|analyst|associate|lead|architect|consultant|technician|writer)\b/i.test(title) ||
    subtypes.has("FULL_TIME") ||
    subtypes.has("PART_TIME") ||
    /\/jobs?\//i.test(url)
  ) {
    return {
      opportunityType: "JOB",
      subtypes: Array.from(subtypes),
      tags: Array.from(tags),
      confidence: "HIGH",
    };
  }

  return {
    opportunityType: "OTHER",
    subtypes: Array.from(subtypes),
    tags: Array.from(tags),
    confidence: "LOW",
  };
}
