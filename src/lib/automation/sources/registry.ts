/**
 * Approved Opportunity Source Registry
 * CampusConnectCo — Phase 16B
 *
 * All sources declare an explicit discovery method:
 * - agent_reach_web: Internet access via Agent-Reach WebChannel (Jina Reader markdown extractor)
 * - agent_reach_rss: Internet access via Agent-Reach RSS (Feedparser)
 * - structured_api: Direct legitimate verified public REST API
 * - structured_feed: Direct legitimate verified public structured JSON feed
 *
 * One broken source never blocks discovery. Each source is independently configured with:
 * - scheduleMinutes: Deterministic polling frequency
 * - policy: Source-level rules (attribution, freshness evidence, direct application)
 * - failure backoff with bounded jitter
 */

import { SourceConfig } from "../types";

export const APPROVED_SOURCES: SourceConfig[] = [
  {
    source: "devfolio_hackathons",
    sourceName: "Devfolio Official Student Hackathons",
    category: "HACKATHONS",
    discoveryMethod: "structured_api",
    defaultTrust: "OFFICIAL",
    scheduleHours: 6,
    scheduleMinutes: 360,
    endpointUrl: "https://api.devfolio.co/api/hackathons?filter=application_open&page=1&limit=20",
    enabled: true,
    maxItemsPerRun: 8,
    applicationUrlPolicy: "DIRECT",
    policy: {
      directApplicationRequired: false,
      requiresFreshnessEvidence: true,
      maxStalenessMinutes: 1440,
      allowedOpportunityTypes: ["HACKATHON"]
    }
  },
  {
    source: "github_student_internships",
    sourceName: "SimplifyJobs Curated Student Tech Internships",
    category: "GITHUB",
    discoveryMethod: "structured_feed",
    defaultTrust: "COMMUNITY_VERIFIED",
    scheduleHours: 6,
    scheduleMinutes: 360,
    endpointUrl: "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json",
    enabled: true,
    maxItemsPerRun: 25,
    applicationUrlPolicy: "DIRECT",
    policy: {
      directApplicationRequired: true,
      requiresFreshnessEvidence: true,
      maxStalenessMinutes: 1440,
      allowedOpportunityTypes: ["INTERNSHIP"]
    }
  },
  {
    source: "github_new_grad_jobs",
    sourceName: "SimplifyJobs Curated New Grad & Junior Tech Roles",
    category: "CAREERS",
    discoveryMethod: "structured_feed",
    defaultTrust: "COMMUNITY_VERIFIED",
    scheduleHours: 6,
    scheduleMinutes: 360,
    endpointUrl: "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/.github/scripts/listings.json",
    enabled: true,
    maxItemsPerRun: 20,
    applicationUrlPolicy: "DIRECT",
    policy: {
      directApplicationRequired: true,
      requiresFreshnessEvidence: true,
      maxStalenessMinutes: 1440,
      allowedOpportunityTypes: ["JOB"]
    }
  },
  {
    source: "remoteok_tech_jobs",
    sourceName: "RemoteOK Verified Developer & Student Roles",
    category: "CAREERS",
    discoveryMethod: "structured_feed",
    defaultTrust: "CURATED_FEED",
    scheduleHours: 2,
    scheduleMinutes: 120,
    endpointUrl: "https://remoteok.com/api",
    enabled: true,
    maxItemsPerRun: 15,
    applicationUrlPolicy: "DIRECT",
    attributionRequired: true,
    attributionName: "Remote OK",
    policy: {
      attributionRequired: true,
      attributionName: "Remote OK",
      directApplicationRequired: true,
      maxStalenessMinutes: 720,
      allowedOpportunityTypes: ["JOB", "GIG"]
    }
  },
  {
    source: "agent_reach_remote_opportunities",
    sourceName: "Agent-Reach: Global Remote Programming Opportunities",
    category: "RSS",
    discoveryMethod: "agent_reach_rss",
    defaultTrust: "CURATED_FEED",
    scheduleHours: 3,
    scheduleMinutes: 180,
    endpointUrl: "https://weworkremotely.com/categories/remote-programming-jobs.rss",
    enabled: true,
    maxItemsPerRun: 15,
    applicationUrlPolicy: "DIRECT",
    policy: {
      directApplicationRequired: true,
      maxStalenessMinutes: 720,
      allowedOpportunityTypes: ["JOB", "GIG"]
    }
  },
  {
    source: "agent_reach_hn_jobs",
    sourceName: "Agent-Reach: Hacker News Hiring & Tech Opportunities",
    category: "RSS",
    discoveryMethod: "agent_reach_rss",
    defaultTrust: "CURATED_FEED",
    scheduleHours: 2,
    scheduleMinutes: 120,
    endpointUrl: "https://hnrss.org/jobs",
    enabled: true,
    maxItemsPerRun: 15,
    applicationUrlPolicy: "DIRECT",
    policy: {
      directApplicationRequired: true,
      maxStalenessMinutes: 720,
      allowedOpportunityTypes: ["JOB", "GIG", "INTERNSHIP"]
    }
  },
  {
    source: "agent_reach_yc_jobs",
    sourceName: "Agent-Reach: Y-Combinator Tech Opportunities",
    category: "CAREERS",
    discoveryMethod: "agent_reach_web",
    defaultTrust: "CURATED_FEED",
    scheduleHours: 12,
    scheduleMinutes: 720,
    endpointUrl: "https://news.ycombinator.com/jobs",
    enabled: true,
    maxItemsPerRun: 10,
    applicationUrlPolicy: "DIRECT",
    policy: {
      directApplicationRequired: true,
      maxStalenessMinutes: 1440,
      allowedOpportunityTypes: ["JOB"]
    }
  },
  {
    source: "github_tech_apprenticeships",
    sourceName: "Apprenticeships.me Tech Apprenticeship Directory",
    category: "CAREERS",
    discoveryMethod: "structured_feed",
    defaultTrust: "COMMUNITY_VERIFIED",
    scheduleHours: 12,
    scheduleMinutes: 720,
    endpointUrl: "https://raw.githubusercontent.com/FrancesCoronel/apprenticeships/main/content/apprenticeships",
    enabled: true,
    maxItemsPerRun: 15,
    applicationUrlPolicy: "DIRECT",
    policy: {
      directApplicationRequired: true,
      maxStalenessMinutes: 1440,
      allowedOpportunityTypes: ["APPRENTICESHIP"]
    }
  },
  {
    source: "confs_tech_events",
    sourceName: "Confs.tech Global Developer Events & Conferences",
    category: "EVENTS",
    discoveryMethod: "structured_feed",
    defaultTrust: "COMMUNITY_VERIFIED",
    scheduleHours: 6,
    scheduleMinutes: 360,
    endpointUrl: "https://raw.githubusercontent.com/tech-conferences/conference-data/main/conferences/2025/general.json",
    enabled: true,
    maxItemsPerRun: 15,
    applicationUrlPolicy: "DIRECT",
    policy: {
      directApplicationRequired: false,
      maxStalenessMinutes: 1440,
      allowedOpportunityTypes: ["EVENT"]
    }
  },
  {
    source: "zapply_undergrad_research",
    sourceName: "Global Undergrad Research Internships Directory",
    category: "UNIVERSITY",
    discoveryMethod: "structured_feed",
    defaultTrust: "COMMUNITY_VERIFIED",
    scheduleHours: 12,
    scheduleMinutes: 720,
    endpointUrl: "https://raw.githubusercontent.com/zapplyjobs/Research-Internships-for-Undergraduates/main/README.md",
    enabled: true,
    maxItemsPerRun: 15,
    applicationUrlPolicy: "DIRECT",
    policy: {
      directApplicationRequired: true,
      maxStalenessMinutes: 1440,
      allowedOpportunityTypes: ["RESEARCH"]
    }
  },
  {
    source: "indian_postgrad_scholarships",
    sourceName: "Postgrad Scholarships & Fellowships for Indian Students",
    category: "UNIVERSITY",
    discoveryMethod: "structured_feed",
    defaultTrust: "COMMUNITY_VERIFIED",
    scheduleHours: 12,
    scheduleMinutes: 720,
    endpointUrl: "https://raw.githubusercontent.com/anjalibhavan/postgrad-scholarships-for-indian-students/master/README.md",
    enabled: true,
    maxItemsPerRun: 10,
    applicationUrlPolicy: "DIRECT",
    policy: {
      directApplicationRequired: true,
      maxStalenessMinutes: 1440,
      allowedOpportunityTypes: ["SCHOLARSHIP", "FELLOWSHIP"]
    }
  },
  {
    source: "monajalal_cs_fellowships",
    sourceName: "Curated CS Research Fellowships & Scholarships",
    category: "UNIVERSITY",
    discoveryMethod: "structured_feed",
    defaultTrust: "COMMUNITY_VERIFIED",
    scheduleHours: 12,
    scheduleMinutes: 720,
    endpointUrl: "https://raw.githubusercontent.com/monajalal/Resources-For-CS-Students/master/README.md",
    enabled: true,
    maxItemsPerRun: 10,
    applicationUrlPolicy: "DIRECT",
    policy: {
      directApplicationRequired: true,
      maxStalenessMinutes: 1440,
      allowedOpportunityTypes: ["FELLOWSHIP", "SCHOLARSHIP"]
    }
  },
  {
    source: "mohan_careers",
    sourceName: "Mohan Careers",
    category: "CAREERS",
    discoveryMethod: "structured_api",
    defaultTrust: "UNKNOWN",
    scheduleHours: 6,
    scheduleMinutes: 360,
    endpointUrl: "https://mohancareers.com/wp-json/wp/v2/posts",
    enabled: true,
    maxItemsPerRun: 15,
    applicationUrlPolicy: "DIRECT",
    attributionRequired: true,
    attributionName: "Mohan Careers",
    policy: {
      directApplicationRequired: false,
      requiresFreshnessEvidence: true,
      maxStalenessMinutes: 1440,
      allowedOpportunityTypes: ["JOB", "INTERNSHIP", "APPRENTICESHIP"]
    }
  },
  // ── Sources marked NOT READY (Kept Disabled by Policy) ──────────────────────
  {
    source: "cern_careers_smartrecruiters",
    sourceName: "CERN Early Career & Student Research",
    category: "CAREERS",
    discoveryMethod: "structured_api",
    defaultTrust: "OFFICIAL",
    scheduleMinutes: 720,
    endpointUrl: "https://careers.smartrecruiters.com/CERN/api/more?page=1",
    enabled: false, // NOT READY: Endpoint returns HTML markup, not structured JSON
    maxItemsPerRun: 10
  },
  {
    source: "mlh_hackathons_web",
    sourceName: "Major League Hacking Season Events",
    category: "HACKATHONS",
    discoveryMethod: "agent_reach_web",
    defaultTrust: "TRUSTED",
    scheduleMinutes: 360,
    endpointUrl: "https://mlh.io/seasons/2026/events",
    enabled: false, // NOT READY: Markdown table structure mismatch
    maxItemsPerRun: 10
  },
  {
    source: "devpost_hackathons_rss",
    sourceName: "Devpost Public Hackathons Feed",
    category: "HACKATHONS",
    discoveryMethod: "agent_reach_rss",
    defaultTrust: "TRUSTED",
    scheduleMinutes: 360,
    endpointUrl: "https://devpost.com/hackathons.rss",
    enabled: false, // NOT READY: Endpoint returns HTTP 406
    maxItemsPerRun: 10
  },
  {
    source: "arxiv_research_feed",
    sourceName: "ArXiv AI/CS Research Announcements",
    category: "UNIVERSITY",
    discoveryMethod: "structured_api",
    defaultTrust: "OFFICIAL",
    scheduleMinutes: 720,
    endpointUrl: "http://export.arxiv.org/api/query?search_query=cat:cs.AI",
    enabled: false, // NOT READY: Endpoint returns HTTP 429 rate limit
    maxItemsPerRun: 10
  }
];

