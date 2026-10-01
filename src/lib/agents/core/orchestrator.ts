/**
 * Central Agent Orchestrator
 *
 * Coordinates:
 * Opportunity Discovery / Input
 *   ↓
 * Opportunity Intelligence Agent (Agent 1)
 *   ↓
 * Verification Agent (Agent 2)
 *   ↓
 * Policy Gate Check
 *   ↓
 * Controlled Database Mutation & Audit Persistence
 *   ↓
 * Matching Agent (Agent 3) [Optional / Event-driven]
 *   ↓
 * Notification Dispatch [Optional]
 */

import crypto from "crypto";
import { OpportunityIntelligenceAgent, OpportunityInput } from "../opportunity/intelligence-agent";
import { VerificationAgent } from "../opportunity/verification-agent";
import { MatchingAgent, StudentMatchProfile } from "../opportunity/matching-agent";
import {
  AgentContext,
  AgentDecisionRecord,
  AgentRunRecord,
  MatchDecisionData,
  OpportunityIntelligenceData,
  SourceEvidenceRecord,
  VerificationDecisionData
} from "./types";
import { createAgentContext, logAgentTrace } from "./context";
import { evaluateVerificationPolicy } from "../policies/verification-policy";
import { evaluatePublishingPolicy } from "../policies/publishing-policy";
import {
  enrichOpportunityWithIntelligence,
  updateOpportunityVerification
} from "../tools/opportunity";
import { saveAgentDecision, saveAgentRun, saveEvidence } from "../tools/database";
import { createAgentNotification } from "../tools/notification";
import { AgentAIProvider } from "./ai-provider";

export interface OrchestrationOptions {
  opportunity: OpportunityInput;
  studentForMatching?: StudentMatchProfile;
  persistToDatabase?: boolean;
  sendNotification?: boolean;
  timeoutMs?: number;
}

export interface OrchestrationResult {
  runId: string;
  success: boolean;
  intelligence: OpportunityIntelligenceData | null;
  verification: VerificationDecisionData | null;
  match: MatchDecisionData | null;
  policyAllowed: boolean;
  policyViolations: string[];
  durationMs: number;
  error?: string;
}

export class AgentOrchestrator {
  private intelligenceAgent: OpportunityIntelligenceAgent;
  private verificationAgent: VerificationAgent;
  private matchingAgent: MatchingAgent;
  private activeRuns: Set<string> = new Set();

  constructor(aiProvider?: AgentAIProvider) {
    this.intelligenceAgent = new OpportunityIntelligenceAgent(aiProvider);
    this.verificationAgent = new VerificationAgent(aiProvider);
    this.matchingAgent = new MatchingAgent(aiProvider);
  }

