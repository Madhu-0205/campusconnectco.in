/**
 * Opportunity Management Tools for AI Agents
 *
 * Enforces controlled mutations:
 * Updates are performed strictly within allowed schema fields and never
 * fabricate arbitrary states or bypass policy gates.
 */

import prisma from "@/lib/prisma";
import { OpportunityIntelligenceData } from "../core/types";
import { ToolExecutionError } from "../core/errors";

export interface UpdateVerificationInput {
  opportunityId: string;
  sourceTrust: string;
  opportunityAuthenticity: string;
  applicationDestination: string;
  verified: boolean;
}

/**
 * Updates the verification state of an opportunity record.
 * Restricted to verified policy gate consumers.
 */
export async function updateOpportunityVerification(input: UpdateVerificationInput): Promise<boolean> {
  if (!input.opportunityId) {
    throw new ToolExecutionError("opportunity.updateVerification", "Missing opportunity ID");
  }

  try {
    // Only update existing internship records
    const existing = await prisma.internship.findUnique({
      where: { id: input.opportunityId },
      select: { id: true, tags: true }
    });

    if (!existing) {
      return false;
    }

    // Embed verification metadata in tags/metadata without breaking schema
    const currentTags = existing.tags ? existing.tags.split(",").map((t) => t.trim()) : [];
    const filteredTags = currentTags.filter(
      (t) => !t.startsWith("trust:") && !t.startsWith("auth:") && !t.startsWith("dest:") && t !== "AI_VERIFIED"
    );

    if (input.verified) {
      filteredTags.push("AI_VERIFIED");
    }
    filteredTags.push(`trust:${input.sourceTrust.toLowerCase()}`);
    filteredTags.push(`auth:${input.opportunityAuthenticity.toLowerCase()}`);
    filteredTags.push(`dest:${input.applicationDestination.toLowerCase()}`);

    await prisma.internship.update({
      where: { id: input.opportunityId },
      data: {
        tags: filteredTags.join(", "),
        updatedAt: new Date()
      }
    });

    return true;
  } catch (err: any) {
    throw new ToolExecutionError("opportunity.updateVerification", err instanceof Error ? err.message : String(err));
  }
}

/**
 * Enriches an opportunity with structured intelligence extracted by Agent 1.
 * Only updates fields if they are currently null or empty (preserves deterministic source truth).
 */
export async function enrichOpportunityWithIntelligence(
  opportunityId: string,
  data: OpportunityIntelligenceData
): Promise<boolean> {
  if (!opportunityId) {
    throw new ToolExecutionError("opportunity.enrich", "Missing opportunity ID");
  }

  try {
    const existing = await prisma.internship.findUnique({
      where: { id: opportunityId }
    });

    if (!existing) return false;

    const updates: Record<string, any> = {};

    // Only backfill missing fields; never overwrite existing deterministic data
    if (!existing.skills && data.skills.length > 0) {
      updates.skills = data.skills.join(", ");
    }
    if (existing.stipend === null && data.compensation.stipend !== null) {
      updates.stipend = data.compensation.stipend;
    }
    if (!existing.duration && data.duration) {
      updates.duration = data.duration;
    }
    if (!existing.location && data.location.city) {
      updates.location = [data.location.city, data.location.state, data.location.country].filter(Boolean).join(", ");
    }
    if (!existing.deadline && data.deadline) {
      const parsedDate = new Date(data.deadline);
      if (!isNaN(parsedDate.getTime())) {
        updates.deadline = parsedDate;
      }
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = new Date();
      await prisma.internship.update({
        where: { id: opportunityId },
        data: updates
      });
      return true;
    }

    return false;
  } catch (err: any) {
    throw new ToolExecutionError("opportunity.enrich", err instanceof Error ? err.message : String(err));
  }
}
