import {
 FileText, Shield, CheckCircle, AlertCircle,
 BookOpen, Edit3, Eye, ArrowRight, Scale
} from"lucide-react"
import type { Metadata } from"next"
import Link from"next/link"

export const metadata: Metadata = {
 title:"Editorial Standards | CampusConnect — Our Content Principles",
 description:
"CampusConnect's editorial standards, fact-checking process, content review guidelines, and author policies. We are committed to accuracy, transparency, and fairness in all platform content.",
 alternates: { canonical:"https://campusconnectco.in/editorial" },
}

const STANDARDS = [
 {
 icon: CheckCircle,
 title:"Accuracy & Fact-Checking",
 color:"text-[#10B981]",
 bg:"bg-[#10B981]/10 border-[#10B981]/20",
 points: [
"All salary ranges and stipend data are sourced from verified student-reported outcomes",
"Industry statistics are cited with primary sources (NASSCOM, AICTE, LinkedIn, etc.)",
"Salary data is updated quarterly using aggregated platform data",
"No fabricated testimonials — all stories are from real, verified CampusConnect users",
 ],
 },
 {
 icon: Eye,
 title:"Transparency",
 color:"text-[#0EA5E9]",
 bg:"bg-[#0EA5E9]/10 border-[#0EA5E9]/20",
 points: [
"Sponsored content is always clearly labeled with 'Sponsored' or 'Partner'",
"Platform statistics (users, gigs posted, money earned) are audited monthly",
"We disclose conflicts of interest in any content mentioning affiliated companies",
"Our data methodology is available on request",
 ],
 },
 {
 icon: Scale,
 title:"Fairness & Balance",
 color:"text-[#1FA971]",
 bg:"bg-[#1FA971]/10 border-[#1FA971]/20",
 points: [
"Both positive and negative experiences are permitted in testimonials and reviews",
"Employer reviews are not filtered or suppressed — only removed for harassment",
"We do not remove negative student reviews unless they violate community guidelines",
"College tier rankings use objective public data (NIRF, QS India Rankings)",
 ],
 },
 {
 icon: Shield,
 title:"Student Protection in Content",
 color:"text-[#F59E0B]",
 bg:"bg-[#F59E0B]/10 border-[#F59E0B]/20",
 points: [
"We never publish real student salary data without explicit consent",
"Photos and quotes from minors require guardian consent",
"Success stories are reviewed by the named individual before publication",
"Students can request removal of their story at any time",
 ],
 },
]

const REVIEW_PROCESS = [
 { step:"01", title:"Content Submission", desc:"Blog posts, success stories, and employer profiles are submitted via internal CMS" },
 { step:"02", title:"Fact Verification", desc:"Data claims are verified against primary sources within 48 hours" },
 { step:"03", title:"Student/Employer Review", desc:"Any story featuring a named person is sent to them for approval before publishing" },
 { step:"04", title:"Editorial Review", desc:"CampusConnect editorial team reviews for tone, accuracy, and compliance with our standards" },
 { step:"05", title:"Publication", desc:"Content is published with author attribution, date, and last-reviewed date" },
 { step:"06", title:"Annual Audit", desc:"All evergreen content is reviewed annually for accuracy and updated as needed" },
]

const CORRECTIONS_POLICY = `If you find an inaccuracy, outdated information, or misrepresentation in any CampusConnect content, please contact us at editorial@campusconnectco.in. 

We commit to:
• Acknowledging your report within 24 hours
• Investigating all factual claims within 72 hours
• Publishing a correction if the report is substantiated
• Crediting the reporter if they wish to be named

We do not delete corrected content — we update it in place and note the correction transparently.`

import { headers } from"next/headers"

