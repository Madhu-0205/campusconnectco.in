import React from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { MapPin, Briefcase, Users, ArrowRight, ShieldCheck, ExternalLink } from "lucide-react"
import { BreadcrumbSchema, FAQSchema, getWikidataURI } from "@/components/seo/JsonLd"
import { headers } from "next/headers"

interface Props {
  params: Promise<{ city: string }>
}

const TOP_CITIES = [
  "bangalore", "pune", "mumbai", "delhi", "hyderabad", "chennai", "kolkata"
]

function getCollegesForCity(city: string): string[] {
  const c = city.toLowerCase()
  if (c === "bangalore") return ["IIIT Bangalore", "PES University", "RV College of Engineering", "BMS College of Engineering", "PESIT"]
  if (c === "pune") return ["COEP", "MIT Pune", "Symbiosis", "Pune University", "COEP Pune"]
  if (c === "mumbai") return ["IIT Bombay", "Veermata Jijabai Technological Institute", "VJTI", "DJ Sanghvi", "NMIMS"]
  if (c === "delhi") return ["IIT Delhi", "Delhi Technological University", "NSUT Delhi", "IGDTUW", "DTU"]
  if (c === "chennai") return ["IIT Madras", "Anna University", "VIT Chennai", "SRM Chennai", "SSN College"]
  if (c === "hyderabad") return ["IIT Hyderabad", "IIIT Hyderabad", "BITS Hyderabad", "Osmania University"]
  return []
}

function capitalizeCity(city: string): string {
  const decoded = decodeURIComponent(city)
  return decoded.charAt(0).toUpperCase() + decoded.slice(1).toLowerCase()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const cityName = capitalizeCity(city)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://campusconnectco.in'

  return {
    title: `Best Campus Gigs & Student Freelance Work in ${cityName} | CampusConnect`,
    description: `Find top college student gigs, part-time jobs, and local startup projects in ${cityName}. Earn money, build your portfolio, and receive secure milestone payments via escrow.`,
    alternates: {
      canonical: `${baseUrl}/gigs/city/${city.toLowerCase()}`,
    },
    openGraph: {
      title: `Hire Vetted Student Developers & Designers in ${cityName}`,
      description: `Browse verified student developers, designers, and local campus gigs in ${cityName}, India.`,
      url: `${baseUrl}/gigs/city/${city.toLowerCase()}`,
      type: 'website',
      images: [{ url: "/logo-v2.jpg" }],
    }
  }
}

export async function generateStaticParams() {
  return TOP_CITIES.map(city => ({
    city
  }))
}

