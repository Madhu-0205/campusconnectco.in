import { headers } from 'next/headers';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

async function getTraceContext() {
    try {
        const headersList = await headers();
        return {
            requestId: headersList.get('x-request-id') || 'unknown',
            correlationId: headersList.get('x-correlation-id') || 'unknown',
        };
    } catch {
        // Outside request context (e.g. build time, static rendering, or server startup)
        return {
            requestId: 'none',
            correlationId: 'none',
        };
    }
}

async function log(level: LogLevel, message: string, error?: any, metadata?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const trace = await getTraceContext();
    
    let errorObj = undefined;
    if (error) {
        errorObj = {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            ...(typeof error === 'object' ? error : {})
        };
    }

    const payload = {
        timestamp,
        level,
        message,
        ...trace,
        error: errorObj,
        metadata
    };

    const serialized = JSON.stringify(payload);
    
    if (level === 'error') {
        console.error(`[LOGGER] ${serialized}`);
    } else if (level === 'warn') {
        console.warn(`[LOGGER] ${serialized}`);
    } else {
        console.log(`[LOGGER] ${serialized}`);
    }
}

export const logger = {
    info: (msg: string, meta?: Record<string, any>) => log('info', msg, undefined, meta),
    warn: (msg: string, meta?: Record<string, any>) => log('warn', msg, undefined, meta),
    error: (msg: string, err?: any, meta?: Record<string, any>) => log('error', msg, err, meta),
    debug: (msg: string, meta?: Record<string, any>) => log('debug', msg, undefined, meta),
};
