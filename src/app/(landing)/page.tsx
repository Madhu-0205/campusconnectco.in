import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { headers } from "next/headers"

const SmoothScroll = dynamic(() => import("@/components/ui/SmoothScroll"))

// Master Landing Components (15 Sections)
import { MasterFeatures } from "@/components/landing/master/MasterFeatures"
import { MasterFinalCTA } from "@/components/landing/master/MasterFinalCTA"
import { MasterFounderValue } from "@/components/landing/master/MasterFounderValue"
import { MasterHero } from "@/components/landing/master/MasterHero"
import { MasterHowItWorks } from "@/components/landing/master/MasterHowItWorks"
import { MasterLiveActivity } from "@/components/landing/master/MasterLiveActivity"
import { MasterMapSection } from "@/components/landing/master/MasterMapSection"
import { MasterProblem } from "@/components/landing/master/MasterProblem"
import { MasterSolution } from "@/components/landing/master/MasterSolution"
import { MasterStats } from "@/components/landing/master/MasterStats"
import { MasterRecommendations } from "@/components/landing/master/MasterRecommendations"
import { MasterStudentValue } from "@/components/landing/master/MasterStudentValue"
import { MasterTrust } from "@/components/landing/master/MasterTrust"
import { MasterPromoBar } from "@/components/landing/master/MasterPromoBar"
import { V2Footer } from "@/components/navigation/V2Footer"
import { V2Navbar } from "@/components/navigation/V2Navbar"
import { WebsiteSchema, FAQSchema } from "@/components/seo/JsonLd"
import prisma from "@/lib/prisma"

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

  // Fetch real database metrics
  const [studentsCount, gigsCount, internshipsCount, connectionsCount, foundersCount, latestGigs, latestInternships] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.gig.count({ where: { status: "OPEN" } }),
    prisma.internship.count({ where: { status: "OPEN" } }),
    prisma.application.count({ where: { status: "ACCEPTED" } }),
    prisma.user.count({ where: { role: "FOUNDER" } }),
    prisma.gig.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { poster: { select: { company_name: true, startup: true } } }
    }),
    prisma.internship.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 3
    })
  ])
  
  const opportunitiesCount = gigsCount + internshipsCount

  // Transform recent gigs & internships into a unified Opportunity type
  const unifiedOpportunities = [
    ...latestGigs.map(g => ({
      id: g.id,
      title: g.title,
      company: g.poster?.startup?.name || g.poster?.company_name || 'Startup',
      location: g.city || g.work_mode || 'Remote',
      budget: g.budget,
      type: 'gig' as const,
      createdAt: g.createdAt
    })),
    ...latestInternships.map(i => ({
      id: i.id,
      title: i.title,
      company: i.company || 'Startup',
      location: i.location || 'Remote',
      budget: i.stipend,
      type: 'internship' as const,
      createdAt: i.createdAt
    }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

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

      <main className="landing-body flex flex-col min-h-screen bg-[#FAFCFA] text-[#232B27]">
        
        {/* 1. Promotional Bar */}
        <MasterPromoBar />

        {/* 2. Navigation */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
           <V2Navbar />
        </div>

        {/* 3. Hero */}
        <MasterHero />

        {/* 4. Platform Stats */}
        <MasterStats 
          studentsCount={studentsCount} 
          opportunitiesCount={opportunitiesCount} 
          connectionsCount={connectionsCount} 
          foundersCount={foundersCount}
        />

        {/* 5. The Problem */}
        <MasterProblem />

        {/* 6. The Solution */}
        <MasterSolution />

        {/* 7. Core Features */}
        <MasterFeatures />

        {/* 8. Map / Hyperlocal Discovery */}
        <MasterMapSection />

        {/* 9. Recommendation Experience */}
        <MasterRecommendations />

        {/* 10. For Students */}
        <MasterStudentValue />

        {/* 11. For Founders */}
        <MasterFounderValue />

        {/* 12. Trust & Safety */}
        <MasterTrust />

        {/* 13. How It Works */}
        <MasterHowItWorks />

        {/* 14. Real Platform Activity */}
        <MasterLiveActivity opportunities={unifiedOpportunities} />

        {/* 15. Final CTA */}
        <MasterFinalCTA />

        {/* Footer */}
        <V2Footer />

      </main>
    </SmoothScroll>
  )
}
