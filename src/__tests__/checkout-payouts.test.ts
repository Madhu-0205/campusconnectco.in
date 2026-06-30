import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as checkoutWebhookHandler } from "../app/api/checkout/webhook/route";
import { POST as createOrderHandler } from "../app/api/checkout/create-order/route";
import { GET as releasePaymentsCronHandler } from "../app/api/cron/release-payments/route";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

// Mock prisma client using proper path alias
vi.mock("@/lib/prisma", () => {
  const mockTransactionFindFirst = vi.fn();
  const mockTransactionFindUnique = vi.fn();
  const mockTransactionFindMany = vi.fn();
  const mockTransactionCreate = vi.fn();
  const mockTransactionUpdate = vi.fn();
  
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
          data: { user: { id: "buyer-user-id", email: "client@test.com" } },
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
    process.env.RAZORPAY_KEY_ID = "rzp_test_placeholder";
    process.env.RAZORPAY_KEY_SECRET = "placeholder_secret";
  });

  describe("Razorpay Webhook Endpoint", () => {
    it("should process mock/local webhook payments without signature validation in test mode", async () => {
      const mockTxRecord = {
        id: "tx-abc-123",
        gigId: "gig-uuid",
        buyerId: "buyer-user-id",
        sellerId: "seller-user-id",
        amount: 2000,
        platformFee: 200,
        sellerPayout: 1800,
        status: "PENDING",
      };
      vi.mocked(prisma.transaction.findFirst).mockResolvedValue(mockTxRecord as any);

      const payload = {
        event: "order.paid",
        orderId: "order_mock_12345",
        payload: {
          payment: {
            entity: {
              id: "pay_xyz",
              amount: 200000,
              order_id: "order_mock_12345",
            },
          },
        },
      };

      const req = new NextRequest("http://localhost/api/checkout/webhook", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const response = await checkoutWebhookHandler(req);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe("Create Checkout Order Endpoint", () => {
    it("should generate simulated mock Razorpay order details for development sandbox", async () => {
      const mockGig = {
        id: "f8f53a47-ef99-4475-b6d8-9cc0ccae491d",
        title: "Test Gig",
        posted_by: "buyer-user-id",
        budget: 5000,
      };
      const mockApp = {
        id: "ca252e3d-0d67-4e78-bc57-0a35db4db59a",
        applicantId: "seller-user-id",
        gigId: "f8f53a47-ef99-4475-b6d8-9cc0ccae491d",
      };

      vi.mocked(prisma.gig.findUnique).mockResolvedValue(mockGig as any);
      vi.mocked(prisma.application.findUnique).mockResolvedValue(mockApp as any);

      const req = new NextRequest("http://localhost/api/checkout/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          gigId: mockGig.id,
          applicationId: mockApp.id,
        }),
      });

      const response = await createOrderHandler(req);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.mock).toBe(true);
      expect(data.amount).toBe(500000);
      expect(data.keyId).toBe("rzp_test_placeholder");

      expect(prisma.transaction.create).toHaveBeenCalled();
    });
  });

  describe("Auto-Release Payments Cron Endpoint", () => {
    it("should process bank payout release logic for eligible transactions", async () => {
      process.env.CRON_SECRET = "super_cron_secret_token";

      const mockEligibleTx = [
        {
          id: "tx-eligible-01",
          buyerId: "buyer-1",
          sellerId: "seller-2",
          amount: 1000,
          platformFee: 100,
          sellerPayout: 900,
          status: "COMPLETED",
          releaseAt: new Date(Date.now() - 3600),
        },
      ];
      vi.mocked(prisma.transaction.findMany).mockResolvedValue(mockEligibleTx as any);

      const req = new NextRequest("http://localhost/api/cron/release-payments", {
        method: "GET",
        headers: {
          authorization: `Bearer super_cron_secret_token`,
        },
      });

      // Mock database calls inside transaction block to prevent `tx.transaction.findUnique` crashes
      const mockTxRecord = {
        id: "tx-eligible-01",
        status: "COMPLETED",
      };
      const mockSellerDetails = {
        upiId: "seller2@upi",
        accNumber: null,
        ifscCode: null,
        name: "Test Seller",
        email: "seller@test.com",
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        const mockTx = {
          transaction: {
            findUnique: vi.fn().mockResolvedValue(mockTxRecord),
            update: vi.fn().mockResolvedValue({}),
          },
          user: {
            findUnique: vi.fn().mockResolvedValue(mockSellerDetails),
          },
          transactionAudit: {
            create: vi.fn().mockResolvedValue({}),
          },
        };
        await cb(mockTx as any);
        return Promise.resolve();
      });

      const response = await releasePaymentsCronHandler(req);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.processed).toBe(1);
    });
  });
});
