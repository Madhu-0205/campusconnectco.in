import type { Metadata } from "next"
import { headers } from "next/headers"
import SmoothScroll from "@/components/ui/SmoothScroll"

// Master Landing Components (Reordered for Phase 11)
import { MasterHero } from "@/components/landing/master/MasterHero"
import { MasterLiveActivity } from "@/components/landing/master/MasterLiveActivity"
import { MasterMapSection } from "@/components/landing/master/MasterMapSection"
import { MasterTrust } from "@/components/landing/master/MasterTrust"
import { MasterStats } from "@/components/landing/master/MasterStats"
import { MasterFeatures } from "@/components/landing/master/MasterFeatures"
import { MasterCategories } from "@/components/landing/master/MasterCategories"
import { MasterSolution } from "@/components/landing/master/MasterSolution"
import { MasterHowItWorks } from "@/components/landing/master/MasterHowItWorks"
import { MasterCommunityStories } from "@/components/landing/master/MasterCommunityStories"
import { MasterFAQ } from "@/components/landing/master/MasterFAQ"
import { MasterFinalCTA } from "@/components/landing/master/MasterFinalCTA"
import { MasterPromoBar } from "@/components/landing/master/MasterPromoBar"
import { V2Footer } from "@/components/navigation/V2Footer"
import { V2Navbar } from "@/components/navigation/V2Navbar"
import { WebsiteSchema, FAQSchema } from "@/components/seo/JsonLd"
import prisma from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Find Internships, Campus Gigs & Freelance Jobs | CampusConnectCo",
  description:
    "CampusConnectCo helps students discover internships, campus gigs, freelance jobs, and AI career roadmaps across India with verified employers and secure payments.",
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
    title: "Find Internships, Campus Gigs & Freelance Jobs | CampusConnectCo",
    description:
      "CampusConnectCo helps students discover internships, campus gigs, freelance jobs, and AI career roadmaps across India with verified employers and secure payments.",
    url: "https://www.campusconnectco.in/",
    type: "website",
    images: [{ url: "/logo-v2.jpg", width: 1200, height: 630, alt: "CampusConnectCo homepage" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Internships, Campus Gigs & Freelance Jobs | CampusConnectCo",
    description:
      "CampusConnectCo helps students discover internships, campus gigs, freelance jobs, and AI career roadmaps across India with verified employers and secure payments.",
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

  // Fetch real database metrics & opportunities
  const [studentsCount, gigsCount, internshipsCount, connectionsCount, foundersCount, latestGigs, latestInternships] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.gig.count({ where: { status: "OPEN" } }),
    prisma.internship.count({ where: { status: "OPEN" } }),
    prisma.application.count({ where: { status: "ACCEPTED" } }),
    prisma.user.count({ where: { role: "FOUNDER" } }),
    prisma.gig.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { poster: { select: { company_name: true, startup: true } } }
    }),
    prisma.internship.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 12
    })
  ])
  
  const opportunitiesCount = gigsCount + internshipsCount

  // Transform recent gigs & internships into a unified Opportunity type with coordinates
  const unifiedOpportunities = [
    ...latestGigs.map(g => ({
      id: g.id,
      title: g.title,
      company: g.poster?.startup?.name || g.poster?.company_name || 'Campus Partner',
      location: g.city ? `${g.city}${g.state ? `, ${g.state}` : ''}` : (g.work_mode || 'Remote'),
      budget: g.budget,
      type: 'gig' as const,
      lat: g.latitude,
      lng: g.longitude,
      href: `/gigs/${g.id}`,
      createdAt: g.createdAt
    })),
    ...latestInternships.map(i => ({
      id: i.id,
      title: i.title,
      company: i.company || 'Startup',
      location: i.city ? `${i.city}${i.state ? `, ${i.state}` : ''}` : (i.location || 'Remote'),
      budget: i.stipend,
      type: 'internship' as const,
      lat: i.latitude,
      lng: i.longitude,
      href: `/opportunities?q=${encodeURIComponent(i.title)}`,
      createdAt: i.createdAt
    }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  const landingFaqs = [
    {
      question: "What is CampusConnectCo?",
      answer: "CampusConnectCo is a platform connecting verified students with startups and founders for internships, campus gigs, and freelance opportunities. We focus on real deliverable-based work to help you build experience."
    },
    {
      question: "Who can use it?",
      answer: "Any university student or recent graduate can join to find opportunities. Founders, startups, and clients can join to post gigs and hire verified talent."
    },
    {
      question: "Are opportunities verified?",
      answer: "Yes. All clients must verify their identity, and we actively monitor the platform to ensure opportunities are legitimate, paid, and safe."
    },
    {
      question: "How do I apply?",
      answer: "Create a profile, add your skills, and you can instantly apply to any open gig or internship. Your profile acts as your dynamic resume."
    },
    {
      question: "Can I find remote opportunities?",
      answer: "Absolutely. You can filter by 'Remote' in the search interface to find opportunities you can complete from anywhere."
    },
    {
      question: "Can I find opportunities near my college?",
      answer: "Yes! Our MapLibre integration allows you to discover hyperlocal campus gigs and internships physically close to your university."
    },
    {
      question: "Where can I track applications?",
      answer: "Your personalized student dashboard automatically tracks the status of every application you submit (Pending, Reviewed, Accepted, Rejected)."
    }
  ]

  return (
    <SmoothScroll>
      <WebsiteSchema nonce={nonce} />
      <FAQSchema faqs={landingFaqs} nonce={nonce} />

      <main className="landing-body flex flex-col min-h-screen w-full max-w-full overflow-x-hidden bg-[#FAFCFA] text-[#232B27]">
        
        {/* 1. Promotional Bar */}
        <MasterPromoBar />

        {/* 2. Navigation */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <V2Navbar />
        </div>

        {/* 3. Hero / Value Proposition */}
        <MasterHero />

        {/* 4. Live Opportunity Discovery (Immediately after Hero) */}
        <MasterLiveActivity opportunities={unifiedOpportunities} />
        
        {/* Optional Context: Map based discovery alongside list */}
        <MasterMapSection opportunities={unifiedOpportunities} />

        {/* 5. Trust / Platform Signals */}
        <MasterStats 
          studentsCount={studentsCount} 
          opportunitiesCount={opportunitiesCount} 
          connectionsCount={connectionsCount} 
          foundersCount={foundersCount}
        />
        <MasterTrust />

        {/* 6. What You Can Do */}
        <MasterFeatures />

        {/* 7. Opportunity Categories */}
        <MasterCategories />

        {/* 8. Why CampusConnectCo */}
        <MasterSolution />

        {/* 9. How It Works */}
        <MasterHowItWorks />

        {/* 10. Real Community Stories */}
        <MasterCommunityStories />

        {/* 11. FAQ */}
        <MasterFAQ faqs={landingFaqs} />

        {/* 12. Final CTA */}
        <MasterFinalCTA />

        {/* 13. Footer */}
        <V2Footer />

      </main>
    </SmoothScroll>
  )
}
