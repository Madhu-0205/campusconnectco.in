/**
 * Clean Provider Abstraction for CampusConnectCo AI Intelligence Layer
 *
 * ARCHITECTURAL PRINCIPLES:
 * 1. AI remains ASSISTIVE ONLY — deterministic recommendation algorithms, distance scoring,
 *    and database state remain completely isolated and authoritative.
 * 2. Provider details (Groq / openai/gpt-oss-120b) are isolated behind this abstraction.
 * 3. Secrets (GROQ_API_KEY) are strictly server-side — never exposed to client JS, never logged,
 *    never in HTML, never returned in API responses.
 * 4. Error classification distinguishes throttling (429), authentication (401/403),
 *    cancellation (AbortError), and provider outages (500+).
 */

import OpenAI from 'openai';

import { scrubSensitiveData, validatePromptLength } from './guards';
import type { AIChatMessage } from './types';

export const GROQ_DEFAULT_BASE_URL = 'https://api.groq.com/openai/v1';
export const GROQ_DEFAULT_MODEL = 'openai/gpt-oss-120b';
export const DEFAULT_TIMEOUT_MS = 15000;
export const MAX_USER_PROMPT_LENGTH = 4000;

export interface ProviderChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export type ProviderStreamOptions = ProviderChatOptions;

export interface AIProvider {
  chat(messages: AIChatMessage[], options?: ProviderChatOptions): Promise<string>;
  streamChat(messages: AIChatMessage[], options?: ProviderStreamOptions): AsyncIterable<string>;
  isAvailable(): boolean;
  getAttribution(): string;
  getModel(): string;
}

export class GroqProviderError extends Error {
  public status?: number;
  public code?: string;
  public isRateLimit: boolean;
  public isAuthError: boolean;
  public isServerError: boolean;
  public isAbortError: boolean;

  constructor(message: string, options?: { status?: number; code?: string; cause?: any }) {
    // Redact any potential API keys or tokens from error message
    const sanitizedMessage = sanitizeErrorString(message);
    super(sanitizedMessage);
    this.name = 'GroqProviderError';
    this.status = options?.status;
    this.code = options?.code;
    this.isRateLimit = options?.status === 429;
    this.isAuthError = options?.status === 401 || options?.status === 403;
    this.isServerError = options?.status !== undefined && options?.status >= 500;
    this.isAbortError =
      options?.code === 'ERR_CANCELED' ||
      options?.cause?.name === 'AbortError' ||
      sanitizedMessage.toLowerCase().includes('aborted') ||
      sanitizedMessage.toLowerCase().includes('cancelled');
  }
}

/**
 * Redacts any potential credentials, bearer tokens, or gsk_ Groq keys from strings.
 */
