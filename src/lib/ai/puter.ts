/**
 * DEPRECATED / TRANSITIONAL: Puter.js AI Adapter has been superseded by GroqProvider (adapter.ts)
 *
 * This file re-exports the Groq-backed AIAdapter as puterAI to maintain backward-compatibility
 * without loading any Puter packages, scripts, or tokens.
 */

export {
  AIAdapter,
  aiAdapter,
  groqAI,
  puterAI,
  type PuterAIAdapter,
} from "./adapter";
