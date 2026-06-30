import { NextRequest, NextResponse } from "next/server"

import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

     
    const referral = await (prisma as any).referral.findFirst({
      where: { referralCode: code.toUpperCase() },
      include: {
        referrer: {
          select: {
            name: true,
            college: true,
            avatar_url: true,
            image: true,
          }
        }
      }
    })

    if (!referral) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 })
    }

    return NextResponse.json({
      referrerName: referral.referrer.name || "A friend",
      referrerCollege: referral.referrer.college || "",
      referrerAvatar: referral.referrer.avatar_url || referral.referrer.image || null,
    })
  } catch (error) {
    console.error("[GET /api/growth/referral/lookup]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
