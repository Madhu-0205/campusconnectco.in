import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  isValidLifecycleTransition,
  isPubliclyDiscoverable,
  OpportunityStatus,
} from "@/lib/opportunities/lifecycle";

// Mock cookies & headers from next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  }),
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(null),
  }),
}));

// Mock user state
let mockUser: any = null;
let mockDbUser: any = null;

vi.mock("@/lib/supabase/server", () => {
  return {
    createClient: vi.fn().mockImplementation(() => {
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

// Mock rate limiters
vi.mock("@/lib/rate-limit", () => ({
  generalApiLimiter: { check: vi.fn().mockResolvedValue(true) },
  authApiLimiter: { check: vi.fn().mockResolvedValue(true) },
}));

// Mock Security Audit
vi.mock("@/lib/security/audit", () => ({
  logSecurityEvent: vi.fn().mockResolvedValue(undefined),
}));

// Test entities
const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const ATTACKER_ID = "22222222-2222-4222-8222-222222222222";
const GIG_ID = "33333333-3333-4333-8333-333333333333";
const INTERNSHIP_ID = "44444444-4444-4444-8444-444444444444";

const mockGig = {
  id: GIG_ID,
  title: "Full Stack Next.js Engineer",
  description: "Build micro-services and modern UI",
  budget: 25000,
  deadline: new Date(Date.now() + 86400000),
  tags: "react,nextjs",
  work_mode: "remote",
  status: "OPEN",
  posted_by: OWNER_ID,
  deletedAt: null as Date | null,
  completedAt: null as Date | null,
  poster: {
    name: "Owner Client",
    email: "owner@client.com",
  },
};

const mockInternship = {
  id: INTERNSHIP_ID,
  title: "Frontend Development Intern",
  company: "CampusConnectCo Tech",
  description: "React and Tailwind UI development",
  location: "Bangalore",
  stipend: 15000,
  duration: "3 Months",
  status: "OPEN",
  posted_by: OWNER_ID,
  deletedAt: null as Date | null,
  completedAt: null as Date | null,
};

const { mockPrismaGigUpdate, mockPrismaInternshipUpdate } = vi.hoisted(() => ({
  mockPrismaGigUpdate: vi.fn().mockImplementation(({ where, data }: any) => {
    return Promise.resolve({ ...data });
  }),
  mockPrismaInternshipUpdate: vi.fn().mockImplementation(({ where, data }: any) => {
    return Promise.resolve({ ...data });
  }),
}));

vi.mock("@/lib/prisma", () => {
  return {
    default: {
      user: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === OWNER_ID) {
            return Promise.resolve({
              id: OWNER_ID,
              role: "CLIENT",
              isSuspended: false,
              name: "Owner Client",
              email: "owner@client.com",
            });
          }
          if (where.id === ATTACKER_ID) {
            return Promise.resolve({
              id: ATTACKER_ID,
              role: "STUDENT",
              isSuspended: false,
              name: "Attacker Student",
              email: "attacker@student.edu",
            });
          }
          return Promise.resolve(mockDbUser);
        }),
      },
      gig: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === GIG_ID) return Promise.resolve({ ...mockGig });
          return Promise.resolve(null);
        }),
        update: mockPrismaGigUpdate,
      },
      internship: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === INTERNSHIP_ID) return Promise.resolve({ ...mockInternship });
          return Promise.resolve(null);
        }),
        update: mockPrismaInternshipUpdate,
      },
      application: {
        findFirst: vi.fn().mockResolvedValue(null),
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn().mockResolvedValue({ id: "app-123" }),
      },
      notification: {
        create: vi.fn().mockResolvedValue({ id: "notif-123" }),
      },
      $transaction: vi.fn().mockImplementation(async (callback) => {
        return await callback(vi.importActual("@/lib/prisma"));
      }),
    },
    prisma: {
      user: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === OWNER_ID) {
            return Promise.resolve({
              id: OWNER_ID,
              role: "CLIENT",
              isSuspended: false,
              name: "Owner Client",
              email: "owner@client.com",
            });
          }
          if (where.id === ATTACKER_ID) {
            return Promise.resolve({
              id: ATTACKER_ID,
              role: "STUDENT",
              isSuspended: false,
              name: "Attacker Student",
              email: "attacker@student.edu",
            });
          }
          return Promise.resolve(mockDbUser);
        }),
      },
      gig: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === GIG_ID) return Promise.resolve({ ...mockGig });
          return Promise.resolve(null);
        }),
        update: mockPrismaGigUpdate,
      },
      internship: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === INTERNSHIP_ID) return Promise.resolve({ ...mockInternship });
          return Promise.resolve(null);
        }),
        update: mockPrismaInternshipUpdate,
      },
      application: {
        findFirst: vi.fn().mockResolvedValue(null),
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn().mockResolvedValue({ id: "app-123" }),
      },
    },
  };
});

