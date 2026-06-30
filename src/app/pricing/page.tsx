import type { Metadata } from "next"

import PricingClient from "./PricingClient"

export const metadata: Metadata = {
  title: "Pricing — CampusConnect",
  description: "Free for students forever. Startups pay only when you hire — transparent platform fees with escrow protection. No hidden costs.",
  openGraph: {
    title: "Pricing — CampusConnect",
    description: "Free for students forever. Startups pay only when you hire.",
    images: [{ url: "/logo-v2.jpg" }],
  },
}

export default function PricingPage() {
  return <PricingClient />
}
