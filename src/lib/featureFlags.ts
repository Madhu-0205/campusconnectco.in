import prisma from "@/lib/prisma";

const CACHE_TTL_MS = 60 * 1000; // 1-minute TTL caching to optimize database queries
const flagCache: Record<string, { value: boolean; expiresAt: number }> = {};

/**
 * Enterprise-grade Feature Flag retriever. Evaluates flags stored in the Database 
 * (PlatformSetting model under 'flag:{key}'), falling back to environment values 
 * or default true values. Gracefully degrades to cache / fallback values on DB downtime.
 */
export async function isFeatureEnabled(flagKey: string): Promise<boolean> {
    const dbKey = `flag:${flagKey}`;
    const now = Date.now();

    // Check active memory cache
    const cached = flagCache[flagKey];
    if (cached && cached.expiresAt > now) {
        return cached.value;
    }

    try {
        const setting = await prisma.platformSetting.findUnique({
            where: { key: dbKey }
        });

        let isEnabled = true; // Default fallback

        if (setting) {
            isEnabled = setting.value === "true" || setting.value === "enabled";
        } else {
            // Fallback to environment configuration
            const envKey = `FEATURE_${flagKey.toUpperCase()}`;
            const envVal = process.env[envKey];
            if (envVal !== undefined) {
                isEnabled = envVal === "true" || envVal === "enabled";
            }
        }

        // Cache the retrieved flag
        flagCache[flagKey] = {
            value: isEnabled,
            expiresAt: now + CACHE_TTL_MS
        };

        return isEnabled;
    } catch (error) {
        console.error(`[FeatureFlags] Failed to fetch flag "${flagKey}", degrading gracefully:`, error);
        
        // Return stale cached value if present during outage
        if (cached) return cached.value;
        
        // Ultimate fallback default is true (so system features remain accessible by default)
        return true;
    }
}
