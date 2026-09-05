import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock user state
let mockUser: any = null;

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

// Mock Prisma
const mockGig = {
  id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  title: "Build React Component",
  posted_by: "client-uuid-123",
  status: "IN_PROGRESS",
  ownerConfirmed: false,
  studentConfirmed: false,
};

const mockApplication = {
  id: "app-uuid-999",
  gigId: mockGig.id,
  applicantId: "student-uuid-456",
  status: "ACCEPTED",
};

vi.mock("@/lib/prisma", () => {
  return {
    default: {
      gig: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === mockGig.id) return Promise.resolve({ ...mockGig });
          return Promise.resolve(null);
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          return Promise.resolve({ ...mockGig, ...data });
        }),
      },
      application: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.gigId === mockGig.id && where.applicantId === "student-uuid-456") {
            return Promise.resolve({ ...mockApplication });
          }
          return Promise.resolve(null);
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      $transaction: vi.fn().mockImplementation(async (callback) => {
        const tx = {
          gig: {
            update: vi.fn().mockImplementation(({ where, data }) => {
              return Promise.resolve({ ...mockGig, ...data });
            }),
          },
          application: {
            updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
        };
        return await callback(tx);
      }),
    },
  };
});

import { POST as escrowHandler } from "@/app/api/escrow/route";

describe("Escrow Completion API (/api/escrow)", () => {
  beforeEach(() => {
    mockUser = null;
    vi.clearAllMocks();
  });

  it("should return 401 when user is unauthenticated", async () => {
    mockUser = null;
    const req = new NextRequest("http://localhost:3000/api/escrow", {
      method: "POST",
      body: JSON.stringify({ gigId: mockGig.id, action: "RELEASE" }),
    });

    const res = await escrowHandler(req);
    expect(res.status).toBe(401);
  });

  it("should return 403 when user is not a participant in the gig", async () => {
    mockUser = { id: "random-attacker-uuid" };
    const req = new NextRequest("http://localhost:3000/api/escrow", {
      method: "POST",
      body: JSON.stringify({ gigId: mockGig.id, action: "RELEASE" }),
    });

    const res = await escrowHandler(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("Forbidden");
  });

  it("should allow student worker to confirm completion", async () => {
    mockUser = { id: "student-uuid-456" };
    const req = new NextRequest("http://localhost:3000/api/escrow", {
      method: "POST",
      body: JSON.stringify({ gigId: mockGig.id, action: "RELEASE" }),
    });

    const res = await escrowHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.gig.studentConfirmed).toBe(true);
  });

  it("should transition gig to COMPLETED when both parties confirm", async () => {
    // Gig where owner has already confirmed
    mockGig.ownerConfirmed = true;
    mockUser = { id: "student-uuid-456" };

    const req = new NextRequest("http://localhost:3000/api/escrow", {
      method: "POST",
      body: JSON.stringify({ gigId: mockGig.id, action: "CONFIRM_COMPLETION" }),
    });

    const res = await escrowHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.gig.status).toBe("COMPLETED");
  });
});
