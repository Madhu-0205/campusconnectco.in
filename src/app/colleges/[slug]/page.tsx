import { Award, Briefcase, Users, ArrowRight, ShieldCheck, ExternalLink } from "lucide-react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import React from "react"

import { BreadcrumbSchema, FAQSchema, getWikidataURI } from "@/components/seo/JsonLd"
import prisma from "@/lib/prisma"


const COLLEGES = [
  "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
  "IIT Roorkee", "IIT Guwahati", "IIT Hyderabad", "IIT BHU", "IIT Patna",
  "NIT Trichy", "NIT Warangal", "NIT Surathkal", "NIT Calicut", "NIT Rourkela",
  "BITS Pilani", "BITS Goa", "BITS Hyderabad", "BITS Pilani (Pilani Campus)",
  "IIIT Hyderabad", "IIIT Bangalore", "IIIT Allahabad",
  "VIT Vellore", "VIT Chennai", "VIT Bhopal", "VIT-AP",
  "SRM Institute of Science and Technology", "Manipal Institute of Technology",
  "PSG College of Technology", "Amrita School of Engineering",
  "Jadavpur University", "Anna University", "Osmania University",
  "Delhi Technological University", "NSUT Delhi", "IGDTUW",
  "PES University", "RV College of Engineering", "BMS College of Engineering",
  "SASTRA University", "Vellore Institute of Technology", "Sri Sivasubramaniya Nadar College",
  "Karpagam Academy of Higher Education", "Kumaraguru College of Technology",
  "Thiagarajar College of Engineering", "Coimbatore Institute of Technology",
  "Birla Institute of Technology Mesra", "Thapar Institute of Engineering",
  "Chandigarh University", "LPU (Lovely Professional University)",
  "KIIT University", "Kalinga Institute of Industrial Technology"
]

function getCollegeFromSlug(slug: string): string {
  const decoded = decodeURIComponent(slug).toLowerCase().replace(/-/g, ' ')
  
  const match = COLLEGES.find(c => {
    const canonical = c.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim()
    const cleanSlug = decoded.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim()
    return canonical === cleanSlug || canonical.includes(cleanSlug) || cleanSlug.includes(canonical)
  })

  return match || decodeURIComponent(slug)
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const collegeName = getCollegeFromSlug(slug)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://campusconnectco.in'

  return {
    title: `Hire Vetted Students & Campus Freelancers from ${collegeName}`,
    description: `Find top student talent, developers, designers, and managers from ${collegeName}. Browse verified student profiles, check dynamic ratings, and start secure contracts.`,
    alternates: {
      canonical: `${baseUrl}/colleges/${encodeURIComponent(slug)}`,
    },
    openGraph: {
      title: `Vetted Campus Gigs & Tech Talents at ${collegeName}`,
      description: `Browse student portfolios, active local gigs, and verified technical records for students at ${collegeName}.`,
      url: `${baseUrl}/colleges/${encodeURIComponent(slug)}`,
      type: 'website',
      images: [{ url: "/logo-v2.jpg" }],
    }
  }
}

export async function generateStaticParams() {
  return COLLEGES.map(c => ({
    slug: c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }))
}

