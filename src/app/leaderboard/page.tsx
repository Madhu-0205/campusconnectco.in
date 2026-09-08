import type { Metadata } from"next"

import { LeaderboardClient } from"./LeaderboardClient"

export const metadata: Metadata = {
 title:"Campus Leaderboard | CampusConnectCo — Top Student Earners",
 description:
"See which students are leading the CampusConnectCo rankings. Filter by college, skill, and time period. Earn XP, build your Smart Score, and climb the leaderboard.",
 openGraph: {
 title:"Campus Leaderboard | CampusConnectCo",
 description:"India's most ambitious students, ranked by verified work and real earnings.",
 images: [{ url:"/og-leaderboard.jpg" }],
 },
 alternates: { canonical:"https://campusconnectco.in/leaderboard" },
}

import { headers } from"next/headers"

export default async function LeaderboardPage() {
 const nonce = (await headers()).get("x-nonce") || undefined;
 return <LeaderboardClient nonce={nonce} />
}
