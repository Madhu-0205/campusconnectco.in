import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export type SecurityEvent =
    | "AUTH_LOGIN_SUCCESS"
    | "AUTH_LOGIN_FAILED"
    | "AUTH_LOGOUT"
    | "AUTH_SIGNUP"
    | "AUTH_PASSWORD_CHANGE"
    | "ROLE_CHANGE"
    | "PROFILE_UPDATED"
    | "ADMIN_ACTION"
    | "RATE_LIMIT_TRIGGERED"
    | "SENSITIVE_OPERATION"
    | "ESCROW_LOCKED"
    | "ESCROW_RELEASED"
    | "PAYMENT_FAILED"
    | "PAYMENT_REFUNDED"
    | "DISPUTE_CREATED"
    | "RESUME_UPLOADED"
    | "GIG_CREATED"
    | "APPLICATION_SUBMITTED"
    | "ACCOUNT_DELETED";

interface AuditLogPayload {
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    resourceId?: string;
    metadata?: Record<string, any>;
}

/**
 * Enterprise-grade security auditing helper. Logs security events to the database
 * and prints structured JSON stdout logs for log aggregators (e.g. Datadog, CloudWatch).
 */
export async function logSecurityEvent(
    event: SecurityEvent,
    payload: AuditLogPayload
) {
    const timestamp = new Date().toISOString();
    
    // Fetch tracing/correlation context if available
    let requestId = "none";
    let correlationId = "none";
    try {
        const headersList = await headers();
        requestId = headersList.get('x-request-id') || "unknown";
        correlationId = headersList.get('x-correlation-id') || "unknown";
    } catch {
        // Safe fallback outside of request context
    }

    const logData = {
        timestamp,
        event,
        userId: payload.userId || "anonymous",
        ipAddress: payload.ipAddress || "unknown",
        userAgent: payload.userAgent || "unknown",
        resourceId: payload.resourceId,
        requestId,
        correlationId,
        metadata: payload.metadata || {},
    };

    // 1. Structured JSON output for external ingestion (e.g., Datadog, Axiom)
    console.log(`[SECURITY_AUDIT] ${JSON.stringify(logData)}`);

    // 2. Persist to database Analytics log trail
    try {
        await prisma.analytics.create({
            data: {
                event: `SEC:${event}`,
                data: {
                    userId: logData.userId,
                    ipAddress: logData.ipAddress,
                    userAgent: logData.userAgent,
                    resourceId: logData.resourceId,
                    requestId: logData.requestId,
                    correlationId: logData.correlationId,
                    ...logData.metadata,
                },
            },
        });
    } catch (err) {
        console.error(`[SecurityAudit] Failed to persist security audit event:`, err);
    }
}
