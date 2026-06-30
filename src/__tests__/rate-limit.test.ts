import { describe, it, expect, vi, beforeEach } from "vitest";
import { RateLimiter } from "../lib/rate-limit";

describe("Rate Limiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should allow requests within limit and reject when exceeding limit", async () => {
    const limiter = new RateLimiter(1000, 3, "test"); // 3 requests per 1 second
    const ip = "192.168.1.1";

    // 1st request - allow
    const res1 = await limiter.check(ip);
    expect(res1).toBe(true);

    // 2nd request - allow
    const res2 = await limiter.check(ip);
    expect(res2).toBe(true);

    // 3rd request - allow
    const res3 = await limiter.check(ip);
    expect(res3).toBe(true);

    // 4th request - deny
    const res4 = await limiter.check(ip);
    expect(res4).toBe(false);
  });

  it("should reset rate limit status after window duration passes", async () => {
    const limiter = new RateLimiter(1000, 2, "test2"); // 2 requests per 1 second
    const ip = "192.168.1.2";

    // Consume limit
    expect(await limiter.check(ip)).toBe(true);
    expect(await limiter.check(ip)).toBe(true);
    expect(await limiter.check(ip)).toBe(false);

    // Advance clock by 1001ms
    vi.advanceTimersByTime(1001);

    // Should allow again
    expect(await limiter.check(ip)).toBe(true);
  });

  it("should enforce limits per client IP address independently", async () => {
    const limiter = new RateLimiter(1000, 1, "test3");
    const ipA = "1.1.1.1";
    const ipB = "2.2.2.2";

    expect(await limiter.check(ipA)).toBe(true);
    expect(await limiter.check(ipB)).toBe(true);

    expect(await limiter.check(ipA)).toBe(false);
    expect(await limiter.check(ipB)).toBe(false);
  });
});
