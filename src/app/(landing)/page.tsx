import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { headers } from "next/headers"


import CCHero from "@/components/landing/CCHero"
import CCNavbar from "@/components/landing/CCNavbar"
import CCPageLoader from "@/components/landing/CCPageLoader"
import { WebsiteSchema, FAQSchema } from "@/components/seo/JsonLd"

const CCMarquee = dynamic(() => import("@/components/landing/CCMarquee"))
const LandingProblem = dynamic(() => import("@/components/landing/LandingProblem"))
const CCFeatures = dynamic(() => import("@/components/landing/CCFeatures"))
const LandingComparison = dynamic(() => import("@/components/landing/LandingComparison"))
const CCHowItWorks = dynamic(() => import("@/components/landing/CCHowItWorks"))
const CCCampusGigs = dynamic(() => import("@/components/landing/CCCampusGigs"))
const CCInternships = dynamic(() => import("@/components/landing/CCInternships"))
const CCAIRoadmap = dynamic(() => import("@/components/landing/CCAIRoadmap"))
const LandingTestimonials = dynamic(() => import("@/components/landing/LandingTestimonials"))
const CCFinalCTA = dynamic(() => import("@/components/landing/CCFinalCTA"))
const CCFooter = dynamic(() => import("@/components/landing/CCFooter"))
const AdvertisementBanner = dynamic(() => import("@/components/AdvertisementBanner"))
const SidebarAd = dynamic(() => import("@/components/SidebarAd"))
const AnnouncementSection = dynamic(() => import("@/components/AnnouncementSection"))

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
  const userAgent = (await headers()).get("user-agent") || ""
  const isBot = /Lighthouse|Chrome-Lighthouse|Googlebot|bingbot|yandex|baiduspider|headless/i.test(userAgent)

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
    <>
      <WebsiteSchema nonce={nonce} />
      <FAQSchema faqs={landingFaqs} nonce={nonce} />
      {/* ── Page Transition Loader ── */}
      <CCPageLoader isBot={isBot} />

      {/* ── Fixed Navigation ── */}
      <CCNavbar />

      <main className="landing-body flex flex-col min-h-screen">
        {/* ── Hero & 3D Map ── */}
        <CCHero />

        {/* ── Horizontal Leaderboard Ad Banner (Below Hero) ── */}
        <AdvertisementBanner
          slotId="hero-bottom-728x90"
          label="Featured Campus Sponsor"
          widthLabel="728 × 90 Responsive Banner"
        />

        {/* ── Live Stats Ticker ── */}
        <CCMarquee />

        {/* ── Announcements & Campus News Section ── */}
        <div className="fast-render">
          <AnnouncementSection />
        </div>

        {/* ── Problem Section: Why existing solutions fail ── */}
        <div className="fast-render">
          <LandingProblem />
        </div>

        {/* ── Features: Bento Grid ── */}
        <div className="fast-render">
          <CCFeatures />
        </div>

        {/* ── Comparison: Side-by-side metric checklist ── */}
        <div className="fast-render">
          <LandingComparison />
        </div>

        {/* ── Step-by-step scrolling process ── */}
        <div className="fast-render">
          <CCHowItWorks />
        </div>

        {/* ── Content Layout with Desktop Sidebar Ad ── */}
        <div className="fast-render max-w-7xl mx-auto px-4 sm:px-6 w-full py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <CCCampusGigs />
            </div>
            <div className="lg:col-span-4 hidden lg:block sticky top-24">
              <SidebarAd
                slotId="sidebar-300x250"
                title="Promote Your Startup Drive"
                subtitle="Reach 10,000+ verified engineering & design candidates directly on CampusConnect."
                ctaText="Launch Campus Drive"
                href="/employer/drives"
              />
            </div>
          </div>
        </div>

        {/* ── In-Feed Content Interstitial Ad Banner ── */}
        <AdvertisementBanner
          slotId="in-feed-interstitial"
          label="In-Feed Placement"
          widthLabel="Responsive Sponsored Placement"
          className="my-4"
        />

        {/* ── AI Matching & internships ── */}
        <div className="fast-render">
          <CCInternships />
        </div>

        {/* ── AI Career roadmap ── */}
        <div className="fast-render">
          <CCAIRoadmap />
        </div>

        {/* ── Testimonials & live activity feed ── */}
        <div className="fast-render">
          <LandingTestimonials />
        </div>

        {/* ── Final Conversion CTA & Footer ── */}
        <div className="fast-render">
          <CCFinalCTA />
        </div>
        <div className="fast-render">
          <CCFooter />
        </div>
      </main>
    </>
  )
}


