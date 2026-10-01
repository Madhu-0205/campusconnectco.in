import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Mock auth-checks
vi.mock("@/lib/auth-checks", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    getSession: vi.fn(),
    getUserRoleFromDb: vi.fn(),
    protectApi: vi.fn(),
  };
});

// Mock Next headers cookies
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(() => []),
  })),
}));

// Mock AI ranking functions
vi.mock("@/lib/ai/rankStudents", () => ({
  rankStudentsForUser: vi.fn(async () => []),
}));

vi.mock("@/lib/ai/rankGigs", () => ({
  rankGigsForUser: vi.fn(async () => []),
}));

import { GET as matchStudentsHandler } from "@/app/api/ai/match/students/route";
import { GET as matchGigsHandler } from "@/app/api/ai/match/gigs/route";
import { POST as founderPreviewHandler } from "@/app/api/founder/preview/route";
import { protectApi, getUserRoleFromDb } from "@/lib/auth-checks";
import { createClient } from "@/lib/supabase/server";

describe("Post-Hardening Security Verification Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. AI Match Authorization & IDOR Hardening (CC-SEC-01)", () => {
    it("should reject unauthenticated requests to /api/ai/match/students with 401", async () => {
      vi.mocked(protectApi).mockResolvedValueOnce({
        errorResponse: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }) as any,
        user: null,
      });

      const req = new NextRequest("http://localhost:3000/api/ai/match/students?userId=target-user-123");
      const res = await matchStudentsHandler(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("should reject unauthenticated requests to /api/ai/match/gigs with 401", async () => {
      vi.mocked(protectApi).mockResolvedValueOnce({
        errorResponse: new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }) as any,
        user: null,
      });

      const req = new NextRequest("http://localhost:3000/api/ai/match/gigs?userId=target-user-123");
      const res = await matchGigsHandler(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("should block a STUDENT from querying student matches for another user (IDOR)", async () => {
      vi.mocked(protectApi).mockResolvedValueOnce({
        errorResponse: null as any,
        user: { id: "student-user-a", email: "student@test.com" } as any,
        role: "STUDENT" as any,
      });

      const req = new NextRequest("http://localhost:3000/api/ai/match/students?userId=victim-user-b");
      const res = await matchStudentsHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toContain("Forbidden");
    });

    it("should block a non-founder from querying gig matches for another user (IDOR)", async () => {
      vi.mocked(protectApi).mockResolvedValueOnce({
        errorResponse: null as any,
        user: { id: "student-user-a", email: "student@test.com" } as any,
        role: "STUDENT" as any,
      });

      const req = new NextRequest("http://localhost:3000/api/ai/match/gigs?userId=victim-user-b");
      const res = await matchGigsHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toContain("Forbidden");
    });
  });

  describe("2. Founder Admin Preview Role Guard (CC-SEC-05)", () => {
    it("should reject unauthenticated callers with 401", async () => {
      vi.mocked(createClient).mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({ data: { user: null } }),
        },
      } as any);

      const req = new NextRequest("http://localhost:3000/api/founder/preview", {
        method: "POST",
        body: JSON.stringify({ enable: false }),
      });
      const res = await founderPreviewHandler(req);
      expect(res.status).toBe(401);
    });

    it("should reject a non-founder with 403 even when enable is false", async () => {
      vi.mocked(createClient).mockResolvedValueOnce({
        auth: {
          getUser: vi.fn().mockResolvedValueOnce({
            data: { user: { id: "student-user-1", email: "student@campus.edu" } },
          }),
        },
      } as any);
      vi.mocked(getUserRoleFromDb).mockResolvedValueOnce("STUDENT");

      const req = new NextRequest("http://localhost:3000/api/founder/preview", {
        method: "POST",
        body: JSON.stringify({ enable: false }),
      });
      const res = await founderPreviewHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });
  });

  describe("3. API Error Sanitization & Safe Production Responses (CC-SEC-02)", () => {
    it("should return generic Internal Server Error on unexpected exceptions in match/students", async () => {
      vi.mocked(protectApi).mockRejectedValueOnce(new Error("Database connection timed out: postgresql://secret_db:5432"));

      const req = new NextRequest("http://localhost:3000/api/ai/match/students?userId=user-123");
      const res = await matchStudentsHandler(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBe("Internal Server Error");
      expect(JSON.stringify(json)).not.toContain("postgresql://");
      expect(JSON.stringify(json)).not.toContain("secret_db");
    });

    it("should return generic Internal Server Error on unexpected exceptions in match/gigs", async () => {
      vi.mocked(protectApi).mockRejectedValueOnce(new Error("FATAL: terminating connection due to administrator command"));

      const req = new NextRequest("http://localhost:3000/api/ai/match/gigs?userId=user-123");
      const res = await matchGigsHandler(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBe("Internal Server Error");
      expect(JSON.stringify(json)).not.toContain("FATAL");
    });
  });
});
