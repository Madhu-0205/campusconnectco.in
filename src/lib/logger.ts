import { headers } from 'next/headers';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// ---------------------------------------------------------------------------
// normalizeError
// ---------------------------------------------------------------------------

export interface NormalizedError {
    name: string;
    message: string;
    stack?: string;
    code?: string;
    cause?: string;
}

/**
 * normalizeError(error)
 *
 * Converts any unknown thrown value into a safe, flat, serialisable object.
 * Never throws. Never exposes circular references, SDK internals, or Prisma
 * client implementation details.
 *
 * Extracts only: name, message, stack (bounded), code, cause.
 */
export function normalizeError(error: unknown): NormalizedError {
    // Handle null / undefined
    if (error === null || error === undefined) {
        return { name: 'UnknownError', message: 'An unknown error occurred.' };
    }

    // Standard Error (and all subclasses: TypeError, SyntaxError, etc.)
    if (error instanceof Error) {
        const result: NormalizedError = {
            name: error.name || 'Error',
            message: error.message || 'No message provided.',
            // Bound to first 15 lines — avoids multi-KB stack traces in logs
            stack: error.stack?.split('\n').slice(0, 15).join('\n'),
        };

        // Prisma errors expose a `code` field (e.g. "P2025")
        if ('code' in error && typeof (error as Record<string, unknown>).code === 'string') {
            result.code = (error as Record<string, unknown>).code as string;
        }

        // Chain causes as a string summary, not a nested object
        if (error.cause !== undefined) {
            result.cause = error.cause instanceof Error
                ? `${error.cause.name}: ${error.cause.message}`
                : String(error.cause);
        }

        return result;
    }

    // Plain objects (e.g. manual throws of { message: "..." })
    if (typeof error === 'object') {
        const obj = error as Record<string, unknown>;
        return {
            name:    typeof obj.name    === 'string' ? obj.name    : 'ObjectError',
            message: typeof obj.message === 'string' ? obj.message : 'No message provided.',
            code:    typeof obj.code    === 'string' ? obj.code    : undefined,
            cause:   typeof obj.cause   === 'string' ? obj.cause   : undefined,
        };
    }

    // Primitive throws (string, number, etc.)
    return { name: 'PrimitiveError', message: String(error) };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Safely serialise a value to JSON, handling circular references and
 * non-serialisable properties (e.g. Prisma errors, Google SDK errors).
 * Never throws.
 */
function safeStringify(value: unknown): string {
    const seen = new WeakSet();
    try {
        return JSON.stringify(value, (_key, val) => {
            if (typeof val === 'object' && val !== null) {
                if (seen.has(val)) return '[Circular]';
                seen.add(val);
            }
            if (typeof val === 'function' || typeof val === 'symbol') return '[NonSerializable]';
            return val;
        });
    } catch {
        return '{"_logger":"Payload could not be serialised"}';
    }
}

async function getTraceContext() {
    try {
        const headersList = await headers();
        return {
            requestId: headersList.get('x-request-id') || undefined,
            correlationId: headersList.get('x-correlation-id') || undefined,
        };
    } catch {
        // Outside request context (e.g. build time, static rendering)
        return { requestId: undefined, correlationId: undefined };
    }
}

// ---------------------------------------------------------------------------
// Core log() — NEVER throws. All failures are swallowed with a minimal fallback.
// ---------------------------------------------------------------------------

async function log(
    level: LogLevel,
    message: string,
    error?: unknown,
    metadata?: Record<string, unknown>,
): Promise<void> {
    try {
        const timestamp = new Date().toISOString();
        const trace = await getTraceContext();

        const payload = {
            timestamp,
            level,
            message,
            ...(trace.requestId    ? { requestId:    trace.requestId    } : {}),
            ...(trace.correlationId ? { correlationId: trace.correlationId } : {}),
            ...(error !== undefined ? { error: normalizeError(error) } : {}),
            ...(metadata            ? { metadata }                        : {}),
        };

        const serialized = safeStringify(payload);

        if (level === 'error') {
            console.error(`[LOGGER] ${serialized}`);
        } else if (level === 'warn') {
            console.warn(`[LOGGER] ${serialized}`);
        } else {
            console.log(`[LOGGER] ${serialized}`);
        }
    } catch {
        // Last-resort fallback: if the logger itself crashes for any reason,
        // emit a minimal safe line and NEVER propagate the exception to callers.
        try {
            console.error(`[LOGGER:FALLBACK] level=${level} message=${message}`);
        } catch {
            // Absolutely nothing we can do — swallow silently.
        }
    }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const logger = {
    info:  (msg: string, meta?: Record<string, unknown>) => log('info',  msg, undefined, meta),
    warn:  (msg: string, meta?: Record<string, unknown>) => log('warn',  msg, undefined, meta),
    error: (msg: string, err?: unknown, meta?: Record<string, unknown>) => log('error', msg, err, meta),
    debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, undefined, meta),
};
