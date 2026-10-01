/**
 * Database Tools for AI Agents
 *
 * Implements least-privilege, typed access to opportunities, student profiles,
 * and persistent agent audit records.
 *
 * Resilient schema fallback:
 * If AgentRun / AgentDecision / SourceEvidence tables are not yet migrated in PostgreSQL,
 * falls back to storing in PlatformSetting key-value records or structured telemetry.
 */

import prisma from "@/lib/prisma";
import { AgentDecisionRecord, AgentRunRecord, SourceEvidenceRecord } from "../core/types";
import { ToolExecutionError } from "../core/errors";

export interface DatabaseOpportunityData {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string | null;
  stipend: number | null;
  duration: string | null;
  location: string | null;
  workMode?: string | null;
  deadline: Date | null;
  status: string;
  applicationLink: string | null;
  source: string | null;
  externalId: string | null;
  tags: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseStudentProfileData {
  id: string;
  name: string | null;
  email: string;
  skills: string | null;
  branch: string | null;
  college: string | null;
  collegeId: string | null;
  year: string | null;
  careerGoal: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  userSkills?: Array<{ name: string }>;
  resumeData?: any;
}

/**
 * Reads an opportunity by ID from Internship or Gig tables.
 */
export async function readOpportunity(id: string): Promise<DatabaseOpportunityData | null> {
  if (!id || typeof id !== "string") {
    throw new ToolExecutionError("database.readOpportunity", "Valid opportunity ID is required");
  }

  try {
    const internship = await prisma.internship.findUnique({
      where: { id }
    });

    if (internship) {
      return {
        id: internship.id,
        title: internship.title,
        company: internship.company,
        description: internship.description,
        skills: internship.skills,
        stipend: internship.stipend,
        duration: internship.duration,
        location: internship.location,
        workMode: (internship as any).workMode || null,
        deadline: internship.deadline,
        status: internship.status,
        applicationLink: internship.applicationLink,
        source: internship.source,
        externalId: internship.externalId,
        tags: internship.tags,
        createdAt: internship.createdAt,
        updatedAt: internship.updatedAt
      };
    }

    // Try finding in gigs table
    const gig = await prisma.gig.findUnique({
      where: { id }
    });

    if (gig) {
      const gigLocation = [gig.city, gig.state, gig.country].filter(Boolean).join(", ") || null;
      return {
        id: gig.id,
        title: gig.title,
        company: "Gig Poster",
        description: gig.description,
        skills: gig.tags,
        stipend: gig.budget,
        duration: null,
        location: gigLocation,
        workMode: gig.work_mode,
        deadline: gig.deadline,
        status: gig.status,
        applicationLink: null,
        source: "CAMPUSCONNECT_GIG",
        externalId: null,
        tags: gig.tags,
        createdAt: gig.createdAt,
        updatedAt: gig.updatedAt
      };
    }

    return null;
  } catch (err: any) {
    throw new ToolExecutionError("database.readOpportunity", err instanceof Error ? err.message : String(err));
  }
}

/**
 * Reads a student profile with associated skills and college info.
 */
export async function readStudentProfile(studentId: string): Promise<DatabaseStudentProfileData | null> {
  if (!studentId || typeof studentId !== "string") {
    throw new ToolExecutionError("database.readStudentProfile", "Valid student ID is required");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        userSkills: {
          include: { skill: true }
        }
      }
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name || user.full_name,
      email: user.email,
      skills: user.skills,
      branch: user.branch,
      college: user.college,
      collegeId: user.collegeId,
      year: user.year,
      careerGoal: user.careerGoal,
      city: user.city,
      state: user.state,
      country: user.country,
      latitude: user.latitude,
      longitude: user.longitude,
      userSkills: user.userSkills?.map((us) => ({ name: us.skill.name })),
      resumeData: user.resumeData
    };
  } catch (err: any) {
    throw new ToolExecutionError("database.readStudentProfile", err instanceof Error ? err.message : String(err));
  }
}

/**
 * Persists an AgentRun record with graceful fallback.
 */