export default async function CollegeSEOPage({ params }: Props) {
  const nonce = (await headers()).get("x-nonce") || undefined
  const { slug } = await params
  const collegeName = getCollegeFromSlug(slug)

  if (!collegeName || collegeName.length > 80) {
    notFound()
  }

  // 1. Fetch matching students from database
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      college: {
        contains: collegeName,
        mode: "insensitive"
      }
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

  // 2. Fetch active gigs containing matching text
  const gigs = await prisma.gig.findMany({
    where: {
      status: "OPEN",
      OR: [
        { title: { contains: collegeName, mode: "insensitive" } },
        { description: { contains: collegeName, mode: "insensitive" } }
      ]
    },
    take: 10,
    orderBy: { createdAt: "desc" }
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://campusconnectco.in'
  const breadcrumbItems = [
    { name: "Home", url: `${baseUrl}` },
    { name: "Colleges", url: `${baseUrl}` },
    { name: collegeName, url: `${baseUrl}/colleges/${slug}` }
  ]

  const collegeURI = getWikidataURI(collegeName);

  const faqs = [
    {
      question: `How do I recruit students from ${collegeName} on CampusConnect?`,
      answer: `Employers and startups can post gigs specifically targeting ${collegeName} or search the vetted student directory, review design and development portfolios, and directly hire candidates.`
    },
    {
      question: `What roles do students from ${collegeName} specialize in on CampusConnect?`,
      answer: `Students from ${collegeName} are active across software engineering, UX/UI design, mobile development, content strategy, and data analysis roles.`
    },
    {
      question: `Are student freelancing payments on CampusConnect secure?`,
      answer: `Yes, all student engagements are backed by platform milestone escrows, ensuring that payments are locked before work starts and only released after approval.`
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
        data-cc-entity="CollegeHub"
        data-cc-college={collegeName}
        aria-hidden="false"
      >
        <h2>Factual Digest: Vetted Students & Campus Careers at {collegeName}</h2>
        <ul>
          <li>Institution Name: {collegeName}</li>
          {collegeURI && <li>Entity Wikidata Reference: {collegeURI}</li>}
          <li>Verified Active Student Profiles: {students.length}</li>
          <li>Opportunities Listed: {gigs.length}</li>
          <li>Security Protocol: Milestone Escrow Guaranteed</li>
        </ul>
      </div>

      {/* Background gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center md:text-left space-y-4 border-b border-white/5 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/20 bg-violet-600/5 text-violet-400 text-xs font-black uppercase tracking-widest font-mono">
            <Award size={12} /> Hyperlocal Campus Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight font-heading">
            Hire Top Talents from <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">{collegeName}</span>
          </h1>
          <p className="text-slate-400 max-w-3xl text-base md:text-lg leading-relaxed">
            Browse verified students, view code portfolios, and source freelance operators directly from the classrooms of {collegeName}. Zero brokerage and secure escrow support included.
          </p>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Vetted Students */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2.5 mb-2">
              <Users className="w-5 h-5 text-violet-400" />
              <h2 className="text-xl font-bold text-white">Vetted {collegeName} Students ({students.length})</h2>
            </div>

            {students.length === 0 ? (
              <div className="bg-[#111127]/50 border border-white/5 rounded-3xl p-10 text-center space-y-4">
                <p className="text-slate-400">No active students registered under {collegeName} yet.</p>
                <Link href="/auth/sign-up" className="inline-block px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-all">
                  Join as student
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students.map((student: any) => {
                  const avatarLetter = (student.full_name || student.name || "?").charAt(0).toUpperCase();
                  return (
                    <div key={student.id} className="bg-[#111127]/60 border border-white/5 rounded-3xl p-5 hover:border-violet-500/20 transition-all flex flex-col justify-between h-52">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-violet-600 to-cyan-500 flex items-center justify-center font-black text-lg text-white">
                          {avatarLetter}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-white text-sm truncate">{student.full_name || student.name}</h3>
                            {student.isVerified && <span className="text-amber-500 text-xs">★</span>}
                          </div>
                          <p className="text-xs text-slate-400 truncate">{student.college || "Independent Student"}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{student.branch || ""} · {student.year || ""}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 italic my-3">&quot;{student.bio || 'Passionate student developer honing skills on CampusConnect.'}&quot;</p>
                      <Link href={`/profile/${student.username || student.id}`} className="inline-flex items-center gap-1 text-xs text-violet-400 font-bold hover:text-violet-300">
                        View Brand Profile <ExternalLink size={12} />
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Side: Campus Gigs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2.5 mb-2">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Opportunities at {collegeName}</h2>
            </div>

            {gigs.length === 0 ? (
              <div className="bg-[#111127]/50 border border-white/5 rounded-3xl p-8 text-center space-y-4">
                <p className="text-slate-400 text-xs">No active opportunities currently scoped specifically for {collegeName}.</p>
                <Link href="/post-gig" className="inline-block px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-all">
                  Post a Gig
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {gigs.map((gig: any) => (
                  <div key={gig.id} className="bg-[#111127]/80 border border-white/5 rounded-2xl p-4 space-y-3 hover:border-cyan-500/20 transition-all">
                    <div>
                      <h3 className="font-bold text-sm text-white line-clamp-1">{gig.title}</h3>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{gig.description}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs">
                      <span className="font-mono text-cyan-400 font-bold">₹{gig.budget.toLocaleString("en-IN")}</span>
                      <Link href={`/gigs/${gig.id}`} className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white font-bold">
                        Apply <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Escrow Guarantee Box */}
            <div className="bg-gradient-to-br from-violet-600/10 to-cyan-500/5 border border-violet-500/10 rounded-3xl p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldCheck size={16} />
                <h4 className="font-black uppercase tracking-wider text-xs">Escrow Guarantee</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Funds are held securely in platform-controlled vaults and only released when the student submits milestone work and the employer signs off. Backed by dispute-resolution support.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
