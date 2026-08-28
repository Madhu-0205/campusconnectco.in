import { createHmac, timingSafeEqual } from"crypto";

/**
 * timing-attack resistant comparison of two secret strings of any length.
 * We hash them first using a random or fixed HMAC key to ensure hashes
 * have the same length before calling Node.js timingSafeEqual.
 */
export function safeCompare(a: string, b: string): boolean {
 if (typeof a !=="string" || typeof b !=="string") {
 return false;
 }
 const key = process.env.HMAC_KEY ||"static-fallback-key-for-timing-safe-comparison-campusconnect";
 const hmacA = createHmac("sha256", key).update(a).digest();
 const hmacB = createHmac("sha256", key).update(b).digest();
 return timingSafeEqual(hmacA, hmacB);
}