export default async function CityGigsPage({ params }: Props) {
  const nonce = (await headers()).get("x-nonce") || undefined
  const { city } = await params
  const decodedCity = decodeURIComponent(city).toLowerCase()
  const cityName = capitalizeCity(city)

  if (!decodedCity || decodedCity.length > 50) {
    notFound()
  }

  // 1. Fetch matching local gigs
  const gigs = await prisma.gig.findMany({
    where: {
      status: "OPEN",
      work_mode: { equals: decodedCity, mode: "insensitive" }
    },
    include: {
      poster: {
        select: {
          name: true,
          image: true,
        }
      }
    },
    take: 12,
    orderBy: { createdAt: "desc" }
  })

  // 2. Fetch matching local students via city name and college mappings
  const localColleges = getCollegesForCity(decodedCity)
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      OR: [
        { college: { contains: decodedCity, mode: 'insensitive' } },
        ...(localColleges.length > 0 ? [{ college: { in: localColleges } }] : [])
      ]
    },
    select: {
      id: true,
      name: true,
      full_name: true,
      username: true,
      image: true,
      avatar_url: true,
      college: true,
      branch: true,
      year: true,
      bio: true,
      isVerified: true,
    },
    take: 12,
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://campusconnectco.in'
  const breadcrumbItems = [
    { name: "Home", url: `${baseUrl}` },
    { name: "Gigs", url: `${baseUrl}/gigs/find` },
    { name: cityName, url: `${baseUrl}/gigs/city/${city}` }
  ]

  const averageBudget = gigs.length > 0
    ? Math.round(gigs.reduce((acc: number, curr: any) => acc + curr.budget, 0) / gigs.length)
    : 15000;

  const cityURI = getWikidataURI(decodedCity);
  const collegesList = getCollegesForCity(decodedCity);

  const faqs = [
    {
      question: `How do I find freelance campus gigs in ${cityName}?`,
      answer: `You can browse CampusConnect's local opportunities directory for ${cityName}, filter by your skills, and apply directly. All jobs offer milestone escrow security.`
    },
    {
      question: `Are local gigs in ${cityName} protected by payment security?`,
      answer: `Yes, all gigs on CampusConnect use platform-held milestone escrows, securing student payments before project development begins.`
    },
    {
      question: `Which colleges in ${cityName} have active students on CampusConnect?`,
      answer: `CampusConnect has a verified student pool from major regional colleges including ${collegesList.length > 0 ? collegesList.join(", ") : "various regional universities"}.`
    }
  ];

  return (
    <div className="min-h-screen bg-[#08080F] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>
      <BreadcrumbSchema items={breadcrumbItems} nonce={nonce} />
      <FAQSchema faqs={faqs} nonce={nonce} />

      {/* LLM Digest Section for RAG Crawling Engines */}
      <div 
        className="sr-only" 
        data-ai-digest="true" 
        data-ai-source-origin="CampusConnect"
        data-cc-entity="CityGigs"
        data-cc-city={decodedCity}
        aria-hidden="false"
      >
        <h2>Factual Digest: Campus Gigs & Local Opportunities in {cityName}</h2>
        <ul>
          <li>Target Location: {cityName}</li>
          {cityURI && <li>Entity Wikidata Reference: {cityURI}</li>}
          <li>Active Local Gigs Listed: {gigs.length}</li>
          <li>Verified Student Pool Size: {students.length}</li>
          <li>Expected Average Gig Budget: INR {averageBudget.toLocaleString("en-IN")}</li>
          <li>Affiliated Regional Colleges: {collegesList.join(", ")}</li>
        </ul>
      </div>

      {/* Background gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center md:text-left space-y-4 border-b border-white/5 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/20 bg-violet-600/5 text-violet-400 text-xs font-black uppercase tracking-widest font-mono">
            <MapPin size={12} /> Local Opportunities
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight font-heading">
            Student Gigs & Projects in <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">{cityName}</span>
          </h1>
          <p className="text-slate-400 max-w-3xl text-base md:text-lg leading-relaxed">
            Discover part-time coding gigs, design projects, and event roles posted by clients and startups located in {cityName}. Earn securely through milestone escrows.
          </p>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Local Gigs */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2.5 mb-2">
              <Briefcase className="w-5 h-5 text-violet-400" />
              <h2 className="text-xl font-bold text-white">Active Gigs in {cityName} ({gigs.length})</h2>
            </div>

            {gigs.length === 0 ? (
              <div className="bg-[#111127]/50 border border-white/5 rounded-3xl p-10 text-center space-y-4">
                <p className="text-slate-400">No active physical/local gigs posted in {cityName} currently.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/post-gig" className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-all">
                    Post a Gig in {cityName}
                  </Link>
                  <Link href="/gigs/find" className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-bold text-sm transition-all">
                    Browse Remote Gigs
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gigs.map((gig: any) => (
                  <div key={gig.id} className="bg-[#111127]/60 border border-white/5 rounded-3xl p-5 hover:border-violet-500/20 transition-all flex flex-col justify-between h-52">
                    <div>
                      <h3 className="font-bold text-white text-base line-clamp-1">{gig.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-3 my-2.5 leading-relaxed">{gig.description}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px] text-white">
                          {(gig.poster?.name || "R").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-slate-400 truncate max-w-[120px]">{gig.poster?.name || "Recruiter"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-violet-400 font-bold text-sm">₹{gig.budget.toLocaleString("en-IN")}</span>
                        <Link href={`/gigs/${gig.id}`} className="inline-flex items-center gap-1 text-xs text-slate-200 hover:text-white font-black uppercase tracking-wider">
                          Apply <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Local Candidates */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2.5 mb-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Student Experts in {cityName}</h2>
            </div>

            {students.length === 0 ? (
              <div className="bg-[#111127]/50 border border-white/5 rounded-3xl p-8 text-center space-y-4">
                <p className="text-slate-400 text-xs">No active students registered from colleges in {cityName} yet.</p>
                <Link href="/auth/sign-up" className="inline-block px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-all">
                  Join CampusConnect
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student: any) => {
                  const avatarLetter = (student.full_name || student.name || "?").charAt(0).toUpperCase();
                  return (
                    <div key={student.id} className="bg-[#111127]/80 border border-white/5 rounded-2xl p-4 space-y-3 hover:border-cyan-500/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-600 to-cyan-500 flex items-center justify-center font-black text-xs text-white">
                          {avatarLetter}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <h4 className="font-bold text-xs text-white truncate">{student.full_name || student.name}</h4>
                            {student.isVerified && <span className="text-amber-500 text-[10px]">★</span>}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">{student.college || "Student"}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-2 text-[10px]">
                        <span className="text-slate-500">{student.branch || "Tech Enthusiast"}</span>
                        <Link href={`/profile/${student.username || student.id}`} className="inline-flex items-center gap-0.5 text-cyan-400 hover:text-cyan-300 font-bold">
                          Portfolio <ExternalLink size={10} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Escrow Guarantee Box */}
            <div className="bg-gradient-to-br from-violet-600/10 to-cyan-500/5 border border-violet-500/10 rounded-3xl p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldCheck size={16} />
                <h4 className="font-black uppercase tracking-wider text-xs">Escrow Guarantee</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                CampusConnect protects local and remote student collaborations with a secure milestone escrow system. Funds are released only upon successful task verification.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
