import { ArrowRight, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

import { BreadcrumbSchema } from "@/components/seo/JsonLd";
import { RelatedContentClusters } from "@/components/seo/RelatedContentClusters";
import { ARTICLES, TOPIC_CLUSTERS } from "@/lib/content-engine/mock-cms";

interface Props {
  params: Promise<{ topic: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  const cluster = TOPIC_CLUSTERS.find((t) => t.slug === topic);
  
  if (!cluster) return {};

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campusconnectco.in";
  
  return {
    title: `${cluster.name} Hub: Internships, Careers, and Guides | CampusConnect`,
    description: cluster.description,
    alternates: {
      canonical: `${baseUrl}/topics/${topic}`,
    },
    openGraph: {
      title: `${cluster.name} Hub | CampusConnect`,
      description: cluster.description,
      url: `${baseUrl}/topics/${topic}`,
      type: "website",
      images: [{ url: "/logo-v2.jpg" }],
    }
  };
}

export async function generateStaticParams() {
  return TOPIC_CLUSTERS.map((t) => ({
    topic: t.slug,
  }));
}

export default async function TopicHubPage({ params }: Props) {
  const nonce = (await headers()).get("x-nonce") || undefined;
  const { topic } = await params;
  const cluster = TOPIC_CLUSTERS.find((t) => t.slug === topic);

  if (!cluster) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://campusconnectco.in";
  const breadcrumbItems = [
    { name: "Home", url: `${baseUrl}` },
    { name: "Topics", url: `${baseUrl}/topics` },
    { name: cluster.name, url: `${baseUrl}/topics/${topic}` }
  ];

  // Fetch related articles from CMS
  const clusterArticles = ARTICLES.filter(a => a.relatedTopics.includes(cluster.slug));

  return (
    <div className="min-h-screen bg-[#08080F] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>
      <BreadcrumbSchema items={breadcrumbItems} nonce={nonce} />
      
      {/* Background gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        <header className="text-center md:text-left space-y-4 border-b border-white/5 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/20 bg-violet-600/5 text-violet-400 text-xs font-black uppercase tracking-widest font-mono">
            <BookOpen size={12} /> {cluster.name} Topic Hub
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight font-heading">
            {cluster.name}
          </h1>
          <p className="text-slate-400 max-w-3xl text-lg md:text-xl leading-relaxed">
            {cluster.description}
          </p>
        </header>

        <section>
          <h2 className="text-2xl font-bold mb-8">Essential {cluster.name} Guides</h2>
          {clusterArticles.length === 0 ? (
            <p className="text-slate-400">Guides for this topic are currently being drafted by our editorial team.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clusterArticles.map(article => (
                <Link 
                  key={article.slug}
                  href={`/guides/${article.category}/${article.slug}`}
                  className="bg-[#111127]/60 border border-white/5 rounded-3xl p-6 hover:border-violet-500/30 transition-all flex flex-col justify-between h-full"
                >
                  <div className="space-y-3 mb-6">
                    <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">{article.category.replace("-", " ")}</span>
                    <h3 className="font-bold text-lg leading-snug">{article.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-3">{article.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 text-sm font-medium">
                    <span className="text-slate-500">{article.readingTimeMinutes} min read</span>
                    <span className="text-cyan-400 flex items-center gap-1">Read <ArrowRight size={14} /></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="pt-8 border-t border-white/5">
          <h2 className="text-2xl font-bold mb-8">Related Opportunities & Internships</h2>
          <RelatedContentClusters currentType="skill" currentSlug={cluster.associatedSkills[0] || 'software-engineering'} />
        </section>
      </div>
    </div>
  );
}
