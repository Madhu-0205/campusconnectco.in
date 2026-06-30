import prisma from "@/lib/prisma"
import { computeLevel, computeSmartScore } from "@/lib/gamification"

/**
 * Handles referral conversion and payouts when a referee completes their first gig (escrow released).
 * @param refereeId The user ID of the referred user (referee)
 * @param transactionId The ID of the transaction that was released
 */
export async function triggerReferralConversion(refereeId: string, transactionId: string) {
  try {
    console.log(`[GrowthEngine] Checking referral conversion for referee: ${refereeId}, tx: ${transactionId}`)

    // 1. Find the pending referral record
    const referral = await prisma.referral.findFirst({
      where: {
        refereeId,
        status: "SIGNED_UP",
      },
    })

    if (!referral) {
      console.log(`[GrowthEngine] No pending referral found for user ${refereeId}`)
      return
    }

    // Get the transaction details to compute Ambassador share if applicable
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { sellerPayout: true },
    })

    const payoutAmount = Number(transaction?.sellerPayout || 0)
    const referrerXpAward = 200 // Champion referral bonus
    const refereeXpAward = 100 // Referee signup bonus
    const referrerCashAward = 100.0 // ₹100 cash back
    const refereeCashAward = 100.0 // ₹100 cash back

    console.log(`[GrowthEngine] Found referral link: ${referral.referralCode}. Triggering conversion rewards.`)

    await prisma.$transaction(async (tx: any) => {
      // 2. Mark referral as converted/rewarded
      await tx.referral.update({
        where: { id: referral.id },
        data: {
          status: "REWARDED",
          convertedAt: new Date(),
          referrerBonus: referrerXpAward,
          refereeBonus: refereeXpAward,
          referrerCash: referrerCashAward,
          refereeCash: refereeCashAward,
          rewarded: true,
        },
      })

      // ── REFERRER REWARDS ──
      let referrerGamif = await tx.userGamification.findUnique({
        where: { userId: referral.referrerId },
      })
      if (!referrerGamif) {
        referrerGamif = await tx.userGamification.create({
          data: { userId: referral.referrerId },
        })
      }

      const referrerNewTotalXp = referrerGamif.totalXp + referrerXpAward
      const referrerLevelData = computeLevel(referrerNewTotalXp)

      await tx.userGamification.update({
        where: { userId: referral.referrerId },
        data: {
          totalXp: referrerNewTotalXp,
          level: referrerLevelData.level,
          levelTitle: referrerLevelData.title,
          totalEarned: referrerGamif.totalEarned + referrerCashAward,
          communityScore: Math.min(100, referrerGamif.communityScore + 15), // Increase community engagement score
          smartScore: computeSmartScore(
            referrerGamif.reliabilityScore,
            referrerGamif.executionScore,
            referrerGamif.learningScore,
            Math.min(100, referrerGamif.communityScore + 15)
          )
        },
      })

      await tx.xpEvent.create({
        data: {
          gamificationId: referrerGamif.id,
          type: "REFERRAL_SIGNUP",
          xpAwarded: referrerXpAward,
          description: `Referral converted: friend completed their first gig (+₹${referrerCashAward} cash)`,
          metadata: { refereeId, referralCode: referral.referralCode },
        },
      })

      // ── REFEREE REWARDS ──
      let refereeGamif = await tx.userGamification.findUnique({
        where: { userId: refereeId },
      })
      if (!refereeGamif) {
        refereeGamif = await tx.userGamification.create({
          data: { userId: refereeId },
        })
      }

      const refereeNewTotalXp = refereeGamif.totalXp + refereeXpAward
      const refereeLevelData = computeLevel(refereeNewTotalXp)

      await tx.userGamification.update({
        where: { userId: refereeId },
        data: {
          totalXp: refereeNewTotalXp,
          level: refereeLevelData.level,
          levelTitle: refereeLevelData.title,
          totalEarned: refereeGamif.totalEarned + refereeCashAward,
        },
      })

      await tx.xpEvent.create({
        data: {
          gamificationId: refereeGamif.id,
          type: "REFERRAL_SIGNUP",
          xpAwarded: refereeXpAward,
          description: `Referral signup reward: completed first gig (+₹${refereeCashAward} cash)`,
          metadata: { referrerId: referral.referrerId, referralCode: referral.referralCode },
        },
      })

      // ── AMBASSADOR LOOP ──
      // Check if referrer is a Campus Ambassador / Captain
      const ambassador = await tx.ambassador.findUnique({
        where: { userId: referral.referrerId },
      })

      if (ambassador && ambassador.status === "ACTIVE") {
        // 5% share of gig payout for Campus Captain
        const feeShare = Math.round(payoutAmount * 0.05 * 100) / 100

        await tx.ambassador.update({
          where: { id: ambassador.id },
          data: {
            studentsOnboarded: ambassador.studentsOnboarded + 1,
            totalEarningsShare: ambassador.totalEarningsShare + feeShare,
          },
        })

        // Also add the fee share to the Ambassador's gamification earnings
        await tx.userGamification.update({
          where: { userId: referral.referrerId },
          data: {
            totalEarned: referrerGamif.totalEarned + referrerCashAward + feeShare,
          },
        })

        console.log(`[GrowthEngine] Ambassador ${referral.referrerId} awarded ₹${feeShare} (5% share of ₹${payoutAmount} gig payout)`)
      }

      // ── GROWTH EVENT LOGS ──
      await tx.growthEvent.create({
        data: {
          userId: refereeId,
          type: "referral_converted",
          channel: referral.channel || "direct",
          metadata: {
            referrerId: referral.referrerId,
            referralCode: referral.referralCode,
            transactionId,
            payoutAmount,
            referrerCashAward,
            refereeCashAward,
          },
        },
      })
    })

    console.log(`[GrowthEngine] Referral conversion completed successfully for referee: ${refereeId}`)
  } catch (error) {
    console.error("[GrowthEngine] Error processing referral conversion:", error)
  }
}
