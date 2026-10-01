/**
 * Pipeline Integration Hook for AI Agent Layer
 *
 * Connects deterministic discovery and collection systems to the AI Agent Layer:
 *
 * Existing Collectors
 *         ↓
 * Normalization
 *         ↓
 * Deterministic Validation
 *         ↓
 * AI Agent Layer (Intelligence + Verification + Evidence)
 *         ↓
 * Policy Gates
 *         ↓
 * Database (Controlled Persistence)
 *         ↓
 * Matching & Notifications
 */

import { getAgentOrchestrator, OrchestrationResult } from "../../core/orchestrator";
import { OpportunityInput } from "../../opportunity/intelligence-agent";
import { refreshMatchesForOpportunity } from "../jobs/match-refresh-job";

export interface PipelineHookOptions {
  opportunity: OpportunityInput;
  autoMatchStudents?: boolean;
}

/**
 * Executes the AI Agent intelligence and verification pipeline on a newly discovered
 * or ingested opportunity candidate.
 */
export async function triggerAgentPipelineForOpportunity(
  options: PipelineHookOptions
): Promise<OrchestrationResult> {
  const orchestrator = getAgentOrchestrator();

  const result = await orchestrator.processOpportunity({
    opportunity: options.opportunity,
    persistToDatabase: true
  });

  // If successfully processed, verified, and has database ID, trigger background matching refresh
  if (result.success && result.verification?.overallVerified && options.opportunity.id && options.autoMatchStudents) {
    // Fire-and-forget matching refresh in background
    refreshMatchesForOpportunity(options.opportunity.id, 15).catch((err) => {
      console.warn(`[PipelineHook] Background match refresh error for ${options.opportunity.id}:`, err?.message || err);
    });
  }

  return result;
}
