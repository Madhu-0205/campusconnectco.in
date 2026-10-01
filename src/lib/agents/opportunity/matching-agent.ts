/**
 * Agent 3 — Matching Agent
 *
 * Responsibilities:
 * - Match opportunities to student profiles
 * - Evaluate skills, education, branch, experience, career goals, location, work mode
 * - Produce fully explainable match reasons (never an opaque number alone)
 * - Provide granular factor breakdown (skills, branch, workMode, location, experience)
 * - Identify missing skills to guide student upskilling
 */

import { BaseAgent } from "../core/agent";
import { AgentAIProvider } from "../core/ai-provider";
import {
  AgentContext,
  AgentMetadata,
  MatchDecisionData,
  MatchFactorBreakdown,
  OpportunityIntelligenceData
} from "../core/types";

export interface StudentMatchProfile {
  id: string;
  name?: string | null;
  skills?: string | string[] | null;
  branch?: string | null;
  college?: string | null;
  year?: string | null;
  careerGoal?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  preferredWorkMode?: "remote" | "hybrid" | "on-site" | null;
  experience?: string | null;
}

export interface MatchingAgentInput {
  student: StudentMatchProfile;
  opportunity: {
    id: string;
    title: string;
    company: string;
    description: string;
    skills?: string | string[] | null;
    location?: string | null;
    workMode?: string | null;
    intelligence?: OpportunityIntelligenceData | null;
  };
}

export class MatchingAgent extends BaseAgent<MatchingAgentInput, MatchDecisionData> {
  public readonly metadata: AgentMetadata = {
    name: "MatchingAgent",
    type: "MATCHING",
    version: "1.0.0",
    description: "Evaluates student-opportunity alignment and generates explainable match reasons with factor scores.",
    timeoutMs: 20000
  };

  constructor(aiProvider?: AgentAIProvider) {
    super(aiProvider);
  }

  protected async executeInternal(input: MatchingAgentInput, context: AgentContext): Promise<MatchDecisionData> {
    const { student, opportunity } = input;

    // 1. Normalize student skills
    const studentSkills: string[] = Array.isArray(student.skills)
      ? student.skills.map((s) => s.trim().toLowerCase())
      : typeof student.skills === "string"
      ? student.skills.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
      : [];

    // 2. Normalize required opportunity skills
    const oppSkillsRaw: string[] = opportunity.intelligence?.skills ||
      (Array.isArray(opportunity.skills)
        ? opportunity.skills
        : typeof opportunity.skills === "string"
        ? opportunity.skills.split(",")
        : []);

    const oppSkills = oppSkillsRaw.map((s) => s.trim()).filter(Boolean);

    // 3. Deterministic Skill Factor Scoring (0 - 50 points)
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const reqSkill of oppSkills) {
      const lowerReq = reqSkill.toLowerCase();
      const hasMatch = studentSkills.some(
        (sk) => sk === lowerReq || sk.includes(lowerReq) || lowerReq.includes(sk)
      );

      if (hasMatch) {
        matchedSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    }

    let skillScore = 0;
    if (oppSkills.length > 0) {
      const matchRatio = matchedSkills.length / oppSkills.length;
      skillScore = Math.round(matchRatio * 50);
    } else {
      // If opportunity declared zero required skills, award neutral baseline
      skillScore = studentSkills.length > 0 ? 30 : 20;
    }

    // 4. Branch / Academic Eligibility Scoring (0 - 20 points)
    let branchScore = 15; // default reasonable eligibility
    const matchReasons: string[] = [];
    const unmetRequirements: string[] = [];

    const allowedBranches = opportunity.intelligence?.eligibility?.branches || [];
    if (allowedBranches.length > 0) {
      if (student.branch) {
        const studentBranchLower = student.branch.toLowerCase();
        const branchSatisfied = allowedBranches.some((b) =>
          studentBranchLower.includes(b.toLowerCase()) || b.toLowerCase().includes(studentBranchLower)
        );

        if (branchSatisfied) {
          branchScore = 20;
          matchReasons.push(`Student branch (${student.branch}) satisfies eligibility criteria`);
        } else {
          branchScore = 5;
          unmetRequirements.push(`Requires branch in [${allowedBranches.join(", ")}], student is ${student.branch}`);
        }
      } else {
        branchScore = 10;
      }
    } else {
      branchScore = 18; // No branch restrictions
      if (student.branch) {
        matchReasons.push(`Open to all engineering and college branches (${student.branch})`);
      }
    }

    // 5. Work Mode Alignment Scoring (0 - 15 points)
    let workModeScore = 10;
    const oppWorkMode = (opportunity.intelligence?.workMode || opportunity.workMode || "remote").toLowerCase();
    const studentPreferred = (student.preferredWorkMode || "remote").toLowerCase();

    if (oppWorkMode === "remote") {
      workModeScore = 15;
      matchReasons.push("Remote opportunity matches flexible student schedule");
    } else if (oppWorkMode === studentPreferred) {
      workModeScore = 15;
      matchReasons.push(`Work mode (${oppWorkMode}) matches student preference`);
    } else if (oppWorkMode === "hybrid") {
      workModeScore = 10;
    } else {
      workModeScore = 7;
    }

    // 6. Location Relevance (0 - 10 points)
    let locationScore = 5;
    if (oppWorkMode === "remote") {
      locationScore = 10;
    } else if (student.city && opportunity.location) {
      if (opportunity.location.toLowerCase().includes(student.city.toLowerCase())) {
        locationScore = 10;
        matchReasons.push(`Located locally in ${student.city}`);
      } else {
        locationScore = 4;
      }
    } else {
      locationScore = 6;
    }

    // 7. Experience / Career Goals Alignment (0 - 5 points)
    let experienceScore = 3;
    if (student.careerGoal) {
      const goalLower = student.careerGoal.toLowerCase();
      if (
        opportunity.title.toLowerCase().includes(goalLower) ||
        opportunity.description.toLowerCase().includes(goalLower)
      ) {
        experienceScore = 5;
        matchReasons.push(`Directly aligns with student career goal: "${student.careerGoal}"`);
      }
    }

    // Add skill match reasons
    for (const skill of matchedSkills) {
      matchReasons.push(`${skill} matches required skill`);
    }

    // Total Score
    const totalScore = Math.min(100, Math.max(0, skillScore + branchScore + workModeScore + locationScore + experienceScore));
    const isEligible = unmetRequirements.length === 0 && totalScore >= 40;

    const factors: MatchFactorBreakdown = {
      skillScore,
      branchScore,
      workModeScore,
      locationScore,
      experienceScore
    };

    const summaryExplanation =
      matchReasons.length > 0
        ? `Matched with score ${totalScore}/100: ${matchReasons.slice(0, 3).join("; ")}.`
        : `Overall match score of ${totalScore}/100 based on standard platform criteria.`;

    // Record explainable agent decision
    this.recordDecision({
      agentRunId: context.runId,
      decisionType: "STUDENT_MATCH_EVALUATION",
      decision: `Score: ${totalScore}/100 (Eligible: ${isEligible})`,
      reason: summaryExplanation,
      confidence: 0.90,
      factors: {
        totalScore,
        isEligible,
        matchedSkillsCount: matchedSkills.length,
        missingSkillsCount: missingSkills.length,
        factorsBreakdown: factors
      }
    });

    return {
      studentId: student.id,
      opportunityId: opportunity.id,
      matchScore: totalScore,
      isEligible,
      matchReasons,
      unmetRequirements,
      missingSkills,
      factors,
      summaryExplanation
    };
  }
}
