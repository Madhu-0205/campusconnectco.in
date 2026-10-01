/**
 * Background Job 1 — Opportunity Monitoring
 *
 * Responsibilities:
 * - Scan active opportunities in batches
 * - Detect deadline expiration
 * - Check application destination reachability
 * - Detect confirmed opportunity closure (404, 410, or page closure markers)
 * - Safely mark EXPIRED or CLOSED without destroying provenance
 */

import prisma from "@/lib/prisma";
import { checkUrlTool, fetchPageTool } from "../../tools/web";
import { isOpportunityExpired } from "@/lib/opportunities/lifecycle";

export interface MonitorJobResult {
  checkedCount: number;
  expiredCount: number;
  closedCount: number;
  unreachableCount: number;
  unchangedCount: number;
  errors: string[];
}

export async function runOpportunityMonitoringJob(batchSize = 15): Promise<MonitorJobResult> {
  const result: MonitorJobResult = {
    checkedCount: 0,
    expiredCount: 0,
    closedCount: 0,
    unreachableCount: 0,
    unchangedCount: 0,
    errors: []
  };

  try {
    // 1. Fetch batch of active opportunities (OPEN status, non-deleted)
    const candidates = await prisma.internship.findMany({
      where: {
        status: "OPEN",
        deletedAt: null
      },
      orderBy: { updatedAt: "asc" },
      take: batchSize,
      select: {
        id: true,
        title: true,
        company: true,
        deadline: true,
        applicationLink: true,
        tags: true
      }
    });

    result.checkedCount = candidates.length;

    for (const opp of candidates) {
      // Check 1: Deadline expiration
      if (opp.deadline && isOpportunityExpired(opp.deadline)) {
        await prisma.internship.update({
          where: { id: opp.id },
          data: {
            status: "EXPIRED",
            updatedAt: new Date()
          }
        });
        result.expiredCount++;
        continue;
      }

      // Check 2: Application link reachability
      if (opp.applicationLink) {
        try {
          const urlCheck = await checkUrlTool(opp.applicationLink);
          if (!urlCheck.valid) {
            result.unreachableCount++;
            continue;
          }

          // Probe page headers / lightweight fetch
          const page = await fetchPageTool(opp.applicationLink, { timeoutMs: 4000, maxBytes: 50_000 });
          if (page.status === 404 || page.status === 410) {
            // Confirmed removed
            await prisma.internship.update({
              where: { id: opp.id },
              data: {
                status: "CLOSED",
                updatedAt: new Date()
              }
            });
            result.closedCount++;
            continue;
          }

          // Check for affirmative closure text markers
          const textLower = page.textContent.toLowerCase();
          const isClosed =
            textLower.includes("this job is closed") ||
            textLower.includes("no longer accepting applications") ||
            textLower.includes("this position has been filled");

          if (isClosed) {
            await prisma.internship.update({
              where: { id: opp.id },
              data: {
                status: "CLOSED",
                updatedAt: new Date()
              }
            });
            result.closedCount++;
            continue;
          }

          result.unchangedCount++;
        } catch {
          // Network hiccup — do not prematurely close opportunity
          result.unchangedCount++;
        }
      } else {
        result.unchangedCount++;
      }
    }
  } catch (err: any) {
    result.errors.push(err instanceof Error ? err.message : String(err));
  }

  return result;
}
