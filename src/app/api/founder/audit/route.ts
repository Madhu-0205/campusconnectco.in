import { NextResponse } from "next/server";

import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface AuditDelegate { findMany: (args: unknown) => Promise<unknown[]>; }
const getAudit = () => (prisma as unknown as { transactionAudit: AuditDelegate }).transactionAudit;

// GET /api/founder/audit - Transaction audit trail for a specific transaction
export async function GET(req: Request) {
  try {
    const auth = await protectApi(["FOUNDER"]);
    if (auth.errorResponse) return auth.errorResponse;

    const url = new URL(req.url);
    const transactionId = url.searchParams.get("transactionId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 20;

    if (transactionId) {
      // Fetch audit logs for a specific transaction
      const [logs, transaction] = await Promise.all([
        getAudit().findMany({
          where: { transactionId },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: (page - 1) * limit,
        }),
        prisma.transaction.findUnique({
          where: { id: transactionId },
          include: {
            buyer: { select: { name: true, email: true } },
            seller: { select: { name: true, email: true } },
            gig: { select: { title: true } },
            dispute: true,
          },
        }),
      ]);
      return NextResponse.json({ logs, transaction });
    }

    // Fetch recent audit logs across all transactions
    const logs = await getAudit().findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("[AUDIT_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
