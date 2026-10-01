/**
 * Base Abstract Agent for CampusConnectCo
 *
 * Enforces:
 * 1. Typed input/output contracts
 * 2. Timeout and abort signal handling
 * 3. Graceful degradation (never corrupts data or marks unverified content as verified)
 * 4. Traceability, decisions, and evidence recording
 */

import { AgentAIProvider, getAIProvider } from "./ai-provider";
import { createAgentContext, logAgentTrace } from "./context";
import { AgentError, AgentTimeoutError } from "./errors";
import {
  AgentContext,
  AgentDecisionRecord,
  AgentMetadata,
  AgentResult,
  AgentStatus,
  SourceEvidenceRecord
} from "./types";

export abstract class BaseAgent<TInput = unknown, TOutput = unknown> {
  public abstract readonly metadata: AgentMetadata;
  protected aiProvider: AgentAIProvider;
  private decisions: AgentDecisionRecord[] = [];
  private evidence: SourceEvidenceRecord[] = [];

  constructor(aiProvider?: AgentAIProvider) {
    this.aiProvider = aiProvider || getAIProvider();
  }

  /**
   * Public execution entry point.
   * Manages context, timeouts, and failure isolation.
   */
  public async execute(input: TInput, externalContext?: AgentContext): Promise<AgentResult<TOutput>> {
    const timeoutMs = externalContext?.timeoutMs || this.metadata.timeoutMs || 25000;
    const context =
      externalContext ||
      createAgentContext({
        agentType: this.metadata.type,
        entityId: (input as any)?.id || "entity-unknown",
        timeoutMs,
        model: this.aiProvider.model
      });

    this.decisions = [];
    this.evidence = [];

    const startTime = Date.now();
    logAgentTrace(context, "INFO", `Starting execution of ${this.metadata.name}`);

    try {
      const outputPromise = this.executeInternal(input, context);

      const timeoutPromise = new Promise<never>((_, reject) => {
        const id = setTimeout(() => {
          clearTimeout(id);
          reject(new AgentTimeoutError(this.metadata.name, timeoutMs));
        }, timeoutMs);
      });

      const data = await Promise.race([outputPromise, timeoutPromise]);
      const durationMs = Date.now() - startTime;

      logAgentTrace(context, "INFO", `Completed execution of ${this.metadata.name} in ${durationMs}ms`);

      return {
        success: true,
        runId: context.runId,
        agentType: this.metadata.type,
        status: "COMPLETED",
        data,
        decisions: [...this.decisions],
        evidence: [...this.evidence],
        durationMs,
        modelUsed: this.aiProvider.model
      };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const isTimeout = err instanceof AgentTimeoutError;
      const status: AgentStatus = isTimeout ? "TIMEOUT" : "FAILED";
      const code = err instanceof AgentError ? err.code : "UNEXPECTED_ERROR";
      const message = err instanceof Error ? err.message : String(err);

      logAgentTrace(context, "ERROR", `Execution failed: ${message}`, { code, isTimeout });

      return {
        success: false,
        runId: context.runId,
        agentType: this.metadata.type,
        status,
        data: null,
        decisions: [...this.decisions],
        evidence: [...this.evidence],
        error: {
          code,
          message,
          recoverable: err instanceof AgentError ? err.recoverable : false
        },
        durationMs,
        modelUsed: this.aiProvider.model
      };
    }
  }

  /**
   * Internal logic to be implemented by specialized agents.
   */
  protected abstract executeInternal(input: TInput, context: AgentContext): Promise<TOutput>;

  /**
   * Records an explicit, explainable decision made during agent reasoning.
   */
  protected recordDecision(decision: Omit<AgentDecisionRecord, "createdAt">): void {
    this.decisions.push({
      ...decision,
      createdAt: new Date()
    });
  }

  /**
   * Records factual, verifiable evidence observed by the agent.
   */
  protected recordEvidence(evidenceItem: Omit<SourceEvidenceRecord, "observedAt">): void {
    this.evidence.push({
      ...evidenceItem,
      observedAt: new Date()
    });
  }
}
