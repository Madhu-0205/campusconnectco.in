export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly name: string;

  constructor(windowMs: number, maxRequests: number, name = "general") {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.name = name;
  }

  public async check(ip: string): Promise<boolean> {
    const result = await this.checkWithInfo(ip);
    return result.ok;
  }

  public async checkWithInfo(ip: string): Promise<RateLimitResult> {
    const effectiveMax =
      process.env.NODE_ENV === "development" && process.env.STRICT_RATE_LIMIT !== "true"
        ? this.maxRequests * 100
        : this.maxRequests;
    const windowSeconds = Math.ceil(this.windowMs / 1000);

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (url && token) {
      try {
        const key = `ratelimit:${this.name}:${ip}`;
        const baseUrl = url.endsWith("/") ? url.slice(0, -1) : url;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        const response = await fetch(`${baseUrl}/pipeline`, {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify([
            ["INCR", key],
            ["EXPIRE", key, windowSeconds],
          ]),
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          if (Array.isArray(result) && result[0] && typeof result[0].result === "number") {
            const count = result[0].result;
            const remaining = Math.max(0, effectiveMax - count);
            return {
              ok: count <= effectiveMax,
              limit: effectiveMax,
              remaining,
              reset: windowSeconds,
            };
          }
        }
      } catch (error) {
        console.error(`[RateLimiter] Distributed check failed, falling back to memory:`, error);
      }
    }

    const now = Date.now();
    const windowStart = now - this.windowMs;

    let timestamps = this.requests.get(ip) || [];
    timestamps = timestamps.filter((t) => t > windowStart);

    const oldest = timestamps.length > 0 ? Math.min(...timestamps) : now;
    const reset = Math.max(1, Math.ceil((oldest + this.windowMs - now) / 1000));

    if (timestamps.length >= effectiveMax) {
      this.requests.set(ip, timestamps);
      return {
        ok: false,
        limit: effectiveMax,
        remaining: 0,
        reset,
      };
    }

    timestamps.push(now);
    this.requests.set(ip, timestamps);

    if (this.requests.size > 1000 || Math.random() < 0.05) {
      for (const [key, times] of Array.from(this.requests.entries())) {
        const activeTimes = times.filter((t) => t > windowStart);
        if (activeTimes.length === 0) {
          this.requests.delete(key);
        } else {
          this.requests.set(key, activeTimes);
        }
      }
    }

    const remaining = Math.max(0, effectiveMax - timestamps.length);
    return {
      ok: true,
      limit: effectiveMax,
      remaining,
      reset,
    };
  }
}

// Global Instances
export const authLimiter = new RateLimiter(60 * 1000, 10, "auth");
export const generalApiLimiter = new RateLimiter(15 * 60 * 1000, 100, "general");
export const aiLimiter = new RateLimiter(10 * 60 * 1000, 20, "ai");
export const resumeParseLimiter = new RateLimiter(24 * 60 * 60 * 1000, 3, "resume");
export const searchLimiter = new RateLimiter(5 * 60 * 1000, 30, "search");
export const uploadLimiter = new RateLimiter(60 * 1000, 5, "upload");
export const paymentLimiter = new RateLimiter(5 * 60 * 1000, 15, "payment");
export const publicFormLimiter = new RateLimiter(60 * 1000, 10, "form");
export const analyticsLimiter = new RateLimiter(60 * 1000, 60, "analytics");
