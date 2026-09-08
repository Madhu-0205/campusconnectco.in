import type { Metadata } from "next"
import { headers } from "next/headers"
import SmoothScroll from "@/components/ui/SmoothScroll"

// Master Landing Components (15 Sections)
import { MasterFeatures } from"@/components/landing/master/MasterFeatures"
import { MasterFinalCTA } from"@/components/landing/master/MasterFinalCTA"
import { MasterFounderValue } from"@/components/landing/master/MasterFounderValue"
import { MasterHero } from"@/components/landing/master/MasterHero"
import { MasterHowItWorks } from"@/components/landing/master/MasterHowItWorks"
import { MasterLiveActivity } from"@/components/landing/master/MasterLiveActivity"
import { MasterMapSection } from"@/components/landing/master/MasterMapSection"
import { MasterProblem } from"@/components/landing/master/MasterProblem"
import { MasterSolution } from"@/components/landing/master/MasterSolution"
import { MasterStats } from"@/components/landing/master/MasterStats"
import { MasterRecommendations } from"@/components/landing/master/MasterRecommendations"
import { MasterStudentValue } from"@/components/landing/master/MasterStudentValue"
import { MasterTrust } from"@/components/landing/master/MasterTrust"
import { MasterPromoBar } from"@/components/landing/master/MasterPromoBar"
import { V2Footer } from"@/components/navigation/V2Footer"
import { V2Navbar } from"@/components/navigation/V2Navbar"
import { WebsiteSchema, FAQSchema } from"@/components/seo/JsonLd"
import prisma from"@/lib/prisma"

export const metadata: Metadata = {
 title:"Find Internships, Campus Gigs & Freelance Jobs | CampusConnectCo",
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
 canonical:"https://www.campusconnectco.in/",
 languages: {"en-IN":"https://www.campusconnectco.in/" },
 },
 openGraph: {
 title:"Find Internships, Campus Gigs & Freelance Jobs | CampusConnectCo",
 description:
"CampusConnectCo helps students discover internships, campus gigs, freelance jobs, and AI career roadmaps across India with verified employers and secure payments.",
 url:"https://www.campusconnectco.in/",
 type:"website",
 images: [{ url:"/logo-v2.jpg", width: 1200, height: 630, alt:"CampusConnectCo homepage" }],
 },
 twitter: {
 card:"summary_large_image",
 title:"Find Internships, Campus Gigs & Freelance Jobs | CampusConnectCo",
 description:
"CampusConnectCo helps students discover internships, campus gigs, freelance jobs, and AI career roadmaps across India with verified employers and secure payments.",
 images: ["/logo-v2.jpg"],
 site:"@campusconnectin",
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
      question: "How do I discover gigs and internships on CampusConnectCo?",
      answer: "You can browse verified campus gigs and remote startup internships directly through our live opportunity catalog and map discovery. Filter by city, required skills, or compensation."
    },
    {
      question: "How does milestone protection work on CampusConnectCo?",
      answer: "CampusConnectCo is architected around deliverable milestones to ensure expectations are clear before work begins. (Online payment gateway processing is temporarily paused for compliance integration; direct hiring, verified applications, and student portfolios are fully live.)"
    },
    {
      question: "How does the student academic email verification work?",
      answer: "Students with valid academic email domains (.edu, .edu.in, .res.in) receive an official verification badge, boosting credibility and search visibility for startup recruiters."
    },
    {
      question: "Can startups hire teams of students on CampusConnectCo?",
      answer: "Yes! Founders can post gigs or internships, review verified applicant profiles, and assemble student teams across engineering, design, and marketing."
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

        {/* 3. Hero */}
        <MasterHero />

        {/* 4. Live Opportunity Preview (Higher on homepage) */}
        <MasterLiveActivity opportunities={unifiedOpportunities} />

        {/* 5. Location / Map Discovery with Synchronized List */}
        <MasterMapSection opportunities={unifiedOpportunities} />

        {/* 6. Platform Stats */}
        <MasterStats 
          studentsCount={studentsCount} 
          opportunitiesCount={opportunitiesCount} 
          connectionsCount={connectionsCount} 
          foundersCount={foundersCount}
        />

        {/* 7. Trust & Safety (Truthful milestone & verified identity messaging) */}
        <MasterTrust />

        {/* 8. Student Value */}
        <MasterStudentValue />

        {/* 9. Smart Recommendations */}
        <MasterRecommendations />

        {/* 10. Founder & Recruiter Value */}
        <MasterFounderValue />

        {/* 11. How It Works */}
        <MasterHowItWorks />

        {/* 12. Core Features */}
        <MasterFeatures />

        {/* 13. Problem & Solution Context */}
        <MasterSolution />

        {/* 14. Final CTA */}
        <MasterFinalCTA />

        {/* 15. Footer */}
        <V2Footer />

      </main>
    </SmoothScroll>
  )
}