  /**
   * Runs the complete end-to-end intelligence and verification pipeline for an opportunity.
   */
  public async processOpportunity(options: OrchestrationOptions): Promise<OrchestrationResult> {
    const oppId = options.opportunity.id || `temp-${crypto.randomUUID()}`;
    const dedupeKey = `orchestrator:${oppId}`;

    // Prevent duplicate concurrent runs for the same entity
    if (this.activeRuns.has(dedupeKey)) {
      return {
        runId: "duplicate-prevented",
        success: false,
        intelligence: null,
        verification: null,
        match: null,
        policyAllowed: false,
        policyViolations: ["Concurrent run already in progress for this opportunity"],
        durationMs: 0,
        error: "Duplicate execution prevented"
      };
    }

    this.activeRuns.add(dedupeKey);
    const runId = crypto.randomUUID();
    const startTime = Date.now();

    const context: AgentContext = createAgentContext({
      runId,
      agentType: "ORCHESTRATOR",
      entityType: "OPPORTUNITY",
      entityId: oppId,
      timeoutMs: options.timeoutMs || 45000
    });

    logAgentTrace(context, "INFO", `Orchestrating pipeline for opportunity ${oppId}`);

    const runRecord: AgentRunRecord = {
      id: runId,
      agentType: "ORCHESTRATOR",
      entityType: "OPPORTUNITY",
      entityId: oppId,
      status: "RUNNING",
      startedAt: new Date(),
      inputSummary: `Title: ${options.opportunity.title} | Company: ${options.opportunity.company}`
    };

    if (options.persistToDatabase) {
      await saveAgentRun(runRecord);
    }

    let intelligence: OpportunityIntelligenceData | null = null;
    let verification: VerificationDecisionData | null = null;
    let match: MatchDecisionData | null = null;
    const allDecisions: AgentDecisionRecord[] = [];
    const allEvidence: SourceEvidenceRecord[] = [];
    let policyAllowed = false;
    const policyViolations: string[] = [];

    try {
      // Step 1: Execute Opportunity Intelligence Agent (Agent 1)
      const intelResult = await this.intelligenceAgent.execute(options.opportunity, {
        ...context,
        agentType: "OPPORTUNITY_INTELLIGENCE"
      });

      if (intelResult.success && intelResult.data) {
        intelligence = intelResult.data;
        allDecisions.push(...intelResult.decisions);
        logAgentTrace(context, "INFO", `Agent 1 completed: Classified as ${intelligence.opportunityType}`);
      } else {
        logAgentTrace(context, "WARN", `Agent 1 failed: ${intelResult.error?.message}`);
      }

      // Step 2: Execute Verification Agent (Agent 2)
      const verifResult = await this.verificationAgent.execute(
        {
          opportunityId: oppId,
          title: options.opportunity.title,
          company: options.opportunity.company,
          sourceUrl: options.opportunity.source || undefined,
          applicationUrl: options.opportunity.applicationLink || ""
        },
        {
          ...context,
          agentType: "VERIFICATION"
        }
      );

      if (verifResult.success && verifResult.data) {
        verification = verifResult.data;
        allDecisions.push(...verifResult.decisions);
        allEvidence.push(...verifResult.evidence);
        logAgentTrace(
          context,
          "INFO",
          `Agent 2 completed: SourceTrust=${verification.sourceTrust}, Auth=${verification.opportunityAuthenticity}, Dest=${verification.applicationDestination}`
        );
      } else {
        logAgentTrace(context, "WARN", `Agent 2 failed: ${verifResult.error?.message}`);
      }

      // Step 3: Policy Gates Check
      if (verification) {
        const verifPolicy = evaluateVerificationPolicy(verification);
        if (!verifPolicy.allowed) {
          policyViolations.push(...verifPolicy.violations);
        }
      }

      const publishPolicy = evaluatePublishingPolicy({
        title: options.opportunity.title,
        company: options.opportunity.company,
        description: options.opportunity.description,
        applicationLink: options.opportunity.applicationLink,
        intelligence,
        verification
      });

      if (!publishPolicy.allowed) {
        policyViolations.push(...publishPolicy.violations);
      }

      policyAllowed = policyViolations.length === 0;

      // Step 4: Controlled Database Mutations & Audit Logging
      if (options.persistToDatabase && options.opportunity.id) {
        // Enforce enrichment only if policy allowed
        if (intelligence) {
          await enrichOpportunityWithIntelligence(options.opportunity.id, intelligence);
        }

        if (verification) {
          await updateOpportunityVerification({
            opportunityId: options.opportunity.id,
            sourceTrust: verification.sourceTrust,
            opportunityAuthenticity: verification.opportunityAuthenticity,
            applicationDestination: verification.applicationDestination,
            verified: verification.overallVerified && policyAllowed
          });
        }

        // Persist evidence records
        for (const ev of allEvidence) {
          await saveEvidence(ev);
        }

        // Persist decision records
        for (const dec of allDecisions) {
          await saveAgentDecision(dec);
        }
      }

      // Step 5: Matching Agent Execution (Optional)
      if (options.studentForMatching) {
        const matchResult = await this.matchingAgent.execute(
          {
            student: options.studentForMatching,
            opportunity: {
              id: oppId,
              title: options.opportunity.title,
              company: options.opportunity.company,
              description: options.opportunity.description,
              skills: options.opportunity.skills,
              location: options.opportunity.location,
              workMode: options.opportunity.workMode,
              intelligence
            }
          },
          {
            ...context,
            agentType: "MATCHING",
            entityType: "STUDENT",
            entityId: options.studentForMatching.id
          }
        );

        if (matchResult.success && matchResult.data) {
          match = matchResult.data;
          allDecisions.push(...matchResult.decisions);

          // Step 6: Targeted Notification (Trigger only for high-quality match >= configured threshold, default 75%)
          const matchThreshold = process.env.MATCH_NOTIFICATION_THRESHOLD ? parseInt(process.env.MATCH_NOTIFICATION_THRESHOLD, 10) || 75 : 75;
          if (options.sendNotification && match.matchScore >= matchThreshold && options.studentForMatching.id) {
            await createAgentNotification({
              userId: options.studentForMatching.id,
              type: "OPPORTUNITY_MATCH",
              title: `New High Match Opportunity: ${options.opportunity.title}`,
              message: `You are a ${match.matchScore}% match for ${options.opportunity.company}: ${match.matchReasons[0] || "Aligned with your profile."}`,
              link: `/internships/${oppId}`,
              throttleHours: 24
            });
          }
        }
      }

      const durationMs = Date.now() - startTime;

      // Update Run Record
      runRecord.status = "COMPLETED";
      runRecord.completedAt = new Date();
      runRecord.outputSummary = `PolicyAllowed: ${policyAllowed} | Verified: ${verification?.overallVerified || false} | Decisions: ${allDecisions.length}`;

      if (options.persistToDatabase) {
        await saveAgentRun(runRecord);
      }

      return {
        runId,
        success: true,
        intelligence,
        verification,
        match,
        policyAllowed,
        policyViolations,
        durationMs
      };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : String(err);

      runRecord.status = "FAILED";
      runRecord.completedAt = new Date();
      runRecord.error = errorMsg;

      if (options.persistToDatabase) {
        await saveAgentRun(runRecord);
      }

      return {
        runId,
        success: false,
        intelligence,
        verification,
        match: null,
        policyAllowed: false,
        policyViolations,
        durationMs,
        error: errorMsg
      };
    } finally {
      this.activeRuns.delete(dedupeKey);
    }
  }
}

let orchestratorInstance: AgentOrchestrator | null = null;

export function getAgentOrchestrator(provider?: AgentAIProvider): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator(provider);
  }
  return orchestratorInstance;
}