// Import route handlers
import { PATCH as gigPatchHandler, DELETE as gigDeleteHandler } from "@/app/api/gigs/route";
import { PATCH as internshipPatchHandler, DELETE as internshipDeleteHandler } from "@/app/api/internships/route";
import { POST as applyHandler } from "@/app/api/applications/apply/route";

describe("Production Content Ownership & Canonical Lifecycle Tests", () => {
  beforeEach(() => {
    mockUser = null;
    mockDbUser = null;
    mockGig.status = "OPEN";
    mockGig.deletedAt = null;
    mockInternship.status = "OPEN";
    mockInternship.deletedAt = null;
    vi.clearAllMocks();
  });

  describe("1. Canonical Lifecycle State Machine", () => {
    it("should validate allowed forward transitions from ACTIVE", () => {
      expect(isValidLifecycleTransition("ACTIVE", "INACTIVE").valid).toBe(true);
      expect(isValidLifecycleTransition("ACTIVE", "COMPLETED").valid).toBe(true);
      expect(isValidLifecycleTransition("ACTIVE", "DELETED").valid).toBe(true);
      expect(isValidLifecycleTransition("ACTIVE", "ACTIVE").valid).toBe(true);
    });

    it("should validate allowed forward transitions from INACTIVE", () => {
      expect(isValidLifecycleTransition("INACTIVE", "ACTIVE").valid).toBe(true);
      expect(isValidLifecycleTransition("INACTIVE", "DELETED").valid).toBe(true);
      expect(isValidLifecycleTransition("INACTIVE", "COMPLETED").valid).toBe(false);
    });

    it("should enforce DELETED as terminal state", () => {
      expect(isValidLifecycleTransition("DELETED", "ACTIVE").valid).toBe(false);
      expect(isValidLifecycleTransition("DELETED", "INACTIVE").valid).toBe(false);
      expect(isValidLifecycleTransition("DELETED", "COMPLETED").valid).toBe(false);
      expect(isValidLifecycleTransition("DELETED", "DELETED").valid).toBe(false);
    });

    it("should correctly identify public discoverability", () => {
      expect(isPubliclyDiscoverable("ACTIVE", null)).toBe(true);
      expect(isPubliclyDiscoverable("OPEN", null)).toBe(true);
      expect(isPubliclyDiscoverable("INACTIVE", null)).toBe(false);
      expect(isPubliclyDiscoverable("COMPLETED", null)).toBe(false);
      expect(isPubliclyDiscoverable("DELETED", null)).toBe(false);
      expect(isPubliclyDiscoverable("ACTIVE", new Date())).toBe(false);
      expect(isPubliclyDiscoverable("OPEN", new Date())).toBe(false);
    });
  });

  describe("2. Gigs IDOR & Ownership Enforcement", () => {
    it("should reject unauthenticated PATCH requests with 401", async () => {
      mockUser = null;
      const req = new NextRequest("http://localhost:3000/api/gigs", {
        method: "PATCH",
        body: JSON.stringify({ id: GIG_ID, status: "INACTIVE" }),
      });

      const res = await gigPatchHandler(req);
      expect(res.status).toBe(401);
    });

    it("should reject non-owner PATCH requests with 403 Forbidden", async () => {
      mockUser = { id: ATTACKER_ID, email: "attacker@student.edu" };
      const req = new NextRequest("http://localhost:3000/api/gigs", {
        method: "PATCH",
        body: JSON.stringify({ id: GIG_ID, title: "Hacked Gig Title", status: "INACTIVE" }),
      });

      const res = await gigPatchHandler(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toMatch(/forbidden|unauthorized/i);
    });

    it("should reject client-injected posted_by and use authenticated user ID", async () => {
      mockUser = { id: ATTACKER_ID, email: "attacker@student.edu" };
      // Attacker attempts to spoof posted_by to match owner in request body
      const req = new NextRequest("http://localhost:3000/api/gigs", {
        method: "PATCH",
        body: JSON.stringify({
          id: GIG_ID,
          posted_by: OWNER_ID,
          ownerId: OWNER_ID,
          status: "INACTIVE",
        }),
      });

      const res = await gigPatchHandler(req);
      expect(res.status).toBe(403);
    });

    it("should allow verified owner to update gig fields and status", async () => {
      mockUser = { id: OWNER_ID, email: "owner@client.com" };
      const req = new NextRequest("http://localhost:3000/api/gigs", {
        method: "PATCH",
        body: JSON.stringify({
          id: GIG_ID,
          title: "Updated Senior Full Stack Engineer",
          budget: 30000,
          status: "INACTIVE",
        }),
      });

      const res = await gigPatchHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe("INACTIVE");
    });

    it("should reject unauthenticated DELETE requests with 401", async () => {
      mockUser = null;
      const req = new NextRequest(`http://localhost:3000/api/gigs?id=${GIG_ID}`, {
        method: "DELETE",
      });

      const res = await gigDeleteHandler(req);
      expect(res.status).toBe(401);
    });

    it("should reject non-owner DELETE requests with 403 Forbidden", async () => {
      mockUser = { id: ATTACKER_ID, email: "attacker@student.edu" };
      const req = new NextRequest(`http://localhost:3000/api/gigs?id=${GIG_ID}`, {
        method: "DELETE",
      });

      const res = await gigDeleteHandler(req);
      expect(res.status).toBe(403);
    });

    it("should perform soft deletion (status=DELETED, deletedAt set) when deleted by owner", async () => {
      mockUser = { id: OWNER_ID, email: "owner@client.com" };
      const req = new NextRequest(`http://localhost:3000/api/gigs?id=${GIG_ID}`, {
        method: "DELETE",
      });

      const res = await gigDeleteHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(mockPrismaGigUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: GIG_ID },
          data: expect.objectContaining({
            status: "DELETED",
            deletedAt: expect.any(Date),
          }),
        })
      );
    });
  });

  describe("3. Internship IDOR & Ownership Enforcement", () => {
    it("should reject unauthenticated PATCH requests with 401", async () => {
      mockUser = null;
      const req = new NextRequest("http://localhost:3000/api/internships", {
        method: "PATCH",
        body: JSON.stringify({ id: INTERNSHIP_ID, status: "INACTIVE" }),
      });

      const res = await internshipPatchHandler(req);
      expect(res.status).toBe(401);
    });

    it("should reject non-owner PATCH requests with 403 Forbidden", async () => {
      mockUser = { id: ATTACKER_ID, email: "attacker@student.edu" };
      const req = new NextRequest("http://localhost:3000/api/internships", {
        method: "PATCH",
        body: JSON.stringify({ id: INTERNSHIP_ID, title: "Hacked Internship" }),
      });

      const res = await internshipPatchHandler(req);
      expect(res.status).toBe(403);
    });

    it("should allow owner to update internship", async () => {
      mockUser = { id: OWNER_ID, email: "owner@client.com" };
      const req = new NextRequest("http://localhost:3000/api/internships", {
        method: "PATCH",
        body: JSON.stringify({ id: INTERNSHIP_ID, stipend: 20000, status: "INACTIVE" }),
      });

      const res = await internshipPatchHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe("INACTIVE");
    });

    it("should reject non-owner DELETE requests with 403 Forbidden", async () => {
      mockUser = { id: ATTACKER_ID, email: "attacker@student.edu" };
      const req = new NextRequest(`http://localhost:3000/api/internships?id=${INTERNSHIP_ID}`, {
        method: "DELETE",
      });

      const res = await internshipDeleteHandler(req);
      expect(res.status).toBe(403);
    });

    it("should perform soft deletion when internship is deleted by owner", async () => {
      mockUser = { id: OWNER_ID, email: "owner@client.com" };
      const req = new NextRequest(`http://localhost:3000/api/internships?id=${INTERNSHIP_ID}`, {
        method: "DELETE",
      });

      const res = await internshipDeleteHandler(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(mockPrismaInternshipUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: INTERNSHIP_ID },
          data: expect.objectContaining({
            status: "DELETED",
            deletedAt: expect.any(Date),
          }),
        })
      );
    });
  });

  describe("4. Application Concurrency & Lifecycle Guard", () => {
    it("should reject applications to an INACTIVE gig with 400 Bad Request", async () => {
      mockGig.status = "INACTIVE";
      mockUser = { id: ATTACKER_ID, email: "student@college.edu" };

      const req = new NextRequest("http://localhost:3000/api/applications/apply", {
        method: "POST",
        body: JSON.stringify({
          gigId: GIG_ID,
          coverLetter: "I would love to work on this gig.",
        }),
      });

      const res = await applyHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/no longer accepting applications/i);
    });

    it("should reject applications to a COMPLETED gig with 400 Bad Request", async () => {
      mockGig.status = "COMPLETED";
      mockUser = { id: ATTACKER_ID, email: "student@college.edu" };

      const req = new NextRequest("http://localhost:3000/api/applications/apply", {
        method: "POST",
        body: JSON.stringify({
          gigId: GIG_ID,
          coverLetter: "I would love to work on this gig.",
        }),
      });

      const res = await applyHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/no longer accepting applications/i);
    });

    it("should reject applications to a soft-DELETED gig with 404 Not Found", async () => {
      mockGig.status = "DELETED";
      mockGig.deletedAt = new Date();
      mockUser = { id: ATTACKER_ID, email: "student@college.edu" };

      const req = new NextRequest("http://localhost:3000/api/applications/apply", {
        method: "POST",
        body: JSON.stringify({
          gigId: GIG_ID,
          coverLetter: "I would love to work on this gig.",
        }),
      });

      const res = await applyHandler(req);
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toMatch(/not found/i);
    });
  });
});
