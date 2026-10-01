/**
 * CampusConnectCo AI Agent Architecture
 * Main Entry Point & Exports
 */

// Core
export * from "./core/types";
export * from "./core/errors";
export * from "./core/ai-provider";
export * from "./core/context";
export * from "./core/schemas";
export * from "./core/agent";
export * from "./core/orchestrator";

// Opportunity Agents
export * from "./opportunity/intelligence-agent";
export * from "./opportunity/verification-agent";
export * from "./opportunity/matching-agent";

// Policies
export * from "./policies/verification-policy";
export * from "./policies/publishing-policy";
export * from "./policies/safety-policy";

// Tools
export * from "./tools/database";
export * from "./tools/web";
export * from "./tools/opportunity";
export * from "./tools/notification";

// Automation & Jobs
export * from "./automation/queue";
export * from "./automation/scheduler";
export * from "./automation/jobs/monitor-job";
export * from "./automation/jobs/reverify-job";
export * from "./automation/jobs/match-refresh-job";
export * from "./automation/triggers/pipeline-hook";
