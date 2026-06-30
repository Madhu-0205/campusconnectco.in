import type { Metadata } from "next"

import { AmbassadorClient } from "./AmbassadorClient"

export const metadata: Metadata = {
  title: "Campus Ambassador Program | CampusConnect",
  description:
    "Become a CampusConnect Campus Captain. Lead your college community, earn ₹ from every student you onboard, and build your career in growth, community, and operations.",
  openGraph: {
    title: "Campus Ambassador Program | CampusConnect",
    description: "Earn while you lead. Be the first CampusConnect Campus Captain at your college.",
    images: [{ url: "/og-ambassador.jpg" }],
  },
  alternates: { canonical: "https://campusconnectco.in/ambassador" },
}

import { headers } from "next/headers"

export default async function AmbassadorPage() {
  const nonce = (await headers()).get("x-nonce") || undefined;
  return <AmbassadorClient nonce={nonce} />
}
