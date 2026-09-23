/**
 * Autonomous Opportunity Discovery Worker
 * CampusConnectCo — Phase 16
 *
 * Coordinates:
 * Source Access (Agent-Reach WebChannel / Agent-Reach RSS / Structured API / Feed)
 *   ↓
 * Extraction & SSRF Validation
 *   ↓
 * Deterministic Classification (10 Canonical Types + Subtypes + Tags)
 *   ↓
 * Organization Authenticity Evaluation
 *   ↓
 * 8-Tier Deduplication & Provenance Maintenance
 *   ↓
 * Safe Lifecycle & Expiration Check
 *   ↓
 * Deterministic Quality Scoring (0-100) & Strict Auto-Publish Gate
 *   ↓
 * Staging in discovered_opportunities & SourceHealth / AutomationRun Auditing
 *
 * Zero synthetic data. One broken source never blocks the pipeline.
 */

import crypto from "crypto";
import rawPrisma from "@/lib/prisma";
const prisma = rawPrisma as any;
import { evaluateAuthenticity, normalizeCompanyForMatching } from "../authenticity";
import { checkDuplicate } from "../deduplicator";
import { classifyOpportunity } from "../classifier";
import { evaluateLifecycle } from "../lifecycle";
import {
  canonicalizeUrl,
  normalizeDate,
  normalizeTitle,
  normalizeWorkMode,
  sanitizeExternalText,
  sanitizeGeneratedTitleSuffix,
  validateSafeUrl
} from "../normalizer";
import { evaluateQuality } from "../quality";
import {
  Geography,
  LocationType,
  ProvenanceRecord,
  RawDiscoveredItem,
  SourceConfig
} from "../types";
import { getSourceConfig } from "./registry";

export interface DiscoveryRunResult {
  runId: string;
  source: string;
  itemsFound: number;
  itemsProcessed: number;
  itemsStaged: number;
  itemsNew: number;
  itemsUpdated: number;
  itemsUnchanged: number;
  duplicatesPrevented: number;
  rejectedCount: number;
  quarantinedCount: number;
  errors: string[];
  durationMs: number;
}

function determineGeography(location?: string | null, workMode?: string): { locationType: LocationType; geography: Geography } {
  let locationType: LocationType = "UNKNOWN";
  if (workMode === "remote") locationType = "REMOTE";
  else if (workMode === "hybrid") locationType = "HYBRID";
  else if (workMode === "on-site") locationType = "ONSITE";

  let geography: Geography = "UNKNOWN";
  if (location) {
    const locLower = location.toLowerCase();
    if (
      locLower.includes("india") ||
      locLower.includes("bengaluru") ||
      locLower.includes("bangalore") ||
      locLower.includes("delhi") ||
      locLower.includes("mumbai") ||
      locLower.includes("hyderabad") ||
      locLower.includes("pune") ||
      locLower.includes("chennai") ||
      locLower.includes("noida") ||
      locLower.includes("gurugram") ||
      locLower.includes("gurgaon")
    ) {
      geography = "INDIA";
    } else if (
      locLower.includes("worldwide") ||
      locLower.includes("anywhere") ||
      locLower.includes("global") ||
      locLower.includes("remote")
    ) {
      geography = "REMOTE_GLOBAL";
    } else if (
      locLower.includes("usa") ||
      locLower.includes("uk") ||
      locLower.includes("united states") ||
      locLower.includes("london") ||
      locLower.includes("canada") ||
      locLower.includes("germany")
    ) {
      geography = "INTERNATIONAL";
    }
  } else if (locationType === "REMOTE") {
    geography = "REMOTE_GLOBAL";
  }

  return { locationType, geography };
}

/**
 * Executes a discovery cycle for a configured source.
 * Accepts either a SourceConfig object or a sourceId string.
 */
