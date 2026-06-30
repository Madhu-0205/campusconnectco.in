/**
 * CampusConnect v3.0 — Safe Data Access Utilities
 * Use these EVERYWHERE to prevent runtime errors from null/undefined/malformed data.
 * Never access arrays, objects, or nullable fields without these helpers.
 */

/**
 * Safely coerce any value into an array.
 * Handles: null, undefined, comma-separated strings, actual arrays.
 */
export const safeArray = <T>(val: unknown): T[] => {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === "string" && val.trim().length > 0)
    return val.split(",").map((s) => s.trim()) as T[];
  return [];
};

/**
 * Safely coerce any value into a string with a fallback.
 */
export const safeString = (val: unknown, fallback = ""): string => {
  if (typeof val === "string") return val;
  if (val === null || val === undefined) return fallback;
  return String(val);
};

/**
 * Safely coerce any value into a number with a fallback.
 */
export const safeNumber = (val: unknown, fallback = 0): number => {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
};

/**
 * Sum a specific numeric key across an array of objects.
 * Handles nulls and malformed data gracefully.
 */
export const safeSum = (arr: unknown[], key: string): number => {
  if (!Array.isArray(arr)) return 0;
  return arr.reduce<number>((sum, item) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      return sum + safeNumber((item as Record<string, unknown>)[key]);
    }
    return sum + 0;
  }, 0);
};

/**
 * Safely access a nested property using a dot-notation path.
 * Example: safeGet(user, 'profile.address.city', 'Unknown')
 */
export const safeGet = <T>(
  obj: unknown,
  path: string,
  fallback: T
): T => {
  try {
    const result = path
      .split(".")
      .reduce<unknown>(
        (acc, key) =>
          acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined,
        obj
      );
    return (result as T) ?? fallback;
  } catch {
    return fallback;
  }
};

/**
 * Safe JSON parse with fallback.
 */
export const safeJsonParse = <T>(val: unknown, fallback: T): T => {
  if (typeof val !== "string") return fallback;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
};

/**
 * Safely format a number as Indian currency (₹).
 */
export const formatINR = (val: unknown): string => {
  const n = safeNumber(val);
  return `₹${n.toLocaleString("en-IN")}`;
};

/**
 * Safely get initials from a name string.
 */
export const getInitials = (name: unknown): string => {
  const str = safeString(name, "?");
  return str
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Safely truncate a string with ellipsis.
 */
export const truncate = (val: unknown, maxLen = 80): string => {
  const str = safeString(val);
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1).trimEnd() + "…";
};
