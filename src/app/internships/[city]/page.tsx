import { MapPin, Briefcase, Users, ArrowRight, ShieldCheck, ExternalLink } from "lucide-react"
import type { Metadata } from "next"
import { unstable_cache } from "next/cache"
import { headers } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import React from "react"


import { BreadcrumbSchema, FAQSchema, getWikidataURI } from "@/components/seo/JsonLd"
import prisma from "@/lib/prisma"


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
    title: `Best Student Internships in ${cityName} | CampusConnect`,
    description: `Find top college student internships, remote projects, and startup opportunities in ${cityName}. Earn stipend, build your career roadmap, and match with mentors.`,
    alternates: {
      canonical: `${baseUrl}/internships/${city.toLowerCase()}`,
    },
    openGraph: {
      title: `Match Student Internships & Startup Placements in ${cityName}`,
      description: `Browse student internships, college credits placement, and verified candidate profiles in ${cityName}, India.`,
      url: `${baseUrl}/internships/${city.toLowerCase()}`,
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

export default async function CityInternshipsPage({ params }: Props) {
  const nonce = (await headers()).get("x-nonce") || undefined
  const { city } = await params
  const decodedCity = decodeURIComponent(city).toLowerCase()
  const cityName = capitalizeCity(city)

  if (!decodedCity || decodedCity.length > 50) {
    notFound()
  }

  // 1. Fetch matching local internships
  const getInternships = unstable_cache(
    async (decodedCity: string) => prisma.internship.findMany({
      where: {
        status: "OPEN",
        location: { equals: decodedCity, mode: "insensitive" }
      },
      take: 12,
      orderBy: { createdAt: "desc" }
    }),
    [`internships-city-${decodedCity}`],
    { revalidate: 3600 }
  )
  const internships = await getInternships(decodedCity)

  // 2. Fetch matching local students via city name and college mappings
  const localColleges = getCollegesForCity(decodedCity)
  const getStudents = unstable_cache(
    async (decodedCity: string, colleges: string[]) => prisma.user.findMany({
      where: {
        role: "STUDENT",
        OR: [
          { college: { contains: decodedCity, mode: 'insensitive' } },
          ...(colleges.length > 0 ? [{ college: { in: colleges } }] : [])
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
    }),
    [`internships-city-students-${decodedCity}`],
    { revalidate: 3600 }
  )
  const students = await getStudents(decodedCity, localColleges)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://campusconnectco.in'
  const breadcrumbItems = [
    { name: "Home", url: `${baseUrl}` },
    { name: "Internships", url: `${baseUrl}/dashboard/student/internships` },
    { name: cityName, url: `${baseUrl}/internships/${city}` }
  ]

  const paidInternships = internships.filter((i: any) => i.stipend && i.stipend > 0);
  const averageStipend = paidInternships.length > 0
    ? Math.round(paidInternships.reduce((acc: number, curr: any) => acc + (curr.stipend || 0), 0) / paidInternships.length)
    : 15000;

  const cityURI = getWikidataURI(decodedCity);
  const collegesList = getCollegesForCity(decodedCity);

  const faqs = [
    {
      question: `What is the average internship stipend in ${cityName} on CampusConnect?`,
      answer: `The average monthly stipend for student internships in ${cityName} is approximately INR ${averageStipend.toLocaleString("en-IN")}, based on active startup and tech project listings.`
    },
    {
      question: `Which local colleges in ${cityName} have active student networks on CampusConnect?`,
      answer: `CampusConnect features verified candidates from premier local colleges including ${collegesList.length > 0 ? collegesList.join(", ") : "various regional universities"}.`
    },
    {
      question: `How are student internship engagements verified and secured?`,
      answer: `All roles are listed by verified recruiters. Engagements can be backed by college credits tracking and dynamic milestone evaluations to ensure trust and safety.`
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
        data-cc-entity="CityInternships"
        data-cc-city={decodedCity}
        aria-hidden="false"
      >
        <h2>Factual Digest: Student Internships & Career Placement in {cityName}</h2>
        <ul>
          <li>Target Location: {cityName}</li>
          {cityURI && <li>Entity Wikidata Reference: {cityURI}</li>}
          <li>Active Local Placement Listings: {internships.length}</li>
          <li>Verified Student Pool Size: {students.length}</li>
          <li>Expected Average Monthly Stipend: INR {averageStipend.toLocaleString("en-IN")}</li>
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
            <MapPin size={12} /> University Placements
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight font-heading">
            Student Internships in <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-cyan-400">{cityName}</span>
          </h1>
          <p className="text-slate-400 max-w-3xl text-base md:text-lg leading-relaxed">
            Apply to verified internships and startup roles in {cityName}. Earn stipends, gain industry experience, and accelerate your dynamic career path.
          </p>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Local Internships */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2.5 mb-2">
              <Briefcase className="w-5 h-5 text-violet-400" />
              <h2 className="text-xl font-bold text-white">Active Internships in {cityName} ({internships.length})</h2>
            </div>

            {internships.length === 0 ? (
              <div className="bg-[#111127]/50 border border-white/5 rounded-3xl p-10 text-center space-y-4">
                <p className="text-slate-400">No active physical internships in {cityName} currently listed.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/dashboard" className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-all">
                    Go to Dashboard
                  </Link>
                  <Link href="/dashboard/student/internships" className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 font-bold text-sm transition-all">
                    Browse Remote Internships
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {internships.map((internship: any) => (
                  <div key={internship.id} className="bg-[#111127]/60 border border-white/5 rounded-3xl p-5 hover:border-violet-500/20 transition-all flex flex-col justify-between h-52">
                    <div>
                      <h3 className="font-bold text-white text-base line-clamp-1">{internship.title}</h3>
                      <p className="text-xs text-slate-300 font-semibold mt-1">{internship.company}</p>
                      <p className="text-xs text-slate-400 line-clamp-2 my-2.5 leading-relaxed">{internship.description}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{internship.duration || "3 Months"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-violet-400 font-bold text-sm">{internship.stipend ? `₹${internship.stipend.toLocaleString("en-IN")}/mo` : "Unpaid"}</span>
                        <Link href={`/dashboard/student/internships/${internship.id}`} className="inline-flex items-center gap-1 text-xs text-slate-200 hover:text-white font-black uppercase tracking-wider">
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
              <h2 className="text-xl font-bold text-white">Student Candidates in {cityName}</h2>
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

            {/* AI Career Box */}
            <div className="bg-gradient-to-br from-violet-600/10 to-cyan-500/5 border border-violet-500/10 rounded-3xl p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldCheck size={16} />
                <h4 className="font-black uppercase tracking-wider text-xs">AI SmartMatch</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                CampusConnect matches student profiles with local internships based on skills, academic history, and career copilot objectives dynamically.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
