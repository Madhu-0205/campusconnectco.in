import { ArrowRight, CheckCircle2, Compass, DollarSign, Wrench } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

import { BreadcrumbsUI } from "@/components/seo/BreadcrumbsUI";
import { BreadcrumbSchema, FAQSchema } from "@/components/seo/JsonLd";
import { RelatedContentClusters } from "@/components/seo/RelatedContentClusters";
import prisma from "@/lib/prisma";
import { CAREER_PATHS } from "@/lib/pSEO-dataset";

interface Props {
  params: Promise<{ slug: string }>;
}

function getCareerFromSlug(slug: string) {
  const decoded = decodeURIComponent(slug).toLowerCase();
  return CAREER_PATHS.find(
    (c) => c.slug === decoded || c.title.toLowerCase().replace(/\s+/g, "-") === decoded
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const career = getCareerFromSlug(slug);
  const careerTitle = career ? career.title : decodeURIComponent(slug);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campusconnectco.in";

  return {
    title: `How to Become a ${careerTitle}: Student Career Roadmap & Internships | CampusConnect`,
    description: `Complete step-by-step roadmap for college students to become a ${careerTitle}. Explore required skills, average salary expectations (${career?.salaryRange || ""}), and active student internships.`,
    alternates: {
      canonical: `${baseUrl}/careers/${encodeURIComponent(slug)}`,
    },
    openGraph: {
      title: `${careerTitle} Student Roadmap & Internship Preparation Guide`,
      description: `Step-by-step learning path, essential technical skills, and internship matching for aspiring ${careerTitle}s.`,
      url: `${baseUrl}/careers/${encodeURIComponent(slug)}`,
      type: "website",
      images: [{ url: "/logo-v2.jpg" }],
    },
  };
}

export async function generateStaticParams() {
  return CAREER_PATHS.map((c) => ({
    slug: c.slug,
  }));
}

export default async function CareerPathSEOPage({ params }: Props) {
  const nonce = (await headers()).get("x-nonce") || undefined;
  const { slug } = await params;
  const career = getCareerFromSlug(slug);

  if (!career) {
    notFound();
  }

  // 1. Fetch internships matching career title or skills
  const internships = await prisma.internship.findMany({
    where: {
      status: "OPEN",
      OR: [
        { title: { contains: career.title, mode: "insensitive" } },
        ...career.prerequisiteSkills.map((sk) => ({
          description: { contains: sk, mode: "insensitive" as const },
        })),
      ],
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campusconnectco.in";
  const breadcrumbItems = [
    { name: "Home", url: baseUrl },
    { name: "Careers", url: `${baseUrl}/careers` },
    { name: career.title, url: `${baseUrl}/careers/${career.slug}` },
  ];

  const faqs = [
    {
      question: `What skills do I need to become a ${career.title} as a student?`,
      answer: `To build a career as a ${career.title}, college students should master ${career.prerequisiteSkills.join(", ")} and build verifiable project portfolios.`,
    },
    {
      question: `What is the expected salary range for a ${career.title} in India?`,
      answer: `The typical salary range for a ${career.title} in India ranges between ${career.salaryRange}, depending on experience, skill competency, and company scale.`,
    },
    {
      question: `How does CampusConnect help students become a ${career.title}?`,
      answer: `CampusConnect offers AI career roadmaps, matches students with skill-specific campus gigs, and connects candidates to verified startup internships.`,
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
        data-cc-entity="CareerRoadmap"
        data-cc-career={career.title}
        aria-hidden="false"
      >
        <h2>Factual Digest: {career.title} Student Career Roadmap & Prerequisites</h2>
        <ul>
          <li>Target Role Title: {career.title}</li>
          <li>Category Classification: {career.category}</li>
          <li>Expected Entry/Mid Salary Range: {career.salaryRange}</li>
          <li>Prerequisite Technical Skills: {career.prerequisiteSkills.join(", ")}</li>
          <li>Recommended Learning Phases: {career.recommendedRoadmap.join(" -> ")}</li>
          <li>Current Opportunity Listings Count: {internships.length}</li>
        </ul>
      </div>

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        <BreadcrumbsUI items={breadcrumbItems} />

        {/* Header */}
        <div className="text-center md:text-left space-y-4 border-b border-white/5 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-600/5 text-amber-400 text-xs font-black uppercase tracking-widest font-mono">
            <Compass size={12} /> AI Career Roadmap
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight font-heading">
            How to Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-violet-400">{career.title}</span>
          </h1>
          <p className="text-slate-400 max-w-3xl text-base md:text-lg leading-relaxed">
            {career.description} Follow our structured step-by-step student roadmap, acquire core technical skills, and land verified internships.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
            <span className="flex items-center gap-1.5 font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl">
              <DollarSign size={13} /> {career.salaryRange}
            </span>
          </div>

          {/* Prerequisite Skill Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Required Technical Skills:</span>
            {career.prerequisiteSkills.map((sk) => (
              <Link
                key={sk}
                href={`/skills/${sk.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold hover:border-amber-400 transition-colors"
              >
                {sk}
              </Link>
            ))}
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Step-by-Step Learning Roadmap */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2.5 mb-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Recommended Learning Roadmap</h2>
            </div>

            <div className="space-y-4">
              {career.recommendedRoadmap.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-[#111127]/60 border border-white/5 rounded-2xl p-5 hover:border-amber-500/20 transition-all flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-sm">{step}</h3>
                    <p className="text-xs text-slate-400">
                      Master key concepts through hands-on campus projects and verified portfolio demonstrations.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Relevant Internships */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2.5 mb-2">
              <Wrench className="w-5 h-5 text-violet-400" />
              <h2 className="text-xl font-bold text-white">{career.title} Internships</h2>
            </div>

            {internships.length === 0 ? (
              <div className="bg-[#111127]/50 border border-white/5 rounded-3xl p-8 text-center space-y-4">
                <p className="text-slate-400 text-xs">No active postings specifically for {career.title} currently listed.</p>
                <Link
                  href="/dashboard/student/internships"
                  className="inline-block px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-all"
                >
                  Explore All Roles
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {internships.map((internship: any) => (
                  <div
                    key={internship.id}
                    className="bg-[#111127]/80 border border-white/5 rounded-2xl p-4 space-y-3 hover:border-violet-500/20 transition-all"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-white line-clamp-1">{internship.title}</h3>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{internship.description}</p>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs">
                      <span className="font-mono text-amber-400 font-bold text-xs">
                        {internship.stipend ? `₹${internship.stipend.toLocaleString("en-IN")}/mo` : "Paid Stipend"}
                      </span>
                      <Link
                        href={`/dashboard/student/internships/${internship.id}`}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white font-bold"
                      >
                        Apply <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-gradient-to-br from-amber-600/10 to-violet-500/5 border border-amber-500/10 rounded-3xl p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400">
                <CheckCircle2 size={16} />
                <h4 className="font-black uppercase tracking-wider text-xs">AI Milestone Tracking</h4>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                As you complete campus gigs and internship milestones on CampusConnect, your career level automatically updates on your public brand profile.
              </p>
            </div>
          </div>
        </div>

        {/* Cross-Linking Clusters */}
        <RelatedContentClusters currentType="career" currentSlug={career.slug} />
      </div>
    </div>
  );
}
