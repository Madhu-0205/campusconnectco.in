import { NextRequest } from"next/server";
import { describe, it, expect, vi, beforeEach } from"vitest";

import prisma from"@/lib/prisma";

import { POST as createOrderHandler } from"../app/api/checkout/create-order/route";
import { POST as checkoutWebhookHandler } from"../app/api/checkout/webhook/route";
import { GET as releasePaymentsCronHandler } from"../app/api/cron/release-payments/route";


// Mock prisma client using proper path alias
vi.mock("@/lib/prisma", () => {
 const mockTransactionFindFirst = vi.fn();
 const mockTransactionFindUnique = vi.fn();
 const mockTransactionFindMany = vi.fn();
 const mockTransactionCreate = vi.fn();
 const mockTransactionUpdate = vi.fn();
 const mockTransactionUpdateMany = vi.fn().mockResolvedValue({ count: 1 });
 
 const mockGigFindUnique = vi.fn();
 const mockGigUpdate = vi.fn();
 
 const mockApplicationFindUnique = vi.fn();
 const mockApplicationFindFirst = vi.fn();
 const mockApplicationUpdate = vi.fn();
 
 const mockEscrowCreate = vi.fn();
 const mockAuditCreate = vi.fn();
 const mockNotificationCreate = vi.fn();
 const mockUserFindUnique = vi.fn();

 const mockTxClient = {
 transaction: {
 findUnique: mockTransactionFindUnique,
 update: mockTransactionUpdate,
 updateMany: mockTransactionUpdateMany,
 create: mockTransactionCreate,
 },
 escrow: { create: mockEscrowCreate },
 gig: { update: mockGigUpdate },
 application: { findFirst: mockApplicationFindFirst, update: mockApplicationUpdate },
 transactionAudit: { create: mockAuditCreate },
 notification: { create: mockNotificationCreate },
 user: { findUnique: mockUserFindUnique },
 ambassador: { findUnique: vi.fn(), update: vi.fn() },
 userGamification: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
 xpEvent: { create: vi.fn() },
 growthEvent: { create: vi.fn() },
 };

 const mockTransaction = vi.fn(async (cb) => {
 return cb(mockTxClient);
 });

 return {
 default: {
 transaction: {
 findFirst: mockTransactionFindFirst,
 findUnique: mockTransactionFindUnique,
 findMany: mockTransactionFindMany,
 create: mockTransactionCreate,
 update: mockTransactionUpdate,
 updateMany: mockTransactionUpdateMany,
 },
 gig: {
 findUnique: mockGigFindUnique,
 update: mockGigUpdate,
 },
 application: {
 findUnique: mockApplicationFindUnique,
 findFirst: mockApplicationFindFirst,
 update: mockApplicationUpdate,
 },
 escrow: { create: mockEscrowCreate },
 transactionAudit: { create: mockAuditCreate },
 notification: { create: mockNotificationCreate },
 user: { findUnique: mockUserFindUnique },
 referral: { findFirst: vi.fn().mockResolvedValue(null) },
 $transaction: mockTransaction,
 },
 };
});

// Mock Supabase Server Client
vi.mock("../lib/supabase/server", () => {
 return {
 createClient: vi.fn().mockResolvedValue({
 auth: {
 getUser: vi.fn().mockResolvedValue({
 data: { user: { id:"buyer-user-id", email:"client@test.com" } },
 error: null,
 }),
 },
 }),
 };
});

const globalFetch = global.fetch;

describe("Checkout and Payout Cron Integrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = globalFetch;
  });

  describe("Razorpay Webhook Endpoint (Payment Lock Mode)", () => {
    it("should return HTTP 503 PAYMENTS_COMING_SOON while payments are disabled", async () => {
      const payload = {
        event: "order.paid",
        orderId: "order_mock_12345",
      };

      const req = new NextRequest("http://localhost/api/checkout/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const response = await checkoutWebhookHandler(req);
      expect(response.status).toBe(503);

      const data = await response.json();
      expect(data.code).toBe("PAYMENTS_COMING_SOON");
      expect(data.error).toBe("Payments are coming soon.");

      // Ensure no transaction or escrow was modified
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe("Create Checkout Order Endpoint (Payment Lock Mode)", () => {
    it("should return HTTP 503 PAYMENTS_COMING_SOON and not create any database orders", async () => {
      const req = new NextRequest("http://localhost/api/checkout/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          gigId: "f8f53a47-ef99-4475-b6d8-9cc0ccae491d",
          applicationId: "ca252e3d-0d67-4e78-bc57-0a35db4db59a",
        }),
      });

      const response = await createOrderHandler(req);
      expect(response.status).toBe(503);

      const data = await response.json();
      expect(data.code).toBe("PAYMENTS_COMING_SOON");
      expect(data.error).toBe("Payments are coming soon.");

      expect(prisma.transaction.create).not.toHaveBeenCalled();
    });
  });

  describe("Auto-Release Payments Cron Endpoint (Payment Lock Mode)", () => {
    it("should return HTTP 503 PAYMENTS_COMING_SOON and prevent any external provider transfers", async () => {
      const req = new NextRequest("http://localhost/api/cron/release-payments", {
        method: "GET",
        headers: {
          authorization: `Bearer super_cron_secret_token`,
        },
      });

      const response = await releasePaymentsCronHandler(req);
      expect(response.status).toBe(503);

      const data = await response.json();
      expect(data.code).toBe("PAYMENTS_COMING_SOON");
      expect(data.error).toBe("Payments are coming soon.");

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