export async function saveAgentRun(run: AgentRunRecord): Promise<void> {
  const p = prisma as any;
  if (typeof p.agentRun?.upsert === "function") {
    try {
      await p.agentRun.upsert({
        where: { id: run.id },
        update: {
          status: run.status,
          completedAt: run.completedAt || new Date(),
          outputSummary: run.outputSummary,
          error: run.error
        },
        create: {
          id: run.id,
          agentType: run.agentType,
          entityType: run.entityType,
          entityId: run.entityId,
          status: run.status,
          startedAt: run.startedAt,
          completedAt: run.completedAt,
          model: run.model,
          inputSummary: run.inputSummary,
          outputSummary: run.outputSummary,
          error: run.error
        }
      });
      return;
    } catch {
      // Fall through to PlatformSetting if table not created
    }
  }

  // Graceful fallback to PlatformSetting key-value store
  try {
    const key = `agent_run:${run.id}`;
    await prisma.platformSetting.upsert({
      where: { key },
      update: {
        value: JSON.stringify(run),
        updatedAt: new Date()
      },
      create: {
        key,
        value: JSON.stringify(run),
        updatedAt: new Date()
      }
    });
  } catch {
    // Audit write failure must not crash parent flow
  }
}

/**
 * Persists an AgentDecision record with graceful fallback.
 */
export async function saveAgentDecision(decision: AgentDecisionRecord): Promise<void> {
  const p = prisma as any;
  if (typeof p.agentDecision?.create === "function" && decision.agentRunId) {
    try {
      // Satisfy foreign key constraint if parent AgentRun hasn't been written yet
      if (typeof p.agentRun?.upsert === "function") {
        await p.agentRun.upsert({
          where: { id: decision.agentRunId },
          update: {},
          create: {
            id: decision.agentRunId,
            agentType: "AGENT_EXECUTION",
            entityType: "OPPORTUNITY",
            entityId: "system",
            status: "COMPLETED",
            startedAt: new Date()
          }
        });
      }

      await p.agentDecision.create({
        data: {
          id: decision.id || undefined,
          agentRunId: decision.agentRunId,
          decisionType: decision.decisionType,
          decision: decision.decision,
          reason: decision.reason,
          confidence: decision.confidence,
          createdAt: decision.createdAt
        }
      });
      return;
    } catch {
      // Fall through
    }
  }

  // Fallback to PlatformSetting
  try {
    const key = `agent_dec:${decision.agentRunId || "run"}:${decision.decisionType}:${Date.now()}`;
    await prisma.platformSetting.upsert({
      where: { key },
      update: {
        value: JSON.stringify(decision),
        updatedAt: new Date()
      },
      create: {
        key,
        value: JSON.stringify(decision),
        updatedAt: new Date()
      }
    });
  } catch {}
}

/**
 * Persists a SourceEvidence record with graceful fallback.
 */
export async function saveEvidence(evidence: SourceEvidenceRecord): Promise<void> {
  const p = prisma as any;
  if (typeof p.sourceEvidence?.create === "function") {
    try {
      await p.sourceEvidence.create({
        data: {
          id: evidence.id,
          opportunityId: evidence.opportunityId,
          sourceUrl: evidence.sourceUrl,
          evidenceType: evidence.evidenceType,
          contentHash: evidence.contentHash,
          observedAt: evidence.observedAt,
          metadata: evidence.metadata as any
        }
      });
      return;
    } catch {
      // Fall through
    }
  }

  // Fallback to PlatformSetting
  try {
    const key = `evidence:${evidence.opportunityId}:${evidence.evidenceType}`;
    await prisma.platformSetting.upsert({
      where: { key },
      update: {
        value: JSON.stringify(evidence),
        updatedAt: new Date()
      },
      create: {
        key,
        value: JSON.stringify(evidence),
        updatedAt: new Date()
      }
    });
  } catch {}
}

/**
 * Retrieves recent agent execution runs for admin/observability views.
 */
export async function getRecentAgentRuns(limit = 20): Promise<AgentRunRecord[]> {
  const p = prisma as any;
  if (typeof p.agentRun?.findMany === "function") {
    try {
      const records = await p.agentRun.findMany({
        orderBy: { startedAt: "desc" },
        take: limit,
        include: { decisions: true }
      });
      return records;
    } catch {
      // Fall through
    }
  }

  // Fallback: Query from PlatformSetting
  try {
    const settings = await prisma.platformSetting.findMany({
      where: {
        key: { startsWith: "agent_run:" }
      },
      orderBy: { updatedAt: "desc" },
      take: limit
    });

    return settings
      .map((s) => {
        try {
          return JSON.parse(s.value) as AgentRunRecord;
        } catch {
          return null;
        }
      })
      .filter((r): r is AgentRunRecord => r !== null);
  } catch {
    return [];
  }
}