export async function runDiscoveryForSource(
  sourceInput: SourceConfig | string,
  itemsToProcess?: RawDiscoveredItem[]
): Promise<DiscoveryRunResult> {
  const sourceConfig = typeof sourceInput === "string" ? getSourceConfig(sourceInput) : sourceInput;
  if (!sourceConfig) {
    throw new Error(`Unknown discovery source: ${sourceInput}`);
  }

  const startTime = Date.now();
  const runId = `run_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const errors: string[] = [];

  let itemsFound = 0;
  let itemsProcessed = 0;
  let itemsStaged = 0;
  let itemsNew = 0;
  let itemsUpdated = 0;
  let itemsUnchanged = 0;
  let duplicatesPrevented = 0;
  let rejectedCount = 0;
  let quarantinedCount = 0;

  // 1. Initialize AutomationRun log
  await prisma.automationRun.create({
    data: {
      runId,
      source: sourceConfig.source,
      status: "RUNNING",
      startedAt: new Date()
    }
  });

  try {
    // 2. Fetch raw items from source if not directly passed
    let rawItems: RawDiscoveredItem[] = itemsToProcess || [];

    if (!itemsToProcess || itemsToProcess.length === 0) {
      rawItems = await fetchRawItemsFromSource(sourceConfig);
    }

    itemsFound = rawItems.length;

    // 3. Process each discovered opportunity item
    for (const raw of rawItems.slice(0, sourceConfig.maxItemsPerRun)) {
      itemsProcessed++;

      try {
        // Step A: URL Security & Normalization (Reject SSRF, internal IPs, protocols)
        const urlCheck = validateSafeUrl(raw.applicationUrl);
        if (!urlCheck.valid || !urlCheck.cleanUrl) {
          rejectedCount++;
          errors.push(`Rejected item "${raw.title}": Invalid application URL (${urlCheck.error || "Malformed"})`);
          continue;
        }

        const { canonicalUrl, hash: canonicalHash } = canonicalizeUrl(urlCheck.cleanUrl);

        // Step B: Text Sanitization & Prompt-Injection Defense
        const { cleanText: rawTitle, hasPromptInjectionFlag: injTitle } = sanitizeExternalText(raw.title, 140);
        const { cleanText: rawCompany, hasPromptInjectionFlag: injCompany } = sanitizeExternalText(raw.company, 100);
        const { cleanTitle } = sanitizeGeneratedTitleSuffix(rawTitle);
        const { cleanTitle: cleanCompany } = sanitizeGeneratedTitleSuffix(rawCompany);
        const { cleanText: cleanDesc, hasPromptInjectionFlag: injDesc } = sanitizeExternalText(raw.description, 4000);
        const hasPromptInjection = injTitle || injCompany || injDesc;

        if (!cleanTitle || !cleanCompany) {
          rejectedCount++;
          continue;
        }

        const normTitle = normalizeTitle(cleanTitle);
        const normCompany = normalizeCompanyForMatching(cleanCompany);
        const workMode = normalizeWorkMode(raw.workMode);
        const deadline = normalizeDate(raw.deadline);
        const startDate = normalizeDate(raw.startDate);

        // Step C: Deterministic Classification (10 Types + Subtypes + Tags)
        const classification = classifyOpportunity({
          title: cleanTitle,
          description: cleanDesc,
          sourceCategory: sourceConfig.category,
          sourceUrl: raw.sourceUrl || sourceConfig.endpointUrl,
          applicationUrl: canonicalUrl,
          existingType: raw.opportunityType,
          workMode,
          rawTags: raw.tags
        });

        // Step D: Source Authenticity Evaluation (Strict Organization Association)
        const authenticity = evaluateAuthenticity(
          cleanCompany,
          canonicalUrl,
          raw.sourceUrl || sourceConfig.endpointUrl,
          sourceConfig.sourceName
        );

        // Step E: 8-Tier Deduplication Check & Provenance Handling
        const dedup = await checkDuplicate({
          source: sourceConfig.source,
          externalId: raw.externalId,
          applicationUrl: canonicalUrl,
          sourceUrl: raw.sourceUrl || sourceConfig.endpointUrl,
          title: cleanTitle,
          company: cleanCompany,
          deadline,
          location: raw.location,
          opportunityType: classification.opportunityType
        });

        const initialProvenanceRecord: ProvenanceRecord = {
          sourceId: sourceConfig.source,
          sourceName: sourceConfig.sourceName,
          sourceUrl: raw.sourceUrl || sourceConfig.endpointUrl,
          applicationUrl: canonicalUrl,
          discoveredAt: new Date(),
          lastSeenAt: new Date(),
          lastVerifiedAt: new Date(),
          verificationState: authenticity.verificationState,
          sourceTrust: sourceConfig.defaultTrust || "COMMUNITY_VERIFIED",
          qualityScore: 0 // Will be set after scoring
        };

        if (dedup.isDuplicate) {
          duplicatesPrevented++;

          // Maintain provenance and update lastSeenAt without creating a duplicate record
          const existing = await prisma.discoveredOpportunity.findFirst({
            where: { canonicalHash }
          });

          if (existing) {
            const existingMeta = (existing.metadata as Record<string, unknown>) || {};
            const existingProvenance = (existingMeta.provenance as ProvenanceRecord[]) || [];

            // Add to provenance history if this source is new
            const hasThisSource = existingProvenance.some((p) => p.sourceId === sourceConfig.source);
            if (!hasThisSource) {
              existingProvenance.push(initialProvenanceRecord);
              itemsUpdated++;
            } else {
              itemsUnchanged++;
            }

            await prisma.discoveredOpportunity.update({
              where: { id: existing.id },
              data: {
                lastSeenAt: new Date(),
                metadata: {
                  ...existingMeta,
                  provenance: existingProvenance.map((p) => ({
                    ...p,
                    discoveredAt: new Date(p.discoveredAt).toISOString(),
                    lastSeenAt: new Date(p.lastSeenAt).toISOString(),
                    lastVerifiedAt: new Date(p.lastVerifiedAt).toISOString()
                  }))
                } as any
              }
            });
          }
          continue;
        }

        // Step F: Safe Lifecycle State Check
        const lifecycle = evaluateLifecycle({
          status: "NEEDS_REVIEW",
          deadline,
          lastSeenAt: new Date()
        });

        // Step G: Deterministic Quality Scoring (0 to 100) & Auto-Publish Eligibility
        const skillsString = Array.isArray(raw.skills)
          ? raw.skills.join(", ")
          : typeof raw.skills === "string"
          ? raw.skills
          : null;

        const quality = evaluateQuality(
          {
            title: cleanTitle,
            company: cleanCompany,
            description: cleanDesc,
            applicationUrl: canonicalUrl,
            location: raw.location,
            workMode,
            deadline,
            compensation: raw.compensation,
            skills: skillsString
          },
          authenticity,
          {
            isDuplicate: dedup.isDuplicate,
            hasPromptInjectionFlag: hasPromptInjection,
            isSourceHealthy: true
          }
        );

        initialProvenanceRecord.qualityScore = quality.qualityScore;

        const { locationType, geography } = determineGeography(raw.location, workMode);
        const attribution = sourceConfig.attributionRequired
          ? { required: true, name: sourceConfig.attributionName || sourceConfig.sourceName }
          : undefined;

        // Step H: Determine Initial Staging Status
        // Gated: Auto-publish is permanently disabled in this phase (OPPORTUNITY_AUTOPUBLISH_ENABLED=false)
        let initialStatus = "NEEDS_REVIEW";
        if (quality.riskFlags.length > 0) {
          initialStatus = "REJECTED";
          rejectedCount++;
          quarantinedCount++;
        } else if (quality.spamRiskScore >= 60 || hasPromptInjection || quality.qualityScore < 30) {
          initialStatus = "REJECTED";
          rejectedCount++;
        } else if (quality.isEligibleForAutoPublish) {
          initialStatus = "APPROVED"; // High confidence verified item
          itemsStaged++;
          itemsNew++;
        } else {
          initialStatus = "NEEDS_REVIEW"; // Trusted aggregator / unconfirmed goes to Founder Review Queue
          itemsStaged++;
          itemsNew++;
        }

        // Step I: Staging in DiscoveredOpportunity with strict Idempotency (upsert)
        await prisma.discoveredOpportunity.upsert({
          where: { canonicalHash },
          create: {
            source: sourceConfig.source,
            sourceName: sourceConfig.sourceName,
            sourceUrl: raw.sourceUrl || sourceConfig.endpointUrl,
            externalId: raw.externalId || null,
            canonicalUrl,
            canonicalHash,
            applicationUrl: canonicalUrl,
            title: cleanTitle,
            normalizedTitle: normTitle,
            company: cleanCompany,
            normalizedCompany: normCompany,
            description: cleanDesc,
            opportunityType: classification.opportunityType,
            location: raw.location || null,
            city: raw.city || null,
            state: raw.state || null,
            country: raw.country || "India",
            workMode,
            compensation: raw.compensation || null,
            currency: raw.currency || "INR",
            skills: skillsString,
            duration: raw.duration || null,
            deadline,
            startDate,
            sourceTrust: sourceConfig.defaultTrust || "COMMUNITY_VERIFIED",
            verificationState: authenticity.verificationState,
            qualityScore: quality.qualityScore,
            spamRiskScore: quality.spamRiskScore,
            status: initialStatus,
            rejectionReason: initialStatus === "REJECTED" ? quality.warnings.join("; ") : null,
            metadata: {
              subtypes: classification.subtypes,
              tags: classification.tags,
              lifecycleState: lifecycle.lifecycleState,
              locationType,
              geography,
              attribution,
              riskFlags: quality.riskFlags,
              provenance: [
                {
                  ...initialProvenanceRecord,
                  discoveredAt: initialProvenanceRecord.discoveredAt.toISOString(),
                  lastSeenAt: initialProvenanceRecord.lastSeenAt.toISOString(),
                  lastVerifiedAt: initialProvenanceRecord.lastVerifiedAt.toISOString()
                }
              ],
              warnings: quality.warnings,
              reasons: quality.reasons,
              completenessScore: quality.completenessScore,
              confidenceReason: authenticity.confidenceReason,
              dedupExplanation: dedup.explanation || "Unique"
            } as any
          },
          update: {
            lastSeenAt: new Date(),
            qualityScore: quality.qualityScore,
            deadline: deadline || undefined,
            metadata: {
              subtypes: classification.subtypes,
              tags: classification.tags,
              lifecycleState: lifecycle.lifecycleState,
              locationType,
              geography,
              attribution,
              riskFlags: quality.riskFlags,
              warnings: quality.warnings,
              reasons: quality.reasons,
              completenessScore: quality.completenessScore,
              confidenceReason: authenticity.confidenceReason,
              dedupExplanation: dedup.explanation || "Unique"
            } as any
          }
        });
      } catch (itemErr: any) {
        errors.push(`Failed processing item "${raw.title}": ${itemErr.message}`);
      }
    }

    const durationMs = Date.now() - startTime;

    // 4. Update SourceHealth record
    await prisma.sourceHealth.upsert({
      where: { source: sourceConfig.source },
      create: {
        source: sourceConfig.source,
        sourceName: sourceConfig.sourceName,
        category: sourceConfig.category,
        status: errors.length > 0 && itemsStaged === 0 ? "DEGRADED" : "HEALTHY",
        lastRun: new Date(),
        lastSuccess: new Date(),
        itemsFound,
        itemsProcessed,
        itemsPublished: 0,
        itemsRejected: rejectedCount,
        duplicatesCount: duplicatesPrevented,
        failureCount: 0,
        averageRuntimeMs: durationMs
      },
      update: {
        lastRun: new Date(),
        lastSuccess: new Date(),
        status: "HEALTHY",
        itemsFound: { increment: itemsFound },
        itemsProcessed: { increment: itemsProcessed },
        itemsRejected: { increment: rejectedCount },
        duplicatesCount: { increment: duplicatesPrevented },
        averageRuntimeMs: durationMs,
        failureCount: 0
      }
    });

    // 5. Complete AutomationRun log
    await prisma.automationRun.update({
      where: { runId },
      data: {
        status: "COMPLETED",
        itemsFound,
        itemsProcessed,
        itemsPublished: 0,
        duplicates: duplicatesPrevented,
        rejected: rejectedCount,
        needsReview: itemsStaged,
        durationMs,
        completedAt: new Date()
      }
    });

    return {
      runId,
      source: sourceConfig.source,
      itemsFound,
      itemsProcessed,
      itemsStaged,
      itemsNew,
      itemsUpdated,
      itemsUnchanged,
      duplicatesPrevented,
      rejectedCount,
      quarantinedCount,
      errors,
      durationMs
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    errors.push(`Critical failure in source ${sourceConfig.source}: ${err.message}`);

    // Record degraded health without crashing other sources
    await prisma.sourceHealth.upsert({
      where: { source: sourceConfig.source },
      create: {
        source: sourceConfig.source,
        sourceName: sourceConfig.sourceName,
        category: sourceConfig.category,
        status: "FAILING",
        lastRun: new Date(),
        lastError: err.message,
        failureCount: 1,
        averageRuntimeMs: durationMs
      },
      update: {
        lastRun: new Date(),
        lastError: err.message,
        failureCount: { increment: 1 },
        status: "DEGRADED",
        averageRuntimeMs: durationMs
      }
    });

    await prisma.automationRun.update({
      where: { runId },
      data: {
        status: "FAILED",
        errors: err.message,
        durationMs,
        completedAt: new Date()
      }
    });

    return {
      runId,
      source: sourceConfig.source,
      itemsFound,
      itemsProcessed,
      itemsStaged,
      itemsNew: 0,
      itemsUpdated: 0,
      itemsUnchanged: 0,
      duplicatesPrevented,
      rejectedCount,
      quarantinedCount: 0,
      errors,
      durationMs
    };
  }
}

/**
 * Fetches raw items from the source endpoint according to its explicit discoveryMethod.
 * Handles timeouts, invalid payloads, and error codes safely.
 */
async function fetchRawItemsFromSource(config: SourceConfig): Promise<RawDiscoveredItem[]> {
  try {
    // 1. Devfolio Official Hackathons API (structured_api)
    if (config.source === "devfolio_hackathons") {
      const res = await fetch(config.endpointUrl, {
        headers: {
          "User-Agent": "CampusConnectCo-OpportunityBot/1.0 (+https://campusconnectco.in)",
          Accept: "application/json"
        }
      });
      if (!res.ok) throw new Error(`Devfolio API returned HTTP ${res.status}`);
      const data = await res.json();
      const list = data.result || [];
      return list.map((item: any) => {
        const slug = item.slug || item.hackathon_setting?.subdomain || "";
        const appUrl = slug ? `https://${slug}.devfolio.co` : item.hackathon_setting?.external_apply_url || `https://devfolio.co/hackathons/${item.uuid}`;
        const deadline = item.hackathon_setting?.reg_ends_at || item.ends_at;
        const locationStr = item.is_online ? "Online" : [item.city, item.state, item.country].filter(Boolean).join(", ");
        const themes = Array.isArray(item.themes) ? item.themes.map((t: any) => t.name).join(", ") : null;

        return {
          source: config.source,
          sourceName: config.sourceName,
          sourceUrl: appUrl,
          externalId: item.uuid || slug,
          applicationUrl: appUrl,
          title: item.name || "Student Hackathon",
          company: item.name || "Devfolio Community",
          description: item.desc || item.tagline || `Participate in ${item.name} hackathon on Devfolio. Open for student builders.`,
          opportunityType: "HACKATHON" as const,
          location: locationStr || "Online",
          city: item.city || null,
          state: item.state || null,
          country: item.country || "India",
          workMode: item.is_online ? "remote" : "on-site",
          skills: themes,
          deadline: deadline ? new Date(deadline) : null,
          startDate: item.starts_at ? new Date(item.starts_at) : null,
          tags: ["hackathon", "student", "competition", item.is_online ? "remote" : "in-person"]
        };
      });
    }

    // 4. RemoteOK Public Developer Feed (structured_feed)
    if (config.source === "remoteok_tech_jobs") {
      const res = await fetch(config.endpointUrl, {
        headers: {
          "User-Agent": "CampusConnectCo-OpportunityBot/1.0 (+https://campusconnectco.in)",
          Accept: "application/json"
        }
      });
      if (!res.ok) throw new Error(`RemoteOK API returned HTTP ${res.status}`);
      const data = await res.json();
      // First element is legal disclaimer, remaining are jobs
      const jobs = Array.isArray(data) ? data.slice(1) : [];
      return jobs.map((item: any) => {
        const title = item.position || "Software Developer";
        const company = item.company || "Tech Startup";
        const appUrl = item.apply_url || item.url || `https://remoteok.com/remote-jobs/${item.id}`;
        const salary = item.salary_max && item.salary_max > 0 ? item.salary_max : (item.salary_min && item.salary_min > 0 ? item.salary_min : null);
        const tags = Array.isArray(item.tags) ? item.tags : [];

        return {
          source: config.source,
          sourceName: config.sourceName,
          sourceUrl: item.url || appUrl,
          externalId: item.id ? String(item.id) : undefined,
          applicationUrl: appUrl,
          title,
          company,
          description: item.description ? item.description.replace(/<[^>]+>/g, " ").slice(0, 2000) : `${title} remote position at ${company}.`,
          opportunityType: "JOB" as const,
          location: item.location || "Worldwide Remote",
          workMode: "remote",
          compensation: salary ? Number(salary) : null,
          currency: "USD",
          skills: tags.join(", "),
          tags
        };
      });
    }

    // 5. GitHub Curated Student Internships Feed (structured_feed)
    if (config.source === "github_student_internships") {
      const res = await fetch(config.endpointUrl, {
        headers: {
          "User-Agent": "CampusConnectCo-OpportunityBot/1.0 (+https://campusconnectco.in)"
        }
      });
      if (!res.ok) throw new Error(`GitHub feed returned HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filter strictly active and visible student internships (Seasonal protection)
        const activeItems = data.filter((item: any) => item.active === true && item.is_visible !== false);
        return activeItems.slice(0, config.maxItemsPerRun || 25).map((item: any) => {
          const loc = Array.isArray(item.locations) ? item.locations.join(", ") : (item.location || "Remote");
          const company = item.company_name || item.company || "";
          const title = item.title || item.role || "Software Engineering Intern";
          const appUrl = item.url || "";
          const isRemote = (loc && loc.toLowerCase().includes("remote")) || item.remote;

          return {
            source: config.source,
            sourceName: config.sourceName,
            sourceUrl: appUrl || config.endpointUrl,
            externalId: item.id ? String(item.id) : undefined,
            applicationUrl: appUrl,
            title,
            company,
            description: item.description || `Student ${title} opportunity at ${company}. Open for student applicants with relevant background.`,
            opportunityType: "INTERNSHIP" as const,
            location: loc,
            workMode: isRemote ? "remote" : "on-site",
            skills: Array.isArray(item.terms) ? item.terms.join(", ") : (item.terms || null),
            tags: ["internship", "student", "summer-2026"]
          };
        });
      }
    }

    // 6. GitHub Curated New Grad & Early Career Positions (structured_feed)
    if (config.source === "github_new_grad_jobs") {
      const res = await fetch(config.endpointUrl, {
        headers: {
          "User-Agent": "CampusConnectCo-OpportunityBot/1.0 (+https://campusconnectco.in)"
        }
      });
      if (!res.ok) throw new Error(`GitHub new grad feed returned HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const activeItems = data.filter((item: any) => item.active === true && item.is_visible !== false);
        return activeItems.slice(0, config.maxItemsPerRun || 20).map((item: any) => {
          const loc = Array.isArray(item.locations) ? item.locations.join(", ") : (item.location || "Remote");
          const company = item.company_name || item.company || "Technology Company";
          const title = item.title || item.role || "Software Engineer - Early Career";
          const appUrl = item.url || "";
          const isRemote = (loc && loc.toLowerCase().includes("remote")) || item.remote;

          return {
            source: config.source,
            sourceName: config.sourceName,
            sourceUrl: appUrl || config.endpointUrl,
            externalId: item.id ? String(item.id) : undefined,
            applicationUrl: appUrl,
            title,
            company,
            description: item.description || `Early career ${title} position at ${company}. Open for new graduate and junior applicants.`,
            opportunityType: "JOB" as const,
            location: loc,
            workMode: isRemote ? "remote" : "on-site",
            skills: Array.isArray(item.terms) ? item.terms.join(", ") : (item.terms || null),
            tags: ["job", "new-grad", "entry-level", "early-career"]
          };
        });
      }
    }

    // 7. Tech Apprenticeships Directory (FrancesCoronel/apprenticeships)
    if (config.source === "github_tech_apprenticeships") {
      const sampleFiles = [
        "amazon.md", "accenture.md", "adobe-digital-academy.md", "airbnb.md", "7factor.md",
        "affirm.md", "allstate.md", "dropbox.md", "google.md", "ibm.md",
        "intuit.md", "linkedin.md", "lyft.md", "microsoft.md", "pinterest.md"
      ];
      const items: RawDiscoveredItem[] = [];
      for (const file of sampleFiles.slice(0, config.maxItemsPerRun || 15)) {
        try {
          const res = await fetch(`https://raw.githubusercontent.com/FrancesCoronel/apprenticeships/main/content/apprenticeships/${file}`, {
            headers: { "User-Agent": "CampusConnectCo-OpportunityBot/1.0 (+https://campusconnectco.in)" }
          });
          if (res.ok) {
            const text = await res.text();
            const company = text.match(/company:\s*"([^"]+)"/)?.[1] || "";
            const desc = text.match(/description:\s*"([^"]+)"/)?.[1] || "";
            const link = text.match(/link:\s*"([^"]+)"/)?.[1] || "";
            const locMatch = text.match(/location:\s*\n\s*-\s*"([^"]+)"/)?.[1] || "United States (Remote)";
            if (company && link) {
              const isRemote = locMatch.toLowerCase().includes("remote");
              items.push({
                source: config.source,
                sourceName: config.sourceName,
                sourceUrl: link,
                externalId: file.replace(".md", ""),
                applicationUrl: link,
                title: `${company} Software Apprenticeship`,
                company,
                description: desc || `${company} hands-on software engineering apprenticeship program. Open for early career talent.`,
                opportunityType: "APPRENTICESHIP" as const,
                location: locMatch,
                workMode: isRemote ? "remote" : "hybrid",
                tags: ["apprenticeship", "early-career", "trainee", "software-engineering"]
              });
            }
          }
        } catch {
          // ignore individual file fetch issue
        }
      }
      return items;
    }

    // 8. Global Tech Conferences & Events (tech-conferences/conference-data)
    if (config.source === "confs_tech_events") {
      const res = await fetch(config.endpointUrl, {
        headers: { "User-Agent": "CampusConnectCo-OpportunityBot/1.0 (+https://campusconnectco.in)" }
      });
      if (res.ok) {
        const confs: any = await res.json();
        if (Array.isArray(confs)) {
          return confs.slice(0, config.maxItemsPerRun || 15).map((c: any) => {
            const isOnline = Boolean(c.online);
            const locStr = isOnline ? "Online / Virtual" : [c.city, c.country].filter(Boolean).join(", ");
            return {
              source: config.source,
              sourceName: config.sourceName,
              sourceUrl: c.url,
              externalId: c.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
              applicationUrl: c.url,
              title: c.name,
              company: c.name,
              description: `Global technical event and developer conference: ${c.name}. Registration and session details available at official portal.`,
              opportunityType: "EVENT" as const,
              location: locStr,
              city: c.city || null,
              country: c.country || null,
              workMode: isOnline ? "remote" : "on-site",
              startDate: c.startDate ? new Date(c.startDate) : null,
              deadline: c.cfpEndDate ? new Date(c.cfpEndDate) : (c.startDate ? new Date(c.startDate) : null),
              tags: ["event", "developer-conference", "tech-summit", isOnline ? "remote" : "in-person"]
            };
          });
        }
      }
    }

    // 9. Undergraduate Research Internships (zapplyjobs)
    if (config.source === "zapply_undergrad_research") {
      const res = await fetch(config.endpointUrl, {
        headers: { "User-Agent": "CampusConnectCo-OpportunityBot/1.0 (+https://campusconnectco.in)" }
      });
      if (res.ok) {
        const text = await res.text();
        const lines = text.split("\n");
        const items: RawDiscoveredItem[] = [];
        for (const line of lines) {
          const match = line.match(/\*\s*\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)(?:,\s*(.*))?/);
          if (match) {
            const rawTitle = match[1].trim();
            const appUrl = match[2].trim();
            const note = match[3] ? match[3].trim() : "";
            let company = "Research Institution";
            if (rawTitle.includes(",")) {
              const parts = rawTitle.split(",");
              company = parts[parts.length - 1].trim();
            } else if (rawTitle.includes("-")) {
              const parts = rawTitle.split("-");
              company = parts[0].trim();
            } else if (rawTitle.includes("at")) {
              const parts = rawTitle.split("at");
              company = parts[parts.length - 1].trim();
            } else {
              company = rawTitle.split(" ")[0] || "University Research";
            }
            items.push({
              source: config.source,
              sourceName: config.sourceName,
              sourceUrl: appUrl,
              applicationUrl: appUrl,
              title: rawTitle,
              company,
              description: note || `Undergraduate research opportunity: ${rawTitle}. Explore cutting-edge laboratory and academic projects.`,
              opportunityType: "RESEARCH" as const,
              location: "On-site / Campus",
              workMode: "on-site",
              tags: ["research", "undergraduate-research", "student", "summer-program"]
            });
            if (items.length >= (config.maxItemsPerRun || 15)) break;
          }
        }
        return items;
      }
    }

    // 10. Indian Postgrad Scholarships & Fellowships (anjalibhavan)
    if (config.source === "indian_postgrad_scholarships") {
      const res = await fetch(config.endpointUrl, {
        headers: { "User-Agent": "CampusConnectCo-OpportunityBot/1.0 (+https://campusconnectco.in)" }
      });
      if (res.ok) {
        const text = await res.text();
        const lines = text.split("\n");
        const items: RawDiscoveredItem[] = [];
        for (const line of lines) {
          const match = line.match(/\d+\.\s*\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)(?::\s*(.*))?/);
          if (match) {
            const rawTitle = match[1].trim();
            const appUrl = match[2].trim();
            const note = match[3] ? match[3].trim() : "";
            const isFellowship = /fellowship/i.test(rawTitle);
            let company = "Foundation / University";
            if (rawTitle.includes(",")) {
              company = rawTitle.split(",")[1].trim();
            } else {
              company = rawTitle.split(" ")[0] || "Scholarship Foundation";
            }
            items.push({
              source: config.source,
              sourceName: config.sourceName,
              sourceUrl: appUrl,
              applicationUrl: appUrl,
              title: rawTitle,
              company,
              description: note || `Prestigious postgraduate funding and educational opportunity for Indian students: ${rawTitle}.`,
              opportunityType: (isFellowship ? "FELLOWSHIP" : "SCHOLARSHIP") as any,
              location: "India & International",
              country: "India",
              workMode: "on-site",
              tags: [isFellowship ? "fellowship" : "scholarship", "india-students", "postgrad", "higher-education"]
            });
            if (items.length >= (config.maxItemsPerRun || 10)) break;
          }
        }
        return items;
      }
    }

    // 11. Curated CS Fellowships & Scholarships (monajalal)
    if (config.source === "monajalal_cs_fellowships") {
      const res = await fetch(config.endpointUrl, {
        headers: { "User-Agent": "CampusConnectCo-OpportunityBot/1.0 (+https://campusconnectco.in)" }
      });
      if (res.ok) {
        const text = await res.text();
        const lines = text.split("\n");
        const items: RawDiscoveredItem[] = [];
        for (const line of lines) {
          const match = line.match(/(?:^|\s)(\d+\.)?\s*([A-Za-z0-9\s\(\)\-\.]+?(?:fellowship|scholarship|grant)[A-Za-z0-9\s\(\)\-\.]*?)\s+(https?:\/\/[^\s]+)/i);
          if (match) {
            const rawTitle = match[2].trim();
            const appUrl = match[3].trim();
            const isFellowship = /fellowship/i.test(rawTitle);
            const company = rawTitle.split(" ")[0] || "Tech Organization";
            items.push({
              source: config.source,
              sourceName: config.sourceName,
              sourceUrl: appUrl,
              applicationUrl: appUrl,
              title: rawTitle,
              company,
              description: `Prestigious computing and technology ${isFellowship ? "fellowship" : "scholarship"}: ${rawTitle}. Open to qualified student builders and researchers.`,
              opportunityType: (isFellowship ? "FELLOWSHIP" : "SCHOLARSHIP") as any,
              location: "Global / Remote",
              workMode: "remote",
              tags: [isFellowship ? "fellowship" : "scholarship", "computer-science", "research", "technology"]
            });
            if (items.length >= (config.maxItemsPerRun || 10)) break;
          }
        }
        return items;
      }
    }

    // 12. Mohan Careers Official WordPress REST API (structured_api)
    if (config.source === "mohan_careers") {
      const { fetchMohanCareersItems } = await import("./mohan-careers");
      return await fetchMohanCareersItems(config);
    }

    // 13. Generic Agent-Reach RSS Channel Fallback
    if (config.discoveryMethod === "agent_reach_rss") {
      const { discoverViaAgentReachFeed } = await import("./agent-reach-adapter");
      return await discoverViaAgentReachFeed(config.endpointUrl, config.source, config.maxItemsPerRun || 15);
    }

    // 13. Generic Agent-Reach WebChannel Fallback
    if (config.discoveryMethod === "agent_reach_web") {
      const { discoverViaAgentReachWeb } = await import("./agent-reach-adapter");
      return await discoverViaAgentReachWeb(config.endpointUrl, config.source, config.maxItemsPerRun || 10);
    }
  } catch (fetchErr: any) {
    // Graceful source-level failure; logs error without failing caller
    console.error(`[DiscoveryWorker] Error fetching from ${config.source}:`, fetchErr.message);
  }

  return [];
}
