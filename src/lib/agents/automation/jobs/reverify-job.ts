/**
 * Background Job 2 — Opportunity Reverification
 *
 * Responsibilities:
 * - Query active opportunities with unverified, disputed, or stale verification status
 * - Re-evaluate using VerificationAgent
 * - Validate against Verification Policy Gate
 * - Controlled database update
 */

import prisma from "@/lib/prisma";
import { VerificationAgent } from "../../opportunity/verification-agent";
import { updateOpportunityVerification } from "../../tools/opportunity";
import { saveAgentDecision, saveEvidence } from "../../tools/database";

export interface ReverifyJobResult {
  attempted: number;
  verified: number;
  unverified: number;
  disputed: number;
  errors: string[];
}

export async function runOpportunityReverificationJob(batchSize = 10): Promise<ReverifyJobResult> {
  const result: ReverifyJobResult = {
    attempted: 0,
    verified: 0,
    unverified: 0,
    disputed: 0,
    errors: []
  };

  const agent = new VerificationAgent();

  try {
    // Look for active opportunities that haven't been verified or need reverification
    const candidates = await prisma.internship.findMany({
      where: {
        status: "OPEN",
        deletedAt: null,
        OR: [
          { tags: null },
          { tags: { not: { contains: "AI_VERIFIED" } } }
        ]
      },
      orderBy: { updatedAt: "asc" },
      take: batchSize
    });

    result.attempted = candidates.length;

    for (const cand of candidates) {
      if (!cand.applicationLink) continue;

      try {
        const verifResult = await agent.execute({
          opportunityId: cand.id,
          title: cand.title,
          company: cand.company,
          sourceUrl: cand.source || undefined,
          applicationUrl: cand.applicationLink
        });

        if (verifResult.success && verifResult.data) {
          const data = verifResult.data;
          if (data.overallVerified) {
            result.verified++;
          } else if (data.opportunityAuthenticity === "DISPUTED") {
            result.disputed++;
          } else {
            result.unverified++;
          }

          // Persist updated verification state
          await updateOpportunityVerification({
            opportunityId: cand.id,
            sourceTrust: data.sourceTrust,
            opportunityAuthenticity: data.opportunityAuthenticity,
            applicationDestination: data.applicationDestination,
            verified: data.overallVerified
          });

          // Persist evidence records
          for (const ev of verifResult.evidence) {
            await saveEvidence(ev);
          }

          // Persist decisions
          for (const dec of verifResult.decisions) {
            await saveAgentDecision(dec);
          }
        }
      } catch (err: any) {
        result.errors.push(`Reverification failed for ${cand.id}: ${err?.message || err}`);
      }
    }
  } catch (err: any) {
    result.errors.push(err instanceof Error ? err.message : String(err));
  }

  return result;
}
