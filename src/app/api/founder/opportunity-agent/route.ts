/**
 * Opportunity Agent & Review Queue API Endpoint
 * CampusConnectCo — Phase 16
 *
 * Provides real-time metrics, multi-source health data, category breakdown,
 * confidence filtering, and handles Founder manual review actions
 * (Approve & Publish, Reject, Edit, Mark Verified, Retry, Remove).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { protectApi } from "@/lib/auth-checks";
import { evaluateLifecycle } from "@/lib/automation/lifecycle";
import { validateSafeUrl } from "@/lib/automation/normalizer";
import { publishOpportunityThroughFounderWorkflow } from "@/lib/automation/publishers/runner";
import { runDiscoveryForSource } from "@/lib/automation/sources/discovery-worker";
import { getAllEnabledSources, getSourceConfig } from "@/lib/automation/sources/registry";
import { runDueOpportunitySources } from "@/lib/automation/sources/scheduler";
import {
  validateStateTransition,
  createHumanAuthorization,
  verifyHumanAuthorization,
  consumeHumanAuthorization,
  revokeHumanAuthorization,
  createAuditEvent,
  appendAuditEvent,
  type ActorContext
} from "@/lib/automation/state-machine";
import { CanonicalOpportunity, LifecycleState } from "@/lib/automation/types";
import rawPrisma from "@/lib/prisma";
const prisma = rawPrisma as any;

export const dynamic = "force-dynamic";

const CANONICAL_TYPES = [
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
] as const;

const ReviewActionSchema = z.object({
  action: z.enum([
    "approve",
    "reject",
    "restore",
    "unpublish",
    "edit",
    "mark_verified",
    "retry",
    "remove",
    "trigger_discovery",
    "recheck_opportunity",
    "recheck_source",
    "run_due_sources"
  ]),
  opportunityId: z.string().uuid().optional(),
  sourceId: z.string().optional(),
  reason: z.string().optional(),
  editedFields: z.object({
    title: z.string().optional(),
    company: z.string().optional(),
    description: z.string().optional(),
    opportunityType: z.string().optional(),
    location: z.string().optional().nullable(),
    compensation: z.number().optional().nullable(),
    deadline: z.string().optional().nullable(),
    skills: z.string().optional().nullable(),
    workMode: z.enum(["remote", "hybrid", "on-site"]).optional()
  }).optional()
});

/**
 * GET - Retrieve dashboard metrics, source health, category breakdown, and review queue
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await protectApi(["FOUNDER", "ADMIN"], { disallowAutomationBot: true });
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status") || "NEEDS_REVIEW";
    const typeFilter = searchParams.get("type") || "ALL";
    const freshnessFilter = searchParams.get("freshness") || "ALL";
    const confidenceFilter = searchParams.get("confidence") || "ALL";
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Build Prisma query condition
    const whereCondition: any = {};
    if (statusFilter !== "ALL") {
      whereCondition.status = statusFilter;
    }
    if (typeFilter !== "ALL") {
      whereCondition.opportunityType = typeFilter;
    }
    if (freshnessFilter !== "ALL") {
      whereCondition.metadata = {
        path: ["lifecycleState"],
        equals: freshnessFilter
      };
    }
    if (confidenceFilter === "HIGH") {
      whereCondition.qualityScore = { gte: 75 };
    } else if (confidenceFilter === "MEDIUM") {
      whereCondition.qualityScore = { gte: 50, lt: 75 };
    } else if (confidenceFilter === "LOW") {
      whereCondition.qualityScore = { lt: 50 };
    }

    // 1. Compute authoritative real-time metrics
    const [
      discoveredToday,
      totalDiscovered,
      publishedCount,
      duplicatesCount,
      rejectedCount,
      needsReviewCount,
      sourceHealthList,
      recentRuns,
      queueItems,
      typeBreakdown,
      allMetadataItems
    ] = await Promise.all([
      prisma.discoveredOpportunity.count({ where: { discoveredAt: { gte: startOfToday } } }),
      prisma.discoveredOpportunity.count(),
      prisma.discoveredOpportunity.count({ where: { status: "PUBLISHED" } }),
      prisma.sourceHealth.aggregate({ _sum: { duplicatesCount: true } }),
      prisma.discoveredOpportunity.count({ where: { status: "REJECTED" } }),
      prisma.discoveredOpportunity.count({ where: { status: "NEEDS_REVIEW" } }),
      prisma.sourceHealth.findMany({ orderBy: { updatedAt: "desc" }, take: 20 }),
      prisma.automationRun.findMany({ orderBy: { startedAt: "desc" }, take: 10 }),
      prisma.discoveredOpportunity.findMany({
        where: whereCondition,
        orderBy: [{ qualityScore: "desc" }, { discoveredAt: "desc" }],
        take: limit
      }),
      prisma.discoveredOpportunity.groupBy({
        by: ["opportunityType"],
        _count: { id: true }
      }),
      prisma.discoveredOpportunity.findMany({
        select: { metadata: true }
      })
    ]);

    const categoryCounts: Record<string, number> = {};
    for (const t of CANONICAL_TYPES) {
      categoryCounts[t] = 0;
    }
    for (const b of typeBreakdown) {
      categoryCounts[b.opportunityType] = b._count.id;
    }

    const freshnessCounts: Record<string, number> = {
      ALL: allMetadataItems.length,
      ACTIVE: 0,
      STALE_REQUIRES_RECHECK: 0,
      CONFIRMED_EXPIRED: 0,
      CONFIRMED_INACTIVE: 0,
      SOURCE_UNAVAILABLE: 0
    };
    for (const item of allMetadataItems) {
      const meta = item.metadata as any;
      const state = meta?.lifecycleState;
      if (state && freshnessCounts[state] !== undefined) {
        freshnessCounts[state]++;
      }
    }

    return NextResponse.json({
      metrics: {
        discoveredToday,
        totalDiscovered,
        publishedCount,
        duplicatesCount: duplicatesCount?._sum?.duplicatesCount || 0,
        rejectedCount,
        needsReviewCount,
        autoPublishEnabled: process.env.OPPORTUNITY_AUTOPUBLISH_ENABLED === "true",
        categoryCounts,
        freshnessCounts
      },
      sourceHealth: sourceHealthList,
      recentRuns,
      reviewQueue: queueItems
    });
  } catch (err: any) {
    console.error("[GET /api/founder/opportunity-agent]", err);
    return NextResponse.json({ error: "Failed to fetch opportunity agent data." }, { status: 500 });
  }
}

/**
 * POST - Handle Review Actions & Manual Execution
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await protectApi(["FOUNDER", "ADMIN"], { disallowAutomationBot: true });
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const parsed = ReviewActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid action payload", details: parsed.error.issues }, { status: 400 });
    }

    const { action, opportunityId, sourceId, reason, editedFields } = parsed.data;

    // Trigger run due sources across all configured sources
    if (action === "run_due_sources") {
      const result = await runDueOpportunitySources();
      return NextResponse.json({ message: "Due opportunity sources executed successfully.", result });
    }

    // Trigger on-demand discovery / recheck for a source
    if (action === "trigger_discovery" || action === "recheck_source") {
      const config = sourceId ? getSourceConfig(sourceId) : getAllEnabledSources()[0];
      if (!config) {
        return NextResponse.json({ error: "Source configuration not found." }, { status: 404 });
      }
      const runResult = await runDiscoveryForSource(config);
      return NextResponse.json({ message: "Discovery run completed.", result: runResult });
    }

    if (!opportunityId) {
      return NextResponse.json({ error: "opportunityId is required for this action." }, { status: 400 });
    }

    const item = await prisma.discoveredOpportunity.findUnique({
      where: { id: opportunityId }
    });
    if (!item) {
      return NextResponse.json({ error: "Discovered opportunity not found." }, { status: 404 });
    }

    // ------------------------------------------------------------------------
    // Action 0: Recheck Opportunity (Live URL revalidation & freshness check)
    // ------------------------------------------------------------------------
    if (action === "recheck_opportunity") {
      const urlCheck = validateSafeUrl(item.applicationUrl);
      if (!urlCheck.valid) {
        return NextResponse.json({ error: `URL safety check failed: ${urlCheck.error}` }, { status: 400 });
      }

      let httpStatus = 0;
      let newLifecycleState: LifecycleState = "ACTIVE";
      let errorMessage: string | null = null;

      try {
        const res = await fetch(urlCheck.cleanUrl || item.applicationUrl, {
          method: "HEAD",
          headers: {
            "User-Agent": "CampusConnectBot/1.0 (+https://campusconnectco.in/bot)"
          },
          signal: AbortSignal.timeout(5000),
          redirect: "follow"
        });
        httpStatus = res.status;
        if (httpStatus >= 200 && httpStatus < 400) {
          if (item.deadline && new Date(item.deadline).getTime() < Date.now()) {
            newLifecycleState = "CONFIRMED_EXPIRED";
          } else {
            newLifecycleState = "ACTIVE";
          }
        } else if (httpStatus === 404 || httpStatus === 410) {
          newLifecycleState = "CONFIRMED_INACTIVE";
        } else if (httpStatus >= 500) {
          newLifecycleState = "SOURCE_UNAVAILABLE";
        } else {
          newLifecycleState = "SOURCE_UNAVAILABLE";
        }
      } catch (fetchErr: any) {
        errorMessage = fetchErr.message;
        newLifecycleState = "SOURCE_UNAVAILABLE";
      }

      const now = new Date();
      const existingMeta = (item.metadata as any) || {};
      const updatedItem = await prisma.discoveredOpportunity.update({
        where: { id: opportunityId },
        data: {
          lastSeenAt: now,
          reviewNotes: `Rechecked by ${auth.user?.email || "Founder"} at ${now.toISOString()} [HTTP ${httpStatus || "ERR: " + errorMessage}]`,
          metadata: {
            ...existingMeta,
            lifecycleState: newLifecycleState,
            lastVerifiedAt: now.toISOString(),
            lastRecheckedAt: now.toISOString(),
            recheckHttpStatus: httpStatus,
            recheckError: errorMessage
          }
        }
      });

      return NextResponse.json({
        message: "Opportunity rechecked successfully.",
        lifecycleState: newLifecycleState,
        lastVerifiedAt: now.toISOString(),
        httpStatus,
        error: errorMessage
      });
    }

    // Construct verified actor context
    const actor: ActorContext = {
      email: auth.user?.email || "founder@campusconnectco.in",
      role: auth.user?.role || "FOUNDER",
      isBot: false
    };

    // ------------------------------------------------------------------------
    // Action 1: Approve & Publish through authentic Founder workflow
    // ------------------------------------------------------------------------
    if (action === "approve" || action === "retry") {
      // 1. Strict Idempotency Check
      if (item.status === "PUBLISHED" && item.publishedOpportunityId) {
        return NextResponse.json({
          message: "Opportunity is already published.",
          publishedOpportunityId: item.publishedOpportunityId,
          publishedUrl:
            item.publishedOpportunityType === "GIG"
              ? `/gigs/${item.publishedOpportunityId}`
              : `/internships/${item.publishedOpportunityId}`,
          idempotent: true
        });
      }

      // 2. Server-Enforced State Machine Validation (NEEDS_REVIEW -> APPROVED)
      const transitionValidation = validateStateTransition({
        currentStatus: item.status,
        targetStatus: "APPROVED",
        actor,
        opportunity: item,
        reason
      });

      if (!transitionValidation.valid) {
        return NextResponse.json(
          { error: transitionValidation.error },
          { status: transitionValidation.statusCode || 400 }
        );
      }

      // 3. Generate Server-Verifiable Human Publication Authorization Token (Replay Protected)
      const humanAuth = createHumanAuthorization(opportunityId, actor);
      const approveEvent = createAuditEvent({
        action: "APPROVE",
        actor,
        fromStatus: item.status,
        toStatus: "APPROVED",
        reason: reason || "Approved by Founder during review.",
        details: { authToken: humanAuth.token }
      });
      const metaWithApproval = {
        ...appendAuditEvent(item.metadata, approveEvent),
        authorization: humanAuth
      };

      // Record intermediate APPROVED state with verifiable authorization
      await prisma.discoveredOpportunity.update({
        where: { id: opportunityId },
        data: {
          status: "APPROVED",
          verificationState: "ADMIN_VERIFIED",
          reviewNotes: `Approved by ${actor.email} at ${new Date().toISOString()}`,
          metadata: metaWithApproval as any
        }
      });

      // 4. Construct Canonical Opportunity for Dedicated Bot Publisher
      const canonical: CanonicalOpportunity = {
        id: item.id,
        source: item.source,
        sourceName: item.sourceName,
        sourceUrl: item.sourceUrl,
        externalId: item.externalId,
        canonicalUrl: item.canonicalUrl || item.applicationUrl,
        canonicalHash: item.canonicalHash || "",
        applicationUrl: item.applicationUrl,
        title: item.title,
        normalizedTitle: item.normalizedTitle,
        company: item.company,
        normalizedCompany: item.normalizedCompany,
        description: item.description,
        opportunityType: item.opportunityType as any,
        location: item.location,
        city: item.city,
        state: item.state,
        country: item.country,
        workMode: item.workMode as any,
        compensation: item.compensation,
        currency: item.currency || "INR",
        skills: item.skills,
        duration: item.duration,
        deadline: item.deadline,
        startDate: item.startDate,
        sourceTrust: item.sourceTrust as any,
        verificationState: "ADMIN_VERIFIED",
        qualityScore: item.qualityScore,
        spamRiskScore: item.spamRiskScore,
        status: "APPROVED",
        discoveredAt: item.discoveredAt,
        lastSeenAt: item.lastSeenAt
      };

      // 5. Dedicated Bot executes publication via real Founder UI workflow
      const pubResult = await publishOpportunityThroughFounderWorkflow({
        opportunity: canonical
      });

      if (!pubResult.success || !pubResult.publishedOpportunityId) {
        return NextResponse.json(
          {
            error: pubResult.error || "Publication through Founder workflow unconfirmed.",
            unconfirmed: pubResult.unconfirmed
          },
          { status: 422 }
        );
      }

      // 6. Consume Authorization Token (Replay Protection) & Bot Publication Audit Event
      const botActor: ActorContext = {
        email: process.env.FOUNDER_BOT_EMAIL || "opportunity-bot@campusconnectco.in",
        role: "FOUNDER",
        isBot: true
      };
      const consumedAuth = consumeHumanAuthorization(humanAuth);
      const publishEvent = createAuditEvent({
        action: "PUBLISH",
        actor: botActor,
        fromStatus: "APPROVED",
        toStatus: "PUBLISHED",
        details: {
          publishedOpportunityId: pubResult.publishedOpportunityId,
          publishedOpportunityType: pubResult.publishedOpportunityType,
          publishedUrl: pubResult.publishedUrl,
          consumedAuthToken: consumedAuth.token
        }
      });

      const freshItem = await prisma.discoveredOpportunity.findUnique({
        where: { id: opportunityId },
        select: { metadata: true }
      });
      const finalMeta = {
        ...appendAuditEvent(freshItem?.metadata || metaWithApproval, publishEvent),
        authorization: consumedAuth
      };

      await prisma.discoveredOpportunity.update({
        where: { id: opportunityId },
        data: {
          status: "PUBLISHED",
          publishedOpportunityId: pubResult.publishedOpportunityId,
          publishedOpportunityType: pubResult.publishedOpportunityType,
          publishedAt: pubResult.publishedAt || new Date(),
          publishedBy: "AUTOMATION_BOT",
          metadata: finalMeta as any
        }
      });

      return NextResponse.json({
        message: "Opportunity successfully approved and published by dedicated bot!",
        publishedOpportunityId: pubResult.publishedOpportunityId,
        publishedUrl: pubResult.publishedUrl
      });
    }

    // ------------------------------------------------------------------------
    // Action 2: Reject with Mandatory Meaningful Reason & Audit Trail
    // ------------------------------------------------------------------------
    if (action === "reject") {
      const transitionValidation = validateStateTransition({
        currentStatus: item.status,
        targetStatus: "REJECTED",
        actor,
        opportunity: item,
        reason
      });

      if (!transitionValidation.valid) {
        return NextResponse.json(
          { error: transitionValidation.error },
          { status: transitionValidation.statusCode || 400 }
        );
      }

      const rejectEvent = createAuditEvent({
        action: "REJECT",
        actor,
        fromStatus: item.status,
        toStatus: "REJECTED",
        reason
      });

      // Revoke any active human authorization token
      const existingAuth = (item.metadata as any)?.authorization;
      const revokedAuth = revokeHumanAuthorization(existingAuth);
      const metaWithReject = appendAuditEvent(item.metadata, rejectEvent);
      if (revokedAuth) {
        (metaWithReject as any).authorization = revokedAuth;
      }

      await prisma.discoveredOpportunity.update({
        where: { id: opportunityId },
        data: {
          status: "REJECTED",
          rejectionReason: reason,
          metadata: metaWithReject
        }
      });
      return NextResponse.json({ message: "Opportunity marked as rejected.", reason });
    }

    // ------------------------------------------------------------------------
    // Action 3: Restore to Review Queue
    // ------------------------------------------------------------------------
    if (action === "restore") {
      const transitionValidation = validateStateTransition({
        currentStatus: item.status,
        targetStatus: "NEEDS_REVIEW",
        actor,
        opportunity: item,
        reason
      });

      if (!transitionValidation.valid) {
        return NextResponse.json(
          { error: transitionValidation.error },
          { status: transitionValidation.statusCode || 400 }
        );
      }

      const restoreEvent = createAuditEvent({
        action: "RESTORE",
        actor,
        fromStatus: item.status,
        toStatus: "NEEDS_REVIEW",
        reason: reason || "Restored to review queue by Founder."
      });

      await prisma.discoveredOpportunity.update({
        where: { id: opportunityId },
        data: {
          status: "NEEDS_REVIEW",
          rejectionReason: null,
          metadata: appendAuditEvent(item.metadata, restoreEvent)
        }
      });
      return NextResponse.json({ message: "Opportunity restored to review queue." });
    }

    // ------------------------------------------------------------------------
    // Action 4: Emergency Rollback / Unpublish
    // ------------------------------------------------------------------------
    if (action === "unpublish") {
      const transitionValidation = validateStateTransition({
        currentStatus: item.status,
        targetStatus: "NEEDS_REVIEW",
        actor,
        opportunity: item,
        reason
      });

      if (!transitionValidation.valid) {
        return NextResponse.json(
          { error: transitionValidation.error },
          { status: transitionValidation.statusCode || 400 }
        );
      }

      // Soft-delete downstream public record
      if (item.publishedOpportunityType === "INTERNSHIP" && item.publishedOpportunityId) {
        await prisma.internship.updateMany({
          where: { id: item.publishedOpportunityId },
          data: { status: "INACTIVE", deletedAt: new Date() }
        });
      } else if (item.publishedOpportunityType === "GIG" && item.publishedOpportunityId) {
        await prisma.gig.updateMany({
          where: { id: item.publishedOpportunityId },
          data: { status: "inactive", deletedAt: new Date() }
        });
      }

      const unpublishEvent = createAuditEvent({
        action: "UNPUBLISH",
        actor,
        fromStatus: "PUBLISHED",
        toStatus: "NEEDS_REVIEW",
        reason: reason || "Emergency rollback / unpublish executed by Founder."
      });

      // Revoke any remaining authorization
      const existingAuth = (item.metadata as any)?.authorization;
      const revokedAuth = revokeHumanAuthorization(existingAuth);
      const metaWithUnpublish = appendAuditEvent(item.metadata, unpublishEvent);
      if (revokedAuth) {
        (metaWithUnpublish as any).authorization = revokedAuth;
      }

      await prisma.discoveredOpportunity.update({
        where: { id: opportunityId },
        data: {
          status: "NEEDS_REVIEW",
          reviewNotes: `Unpublished by ${actor.email} at ${new Date().toISOString()}: ${reason || "Emergency unpublish"}`,
          metadata: metaWithUnpublish
        }
      });

      return NextResponse.json({ message: "Opportunity unpublished and rolled back to review queue." });
    }

    // ------------------------------------------------------------------------
    // Action 5: Mark Verified
    // ------------------------------------------------------------------------
    if (action === "mark_verified") {
      const verifyEvent = createAuditEvent({
        action: "EDIT",
        actor,
        fromStatus: item.status,
        toStatus: item.status,
        reason: "Marked verified by Founder."
      });

      await prisma.discoveredOpportunity.update({
        where: { id: opportunityId },
        data: {
          verificationState: "ADMIN_VERIFIED",
          reviewNotes: `Verified by ${auth.user?.email || "Founder"} at ${new Date().toISOString()}`,
          metadata: appendAuditEvent(item.metadata, verifyEvent)
        }
      });
      return NextResponse.json({ message: "Verification state updated to ADMIN_VERIFIED." });
    }

    // ------------------------------------------------------------------------
    // Action 6: Edit
    // ------------------------------------------------------------------------
    if (action === "edit" && editedFields) {
      const editEvent = createAuditEvent({
        action: "EDIT",
        actor,
        fromStatus: item.status,
        toStatus: item.status,
        details: { editedFields }
      });

      await prisma.discoveredOpportunity.update({
        where: { id: opportunityId },
        data: {
          ...(editedFields.title ? { title: editedFields.title } : {}),
          ...(editedFields.company ? { company: editedFields.company } : {}),
          ...(editedFields.description ? { description: editedFields.description } : {}),
          ...(editedFields.opportunityType ? { opportunityType: editedFields.opportunityType } : {}),
          ...(editedFields.location !== undefined ? { location: editedFields.location } : {}),
          ...(editedFields.compensation !== undefined ? { compensation: editedFields.compensation } : {}),
          ...(editedFields.deadline !== undefined ? { deadline: editedFields.deadline ? new Date(editedFields.deadline) : null } : {}),
          ...(editedFields.skills !== undefined ? { skills: editedFields.skills } : {}),
          ...(editedFields.workMode ? { workMode: editedFields.workMode } : {}),
          metadata: appendAuditEvent(item.metadata, editEvent)
        }
      });
      return NextResponse.json({ message: "Opportunity fields updated." });
    }

    // ------------------------------------------------------------------------
    // Action 7: Remove
    // ------------------------------------------------------------------------
    if (action === "remove") {
      const transitionValidation = validateStateTransition({
        currentStatus: item.status,
        targetStatus: "REMOVED",
        actor,
        opportunity: item
      });

      if (!transitionValidation.valid) {
        return NextResponse.json(
          { error: transitionValidation.error },
          { status: transitionValidation.statusCode || 400 }
        );
      }

      await prisma.discoveredOpportunity.update({
        where: { id: opportunityId },
        data: { status: "REMOVED" }
      });
      return NextResponse.json({ message: "Opportunity removed from queue." });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (err: any) {
    console.error("[POST /api/founder/opportunity-agent]", err);
    return NextResponse.json({ error: "Failed to process review action." }, { status: 500 });
  }
}
