import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { headers } from "next/headers"

const SmoothScroll = dynamic(() => import("@/components/ui/SmoothScroll"))

// V2 Landing Components
import { V2BentoFeatures } from "@/components/landing/V2BentoFeatures"
import { V2FinalCTA } from "@/components/landing/V2FinalCTA"
import { V2Hero } from "@/components/landing/V2Hero"
import { V2LiveOpportunities } from "@/components/landing/V2LiveOpportunities"
import { V2Marquee } from "@/components/landing/V2Marquee"
import { V2Testimonials } from "@/components/landing/V2Testimonials"
import { V2Footer } from "@/components/navigation/V2Footer"
import { V2Navbar } from "@/components/navigation/V2Navbar"
import { WebsiteSchema, FAQSchema } from "@/components/seo/JsonLd"

export const metadata: Metadata = {
  title: "Find Internships, Campus Gigs & Freelance Jobs | CampusConnect",
  description:
    "CampusConnect helps students discover internships, campus gigs, freelance jobs, and AI career roadmaps across India with verified employers and secure payments.",
  keywords: [
    "student internships",
    "college internships",
    "campus gigs",
    "freelance jobs",
    "AI career roadmap",
    "student networking",
    "career guidance",
    "internships for students",
    "verified internships",
    "remote internships",
  ],
  alternates: {
    canonical: "https://www.campusconnectco.in/",
    languages: { "en-IN": "https://www.campusconnectco.in/" },
  },
  openGraph: {
    title: "Find Internships, Campus Gigs & Freelance Jobs | CampusConnect",
    description:
      "CampusConnect helps students discover internships, campus gigs, freelance jobs, and AI career roadmaps across India with verified employers and secure payments.",
    url: "https://www.campusconnectco.in/",
    type: "website",
    images: [{ url: "/logo-v2.jpg", width: 1200, height: 630, alt: "CampusConnect homepage" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Internships, Campus Gigs & Freelance Jobs | CampusConnect",
    description:
      "CampusConnect helps students discover internships, campus gigs, freelance jobs, and AI career roadmaps across India with verified employers and secure payments.",
    images: ["/logo-v2.jpg"],
    site: "@campusconnectin",
  },
  robots: {
    index: true,
    follow: true,
  },
}


export default async function CampusConnectLandingPage() {
  const nonce = (await headers()).get("x-nonce") || undefined

  const landingFaqs = [
    {
      question: "How do I earn money as a college student on CampusConnect?",
      answer: "You can earn money by applying to local campus gigs or remote startup internships, completing milestones, and receiving payments securely via our escrow system."
    },
    {
      question: "What is the CampusConnect Escrow system?",
      answer: "Our escrow protection guarantees that client funds are locked when a project starts and only released to the student once the completed work is submitted and approved."
    },
    {
      question: "How does the student academic email verification work?",
      answer: "Students with valid academic email domains (.edu, .edu.in, .res.in) receive a gold verification badge, which instantly increases their credibility and search visibility for startup recruiters."
    },
    {
      question: "Can startups hire teams of students on CampusConnect?",
      answer: "Yes! CampusConnect supports co-founder and developer team matching to help startups find multiple student hackers, developers, and designers to collaborate on larger projects."
    }
  ]

  return (
    <SmoothScroll>
      <WebsiteSchema nonce={nonce} />
      <FAQSchema faqs={landingFaqs} nonce={nonce} />

      {/* ── Fixed Navigation (V2) ── */}
      <V2Navbar />

      <main className="landing-body flex flex-col min-h-screen">
        
        {/* V2 Hero Section */}
        <V2Hero />

        {/* V2 Stats Ticker */}
        <div className="relative z-10">
          <V2Marquee />
        </div>

        {/* V2 Bento Features */}
        <V2BentoFeatures />

        {/* V2 Live Opportunities Showcase */}
        <V2LiveOpportunities />

        {/* V2 Testimonials */}
        <div className="fast-render relative z-10">
          <V2Testimonials />
        </div>

        {/* V2 Final CTA */}
        <V2FinalCTA />

        {/* Footer (V2) */}
        <div className="fast-render relative z-10 bg-bg">
          <V2Footer />
        </div>

      </main>
    </SmoothScroll>
  )
}