export function getSourceConfig(sourceId: string): SourceConfig | undefined {
  return APPROVED_SOURCES.find((s) => s.source === sourceId);
}

export function getAllEnabledSources(): SourceConfig[] {
  return APPROVED_SOURCES.filter((s) => s.enabled);
}

export function getAllRegisteredSources(): SourceConfig[] {
  return APPROVED_SOURCES;
}

/**
 * Calculates next eligible run timestamp using scheduleMinutes, failure backoff, and bounded jitter.
 * On success: nextEligible = now + scheduleMinutes (+ bounded jitter)
 * On failure: nextEligible = now + exponentialBackoff (+ bounded jitter)
 */
export function calculateNextEligibleRun(
  config: SourceConfig,
  lastAttemptAt: Date | null,
  consecutiveFailures: number = 0,
  now: Date = new Date()
): Date {
  const baseMinutes = config.scheduleMinutes || (config.scheduleHours ? config.scheduleHours * 60 : 360);
  const maxBackoff = config.maxBackoffMinutes || 1440; // 24 hours cap

  let intervalMinutes = baseMinutes;

  if (consecutiveFailures > 0) {
    // Exponential backoff: base * 2^(failures - 1) capped at maxBackoff
    const multiplier = Math.pow(2, Math.min(consecutiveFailures - 1, 6));
    intervalMinutes = Math.min(baseMinutes * multiplier, maxBackoff);
  }

  // Bounded jitter: ±5% of interval (bounded to max ±5 minutes)
  const maxJitterMinutes = Math.min(5, intervalMinutes * 0.05);
  const jitterOffset = (Math.random() * 2 - 1) * maxJitterMinutes;

  const totalDelayMs = Math.max(1, (intervalMinutes + jitterOffset) * 60 * 1000);
  const baseTime = lastAttemptAt ? lastAttemptAt.getTime() : now.getTime();

  return new Date(baseTime + totalDelayMs);
}

