/**
 * Background Job 3 — Matching Refresh & Notification Dispatch
 *
 * Responsibilities:
 * - Recalculates student matching scores when new opportunities appear or profiles change
 * - Generates explainable match records
 * - Dispatches notifications only for high-value matches (score >= 75%) with 24h throttling
 */

import prisma from "@/lib/prisma";
import { MatchingAgent, StudentMatchProfile } from "../../opportunity/matching-agent";
import { createAgentNotification } from "../../tools/notification";
import { saveAgentDecision } from "../../tools/database";

export interface MatchRefreshResult {
  studentsEvaluated: number;
  matchesGenerated: number;
  notificationsSent: number;
  errors: string[];
}

export async function refreshMatchesForOpportunity(opportunityId: string, limitStudents = 20): Promise<MatchRefreshResult> {
  const result: MatchRefreshResult = {
    studentsEvaluated: 0,
    matchesGenerated: 0,
    notificationsSent: 0,
    errors: []
  };

  const agent = new MatchingAgent();

  try {
    const opp = await prisma.internship.findUnique({
      where: { id: opportunityId }
    });

    if (!opp || opp.status !== "OPEN") {
      return result;
    }

    // Fetch active students
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        isSuspended: false
      },
      select: {
        id: true,
        name: true,
        skills: true,
        branch: true,
        college: true,
        year: true,
        careerGoal: true,
        city: true
      },
      take: limitStudents
    });

    result.studentsEvaluated = students.length;

    for (const student of students) {
      const studentProfile: StudentMatchProfile = {
        id: student.id,
        name: student.name,
        skills: student.skills,
        branch: student.branch,
        college: student.college,
        year: student.year,
        careerGoal: student.careerGoal,
        city: student.city
      };

      const matchRes = await agent.execute({
        student: studentProfile,
        opportunity: {
          id: opp.id,
          title: opp.title,
          company: opp.company,
          description: opp.description,
          skills: opp.skills,
          location: opp.location
        }
      });

      if (matchRes.success && matchRes.data) {
        result.matchesGenerated++;
        const matchData = matchRes.data;

        // Persist decision
        for (const dec of matchRes.decisions) {
          await saveAgentDecision(dec);
        }

        // Notify if high-value match (>= configured threshold, default 75%)
        const matchThreshold = process.env.MATCH_NOTIFICATION_THRESHOLD ? parseInt(process.env.MATCH_NOTIFICATION_THRESHOLD, 10) || 75 : 75;
        if (matchData.matchScore >= matchThreshold) {
          const sent = await createAgentNotification({
            userId: student.id,
            type: "OPPORTUNITY_MATCH",
            title: `Recommended: ${opp.title} at ${opp.company}`,
            message: `${matchData.matchReasons[0] || "Great match for your profile."} (Match score: ${matchData.matchScore}%)`,
            link: `/internships/${opp.id}`,
            throttleHours: 24
          });

          if (sent) {
            result.notificationsSent++;
          }
        }
      }
    }
  } catch (err: any) {
    result.errors.push(err instanceof Error ? err.message : String(err));
  }

  return result;
}