export function sanitizeErrorString(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/gsk_[a-zA-Z0-9_-]+/g, '[REDACTED_API_KEY]')
    .replace(/Bearer\s+[a-zA-Z0-9_.-]+/gi, 'Bearer [REDACTED]')
    .replace(/(api[-_]?key\s*[:=]\s*["']?)[a-zA-Z0-9_.-]+/gi, '$1[REDACTED]');
}

export interface GroqProviderConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  client?: OpenAI;
}

export class GroqProvider implements AIProvider {
  private client: OpenAI | null = null;
  private readonly model: string;
  private readonly baseURL: string;
  private readonly apiKeyProvided: boolean;

  constructor(config?: GroqProviderConfig) {
    this.baseURL = config?.baseURL || process.env.GROQ_BASE_URL || GROQ_DEFAULT_BASE_URL;
    this.model = config?.model || process.env.GROQ_MODEL || GROQ_DEFAULT_MODEL;

    if (config?.client) {
      this.client = config.client;
      this.apiKeyProvided = true;
      return;
    }

    // Safety: ensure client-side code never initializes with private server key
    if (typeof window !== 'undefined') {
      this.apiKeyProvided = false;
      return;
    }

    const apiKey = config?.apiKey !== undefined ? config.apiKey : process.env.GROQ_API_KEY;
    if (apiKey && apiKey.trim() !== '' && !apiKey.includes('placeholder')) {
      this.apiKeyProvided = true;
      this.client = new OpenAI({
        apiKey: apiKey.trim(),
        baseURL: this.baseURL,
        timeout: DEFAULT_TIMEOUT_MS,
      });
    } else {
      this.apiKeyProvided = false;
    }
  }

  public isAvailable(): boolean {
    return this.apiKeyProvided && this.client !== null;
  }

  public getAttribution(): string {
    return `Groq (${this.model})`;
  }

  public getModel(): string {
    return this.model;
  }

  /**
   * Non-streaming chat completion
   */
  public async chat(messages: AIChatMessage[], options?: ProviderChatOptions): Promise<string> {
    if (!this.isAvailable() || !this.client) {
      throw new GroqProviderError('Groq AI provider is not configured. GROQ_API_KEY is missing or invalid.', {
        status: 401,
        code: 'MISSING_API_KEY',
      });
    }

    const sanitizedMessages = this.sanitizeAndValidateMessages(messages);
    const model = options?.model || this.model;

    try {
      const response = await this.client.chat.completions.create(
        {
          model,
          messages: sanitizedMessages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 1000,
        },
        {
          signal: options?.signal,
          timeout: options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        }
      );

      const content = response.choices?.[0]?.message?.content;
      return typeof content === 'string' ? content.trim() : '';
    } catch (err: any) {
      throw this.classifyError(err);
    }
  }

  /**
   * Streaming chat completion yielding individual text deltas
   */
  public async *streamChat(
    messages: AIChatMessage[],
    options?: ProviderStreamOptions
  ): AsyncIterable<string> {
    if (!this.isAvailable() || !this.client) {
      throw new GroqProviderError('Groq AI provider is not configured. GROQ_API_KEY is missing or invalid.', {
        status: 401,
        code: 'MISSING_API_KEY',
      });
    }

    const sanitizedMessages = this.sanitizeAndValidateMessages(messages);
    const model = options?.model || this.model;

    let stream: any;
    try {
      stream = await this.client.chat.completions.create(
        {
          model,
          messages: sanitizedMessages,
          stream: true,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 1000,
        },
        {
          signal: options?.signal,
          timeout: options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        }
      );
    } catch (err: any) {
      throw this.classifyError(err);
    }

    try {
      for await (const chunk of stream) {
        if (options?.signal?.aborted) {
          throw new GroqProviderError('Stream aborted by client', {
            code: 'ERR_CANCELED',
            cause: new Error('AbortError'),
          });
        }

        // Handle empty chunks, missing choices, missing delta content safely
        if (!chunk || !chunk.choices || !Array.isArray(chunk.choices) || chunk.choices.length === 0) {
          continue;
        }

        const delta = chunk.choices[0]?.delta?.content;
        if (delta && typeof delta === 'string') {
          yield delta;
        }
      }
    } catch (err: any) {
      throw this.classifyError(err);
    }
  }

  /**
   * Sanitizes and enforces 4000-character prompt length limits on each message
   */
  private sanitizeAndValidateMessages(messages: AIChatMessage[]): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    return messages.map((m) => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: validatePromptLength(scrubSensitiveData(m.content), MAX_USER_PROMPT_LENGTH),
    }));
  }

  /**
   * Maps underlying client errors to classified GroqProviderError
   */
  private classifyError(err: any): GroqProviderError {
    if (err instanceof GroqProviderError) return err;

    const status = err?.status || err?.statusCode || (err?.response?.status as number | undefined);
    const rawMessage = err?.message || String(err || 'Unknown Groq provider error');
    const code = err?.code || err?.error?.code;

    return new GroqProviderError(rawMessage, {
      status,
      code,
      cause: err,
    });
  }
}

// Singleton server-side instance
export const defaultGroqProvider = new GroqProvider();
