import { ArrowRight, Building2, Globe, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

import { BreadcrumbsUI } from "@/components/seo/BreadcrumbsUI";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/JsonLd";
import { RelatedContentClusters } from "@/components/seo/RelatedContentClusters";
import prisma from "@/lib/prisma";
import { COMPANIES_DATASET } from "@/lib/pSEO-dataset";

interface Props {
  params: Promise<{ slug: string }>;
}

function getCompanyFromSlug(slug: string) {
  const decoded = decodeURIComponent(slug).toLowerCase();
  return COMPANIES_DATASET.find(
    (c) => c.slug === decoded || c.name.toLowerCase().replace(/\s+/g, "-") === decoded
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comp = getCompanyFromSlug(slug);
  const companyName = comp ? comp.name : decodeURIComponent(slug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campusconnectco.in";

  return {
    title: `${companyName} Student Internships, Campus Drives & Hiring | CampusConnect`,
    description: `Explore student internships, campus drive roles, and technical project positions at ${companyName}. View required tech stack, open opportunities, and verified student hires.`,
    alternates: {
      canonical: `${baseUrl}/companies/${encodeURIComponent(slug)}`,
    },
    openGraph: {
      title: `${companyName} Student Careers & Campus Internships`,
      description: `Apply to active internship openings and campus hiring programs at ${companyName}.`,
      url: `${baseUrl}/companies/${encodeURIComponent(slug)}`,
      type: "website",
      images: [{ url: "/logo-v2.jpg" }],
    },
  };
}

export async function generateStaticParams() {
  return COMPANIES_DATASET.map((c) => ({
    slug: c.slug,
  }));
}

export default async function CompanySEOPage({ params }: Props) {
  const nonce = (await headers()).get("x-nonce") || undefined;
  const { slug } = await params;
  const comp = getCompanyFromSlug(slug);

  if (!comp) {
    notFound();
  }

  // 1. Fetch internships matching company name
  const internships = await prisma.internship.findMany({
    where: {
      status: "OPEN",
      company: { contains: comp.name, mode: "insensitive" },
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch student candidates who match company's tech stack
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      OR: comp.techStack.map((tech) => ({
        skills: { contains: tech, mode: "insensitive" },
      })),
    },
    select: {
      id: true,
      name: true,
      full_name: true,
      username: true,
      college: true,
      branch: true,
      year: true,
      bio: true,
      isVerified: true,
    },
    take: 8,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campusconnectco.in";
  const breadcrumbItems = [
    { name: "Home", url: baseUrl },
    { name: "Companies", url: `${baseUrl}/companies` },
    { name: comp.name, url: `${baseUrl}/companies/${comp.slug}` },
  ];

  const faqs = [
    {
      question: `How do I apply for student internships at ${comp.name}?`,
      answer: `Students can apply directly on CampusConnect by building a verified profile, displaying technical skills in ${comp.techStack.slice(0, 3).join(", ")}, and submitting applications for active campus drives.`,
    },
    {
      question: `What tech stack does ${comp.name} use for engineering and product roles?`,
      answer: `${comp.name} utilizes ${comp.techStack.join(", ")} across their core engineering and product development teams.`,
    },
    {
      question: `Are internship hires at ${comp.name} verified on CampusConnect?`,
      answer: `Yes, recruiters at ${comp.name} verify student credentials, academic backgrounds, and project portfolios through CampusConnect's verified university domain infrastructure.`,
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#08080F] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
    >
      <BreadcrumbSchema items={breadcrumbItems} nonce={nonce} />
      <FAQSchema faqs={faqs} nonce={nonce} />

      {/* LLM Digest Section for AI Search Crawlers */}
      <div
        className="sr-only"
        data-ai-digest="true"
        data-ai-source-origin="CampusConnect"
        data-cc-entity="CompanyHub"
        data-cc-company={comp.name}
        aria-hidden="false"
      >
        <h2>Factual Digest: {comp.name} Company Overview & Campus Recruitment</h2>
        <ul>
          <li>Company Name: {comp.name}</li>
          <li>Industry Sector: {comp.industry}</li>
          <li>Corporate Headquarters: {comp.headquarters}</li>
          <li>Core Engineering Tech Stack: {comp.techStack.join(", ")}</li>
          <li>Active Campus Openings: {comp.openRolesCount}</li>
          <li>Verification Method: Verified Academic Domain Email Authentication</li>
        </ul>
      </div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        <BreadcrumbsUI items={breadcrumbItems} />

        {/* Header */}
        <div className="text-center md:text-left space-y-4 border-b border-white/5 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-600/5 text-cyan-400 text-xs font-black uppercase tracking-widest font-mono">
            <Building2 size={12} /> Verified Company Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight font-heading">
            Campus Hiring & Internships at <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">{comp.name}</span>
          </h1>
          <p className="text-slate-400 max-w-3xl text-base md:text-lg leading-relaxed">
            {comp.description} View core tech stack dependencies, open student roles, and match with verified university candidates.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Globe size={13} className="text-cyan-400" /> {comp.industry}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <MapPin size={13} className="text-violet-400" /> {comp.headquarters}
            </span>
          </div>

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Required Tech Stack:</span>
            {comp.techStack.map((tech) => (
              <Link
                key={tech}
                href={`/skills/${tech.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold hover:border-cyan-400 transition-colors"
              >
                {tech}
              </Link>
            ))}
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Company Opportunities */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2.5 mb-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Open Roles at {comp.name} ({internships.length})</h2>
            </div>

            {internships.length === 0 ? (
              <div className="bg-[#111127]/50 border border-white/5 rounded-3xl p-10 text-center space-y-4">
                <p className="text-slate-400">No active direct internship postings for {comp.name} listed on-site right now.</p>
                <p className="text-xs text-slate-500">Students with verified skills in {comp.techStack.slice(0, 3).join(", ")} are automatically surfaced to recruiters from {comp.name}.</p>
                <Link
                  href="/auth/sign-up"
                  className="inline-block px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm transition-all"
                >
                  Create Student Profile
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {internships.map((internship: any) => (
                  <div
                    key={internship.id}
                    className="bg-[#111127]/60 border border-white/5 rounded-3xl p-5 hover:border-cyan-500/20 transition-all flex flex-col justify-between h-52"
                  >
                    <div>
                      <h3 className="font-bold text-white text-base line-clamp-1">{internship.title}</h3>
                      <p className="text-xs text-slate-300 font-semibold mt-1">{comp.name}</p>
                      <p className="text-xs text-slate-400 line-clamp-2 my-2.5 leading-relaxed">{internship.description}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2">
                      <span className="font-mono text-cyan-400 font-bold text-sm">
                        {internship.stipend ? `₹${internship.stipend.toLocaleString("en-IN")}/mo` : "Competitive Stipend"}
                      </span>
                      <Link
                        href={`/dashboard/student/internships/${internship.id}`}
                        className="inline-flex items-center gap-1 text-xs text-slate-200 hover:text-white font-black uppercase tracking-wider"
                      >
                        Apply <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Matched Candidate Talent */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2.5 mb-2">
              <Users className="w-5 h-5 text-violet-400" />
              <h2 className="text-xl font-bold text-white">Candidates for {comp.name} Stack</h2>
            </div>

            {students.length === 0 ? (
              <div className="bg-[#111127]/50 border border-white/5 rounded-3xl p-8 text-center space-y-4">
                <p className="text-slate-400 text-xs">No matching candidate profiles found.</p>
                <Link
                  href="/auth/sign-up"
                  className="inline-block px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-all"
                >
                  Join as Student
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student: any) => {
                  const avatarLetter = (student.full_name || student.name || "?").charAt(0).toUpperCase();
                  return (
                    <div key={student.id} className="bg-[#111127]/80 border border-white/5 rounded-2xl p-4 space-y-3 hover:border-violet-500/20 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-500 to-violet-600 flex items-center justify-center font-black text-xs text-white">
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
                        <span className="text-slate-500">{student.branch || "Tech Stack Matched"}</span>
                        <Link href={`/profile/${student.username || student.id}`} className="inline-flex items-center gap-0.5 text-violet-400 hover:text-violet-300 font-bold">
                          View Profile <ArrowRight size={10} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-gradient-to-br from-cyan-600/10 to-violet-500/5 border border-cyan-500/10 rounded-3xl p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldCheck size={16} />
                <h4 className="font-black uppercase tracking-wider text-xs">Verified Recruiter Access</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Recruiters at {comp.name} can instantly issue skill-matched campus gigs and milestone contracts with zero platform friction.
              </p>
            </div>
          </div>
        </div>

        {/* Cross-Linking Clusters */}
        <RelatedContentClusters currentType="company" currentSlug={comp.slug} />
      </div>
    </div>
  );
}
