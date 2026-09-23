/**
 * Staging Publisher Strategy
 * CampusConnectCo — Phase 15
 *
 * Handles opportunity types that do not yet have a dedicated Founder UI workflow
 * (e.g. standalone Job, Hackathon, Fellowship, Competition tables).
 *
 * As mandated:
 * "If a type does not yet have a real Founder posting workflow, DO NOT fabricate one.
 * Instead: DISCOVERED -> normalized -> reviewed -> stored in staging -> wait for supported publishing workflow."
 */

import type { Page } from "playwright";

import rawPrisma from "@/lib/prisma";
const prisma = rawPrisma as any;

import { CanonicalOpportunity, PublicationResult } from "../types";

import { FieldMapping, OpportunityPublisherStrategy, publisherRegistry } from "./base";

export class StagingPublisherStrategy implements OpportunityPublisherStrategy {
  readonly opportunityType = "OTHER" as const;
  readonly targetRoute = "/dashboard/founder/opportunity-agent";
  readonly name = "Staging Strategy (Awaiting Dedicated Founder UI)";

  readonly fieldMappings: FieldMapping[] = [];

  validate(_opportunity: CanonicalOpportunity): { valid: boolean; errors: string[] } {
    return { valid: true, errors: [] };
  }

  async publish(page: Page, opportunity: CanonicalOpportunity): Promise<PublicationResult> {
    // Record in staging review queue with explicit explanation
    if (opportunity.id) {
      await prisma.discoveredOpportunity.update({
        where: { id: opportunity.id },
        data: {
          status: "NEEDS_REVIEW",
          reviewNotes: `Opportunity type "${opportunity.opportunityType}" does not yet have a dedicated Founder posting form in CampusConnectCo. Retained in staging awaiting supported workflow.`
        }
      });
    }

    return {
      success: true,
      publishedOpportunityType: "STAGED",
      publishedUrl: `/dashboard/founder/opportunity-agent?id=${opportunity.id}`,
      publishedAt: new Date()
    };
  }

  async verifyPublication(opportunityId: string): Promise<boolean> {
    const item = await prisma.discoveredOpportunity.findUnique({
      where: { id: opportunityId },
      select: { id: true }
    });
    return !!item;
  }
}

// Register for unsupported types
const stagingStrategy = new StagingPublisherStrategy();
publisherRegistry.register(stagingStrategy);
