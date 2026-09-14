import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { POST as checkoutCreateOrder } from "@/app/api/checkout/create-order/route";
import { POST as checkoutRefund } from "@/app/api/checkout/refund/route";
import { POST as checkoutWebhook } from "@/app/api/checkout/webhook/route";
import { GET as cronReleasePayments } from "@/app/api/cron/release-payments/route";
import { POST as escrowCreateOrder } from "@/app/api/payments/escrow/create-order/route";
import { POST as escrowRelease } from "@/app/api/payments/escrow/release/route";
import { POST as escrowVerify } from "@/app/api/payments/escrow/verify/route";
import { assertPaymentsEnabled, PAYMENTS_ENABLED } from "@/lib/payments/config";

// Mock Supabase
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "test-user-id", email: "user@test.com" } },
        error: null,
      }),
    },
  }),
}));

// Mock auth-checks
vi.mock("@/lib/auth-checks", () => ({
  requireRole: vi.fn().mockResolvedValue({
    user: { id: "test-user-id", role: "CLIENT" },
    errorResponse: null,
  }),
}));

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    gig: { findUnique: vi.fn(), update: vi.fn() },
    application: { findUnique: vi.fn(), findFirst: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    transaction: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    escrow: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

describe("Payments Coming Soon — Authoritative Production Lock", () => {
  const originalFetch = global.fetch;
  let fetchSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.fn();
    global.fetch = fetchSpy;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("Centralized Payment Gate Configuration", () => {
    it("should have PAYMENTS_ENABLED set to false", () => {
      expect(PAYMENTS_ENABLED).toBe(false);
    });

    it("assertPaymentsEnabled() should return HTTP 503 response with PAYMENTS_COMING_SOON code", async () => {
      const { errorResponse } = assertPaymentsEnabled();
      expect(errorResponse).not.toBeNull();
      expect(errorResponse?.status).toBe(503);

      const body = await errorResponse?.json();
      expect(body.code).toBe("PAYMENTS_COMING_SOON");
      expect(body.error).toBe("Payments are coming soon.");
      expect(body.message).toContain("CampusConnectCo");
    });
  });

  describe("Financial Mutation Endpoints — HTTP 503 Blocked", () => {
    it("POST /api/checkout/create-order returns 503 PAYMENTS_COMING_SOON", async () => {
      const req = new NextRequest("http://localhost:3000/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gigId: "00000000-0000-0000-0000-000000000001",
          applicationId: "00000000-0000-0000-0000-000000000002",
        }),
      });

      const res = await checkoutCreateOrder(req);
      expect(res.status).toBe(503);
      const json = await res.json();
      expect(json.code).toBe("PAYMENTS_COMING_SOON");
      expect(json.error).toBe("Payments are coming soon.");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("POST /api/checkout/webhook returns 503 PAYMENTS_COMING_SOON", async () => {
      const req = new NextRequest("http://localhost:3000/api/checkout/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "order.paid", orderId: "order_123" }),
      });

      const res = await checkoutWebhook(req);
      expect(res.status).toBe(503);
      const json = await res.json();
      expect(json.code).toBe("PAYMENTS_COMING_SOON");
      expect(json.error).toBe("Payments are coming soon.");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("POST /api/checkout/refund returns 503 PAYMENTS_COMING_SOON", async () => {
      const req = new NextRequest("http://localhost:3000/api/checkout/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: "00000000-0000-0000-0000-000000000003",
          reason: "Cancellation",
        }),
      });

      const res = await checkoutRefund(req);
      expect(res.status).toBe(503);
      const json = await res.json();
      expect(json.code).toBe("PAYMENTS_COMING_SOON");
      expect(json.error).toBe("Payments are coming soon.");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("POST /api/payments/escrow/create-order returns 503 PAYMENTS_COMING_SOON", async () => {
      const req = new NextRequest("http://localhost:3000/api/payments/escrow/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gigId: "00000000-0000-0000-0000-000000000001",
          workerId: "00000000-0000-0000-0000-000000000004",
        }),
      });

      const res = await escrowCreateOrder(req);
      expect(res.status).toBe(503);
      const json = await res.json();
      expect(json.code).toBe("PAYMENTS_COMING_SOON");
      expect(json.error).toBe("Payments are coming soon.");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("POST /api/payments/escrow/verify returns 503 PAYMENTS_COMING_SOON", async () => {
      const req = new NextRequest("http://localhost:3000/api/payments/escrow/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: "order_123",
          razorpay_payment_id: "pay_123",
          razorpay_signature: "sig_123",
          gigId: "00000000-0000-0000-0000-000000000001",
        }),
      });

      const res = await escrowVerify(req);
      expect(res.status).toBe(503);
      const json = await res.json();
      expect(json.code).toBe("PAYMENTS_COMING_SOON");
      expect(json.error).toBe("Payments are coming soon.");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("POST /api/payments/escrow/release returns 503 PAYMENTS_COMING_SOON", async () => {
      const req = new NextRequest("http://localhost:3000/api/payments/escrow/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gigId: "00000000-0000-0000-0000-000000000001",
        }),
      });

      const res = await escrowRelease(req);
      expect(res.status).toBe(503);
      const json = await res.json();
      expect(json.code).toBe("PAYMENTS_COMING_SOON");
      expect(json.error).toBe("Payments are coming soon.");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("GET /api/cron/release-payments returns 503 PAYMENTS_COMING_SOON", async () => {
      const req = new NextRequest("http://localhost:3000/api/cron/release-payments", {
        method: "GET",
        headers: {
          Authorization: "Bearer any-token",
        },
      });

      const res = await cronReleasePayments(req);
      expect(res.status).toBe(503);
      const json = await res.json();
      expect(json.code).toBe("PAYMENTS_COMING_SOON");
      expect(json.error).toBe("Payments are coming soon.");
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe("Non-Financial Workflow Preserved", () => {
    it("POST /api/escrow handles milestone deliverable sign-off and does NOT return 503", async () => {
      const { POST: nonFinancialEscrow } = await import("@/app/api/escrow/route");
      const prisma = (await import("@/lib/prisma")).default;

      vi.mocked(prisma.gig.findUnique).mockResolvedValue({
        id: "f8f53a47-ef99-4475-b6d8-9cc0ccae491d",
        posted_by: "test-user-id",
        status: "IN_PROGRESS",
        studentConfirmed: false,
        ownerConfirmed: false,
      } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        return cb({
          gig: {
            update: vi.fn().mockResolvedValue({
              id: "f8f53a47-ef99-4475-b6d8-9cc0ccae491d",
              status: "IN_PROGRESS",
              ownerConfirmed: true,
              studentConfirmed: false,
            }),
          },
          application: {
            updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
        });
      });

      const req = new NextRequest("http://localhost:3000/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gigId: "f8f53a47-ef99-4475-b6d8-9cc0ccae491d",
          action: "CONFIRM_COMPLETION",
        }),
      });

      const res = await nonFinancialEscrow(req);
      const json = await res.json();
      if (res.status !== 200) {
        console.error("Escrow test error:", json);
      }
      expect(res.status).not.toBe(503);
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.gig).toBeDefined();
    });
  });

  describe("Security — Direct API Bypass Rejection", () => {
    it("prevents direct POST bypass attempts even with valid admin or client credentials", async () => {
      const maliciousPayloads = [
        { gigId: "00000000-0000-0000-0000-000000000001", applicationId: "00000000-0000-0000-0000-000000000002" },
        { gigId: "00000000-0000-0000-0000-000000000001", bypass: true, force: true },
        {},
      ];

      for (const payload of maliciousPayloads) {
        const req = new NextRequest("http://localhost:3000/api/checkout/create-order", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-bypass-payment-lock": "true",
          },
          body: JSON.stringify(payload),
        });

        const res = await checkoutCreateOrder(req);
        expect(res.status).toBe(503);
        const json = await res.json();
        expect(json.code).toBe("PAYMENTS_COMING_SOON");
      }
    });
  });

  describe("Zero Outbound Provider Requests", () => {
    it("guarantees zero HTTP calls made to Razorpay or external providers", async () => {
      const endpoints = [
        () => checkoutCreateOrder(new NextRequest("http://localhost:3000/api/checkout/create-order", { method: "POST" })),
        () => checkoutWebhook(new NextRequest("http://localhost:3000/api/checkout/webhook", { method: "POST" })),
        () => checkoutRefund(new NextRequest("http://localhost:3000/api/checkout/refund", { method: "POST" })),
        () => escrowCreateOrder(new NextRequest("http://localhost:3000/api/payments/escrow/create-order", { method: "POST" })),
        () => escrowVerify(new NextRequest("http://localhost:3000/api/payments/escrow/verify", { method: "POST" })),
        () => escrowRelease(new NextRequest("http://localhost:3000/api/payments/escrow/release", { method: "POST" })),
        () => cronReleasePayments(new NextRequest("http://localhost:3000/api/cron/release-payments", { method: "GET" })),
      ];

      for (const call of endpoints) {
        await call();
      }

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});
