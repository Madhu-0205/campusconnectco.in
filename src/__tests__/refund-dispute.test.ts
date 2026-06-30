import { TransactionStatus, DisputeStatus } from '@prisma/client';
import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { POST as DisputePost } from '@/app/api/checkout/dispute/route';
import { POST as RefundPost } from '@/app/api/checkout/refund/route';
import prisma from '@/lib/prisma';


// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'buyer-user-id' } }, error: null }),
    },
  })),
}));

vi.mock('@/lib/prisma', () => ({
  default: {
    transaction: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    escrow: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    dispute: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    gig: {
      update: vi.fn(),
    },
    transactionAudit: {
      create: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (callback) => callback(prisma)),
  }
}));

// Mock Razorpay
vi.mock('razorpay', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      payments: {
        refund: vi.fn().mockResolvedValue({ id: 'rfnd_123' }),
      },
    })),
  };
});

describe('Refund and Dispute Flow APIs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAZORPAY_KEY_ID = 'rzp_test_placeholder'; // Force mock mode for Razorpay
  });

  describe('Refund API', () => {
    it('should reject if transaction not found', async () => {
      vi.mocked(prisma.transaction.findUnique).mockResolvedValue(null);
      
      const req = new NextRequest('http://localhost:3000/api/checkout/refund', {
        method: 'POST',
        body: JSON.stringify({ transactionId: 'd6b7b204-62e5-4d22-97b7-6f81e33c4bc1', reason: 'Test refund' })
      });

      const res = await RefundPost(req);
      expect(res.status).toBe(404);
    });

    it('should process refund for PAID transaction', async () => {
      const mockTx = {
        id: 'd6b7b204-62e5-4d22-97b7-6f81e33c4bc1',
        buyerId: 'buyer-user-id',
        sellerId: 'seller-user-id',
        status: TransactionStatus.PAID,
        gigId: 'gig-123',
        paymentId: 'pay_123'
      };
      // @ts-ignore
      vi.mocked(prisma.transaction.findUnique).mockResolvedValue(mockTx);
      
      const req = new NextRequest('http://localhost:3000/api/checkout/refund', {
        method: 'POST',
        body: JSON.stringify({ transactionId: mockTx.id, reason: 'Test refund' })
      });

      const res = await RefundPost(req);
      expect(res.status).toBe(200);
      expect(prisma.transaction.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: mockTx.id },
        data: { status: TransactionStatus.REFUNDED }
      }));
    });
  });

  describe('Dispute API', () => {
    it('should open a dispute for a PAID transaction and notify counterparty', async () => {
      const mockTx = {
        id: 'd6b7b204-62e5-4d22-97b7-6f81e33c4bc1',
        buyerId: 'buyer-user-id',
        sellerId: 'seller-user-id',
        status: TransactionStatus.PAID,
        gigId: 'gig-123',
      };
      
      // @ts-ignore
      vi.mocked(prisma.transaction.findUnique).mockResolvedValue(mockTx);
      vi.mocked(prisma.dispute.findUnique).mockResolvedValue(null);
      // @ts-ignore
      vi.mocked(prisma.dispute.create).mockResolvedValue({ id: 'disp-123', status: DisputeStatus.OPEN });
      
      const req = new NextRequest('http://localhost:3000/api/checkout/dispute', {
        method: 'POST',
        body: JSON.stringify({ transactionId: mockTx.id, reason: 'Test reason', description: 'Test description 123' })
      });

      const res = await DisputePost(req);
      expect(res.status).toBe(200);
      expect(prisma.transaction.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: mockTx.id },
        data: { status: TransactionStatus.DISPUTED }
      }));
      expect(prisma.notification.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          userId: 'seller-user-id' // Because buyer is initiating, seller should be notified
        })
      }));
    });
  });
});
