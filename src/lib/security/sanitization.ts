/**
 * Escapes characters to prevent HTML/XSS injection.
 */
export function escapeHtml(str: string): string {
    if (typeof str !== "string") return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
}

/**
 * Strips HTML tags completely.
 */
export function stripHtml(str: string): string {
    if (typeof str !== "string") return "";
    return str.replace(/<[^>]*>?/gm, "");
}

/**
 * General purpose input sanitization.
 * Trims, strips HTML tags, and optionally escapes.
 */
export function sanitizeInput(str: string, options: { escape?: boolean } = {}): string {
    if (typeof str !== "string") return "";
    let result = str.trim();
    result = stripHtml(result);
    if (options.escape) {
        result = escapeHtml(result);
    }
    return result;
}
