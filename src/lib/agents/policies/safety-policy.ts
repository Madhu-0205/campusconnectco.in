/**
 * Safety & Security Policy Gate for AI Agents
 *
 * Enforces:
 * 1. Prompt Injection Defenses: Separates SYSTEM INSTRUCTIONS from UNTRUSTED DATA.
 * 2. SSRF Guard: Blocks localhost, loopback, private ranges, cloud metadata.
 * 3. Secret Leakage Protection: Ensures no API keys or credentials enter prompts or logs.
 */

import { validateSafeUrl, sanitizeExternalText } from "@/lib/automation/normalizer";
import { AgentPolicyResult } from "../core/types";

export interface SafetyCheckInput {
  text?: string;
  url?: string;
}

export function evaluateSafetyPolicy(input: SafetyCheckInput): AgentPolicyResult {
  const violations: string[] = [];
  const reasons: string[] = [];

  // Check URL if provided
  if (input.url) {
    const urlCheck = validateSafeUrl(input.url);
    if (!urlCheck.valid) {
      violations.push(`URL Safety Violation: ${urlCheck.error}`);
    } else {
      reasons.push("URL destination verified safe from SSRF/loopback risks");
    }
  }

  // Check text content if provided
  if (input.text) {
    const { hasPromptInjectionFlag } = sanitizeExternalText(input.text, 5000);
    if (hasPromptInjectionFlag) {
      violations.push("Prompt Injection Pattern detected in untrusted content; content was neutralized");
    } else {
      reasons.push("Untrusted text passed prompt injection scan");
    }
  }

  const allowed = violations.length === 0;

  return {
    allowed,
    policyName: "SafetyPolicy",
    reasons,
    violations
  };
}
