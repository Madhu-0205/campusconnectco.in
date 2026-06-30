import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-checks"
import {
  XP_REWARDS, computeLevel, computeSmartScore, getStreakMultiplier, BADGES
} from "@/lib/gamification"

// ── GET /api/gamification/profile ─────────────────────────────────────────────
export async function GET() {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let gamif = await (prisma as any).userGamification.findUnique({
      where: { userId: user.id },
      include: {
        xpEvents: { orderBy: { createdAt: "desc" }, take: 10 },
        userBadges: {
          include: { badge: true },
          where: { isShowcased: true },
          orderBy: { earnedAt: "desc" },
        },
      },
    })

    // Auto-create on first access
    if (!gamif) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gamif = await (prisma as any).userGamification.create({
        data: { userId: user.id },
        include: {
          xpEvents: { take: 10 },
          userBadges: { include: { badge: true } },
        },
      })
    }

    // Compute derived fields
    const levelData = computeLevel(gamif.totalXp)
    const smartScore = computeSmartScore(
      gamif.reliabilityScore,
      gamif.executionScore,
      gamif.learningScore,
      gamif.communityScore,
    )

    // Check streak validity (missed a day = streak broken)
    let currentStreak = gamif.currentStreak
    if (gamif.lastActivityDate) {
      const last = new Date(gamif.lastActivityDate)
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays > 1) currentStreak = 0
    }

    return NextResponse.json({
      ...gamif,
      currentStreak,
      smartScore,
      level: levelData.level,
      levelTitle: levelData.title,
      levelProgress: levelData.progress,
      nextLevelXp: levelData.nextMin,
      streakMultiplier: getStreakMultiplier(currentStreak),
    })
  } catch (error) {
    console.error("[GET /api/gamification/profile]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ── POST /api/gamification/profile (trigger XP event) ────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { type, metadata } = await req.json()
    if (!type || !(type in XP_REWARDS)) {
      return NextResponse.json({ error: "Invalid XP event type" }, { status: 400 })
    }

    const baseXp = XP_REWARDS[type as keyof typeof XP_REWARDS]

    // Get or create gamification record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let gamif = await (prisma as any).userGamification.findUnique({ where: { userId: user.id } })
    if (!gamif) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gamif = await (prisma as any).userGamification.create({ data: { userId: user.id } })
    }

    // Compute streak & multiplier
    const now = new Date()
    let newStreak = gamif.currentStreak
    if (gamif.lastActivityDate) {
      const diffDays = Math.floor((now.getTime() - new Date(gamif.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === 0) newStreak = gamif.currentStreak       // same day — no change
      else if (diffDays === 1) newStreak = gamif.currentStreak + 1 // next day — extend
      else newStreak = 1                                         // gap — reset
    } else {
      newStreak = 1
    }

    const multiplier = getStreakMultiplier(newStreak)
    const finalXp = Math.round(baseXp * multiplier)

    const newTotal = gamif.totalXp + finalXp
    const levelData = computeLevel(newTotal)

    // Update gamification record + log XP event
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [updated] = await (prisma as any).$transaction([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma as any).userGamification.update({
        where: { userId: user.id },
        data: {
          totalXp: newTotal,
          level: levelData.level,
          levelTitle: levelData.title,
          currentStreak: newStreak,
          longestStreak: Math.max(gamif.longestStreak, newStreak),
          lastActivityDate: now,
          smartScore: computeSmartScore(
            gamif.reliabilityScore,
            type === "GIG_COMPLETED" ? Math.min(100, gamif.executionScore + 5) : gamif.executionScore,
            type === "SKILL_VERIFIED" ? Math.min(100, gamif.learningScore + 10) : gamif.learningScore,
            gamif.communityScore,
          ),
          ...(type === "GIG_COMPLETED" && { gigsCompleted: gamif.gigsCompleted + 1 }),
          ...(type === "GIG_COMPLETED" && !gamif.firstGigAt && { firstGigAt: now }),
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma as any).xpEvent.create({
        data: {
          gamificationId: gamif.id,
          type,
          xpAwarded: finalXp,
          multiplier,
          description: buildDescription(type, multiplier, newStreak),
          metadata: metadata || null,
        },
      }),
    ])

    // Badge checks — fire-and-forget (don't block response)
    checkAndAwardBadges(gamif.id, user.id, { ...gamif, totalXp: newTotal, gigsCompleted: gamif.gigsCompleted + (type === "GIG_COMPLETED" ? 1 : 0), currentStreak: newStreak })
      .catch(() => {/* non-blocking */})

    return NextResponse.json({ xpAwarded: finalXp, multiplier, newTotal, level: levelData, streakDays: newStreak })
  } catch (error) {
    console.error("[POST /api/gamification/profile]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function buildDescription(type: string, multiplier: number, streak: number): string {
  const streakNote = multiplier > 1 ? ` (${streak}-day streak ${multiplier}×)` : ""
  const map: Record<string, string> = {
    GIG_COMPLETED: `Gig completed${streakNote}`,
    FIRST_GIG: "First gig bonus!",
    REVIEW_RECEIVED_5STAR: `5-star review received${streakNote}`,
    REVIEW_RECEIVED_4STAR: "4-star review received",
    SKILL_VERIFIED: "Skill verified",
    PROFILE_COMPLETE: "Profile completed",
    STREAK_7: "7-day streak bonus!",
    STREAK_30: "30-day streak bonus!",
    STREAK_100: "100-day streak — LEGENDARY!",
    REFERRAL_SIGNUP: "Referral bonus",
    BADGE_EARNED: "Badge earned",
  }
  return map[type] || type
}

async function checkAndAwardBadges(gamifId: string, userId: string, state: {
  gigsCompleted: number
  totalEarned: number
  currentStreak: number
}) {
  for (const badge of BADGES) {
    const req = badge.requirement as { type: string; value: number }
    let earned = false

    if (req.type === "gig_count" && state.gigsCompleted >= req.value) earned = true
    else if (req.type === "earned_inr" && state.totalEarned >= req.value) earned = true
    else if (req.type === "streak_days" && state.currentStreak >= req.value) earned = true

    if (!earned) continue

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const badgeRecord = await (prisma as any).badge.findUnique({ where: { slug: badge.slug } })
      if (!badgeRecord) continue

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: badgeRecord.id } },
        update: {},
        create: { userId, badgeId: badgeRecord.id, gamificationId: gamifId },
      })
    } catch {
      // Already exists or other non-critical error — skip
    }
  }
}
