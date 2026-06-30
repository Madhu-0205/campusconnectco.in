import { describe, it, expect, vi, beforeEach } from "vitest";

import prisma from "@/lib/prisma";

import { triggerReferralConversion } from "../lib/growth";

// Mock the dependencies using path alias matching source files
vi.mock("@/lib/prisma", () => {
  const mockReferralFindFirst = vi.fn();
  const mockTransactionFindUnique = vi.fn();
  const mockReferralUpdate = vi.fn();
  const mockUserGamificationFindUnique = vi.fn();
  const mockUserGamificationCreate = vi.fn();
  const mockUserGamificationUpdate = vi.fn();
  const mockXpEventCreate = vi.fn();
  const mockAmbassadorFindUnique = vi.fn();
  const mockAmbassadorUpdate = vi.fn();
  const mockGrowthEventCreate = vi.fn();

  const mockTxClient = {
    referral: { update: mockReferralUpdate },
    userGamification: {
      findUnique: mockUserGamificationFindUnique,
      create: mockUserGamificationCreate,
      update: mockUserGamificationUpdate,
    },
    xpEvent: { create: mockXpEventCreate },
    ambassador: {
      findUnique: mockAmbassadorFindUnique,
      update: mockAmbassadorUpdate,
    },
    growthEvent: { create: mockGrowthEventCreate },
  };

  const mockTransaction = vi.fn(async (cb) => {
    return cb(mockTxClient);
  });

  return {
    default: {
      referral: {
        findFirst: mockReferralFindFirst,
        update: mockReferralUpdate,
      },
      transaction: {
        findUnique: mockTransactionFindUnique,
      },
      userGamification: {
        findUnique: mockUserGamificationFindUnique,
        create: mockUserGamificationCreate,
        update: mockUserGamificationUpdate,
      },
      xpEvent: { create: mockXpEventCreate },
      ambassador: {
        findUnique: mockAmbassadorFindUnique,
        update: mockAmbassadorUpdate,
      },
      growthEvent: { create: mockGrowthEventCreate },
      $transaction: mockTransaction,
    },
  };
});

describe("Growth Engine - Referral Conversion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should exit early if no pending referral is found", async () => {
    vi.mocked(prisma.referral.findFirst).mockResolvedValue(null);

    await triggerReferralConversion("referee-123", "tx-999");

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should process rewards and calculate scores when a referral link is converted", async () => {
    const mockReferral = {
      id: "ref-id-001",
      referrerId: "referrer-888",
      refereeId: "referee-123",
      referralCode: "RAVI42",
      channel: "direct",
    };
    vi.mocked(prisma.referral.findFirst).mockResolvedValue(mockReferral as any);

    const mockTransaction = {
      id: "tx-999",
      sellerPayout: 900,
    };
    vi.mocked(prisma.transaction.findUnique).mockResolvedValue(mockTransaction as any);

    let referrerGamifSaved: any = {};
    let refereeGamifSaved: any = {};

    // Inside transactional client
    const mockTx = {
      referral: {
        update: vi.fn().mockResolvedValue(mockReferral),
      },
      userGamification: {
        findUnique: vi.fn().mockImplementation((args) => {
          if (args.where.userId === mockReferral.referrerId) {
            return Promise.resolve({
              id: "gamif-referrer",
              userId: mockReferral.referrerId,
              totalXp: 500,
              totalEarned: 200,
              reliabilityScore: 80,
              executionScore: 70,
              learningScore: 60,
              communityScore: 50,
              smartScore: 68,
            });
          }
          if (args.where.userId === mockReferral.refereeId) {
            return Promise.resolve({
              id: "gamif-referee",
              userId: mockReferral.refereeId,
              totalXp: 100,
              totalEarned: 0,
            });
          }
          return Promise.resolve(null);
        }),
        create: vi.fn(),
        update: vi.fn().mockImplementation((args) => {
          if (args.where.userId === mockReferral.referrerId) {
            referrerGamifSaved = { ...referrerGamifSaved, ...args.data };
          }
          if (args.where.userId === mockReferral.refereeId) {
            refereeGamifSaved = { ...refereeGamifSaved, ...args.data };
          }
          return Promise.resolve({});
        }),
      },
      xpEvent: { create: vi.fn().mockResolvedValue({}) },
      ambassador: {
        findUnique: vi.fn().mockResolvedValue({
          id: "amb-007",
          status: "ACTIVE",
          studentsOnboarded: 10,
          totalEarningsShare: 150,
        }),
        update: vi.fn().mockResolvedValue({}),
      },
      growthEvent: { create: vi.fn().mockResolvedValue({}) },
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
      await cb(mockTx as any);
      return Promise.resolve();
    });

    await triggerReferralConversion("referee-123", "tx-999");

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(referrerGamifSaved).not.toBeNull();
    expect(referrerGamifSaved.totalXp).toBe(700);
    expect(referrerGamifSaved.level).toBe(3);
    expect(referrerGamifSaved.totalEarned).toBe(200 + 100 + 45); // Referrer cash reward (100) + 5% commission of 900 payout (45)

    expect(refereeGamifSaved).not.toBeNull();
    expect(refereeGamifSaved.totalXp).toBe(200);
    expect(refereeGamifSaved.level).toBe(2);
  });
});
