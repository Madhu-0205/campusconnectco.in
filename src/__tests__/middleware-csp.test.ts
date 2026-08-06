import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { proxy as middleware } from "../middleware";

// Mock Supabase Middleware
vi.mock("../lib/supabase/middleware", () => {
  return {
    updateSession: vi.fn().mockImplementation((request) => {
      // Return a simulated NextResponse with input headers forwarded
      const { NextResponse } = require("next/server");
      const res = NextResponse.next({
        request: { headers: request.headers },
      });
      res.headers.set("x-nonce", request.headers.get("x-nonce") || "");
      return Promise.resolve(res);
    }),
  };
});

// Mock rate limiter so it always passes
vi.mock("../lib/rate-limit", () => {
  return {
    generalApiLimiter: {
      check: vi.fn().mockResolvedValue(true),
    },
  };
});

describe("Root Security Proxy (s../middleware.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate a secure nonce, configure CSP, and set required HTTP security headers", async () => {
    const req = new NextRequest("http://localhost/dashboard/student", {
      method: "GET",
    });

    const response = await middleware(req);
    expect(response.status).toBe(200);

    // Verify cryptographic nonce is set in response headers
    const nonce = response.headers.get("x-nonce");
    expect(nonce).toBeDefined();
    expect(nonce?.length).toBeGreaterThan(16);

    // Verify CSP policies
    const csp = response.headers.get("Content-Security-Policy");
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain("manifest-src 'self'");
    expect(csp).toContain(`script-src 'self' 'nonce-${nonce}'`);
    expect(csp).toContain("frame-src 'self' https://checkout.razorpay.com");
    expect(csp).toContain("form-action 'self'");

    // Verify additional safety headers
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(response.headers.get("X-XSS-Protection")).toBe("1; mode=block");
  });
});
