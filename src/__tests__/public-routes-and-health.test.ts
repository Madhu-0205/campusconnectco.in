import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @supabase/ssr createServerClient to return controlled user states
let mockUser: any = null;

vi.mock("@supabase/ssr", () => {
  return {
    createServerClient: vi.fn().mockImplementation(() => {
      return {
        auth: {
          getUser: vi.fn().mockImplementation(() => {
            return Promise.resolve({
              data: { user: mockUser },
              error: mockUser ? null : { message: "No session" },
            });
          }),
        },
      };
    }),
  };
});

import { updateSession } from "@/lib/supabase/middleware";
import { GET as healthHandler } from "@/app/api/health/route";
import { proxy as rootProxy } from "@/middleware";

describe("Public Route Allowlist & Security Verification", () => {
  beforeEach(() => {
    mockUser = null;
    vi.clearAllMocks();
  });

  describe("Finding 1: Public Routes Accessible While Unauthenticated", () => {
    const publicRoutes = [
      // Legal
      "/privacy-policy",
      "/terms-and-conditions",
      "/refund-policy",
      // Company discovery
      "/companies",
      // SEO / Programmatic Landing Pages
      "/freelance-jobs",
      "/campus-gigs",
      "/remote-internships",
      // Additional public routes
      "/about",
      "/pricing",
      "/browse-gigs",
      "/internships",
    ];

    for (const route of publicRoutes) {
      it(`should allow unauthenticated access to ${route} without redirecting to /auth/sign-in`, async () => {
        mockUser = null; // Completely unauthenticated
        const req = new NextRequest(`http://localhost:3000${route}`, {
          method: "GET",
        });

        const res = await updateSession(req);
        // A redirect in updateSession has a 307/308 or a Location header pointing to sign-in
        const location = res.headers.get("location");
        expect(location).toBeNull();
        expect(res.status).not.toBe(401);
      });
    }

    it("should allow public student profiles (/profile/[username]) without authentication", async () => {
      mockUser = null;
      const req = new NextRequest("http://localhost:3000/profile/johndoe", {
        method: "GET",
      });

      const res = await updateSession(req);
      expect(res.headers.get("location")).toBeNull();
    });
  });

  describe("Security Regression: Protected Routes Require Authentication", () => {
    const protectedRoutes = [
      "/dashboard/student",
      "/dashboard/founder",
      "/client-hub",
      "/client-hub/post-gig",
      "/messages",
      "/settings",
      "/network",
      "/notifications",
      "/onboarding",
      "/checkout",
    ];

    for (const route of protectedRoutes) {
      it(`should strictly redirect unauthenticated visitor to /auth/sign-in for protected page ${route}`, async () => {
        mockUser = null;
        const req = new NextRequest(`http://localhost:3000${route}`, {
          method: "GET",
        });

        const res = await updateSession(req);
        const location = res.headers.get("location");
        expect(location).toBeDefined();
        expect(location).toContain("/auth/sign-in");
      });
    }

    it("should reject unauthenticated access to protected API routes with 401 Unauthorized", async () => {
      mockUser = null;
      const req = new NextRequest("http://localhost:3000/api/checkout/create-order", {
        method: "POST",
      });

      const res = await updateSession(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("should allow authenticated users to access protected routes normally", async () => {
      mockUser = { id: "user-uuid-123", email: "student@univ.edu", user_metadata: { role: "STUDENT" } };
      const req = new NextRequest("http://localhost:3000/dashboard/student", {
        method: "GET",
      });

      const res = await updateSession(req);
      expect(res.headers.get("location")).toBeNull();
    });
  });

  describe("Finding 2: /api/health Endpoint Security Headers", () => {
    it("should return HTTP 200 with required production security headers and no-store cache control", async () => {
      const response = await healthHandler();
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.status).toBe("ok");
      expect(body.version).toBe("v1.0.0-production");

      // Verify required security headers
      expect(response.headers.get("Cache-Control")).toContain("no-store");
      expect(response.headers.get("Content-Security-Policy")).toBeDefined();
      expect(response.headers.get("Content-Security-Policy")).toContain("default-src 'none'");
      expect(response.headers.get("Permissions-Policy")).toBeDefined();
      expect(response.headers.get("Permissions-Policy")).toContain("camera=()");
      expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(response.headers.get("X-Frame-Options")).toBe("DENY");
      expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    });
  });
});
