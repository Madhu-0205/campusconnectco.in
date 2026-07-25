import { ArrowRight, Award, Briefcase, ExternalLink, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

import { BreadcrumbsUI } from "@/components/seo/BreadcrumbsUI";
import { BreadcrumbSchema, FAQSchema, getWikidataURI } from "@/components/seo/JsonLd";
import { RelatedContentClusters } from "@/components/seo/RelatedContentClusters";
import prisma from "@/lib/prisma";
import { INTERNSHIP_CATEGORIES } from "@/lib/pSEO-dataset";

interface Props {
  params: Promise<{ category: string }>;
}

function getCategoryFromSlug(slug: string) {
  const decoded = decodeURIComponent(slug).toLowerCase();
  return INTERNSHIP_CATEGORIES.find(
    (c) => c.slug === decoded || c.name.toLowerCase().replace(/\s+/g, "-") === decoded
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const cat = getCategoryFromSlug(categorySlug);
  const categoryName = cat ? cat.name : decodeURIComponent(categorySlug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campusconnectco.in";

  return {
    title: `Best ${categoryName} Student Internships & Startup Roles | CampusConnect`,
    description: `Find top verified ${categoryName} internships, remote student projects, and college jobs in India. Earn competitive stipends with milestone escrow security.`,
    alternates: {
      canonical: `${baseUrl}/internships/category/${encodeURIComponent(categorySlug)}`,
    },
    openGraph: {
      title: `Apply to ${categoryName} Internships for College Students`,
      description: `Verified ${categoryName} student opportunities, skill-matching, and milestone payments.`,
      url: `${baseUrl}/internships/category/${encodeURIComponent(categorySlug)}`,
      type: "website",
      images: [{ url: "/logo-v2.jpg" }],
    },
  };
}

export async function generateStaticParams() {
  return INTERNSHIP_CATEGORIES.map((c) => ({
    category: c.slug,
  }));
}

export default async function CategoryInternshipsPage({ params }: Props) {
  const nonce = (await headers()).get("x-nonce") || undefined;
  const { category: categorySlug } = await params;
  const cat = getCategoryFromSlug(categorySlug);

  if (!cat) {
    notFound();
  }

  // 1. Fetch matching internships by category tags or title
  const internships = await prisma.internship.findMany({
    where: {
      status: "OPEN",
      OR: [
        { tags: { contains: cat.name, mode: "insensitive" } },
        { title: { contains: cat.name, mode: "insensitive" } },
        { description: { contains: cat.name, mode: "insensitive" } },
      ],
    },
    take: 12,
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch matching students who possess relevant category skills
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      OR: cat.topSkills.map((sk) => ({
        skills: { contains: sk, mode: "insensitive" },
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
    take: 12,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campusconnectco.in";
  const breadcrumbItems = [
    { name: "Home", url: baseUrl },
    { name: "Internships", url: `${baseUrl}/internships` },
    { name: cat.name, url: `${baseUrl}/internships/category/${cat.slug}` },
  ];

  const categoryURI = getWikidataURI(cat.name);

  const faqs = [
    {
      question: `What is the average stipend for ${cat.name} internships on CampusConnect?`,
      answer: `The average monthly stipend for ${cat.name} internships is approximately INR ${cat.averageStipend.toLocaleString("en-IN")}, depending on candidate skill level, scope, and company stage.`,
    },
    {
      question: `What skills are required for ${cat.name} student roles?`,
      answer: `Top skills in demand for ${cat.name} include ${cat.topSkills.join(", ")}. Candidates can highlight verified portfolios on CampusConnect for faster matching.`,
    },
    {
      question: `How are student payments protected for ${cat.name} opportunities?`,
      answer: `All payments on CampusConnect are governed by milestone escrows. Funds are locked prior to start and released upon approved project deliverables.`,
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
        data-cc-entity="CategoryDirectory"
        data-cc-category={cat.name}
        aria-hidden="false"
      >
        <h2>Factual Digest: {cat.name} Student Opportunities & Market Benchmarks</h2>
        <ul>
          <li>Category Name: {cat.name}</li>
          {categoryURI && <li>Entity Wikidata Reference: {categoryURI}</li>}
          <li>Average Monthly Stipend Benchmark: INR {cat.averageStipend.toLocaleString("en-IN")}</li>
          <li>Top In-Demand Technical Skills: {cat.topSkills.join(", ")}</li>
          <li>Active Candidate Pool Count: {students.length}</li>
          <li>Current Open Opportunity Listings: {internships.length}</li>
          <li>Escrow Security: 100% Platform Escrow Guarantee</li>
        </ul>
      </div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        <BreadcrumbsUI items={breadcrumbItems} />

        {/* Header */}
        <div className="text-center md:text-left space-y-4 border-b border-white/5 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/20 bg-violet-600/5 text-violet-400 text-xs font-black uppercase tracking-widest font-mono">
            <Briefcase size={12} /> Category Directory
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight font-heading">
            {cat.name} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Internships & Campus Gigs</span>
          </h1>
          <p className="text-slate-400 max-w-3xl text-base md:text-lg leading-relaxed">
            {cat.description} Browse active roles, connect with top hiring startups, and apply with verified student profiles.
          </p>

          {/* Top Skills Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Top In-Demand Skills:</span>
            {cat.topSkills.map((sk) => (
              <Link
                key={sk}
                href={`/skills/${sk.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold hover:border-violet-400 transition-colors"
              >
                {sk}
              </Link>
            ))}
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Active Internships */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2.5 mb-2">
              <Briefcase className="w-5 h-5 text-violet-400" />
              <h2 className="text-xl font-bold text-white">Active {cat.name} Roles ({internships.length})</h2>
            </div>

            {internships.length === 0 ? (
              <div className="bg-[#111127]/50 border border-white/5 rounded-3xl p-10 text-center space-y-4">
                <p className="text-slate-400">No active {cat.name} internships listed at this moment.</p>
                <Link
                  href="/dashboard/student/internships"
                  className="inline-block px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-all"
                >
                  Browse All Internships
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {internships.map((internship: any) => (
                  <div
                    key={internship.id}
                    className="bg-[#111127]/60 border border-white/5 rounded-3xl p-5 hover:border-violet-500/20 transition-all flex flex-col justify-between h-52"
                  >
                    <div>
                      <h3 className="font-bold text-white text-base line-clamp-1">{internship.title}</h3>
                      <p className="text-xs text-slate-300 font-semibold mt-1">{internship.company}</p>
                      <p className="text-xs text-slate-400 line-clamp-2 my-2.5 leading-relaxed">{internship.description}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2">
                      <span className="font-mono text-violet-400 font-bold text-sm">
                        {internship.stipend ? `₹${internship.stipend.toLocaleString("en-IN")}/mo` : `₹${cat.averageStipend.toLocaleString("en-IN")}/mo est.`}
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

          {/* Right Column: Featured Student Candidates */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2.5 mb-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">{cat.name} Candidates</h2>
            </div>

            {students.length === 0 ? (
              <div className="bg-[#111127]/50 border border-white/5 rounded-3xl p-8 text-center space-y-4">
                <p className="text-slate-400 text-xs">No candidate profiles registered for {cat.name} yet.</p>
                <Link
                  href="/auth/sign-up"
                  className="inline-block px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs transition-all"
                >
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
                        <span className="text-slate-500">{student.branch || cat.name}</span>
                        <Link href={`/profile/${student.username || student.id}`} className="inline-flex items-center gap-0.5 text-cyan-400 hover:text-cyan-300 font-bold">
                          Portfolio <ExternalLink size={10} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Escrow Banner */}
            <div className="bg-gradient-to-br from-violet-600/10 to-cyan-500/5 border border-violet-500/10 rounded-3xl p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldCheck size={16} />
                <h4 className="font-black uppercase tracking-wider text-xs">Milestone Escrow</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                CampusConnect secures funds in milestone escrow prior to project initiation, ensuring full protection for both employers and student candidates.
              </p>
            </div>
          </div>
        </div>

        {/* Cross-Linking Clusters */}
        <RelatedContentClusters currentType="category" currentSlug={cat.slug} />
      </div>
    </div>
  );
}
