import { ArrowUpRight, Award, Briefcase, Building2, Compass, MapPin, Wrench } from"lucide-react";
import Link from"next/link";
import React from"react";

import { CAREER_PATHS, COMPANIES_DATASET, INTERNSHIP_CATEGORIES } from"@/lib/pSEO-dataset";

const TOP_CITIES = ["Bangalore","Pune","Mumbai","Delhi","Hyderabad","Chennai","Kolkata"];
const FEATURED_COLLEGES = [
 { name:"IIT Bombay", slug:"iit-bombay" },
 { name:"IIT Delhi", slug:"iit-delhi" },
 { name:"BITS Pilani", slug:"bits-pilani" },
 { name:"NIT Trichy", slug:"nit-trichy" },
 { name:"IIIT Hyderabad", slug:"iiit-hyderabad" },
 { name:"VIT Vellore", slug:"vit-vellore" },
 { name:"DTU Delhi", slug:"delhi-technological-university" },
];

const FEATURED_SKILLS = [
 { name:"React", slug:"react" },
 { name:"Python", slug:"python" },
 { name:"Figma", slug:"figma" },
 { name:"Node.js", slug:"nextjs" },
 { name:"SEO", slug:"image-optimization" },
 { name:"TypeScript", slug:"react-component-architecture" },
];

export function RelatedContentClusters({
 currentType,
 
}: {
 currentType:"category" |"company" |"college" |"skill" |"career" |"location";
 currentSlug?: string;
}) {
 return (
 <section className="mt-16 border-t border-white/10 pt-12 space-y-10" aria-label="Explore Related Student Opportunity Clusters">
 <div className="space-y-2">
 <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 font-heading">
 <Compass className="w-6 h-6 text-primary" />
 Explore Related Career Clusters & Directories
 </h2>
 <p className="text-slate-400 text-sm">
 Discover verified student internships, campus gigs, college networks, and career pathways across India.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {/* Category Clusters */}
 {currentType !=="category" && (
 <div className="bg-surface/60 border border-white/5 rounded-3xl p-5 space-y-3">
 <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider font-mono">
 <Briefcase size={14} /> Popular Internship Categories
 </h3>
 <div className="flex flex-wrap gap-2">
 {INTERNSHIP_CATEGORIES.map((cat) => (
 <Link
 key={cat.slug}
 href={`/internships/category/${cat.slug}`}
 className="px-3 py-1.5 bg-white/5 hover:bg-primary/20 border border-white/5 hover:border-primary/30 rounded-xl text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1"
 >
 <span>{cat.name}</span>
 <ArrowUpRight size={11} className="text-slate-500" />
 </Link>
 ))}
 </div>
 </div>
 )}

 {/* Company Clusters */}
 {currentType !=="company" && (
 <div className="bg-surface/60 border border-white/5 rounded-3xl p-5 space-y-3">
 <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
 <Building2 size={14} /> Top Hiring Companies
 </h3>
 <div className="flex flex-wrap gap-2">
 {COMPANIES_DATASET.map((comp) => (
 <Link
 key={comp.slug}
 href={`/companies/${comp.slug}`}
 className="px-3 py-1.5 bg-white/5 hover:bg-cyan-600/20 border border-white/5 hover:border-cyan-500/30 rounded-xl text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1"
 >
 <span>{comp.name}</span>
 <ArrowUpRight size={11} className="text-slate-500" />
 </Link>
 ))}
 </div>
 </div>
 )}

 {/* Career Path Clusters */}
 {currentType !=="career" && (
 <div className="bg-surface/60 border border-white/5 rounded-3xl p-5 space-y-3">
 <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
 <Compass size={14} /> AI Career Roadmaps
 </h3>
 <div className="flex flex-wrap gap-2">
 {CAREER_PATHS.map((career) => (
 <Link
 key={career.slug}
 href={`/careers/${career.slug}`}
 className="px-3 py-1.5 bg-white/5 hover:bg-amber-600/20 border border-white/5 hover:border-amber-500/30 rounded-xl text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1"
 >
 <span>{career.title}</span>
 <ArrowUpRight size={11} className="text-slate-500" />
 </Link>
 ))}
 </div>
 </div>
 )}

 {/* Location Clusters */}
 {currentType !=="location" && (
 <div className="bg-surface/60 border border-white/5 rounded-3xl p-5 space-y-3">
 <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
 <MapPin size={14} /> Major Tech Hubs
 </h3>
 <div className="flex flex-wrap gap-2">
 {TOP_CITIES.map((city) => (
 <Link
 key={city}
 href={`/internships/${city.toLowerCase()}`}
 className="px-3 py-1.5 bg-white/5 hover:bg-emerald-600/20 border border-white/5 hover:border-emerald-500/30 rounded-xl text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1"
 >
 <span>{city}</span>
 <ArrowUpRight size={11} className="text-slate-500" />
 </Link>
 ))}
 </div>
 </div>
 )}

 {/* College Hub Clusters */}
 {currentType !=="college" && (
 <div className="bg-surface/60 border border-white/5 rounded-3xl p-5 space-y-3">
 <h3 className="text-sm font-bold text-pink-400 flex items-center gap-1.5 uppercase tracking-wider font-mono">
 <Award size={14} /> Premier Campus Hubs
 </h3>
 <div className="flex flex-wrap gap-2">
 {FEATURED_COLLEGES.map((col) => (
 <Link
 key={col.slug}
 href={`/colleges/${col.slug}`}
 className="px-3 py-1.5 bg-white/5 hover:bg-pink-600/20 border border-white/5 hover:border-pink-500/30 rounded-xl text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1"
 >
 <span>{col.name}</span>
 <ArrowUpRight size={11} className="text-slate-500" />
 </Link>
 ))}
 </div>
 </div>
 )}

 {/* Skill Clusters */}
 {currentType !=="skill" && (
 <div className="bg-surface/60 border border-white/5 rounded-3xl p-5 space-y-3">
 <h3 className="text-sm font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider font-mono">
 <Wrench size={14} /> High-Demand Technical Skills
 </h3>
 <div className="flex flex-wrap gap-2">
 {FEATURED_SKILLS.map((sk) => (
 <Link
 key={sk.slug}
 href={`/skills/${sk.slug}`}
 className="px-3 py-1.5 bg-white/5 hover:bg-primary/20 border border-white/5 hover:border-primary/30 rounded-xl text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1"
 >
 <span>{sk.name}</span>
 <ArrowUpRight size={11} className="text-slate-500" />
 </Link>
 ))}
 </div>
 </div>
 )}
 </div>
 </section>
 );
}
