import { NextRequest, NextResponse } from"next/server"

import prisma from"@/lib/prisma"

// ── GET /api/growth/share-card — generate shareable card metadata ─────────────
// Called by the frontend after a milestone is hit
// Returns the data needed to render the OG share image + deeplink
export async function GET(req: NextRequest) {
 try {
 const { searchParams } = new URL(req.url)
 const type = searchParams.get("type") ||"first_gig"
 const userId = searchParams.get("userId") ||""

 if (!userId) return NextResponse.json({ error:"userId required" }, { status: 400 })

 const user = await prisma.user.findUnique({
 where: { id: userId },
 select: { name: true, image: true, college: true, username: true },
 })

 if (!user) return NextResponse.json({ error:"User not found" }, { status: 404 })

 
 let gamif: any = null
 try {
 
 gamif = await (prisma as any).userGamification.findUnique({ where: { userId } })
 } catch { /* optional */ }

 const firstName = user.name?.split("")[0] ||"A student"
 const college = user.college ||"India"
 const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||"https://campusconnectco.in"

 const CARD_TEMPLATES: Record<string, { headline: string; subtext: string; emoji: string }> = {
 first_gig: { headline: `${firstName} just shipped their first gig 🚀`, subtext: `Building real work before graduation at CampusConnect`, emoji:"🚀" },
 earning_1k: { headline: `${firstName} earned ₹1,000 as a student 💰`, subtext: `From ${college}. Real work. Real pay. No degree needed.`, emoji:"💰" },
 earning_5k: { headline: `₹5,000 earned without a degree 🎯`, subtext: `${firstName} from ${college} is on CampusConnect`, emoji:"🎯" },
 earning_10k: { headline: `₹10,000 milestone unlocked! 🏆`, subtext: `${firstName} proves students can earn before graduation`, emoji:"🏆" },
 earning_25k: { headline: `₹25,000 earned as a student 🔥`, subtext: `${firstName} · ${college} · CampusConnect`, emoji:"🔥" },
 earning_1l: { headline: `₹1 Lakh earned as a student 👑`, subtext: `${firstName} from ${college} just hit ₹1L on CampusConnect`, emoji:"👑" },
 streak_7: { headline: `7-day streak 🔥 Nothing stopping ${firstName}`, subtext: `Daily career building at CampusConnect · ${college}`, emoji:"🔥" },
 streak_30: { headline: `30-day streak! ${firstName} never stopped 💯`, subtext: `A month of consistent career building · ${college}`, emoji:"💯" },
 badge: { headline: `${firstName} just earned a new badge ⭐`, subtext: `${college} student leveling up on CampusConnect`, emoji:"⭐" },
 rank_1: { headline: `${firstName} is #1 on campus 👑`, subtext: `Top of the CampusConnect leaderboard at ${college}`, emoji:"👑" },
 level_up: { headline: `Level ${gamif?.level ||"up"}: ${gamif?.levelTitle ||"Achieved"} 🎮`, subtext: `${firstName} from ${college} keeps leveling up`, emoji:"🎮" },
 }

 const template = CARD_TEMPLATES[type] || CARD_TEMPLATES["first_gig"]

 // Referral link embedded in the card
 
 let referralCode: string | null = null
 try {
 
 const ref = await (prisma as any).referral.findFirst({ where: { referrerId: userId }, orderBy: { createdAt:"asc" } })
 referralCode = ref?.referralCode || null
 } catch { /* optional */ }

 const shareUrl = referralCode
 ? `${baseUrl}/join?ref=${referralCode}&utm_source=share_card&utm_medium=social&utm_campaign=${type}`
 : `${baseUrl}?utm_source=share_card&utm_medium=social&utm_campaign=${type}`

 // OG image URL (for dynamic image generation via /api/og/card)
 const ogImageUrl = `${baseUrl}/api/og/card?type=${type}&name=${encodeURIComponent(firstName)}&college=${encodeURIComponent(college)}&emoji=${template.emoji}`

 // Track the card generation
 try {
 
 await (prisma as any).shareCard.create({
 data: {
 userId,
 type,
 metadata: { headline: template.headline, subtext: template.subtext, college, smartScore: gamif?.smartScore },
 },
 })
 
 await (prisma as any).growthEvent.create({
 data: { userId, type:"share_card_generated", metadata: { cardType: type, college } },
 })
 } catch { /* non-blocking */ }

 // Pre-formatted share text per channel
 const shareText = {
 whatsapp: `${template.headline}\n\n${template.subtext}\n\n🔗 Join me: ${shareUrl}`,
 twitter: `${template.headline} ${template.subtext} ${shareUrl} #CampusConnect #StudentFreelancing`,
 linkedin: `${template.headline}\n\n${template.subtext}\n\nJoin 10,000+ students building verified careers: ${shareUrl}`,
 instagram: `${template.headline}\n${template.subtext}\n\n👉 Link in bio`,
 }

 return NextResponse.json({
 template,
 shareUrl,
 ogImageUrl,
 shareText,
 referralCode,
 userName: firstName,
 college,
 })
 } catch (error) {
 console.error("[GET /api/growth/share-card]", error)
 return NextResponse.json({ error:"Internal server error" }, { status: 500 })
 }
}
