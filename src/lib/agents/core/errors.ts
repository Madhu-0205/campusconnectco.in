/**
 * Custom Error Classes for Agent System
 */

export class AgentError extends Error {
  public code: string;
  public recoverable: boolean;
  public details?: Record<string, unknown>;

  constructor(message: string, code = "AGENT_ERROR", recoverable = true, details?: Record<string, unknown>) {
    super(message);
    this.name = "AgentError";
    this.code = code;
    this.recoverable = recoverable;
    this.details = details;
  }
}

export class PolicyViolationError extends AgentError {
  public policyName: string;
  public violations: string[];

  constructor(policyName: string, violations: string[], details?: Record<string, unknown>) {
    super(
      `Policy violation in ${policyName}: ${violations.join("; ")}`,
      "POLICY_VIOLATION",
      false,
      { ...details, policyName, violations }
    );
    this.name = "PolicyViolationError";
    this.policyName = policyName;
    this.violations = violations;
  }
}

export class ToolExecutionError extends AgentError {
  public toolName: string;

  constructor(toolName: string, message: string, recoverable = true, details?: Record<string, unknown>) {
    super(`Tool [${toolName}] failed: ${message}`, "TOOL_EXECUTION_ERROR", recoverable, details);
    this.name = "ToolExecutionError";
    this.toolName = toolName;
  }
}

export class AgentTimeoutError extends AgentError {
  public timeoutMs: number;

  constructor(agentName: string, timeoutMs: number) {
    super(`Agent [${agentName}] timed out after ${timeoutMs}ms`, "AGENT_TIMEOUT", true, { timeoutMs });
    this.name = "AgentTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

export class AIProviderError extends AgentError {
  public status?: number;

  constructor(message: string, status?: number, recoverable = true) {
    super(message, "AI_PROVIDER_ERROR", recoverable, { status });
    this.name = "AIProviderError";
    this.status = status;
  }
}
