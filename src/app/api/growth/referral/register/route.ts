import { NextRequest, NextResponse } from"next/server"

import { getSession } from"@/lib/auth-checks"
import prisma from"@/lib/prisma"

export const dynamic ="force-dynamic"

// ── POST /api/growth/referral/register ────────────────────────────────────────
// Associates the current logged-in user (referee) with the referrer's referral code.
// Called automatically on dashboard or onboarding mount if a referral code is found in localStorage.
export async function POST(req: NextRequest) {
 try {
 const user = await getSession()
 if (!user) return NextResponse.json({ error:"Unauthorized" }, { status: 401 })

 const { code } = await req.json()
 if (!code) {
 return NextResponse.json({ error:"Referral code is required" }, { status: 400 })
 }

 const cleanCode = code.trim().toUpperCase()

 // 1. Check if the user has already been referred (refereeId is unique in Referral)
 
 const alreadyReferred = await (prisma as any).referral.findFirst({
 where: { refereeId: user.id },
 })

 if (alreadyReferred) {
 return NextResponse.json({
 ok: true,
 message:"User is already associated with a referral link",
 referral: alreadyReferred,
 })
 }

 // 2. Find the referrer's master referral link
 
 const referrerRecord = await (prisma as any).referral.findFirst({
 where: { referralCode: cleanCode },
 })

 if (!referrerRecord) {
 return NextResponse.json({ error:"Invalid referral code" }, { status: 404 })
 }

 // A user cannot refer themselves
 if (referrerRecord.referrerId === user.id) {
 return NextResponse.json({ error:"You cannot refer yourself" }, { status: 400 })
 }

 // 3. Create a new referral record for this relation
 
 const newReferral = await (prisma as any).referral.create({
 data: {
 referrerId: referrerRecord.referrerId,
 refereeId: user.id,
 referralCode: cleanCode,
 referralLink: referrerRecord.referralLink,
 status:"SIGNED_UP",
 signedUpAt: new Date(),
 },
 })

 // 4. Log a Growth Event
 
 await (prisma as any).growthEvent.create({
 data: {
 userId: user.id,
 type:"referral_signed_up",
 channel: referrerRecord.channel ||"direct",
 metadata: {
 referrerId: referrerRecord.referrerId,
 referralCode: cleanCode,
 },
 },
 })

 return NextResponse.json({
 ok: true,
 message:"Referral registered successfully",
 referral: newReferral,
 })
 } catch (error) {
 console.error("[POST /api/growth/referral/register]", error)
 return NextResponse.json({ error:"Internal server error" }, { status: 500 })
 }
}