export default async function EditorialPage() {
 const nonce = (await headers()).get("x-nonce") || undefined;
 return (
 <div
 className="min-h-screen text-slate-100"
 style={{ background:"var(--color-background)", fontFamily:"var(--font-body, 'DM Sans', sans-serif)" }}
 >
 {/* JSON-LD */}
 <script
 type="application/ld+json"
 nonce={nonce}
 suppressHydrationWarning
 dangerouslySetInnerHTML={{
 __html: JSON.stringify({
"@context":"https://schema.org",
"@type":"WebPage",
"name":"Editorial Standards | CampusConnect",
"url":"https://campusconnectco.in/editorial",
"description":"CampusConnect's editorial standards, content policies, and fact-checking process.",
"publisher": {
"@type":"Organization",
"name":"CampusConnect",
"url":"https://campusconnectco.in",
 },
"dateModified":"2026-06-25",
 }),
 }}
 />

 {/* Ambient */}
 <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
 <div className="absolute top-1/3 right-1/4 w-72 h-72 blur-[130px] rounded-full" style={{ background:"rgba(31,169,113,0.06)" }} />
 </div>

 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">

 {/* HERO */}
 <div className="max-w-2xl">
 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1FA971]/15 border border-[#1FA971]/30 text-[#A78BFA] text-[11px] font-black uppercase tracking-widest mb-6">
 <BookOpen size={11} />
 Editorial Standards
 </div>
 <h1
 className="text-4xl font-black text-white mb-5 leading-tight"
 style={{ fontFamily:"var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}
 >
 How We Decide What<br />Gets Published
 </h1>
 <p className="text-slate-400 leading-relaxed">
 CampusConnect is a platform where students make real career decisions based on content we publish — salary guides, success stories, employer reviews, and skill advice. That responsibility demands clear editorial principles.
 </p>
 <p className="text-slate-500 text-sm mt-3">
 Last reviewed: <time dateTime="2024-06-01">June 2024</time> · Updated quarterly
 </p>
 </div>

 {/* STANDARDS */}
 <div>
 <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
 <FileText size={16} className="text-[#1FA971]" />
 Our Four Editorial Commitments
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {STANDARDS.map(({ icon: Icon, title, color, bg, points }) => (
 <div
 key={title}
 className="p-6 rounded-3xl"
 style={{ background:"var(--color-surface)", border:"1px solid var(--color-border)" }}
 >
 <div className="flex items-center gap-3 mb-4">
 <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${bg}`}>
 <Icon size={16} className={color} />
 </div>
 <h3 className="font-black text-white text-sm">{title}</h3>
 </div>
 <ul className="space-y-2">
 {points.map((p) => (
 <li key={p} className="flex items-start gap-2 text-xs text-slate-400">
 <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${color.replace("text-","bg-")}`} />
 {p}
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 </div>

 {/* REVIEW PROCESS */}
 <div>
 <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
 <Edit3 size={16} className="text-[#0EA5E9]" />
 Content Review Process
 </h2>
 <div className="relative space-y-4 pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
 {REVIEW_PROCESS.map(({ step, title, desc }) => (
 <div key={step} className="relative">
 <div className="absolute -left-8 top-1 w-6 h-6 rounded-full border border-[#1FA971]/40 bg-[#1FA971]/15 flex items-center justify-center">
 <span className="text-[9px] font-black text-[#A78BFA]">{step}</span>
 </div>
 <div
 className="p-4 rounded-xl"
 style={{ background:"var(--color-surface)", border:"1px solid var(--color-border)" }}
 >
 <p className="font-black text-white text-sm">{title}</p>
 <p className="text-xs text-slate-500 mt-1">{desc}</p>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* CORRECTIONS */}
 <div
 className="p-6 rounded-3xl"
 style={{ background:"var(--color-surface)", border:"1px solid rgba(245,158,11,0.2)" }}
 >
 <h2 className="font-black text-white text-lg mb-3 flex items-center gap-2">
 <AlertCircle size={16} className="text-[#F59E0B]" />
 Corrections Policy
 </h2>
 <pre className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap font-sans">
 {CORRECTIONS_POLICY}
 </pre>
 <a
 href="mailto:editorial@campusconnectco.in"
 className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-[#F59E0B] hover:text-white transition-colors"
 >
 <Edit3 size={13} />
 Report an inaccuracy
 </a>
 </div>

 {/* WHAT WE DON'T DO */}
 <div
 className="p-6 rounded-3xl"
 style={{ background:"var(--color-surface)", border:"1px solid var(--color-border)" }}
 >
 <h2 className="font-black text-white text-lg mb-4 flex items-center gap-2">
 <Shield size={16} className="text-[#EF4444]" />
 What We Will Never Do
 </h2>
 <ul className="space-y-2">
 {[
"Fabricate or pay for testimonials or reviews",
"Delete legitimate negative employer or student reviews",
"Publish salary or outcome data we cannot substantiate",
"Accept payment to alter search rankings or content visibility",
"Share student data with third parties for advertising",
"Suppress valid user complaints or disputes from platform records",
 ].map((item) => (
 <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
 <AlertCircle size={13} className="text-[#EF4444] shrink-0 mt-0.5" />
 {item}
 </li>
 ))}
 </ul>
 </div>

 {/* FOOTER LINKS */}
 <div className="flex items-center gap-4 flex-wrap text-sm">
 <Link href="/trust" className="text-[#A78BFA] hover:text-white transition-colors flex items-center gap-1">
 <Shield size={13} /> Trust & Safety <ArrowRight size={11} />
 </Link>
 <Link href="/privacy-policy" className="text-slate-500 hover:text-white transition-colors">
 Privacy Policy
 </Link>
 <Link href="/terms-and-conditions" className="text-slate-500 hover:text-white transition-colors">
 Terms of Service
 </Link>
 <span className="text-slate-600 text-xs">Questions? editorial@campusconnectco.in</span>
 </div>
 </div>
 </div>
 )
}
