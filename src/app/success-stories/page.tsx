import type { Metadata } from"next"

import { SuccessStoriesClient } from"./SuccessStoriesClient"

export const metadata: Metadata = {
 title:"Student Success Stories | CampusConnectCo — Real Outcomes, Real Careers",
 description:
"Discover how 10,000+ Indian students landed internships, earned ₹50,000+ through gigs, and built verified portfolios on CampusConnectCo. Real stories, measurable results.",
 openGraph: {
 title:"Student Success Stories | CampusConnectCo",
 description:"Real students. Real gigs. Real career outcomes.",
 images: [{ url:"/og-success.jpg" }],
 },
 alternates: { canonical:"https://campusconnectco.in/success-stories" },
}

import { headers } from"next/headers"

export default async function SuccessStoriesPage() {
 const nonce = (await headers()).get("x-nonce") || undefined;
 return <SuccessStoriesClient nonce={nonce} />
}
