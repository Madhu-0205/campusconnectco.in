/**
 * UUID Validation Utility
 * Centralises all UUID-related validation across the CampusConnect API layer.
 * Prevents Prisma P2023 errors caused by invalid/empty UUID values.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Returns true if the string is a properly formatted UUID v4
 */
export function isValidUUID(value: unknown): value is string {
    if (typeof value !== "string") return false;
    if (value.trim() === "") return false;
    return UUID_REGEX.test(value);
}

/**
 * Asserts a UUID is valid. Throws a descriptive error used by API routes.
 * Use this at the top of every route handler that receives a UUID from the client.
 */
export function assertValidUUID(value: unknown, fieldName = "id"): asserts value is string {
    if (!isValidUUID(value)) {
        throw new UUIDValidationError(
            `Invalid UUID for field "${fieldName}": received ${JSON.stringify(value)}`
        );
    }
}

/**
 * Validated a session user's ID from Supabase.
 * Supabase auth.getSession() can return a valid session but with no user.id in some edge cases.
 */
export function validateSessionUserId(userId: string | undefined | null, context = "session"): string {
    if (!userId || userId.trim() === "") {
        throw new UUIDValidationError(
            `[${context}] Session user.id is missing or empty. The user may not be properly synced to the database.`
        );
    }
    if (!isValidUUID(userId)) {
        throw new UUIDValidationError(
            `[${context}] Session user.id is not a valid UUID: "${userId}". Length: ${String(userId).length}`
        );
    }
    return userId;
}

/**
 * Safe UUID extraction from URL params (Next.js route params).
 * Prevents routing ambiguity issues where [id] might be a non-UUID string.
 */
export function extractUUIDParam(params: Record<string, string>, key = "id"): string | null {
    const value = params[key];
    if (!isValidUUID(value)) return null;
    return value;
}

export class UUIDValidationError extends Error {
    statusCode = 400;
    constructor(message: string) {
        super(message);
        this.name = "UUIDValidationError";
    }
}
