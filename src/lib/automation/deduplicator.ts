/**
 * 8-Tier Deduplication Engine
 * CampusConnectCo — Phase 16
 *
 * High-performance consolidation:
 * Evaluates candidate against 8-tier deduplication hierarchy using consolidated OR queries
 * to minimize database roundtrips while preserving exact matching semantics.
 */

import rawPrisma from "@/lib/prisma";
const prisma = rawPrisma as any;

import { normalizeCompanyForMatching } from "./authenticity";
import { canonicalizeUrl, normalizeTitle } from "./normalizer";
import { DeduplicationResult } from "./types";

export interface DeduplicationCandidate {
  id?: string;
  source: string;
  externalId?: string | null;
  applicationUrl: string;
  sourceUrl: string;
  title: string;
  company: string;
  deadline?: Date | null;
  location?: string | null;
  opportunityType?: string;
}

/**
 * Checks an opportunity candidate against existing records using 8-tier hierarchy.
 */
export async function checkDuplicate(candidate: DeduplicationCandidate): Promise<DeduplicationResult> {
  const { canonicalUrl } = canonicalizeUrl(candidate.applicationUrl);
  const sourceCanonical = candidate.sourceUrl ? canonicalizeUrl(candidate.sourceUrl).canonicalUrl : "";
  const normTitle = normalizeTitle(candidate.title);
  const normCompany = normalizeCompanyForMatching(candidate.company);

  // --------------------------------------------------------------------------
  // Tiers 1–5: Consolidated Staging Check (1 single database query)
  // --------------------------------------------------------------------------
  const stagingMatch = await prisma.discoveredOpportunity.findFirst({
    where: {
      OR: [
        { applicationUrl: candidate.applicationUrl },
        { canonicalUrl },
        ...(candidate.externalId && candidate.source ? [{ source: candidate.source, externalId: candidate.externalId }] : []),
        ...(sourceCanonical ? [{ sourceUrl: { contains: sourceCanonical, mode: "insensitive" as const } }] : []),
        {
          normalizedCompany: normCompany,
          normalizedTitle: normTitle,
          status: { notIn: ["REJECTED", "REMOVED"] }
        }
      ],
      ...(candidate.id ? { NOT: { id: candidate.id } } : {})
    },
    select: {
      id: true,
      applicationUrl: true,
      canonicalUrl: true,
      source: true,
      externalId: true,
      sourceUrl: true,
      normalizedCompany: true,
      normalizedTitle: true
    }
  });

  if (stagingMatch) {
    // Determine the highest matching tier
    if (stagingMatch.applicationUrl === candidate.applicationUrl) {
      return {
        isDuplicate: true,
        matchTier: 1,
        matchedId: stagingMatch.id,
        matchedType: "STAGING",
        confidence: "EXACT",
        explanation: `Tier 1: Exact application URL in staging (ID: ${stagingMatch.id}).`
      };
    }
    if (stagingMatch.canonicalUrl === canonicalUrl) {
      return {
        isDuplicate: true,
        matchTier: 2,
        matchedId: stagingMatch.id,
        matchedType: "STAGING",
        confidence: "CANONICAL",
        explanation: `Tier 2: Canonical application URL in staging (ID: ${stagingMatch.id}).`
      };
    }
    if (candidate.externalId && stagingMatch.externalId === candidate.externalId && stagingMatch.source === candidate.source) {
      return {
        isDuplicate: true,
        matchTier: 3,
        matchedId: stagingMatch.id,
        matchedType: "STAGING",
        confidence: "EXACT",
        explanation: `Tier 3: Source external ID match in staging (ID: ${stagingMatch.id}).`
      };
    }
    if (stagingMatch.sourceUrl && sourceCanonical && stagingMatch.sourceUrl.toLowerCase().includes(sourceCanonical.toLowerCase())) {
      return {
        isDuplicate: true,
        matchTier: 4,
        matchedId: stagingMatch.id,
        matchedType: "STAGING",
        confidence: "CANONICAL",
        explanation: `Tier 4: Source URL match in staging (ID: ${stagingMatch.id}).`
      };
    }
    return {
      isDuplicate: true,
      matchTier: 5,
      matchedId: stagingMatch.id,
      matchedType: "STAGING",
      confidence: "METRIC",
      explanation: `Tier 5: Matching company (${candidate.company}) and title (${candidate.title}) in staging.`
    };
  }

  // --------------------------------------------------------------------------
  // Tiers 6–8: Active CampusConnect Database Checks (Concurrent Promise.all)
  // --------------------------------------------------------------------------
  const [dbInternship, dbGig] = await Promise.all([
    prisma.internship.findFirst({
      where: {
        OR: [
          { applicationLink: candidate.applicationUrl },
          { applicationLink: canonicalUrl },
          ...(candidate.externalId ? [{ externalId: candidate.externalId }] : []),
          {
            company: { equals: candidate.company, mode: "insensitive" },
            title: { equals: candidate.title, mode: "insensitive" }
          }
        ],
        deletedAt: null
      },
      select: { id: true, applicationLink: true, externalId: true, company: true, title: true }
    }),
    prisma.gig.findFirst({
      where: {
        title: { equals: candidate.title, mode: "insensitive" },
        deletedAt: null
      },
      select: { id: true }
    })
  ]);

  if (dbInternship) {
    const isUrlMatch =
      dbInternship.applicationLink === candidate.applicationUrl ||
      dbInternship.applicationLink === canonicalUrl ||
      (candidate.externalId && dbInternship.externalId === candidate.externalId);

    return {
      isDuplicate: true,
      matchTier: isUrlMatch ? 6 : 7,
      matchedId: dbInternship.id,
      matchedType: "CAMPUSCONNECT_INTERNSHIP",
      confidence: isUrlMatch ? "EXACT" : "METRIC",
      explanation: isUrlMatch
        ? `Tier 6: Already published as active CampusConnect Internship (ID: ${dbInternship.id}).`
        : `Tier 7: Matching company and title in active CampusConnect Internships (ID: ${dbInternship.id}).`
    };
  }

  if (dbGig) {
    return {
      isDuplicate: true,
      matchTier: 8,
      matchedId: dbGig.id,
      matchedType: "CAMPUSCONNECT_GIG",
      confidence: "METRIC",
      explanation: `Tier 8: Matching title in active CampusConnect Gigs (ID: ${dbGig.id}).`
    };
  }

  // No duplicate found across all 8 tiers
  return {
    isDuplicate: false,
    matchTier: null,
    matchedId: null,
    matchedType: null,
    confidence: "NONE"
  };
}
