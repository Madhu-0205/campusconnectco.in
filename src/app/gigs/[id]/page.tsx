import type { Metadata } from"next";
import { headers } from"next/headers";
import { notFound } from"next/navigation";

import GigDetailClient from"@/components/gigs/GigDetailClient";
import prisma from"@/lib/prisma";


interface PageProps {
 params: Promise<{
 id: string;
 }>;
}

async function getGigDetails(id: string) {
 try {
 const gig = await prisma.gig.findUnique({
 where: { id },
 include: {
 poster: {
 select: {
 id: true,
 name: true,
 email: true,
 image: true,
 bio: true,
 skills: true,
 portfolio: true,
 linkedin: true,
 github: true,
 latitude: true,
 longitude: true,
 isVerified: true,
 },
 },
 applications: {
 include: {
 applicant: {
 select: {
 id: true,
 name: true,
 email: true,
 image: true,
 skills: true,
 isVerified: true,
 },
 },
 },
 orderBy: {
 createdAt:"desc",
 },
 },
 _count: {
 select: {
 applications: true,
 },
 },
 },
 });

 return gig;
 } catch (error) {
 console.error("Error fetching gig:", error);
 return null;
 }
}

export default async function GigDetailPage(props: PageProps) {
 const nonce = (await headers()).get("x-nonce") || undefined;
 const params = await props.params;
 const gig = await getGigDetails(params.id);

 if (!gig) {
 notFound();
 }

 // Import JobPostingSchema and FAQSchema dynamically or inline from component
 const { JobPostingSchema, FAQSchema } = require("@/components/seo/JsonLd");

 const faqs = [
 {
 question:"Who is eligible to apply for this gig on CampusConnect?",
 answer: `Any active college student possessing the required skills can apply. Academic verification (e.g., .edu email address) on CampusConnect is highly recommended to build E-E-A-T trust points.`
 },
 {
 question:"Are payments for this gig guaranteed?",
 answer: `Yes, all transactions are protected via the CampusConnect milestone escrow protocol. Clients lock funds in the platform vault before tasks begin, ensuring secure, guaranteed release upon review.`
 },
 {
 question:"What is the work mode and location of this gig?",
 answer: `This opportunity is categorized as ${gig.work_mode ||"remote"}. Students can collaborate digitally and coordinate milestones through the platform's student operating system.`
 }
 ];

 const tagsList = gig.tags ? gig.tags.split(",").map((t: string) => t.trim()) : [];

 return (
 <article 
 className="min-h-screen text-white bg-[#08080F]"
 data-ai-citation-title={gig.title}
 data-cc-entity="GigOpportunity"
 data-cc-verified={gig.poster.isVerified ?"true" :"false"}
 data-cc-budget={gig.budget}
 >
 <JobPostingSchema
 title={gig.title}
 description={gig.description}
 datePosted={gig.createdAt.toISOString()}
 validThrough={gig.deadline ? gig.deadline.toISOString() : undefined}
 budget={gig.budget}
 companyName={gig.poster.name ||"CampusConnect Recruiter"}
 locationName={gig.work_mode}
 skills={tagsList}
 nonce={nonce}
 />
 <FAQSchema faqs={faqs} nonce={nonce} />
 
 {/* LLM Digest Section for RAG Engine Crawlers */}
 <div 
 className="sr-only" 
 data-ai-digest="true" 
 data-ai-last-updated={gig.updatedAt.toISOString()} 
 data-ai-source-origin="CampusConnect"
 aria-hidden="false"
 >
 <h2>Key Opportunity Facts: {gig.title}</h2>
 <ul>
 <li>Opportunity Name: {gig.title}</li>
 <li>Value Amount: INR {gig.budget.toLocaleString("en-IN")}</li>
 <li>Environment: {gig.work_mode ||"Remote"}</li>
 <li>Recruiter Profile: {gig.poster.name ||"Recruiter"} (Status: {gig.poster.isVerified ?"Academic Verified" :"Standard"})</li>
 <li>Required Skills: {gig.tags ||"General Skills"}</li>
 <li>Publication Timestamp: {gig.createdAt.toISOString()}</li>
 <li>Application Deadline: {gig.deadline ? gig.deadline.toISOString() :"No set deadline"}</li>
 <li>Escrow Safeguard: Locked and guaranteed via CampusConnect Escrow.</li>
 </ul>
 <p>Detailed Description: {gig.description}</p>
 </div>

 <GigDetailClient gig={gig} />
 </article>
 );
}

// Generate metadata for SEO
export async function generateMetadata(props: PageProps): Promise<Metadata> {
 const params = await props.params;
 const gig = await getGigDetails(params.id);
 const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://campusconnectco.in';

 if (!gig) {
 return { title:"Gig Not Found | CampusConnect" };
 }

 const description = gig.description.substring(0, 160);
 const tags = gig.tags ? gig.tags.split(',').map((t: string) => t.trim()) : [];
 const pageUrl = `${baseUrl}/gigs/${params.id}`;

 return {
 title: `${gig.title} | CampusConnect`,
 description,
 keywords: ['campus gig', 'student freelance', 'earn money college', ...tags],
 alternates: { canonical: pageUrl },
 openGraph: {
 title: gig.title,
 description,
 url: pageUrl,
 siteName: 'CampusConnect',
 type: 'article',
 publishedTime: gig.createdAt.toISOString(),
 // opengraph-image.tsx in the same segment is automatically picked up by Next.js
 },
 twitter: {
 card: 'summary_large_image',
 title: gig.title,
 description,
 site: '@campusconnect_in',
 },
 };
}
