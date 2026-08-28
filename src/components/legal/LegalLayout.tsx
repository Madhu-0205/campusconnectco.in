"use client";

import { motion } from"framer-motion";
import { ChevronLeft } from"lucide-react";
import Link from"next/link";
import { useEffect, useState } from"react";

interface Section {
 id: string;
 title: string;
}

interface LegalLayoutProps {
 title: string;
 lastUpdated: string;
 sections: Section[];
 children: React.ReactNode;
}

export default function LegalLayout({ title, lastUpdated, sections, children }: LegalLayoutProps) {
 const [activeSection, setActiveSection] = useState<string>(sections[0]?.id ||"");

 useEffect(() => {
 const observer = new IntersectionObserver(
 (entries) => {
 // Find the first entry that is intersecting
 const intersectingEntry = entries.find((entry) => entry.isIntersecting);
 if (intersectingEntry) {
 setActiveSection(intersectingEntry.target.id);
 }
 },
 {
 rootMargin:"-20% 0px -80% 0px", // Trigger when section hits the top 20% of the screen
 }
 );

 sections.forEach(({ id }) => {
 const element = document.getElementById(id);
 if (element) observer.observe(element);
 });

 return () => observer.disconnect();
 }, [sections]);

 const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
 e.preventDefault();
 const element = document.getElementById(id);
 if (element) {
 const offset = 100; // Header offset
 const bodyRect = document.body.getBoundingClientRect().top;
 const elementRect = element.getBoundingClientRect().top;
 const elementPosition = elementRect - bodyRect;
 const offsetPosition = elementPosition - offset;

 window.scrollTo({
 top: offsetPosition,
 behavior:"smooth"
 });
 }
 };

 return (
 <div className="min-h-screen bg-background" style={{ fontFamily:"var(--font-body, 'DM Sans', sans-serif)" }}>
 {/* Hero Section */}
 <div className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden border-b border-(--border) bg-(--surface-2)">
 <div className="absolute inset-0 bg-size-[48px_48px] opacity-30" />
 <div className="absolute top-0 right-1/4 w-100 h-100 bg-(--primary)/10 blur-[100px] rounded-full pointer-events-none" />
 
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
 <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-6 font-medium">
 <ChevronLeft size={18} /> Back to Home
 </Link>
 <motion.h1 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight"
 style={{ fontFamily:"var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}
 >
 {title}
 </motion.h1>
 <motion.p 
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.1 }}
 className="text-muted-foreground text-lg"
 >
 Last Updated: <span className="font-bold text-white">{lastUpdated}</span>
 </motion.p>
 </div>
 </div>

 {/* Main Content Area */}
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
 <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
 
 {/* Sidebar / Table of Contents */}
 <div className="lg:w-64 shrink-0">
 <div className="sticky top-28 bg-(--surface) border border-(--border) rounded-2xl p-6 hidden lg:block shadow-sm">
 <h3 className="font-black text-white mb-4 uppercase tracking-widest text-xs">Table of Contents</h3>
 <nav className="flex flex-col gap-3">
 {sections.map((section) => (
 <a
 key={section.id}
 href={`#${section.id}`}
 onClick={(e) => scrollToSection(e, section.id)}
 className={`text-sm font-medium transition-all duration-200 ${
 activeSection === section.id 
 ?"text-(--primary-light) translate-x-2" 
 :"text-muted-foreground hover:text-white"
 }`}
 >
 {section.title}
 </a>
 ))}
 </nav>
 </div>
 
 {/* Mobile TOC */}
 <div className="lg:hidden bg-(--surface-2) border border-(--border) rounded-2xl p-6">
 <h3 className="font-black text-white mb-4 uppercase tracking-widest text-xs">Table of Contents</h3>
 <nav className="flex flex-col gap-3">
 {sections.map((section) => (
 <a
 key={section.id}
 href={`#${section.id}`}
 onClick={(e) => scrollToSection(e, section.id)}
 className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
 >
 {section.title}
 </a>
 ))}
 </nav>
 </div>
 </div>

 {/* Legal Content */}
 <div className="prose prose-invert prose-lg max-w-3xl w-full text-slate-300 [&>h2]:text-white [&>h2]:font-bold [&>h2]:mt-16 [&>h2]:mb-6 [&>h3]:text-white [&>h3]:font-bold [&>p]:leading-relaxed [&>ul]:leading-relaxed [&>ul>li]:marker:text-(--primary) [&>a]:text-(--primary-light) hover:[&>a]:text-white [&>a]:transition-colors" style={{ fontFamily:"var(--font-body, 'DM Sans', sans-serif)" }}>
 {children}
 </div>
 </div>
 </div>
 </div>
 );
}
