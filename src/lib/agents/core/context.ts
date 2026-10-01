/**
 * Agent Execution Context Builder & Tracing Utilities
 */

import crypto from "crypto";
import { AgentContext, AgentType } from "./types";

export interface CreateContextOptions {
  runId?: string;
  agentType: AgentType;
  entityType?: "OPPORTUNITY" | "STUDENT" | "APPLICATION" | "SYSTEM";
  entityId: string;
  model?: string;
  timeoutMs?: number;
  metadata?: Record<string, unknown>;
}

export function createAgentContext(options: CreateContextOptions): AgentContext {
  return {
    runId: options.runId || crypto.randomUUID(),
    agentType: options.agentType,
    entityType: options.entityType || "OPPORTUNITY",
    entityId: options.entityId,
    startedAt: new Date(),
    model: options.model,
    timeoutMs: options.timeoutMs || 25000,
    metadata: options.metadata || {},
    traceLogs: []
  };
}

export function logAgentTrace(
  context: AgentContext,
  level: "INFO" | "WARN" | "ERROR",
  message: string,
  details?: Record<string, unknown>
): void {
  const entry = {
    timestamp: new Date(),
    level,
    message,
    details
  };
  context.traceLogs.push(entry);

  if (process.env.NODE_ENV !== "test" || process.env.DEBUG_AGENTS === "true") {
    const prefix = `[Agent:${context.agentType}][Run:${context.runId.slice(0, 8)}]`;
    if (level === "ERROR") {
      console.error(`${prefix} ❌ ${message}`, details || "");
    } else if (level === "WARN") {
      console.warn(`${prefix} ⚠️ ${message}`, details || "");
    } else {
      console.log(`${prefix} ℹ️ ${message}`);
    }
  }
}
