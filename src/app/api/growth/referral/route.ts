import { NextRequest, NextResponse } from "next/server"

import { getSession } from "@/lib/auth-checks"
import prisma from "@/lib/prisma"

// ── Referral code generator ───────────────────────────────────────────────────
function generateReferralCode(name: string, userId: string): string {
  const namePart = (name || "USER").replace(/\s+/g, "").toUpperCase().slice(0, 5)
  const idPart = userId.replace(/-/g, "").slice(0, 4).toUpperCase()
  return `${namePart}${idPart}`
}

// ── GET /api/growth/referral — fetch or create my referral link ───────────────
export async function GET() {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

     
    const existing = await (prisma as any).referral.findFirst({
      where: { referrerId: user.id },
      orderBy: { createdAt: "asc" },
    })

    if (existing) {
       
      const allReferrals: any[] = await (prisma as any).referral.findMany({
        where: { referrerId: user.id },
        orderBy: { createdAt: "desc" },
      })

      const stats = {
        totalSent: allReferrals.length,
        signedUp: allReferrals.filter((r: any) => r.status !== "PENDING").length,
        converted: allReferrals.filter((r: any) => r.status === "CONVERTED" || r.status === "REWARDED").length,
        rewarded: allReferrals.filter((r: any) => r.status === "REWARDED").length,
        totalCashEarned: allReferrals.reduce((sum: number, r: any) => sum + (r.referrerCash || 0), 0),
        conversionRate: allReferrals.length > 0
          ? Math.round((allReferrals.filter((r: any) => r.status === "CONVERTED" || r.status === "REWARDED").length / allReferrals.length) * 100)
          : 0,
      }

      return NextResponse.json({
        referralCode: existing.referralCode,
        referralLink: existing.referralLink,
        stats,
        recentReferrals: allReferrals.slice(0, 5),
      })
    }

    // Create new referral record (the "master" link for this user)
    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { name: true } })
    const code = generateReferralCode(dbUser?.name || "USER", user.id)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campusconnectco.in"
    const link = `${baseUrl}/join?ref=${code}&utm_source=referral&utm_medium=share&utm_campaign=student_referral`

     
    const created = await (prisma as any).referral.create({
      data: {
        referrerId: user.id,
        referralCode: code,
        referralLink: link,
        status: "PENDING",
      },
    })

    return NextResponse.json({
      referralCode: created.referralCode,
      referralLink: created.referralLink,
      stats: { totalSent: 0, signedUp: 0, converted: 0, rewarded: 0, totalCashEarned: 0, conversionRate: 0 },
      recentReferrals: [],
    })
  } catch (error) {
    console.error("[GET /api/growth/referral]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ── POST /api/growth/referral — track a share event ──────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { channel } = await req.json()

     
    await (prisma as any).growthEvent.create({
      data: {
        userId: user.id,
        type: "referral_sent",
        channel: channel || "unknown",
        metadata: { timestamp: new Date().toISOString() },
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[POST /api/growth/referral]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
