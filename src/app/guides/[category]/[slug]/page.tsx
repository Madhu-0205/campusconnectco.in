import type { Metadata } from"next";
import { headers } from"next/headers";
import { notFound } from"next/navigation";
import React from"react";

import { ArticleHeader } from"@/components/editorial/ArticleHeader";
import { TableOfContents } from"@/components/editorial/TableOfContents";
import { TrustBanner } from"@/components/editorial/TrustBanner";
import { BreadcrumbSchema, ArticleSchema } from"@/components/seo/JsonLd";
import { RelatedContentClusters } from"@/components/seo/RelatedContentClusters";
import { ARTICLES, AUTHORS } from"@/lib/content-engine/mock-cms";

interface Props {
 params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const { category, slug } = await params;
 const article = ARTICLES.find((a) => a.slug === slug && a.category === category);
 
 if (!article) return {};

 const author = AUTHORS[article.authorId];
 const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||"https://campusconnectco.in";
 
 return {
 title: `${article.title} | CampusConnect`,
 description: article.description,
 authors: [{ name: author.name }],
 alternates: {
 canonical: `${baseUrl}/guides/${category}/${slug}`,
 },
 openGraph: {
 title: article.title,
 description: article.description,
 url: `${baseUrl}/guides/${category}/${slug}`,
 type:"article",
 publishedTime: article.publishedAt,
 modifiedTime: article.updatedAt,
 authors: [author.name],
 images: [{ url:"/logo-v2.jpg" }],
 },
 twitter: {
 card:"summary_large_image",
 title: article.title,
 description: article.description,
 },
 };
}

export async function generateStaticParams() {
 return ARTICLES.map((a) => ({
 category: a.category,
 slug: a.slug,
 }));
}

export default async function GuideArticlePage({ params }: Props) {
 const nonce = (await headers()).get("x-nonce") || undefined;
 const { category, slug } = await params;
 const article = ARTICLES.find((a) => a.slug === slug && a.category === category);

 if (!article) {
 notFound();
 }

 const author = AUTHORS[article.authorId];
 const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||"https://campusconnectco.in";
 
 const breadcrumbItems = [
 { name:"Home", url: `${baseUrl}` },
 { name:"Guides", url: `${baseUrl}/editorial` },
 { name: category.replace("-",""), url: `${baseUrl}/guides/${category}` },
 { name: article.title, url: `${baseUrl}/guides/${category}/${slug}` }
 ];

 return (
 <div className="min-h-screen bg-[#08080F] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ fontFamily:"var(--font-body, 'DM Sans', sans-serif)" }}>
 <BreadcrumbSchema items={breadcrumbItems} nonce={nonce} />
 <ArticleSchema 
 title={article.title}
 description={article.description}
 authorName={author.name}
 publishedAt={article.publishedAt}
 updatedAt={article.updatedAt}
 images={["https://campusconnectco.in/logo-v2.jpg"]}
 nonce={nonce}
 />

 <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
 <div className="lg:col-span-8 space-y-8">
 <ArticleHeader 
 title={article.title}
 description={article.description}
 author={author}
 publishedAt={article.publishedAt}
 updatedAt={article.updatedAt}
 readingTimeMinutes={article.readingTimeMinutes}
 category={article.category}
 />

 <TrustBanner />

 {/* Simple Markdown rendering (In a real app, use react-markdown) */}
 <article className="prose prose-slate max-w-none mt-8">
 <div dangerouslySetInnerHTML={{ 
 __html: article.content
 .replace(/^## (.*$)/gim, '<h2 id="$1" class="text-2xl font-bold mt-10 mb-4">$1</h2>')
 .replace(/^### (.*$)/gim, '<h3 id="$1" class="text-xl font-bold mt-8 mb-3">$1</h3>')
 .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
 .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
 .replace(/^\\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
 .replace(/\\n/g, '<br/>') 
 }} />
 </article>

 {/* Connect back to the programmatic SEO entities */}
 <div className="mt-16 pt-8 border-t border-white/5">
 <h3 className="text-xl font-bold mb-6">Explore Associated Opportunities</h3>
 <RelatedContentClusters currentType="skill" currentSlug={article.relatedTopics[0] || 'software-engineering'} />
 </div>
 </div>

 <aside className="lg:col-span-4 space-y-8 hidden lg:block">
 <TableOfContents content={article.content} />
 </aside>
 </div>
 </div>
 );
}
