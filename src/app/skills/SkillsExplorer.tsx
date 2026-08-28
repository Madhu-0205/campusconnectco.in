"use client";

import { useState, useMemo } from"react";

// ─── Dataset ────────────────────────────────────────────────────────────────

export interface Skill {
 id: string;
 name: string;
 category: string;
 icon: string;
 color: string;
 keywords: string[];
}

const SKILLS: Skill[] = [
 // Accessibility
 { id:"ux-001", name:"Color Contrast", category:"Accessibility", icon:"🎨", color:"#6366F1", keywords: ["wcag","contrast ratio","a11y","readable","4.5:1","accessibility"] },
 { id:"ux-002", name:"Focus States", category:"Accessibility", icon:"🔹", color:"#8B5CF6", keywords: ["focus-ring","keyboard","outline","tab-focus","focus-visible","accessibility"] },
 { id:"ux-003", name:"Alt Text", category:"Accessibility", icon:"🖼️", color:"#A78BFA", keywords: ["alt-text","screen-reader","image","aria","html","seo"] },
 { id:"ux-004", name:"ARIA Labels", category:"Accessibility", icon:"♿", color:"#1FA971", keywords: ["aria-label","icon-button","screen-reader","semantic-html","accessibility"] },
 { id:"ux-005", name:"Keyboard Navigation", category:"Accessibility", icon:"⌨️", color:"#5B21B6", keywords: ["keyboard-nav","tab-order","focus-trap","skip-links","interactive"] },
 { id:"ux-006", name:"Form Labels", category:"Accessibility", icon:"📋", color:"#6D28D9", keywords: ["form-labels","label","for-attribute","input","forms"] },

 // Touch & Interaction
 { id:"ux-007", name:"Touch Target Size", category:"Touch & Interaction", icon:"👆", color:"#EC4899", keywords: ["touch-target","44px","mobile","tap","button-size","interaction"] },
 { id:"ux-008", name:"Hover vs Tap", category:"Touch & Interaction", icon:"🖱️", color:"#DB2777", keywords: ["hover","tap","click","mobile-first","pointer-events"] },
 { id:"ux-009", name:"Loading Buttons", category:"Touch & Interaction", icon:"⏳", color:"#BE185D", keywords: ["loading","disabled","spinner","async","button-state","feedback"] },
 { id:"ux-010", name:"Error Feedback", category:"Touch & Interaction", icon:"⚠️", color:"#F43F5E", keywords: ["error","validation","toast","inline-error","form","user-feedback"] },
 { id:"ux-011", name:"Cursor Pointer", category:"Touch & Interaction", icon:"🖱️", color:"#E11D48", keywords: ["cursor-pointer","clickable","css-cursor","interactive","ui-hint"] },

 // Performance
 { id:"ux-012", name:"Image Optimization", category:"Performance", icon:"🚀", color:"#F59E0B", keywords: ["webp","srcset","lazy-loading","next-image","performance","lcp","core-web-vitals"] },
 { id:"ux-013", name:"Reduced Motion", category:"Performance", icon:"🎯", color:"#D97706", keywords: ["prefers-reduced-motion","animation","accessibility","vestibular","media-query"] },
 { id:"ux-014", name:"Content Layout Shift", category:"Performance", icon:"📐", color:"#B45309", keywords: ["cls","content-jumping","skeleton","image-size","core-web-vitals","layout-shift"] },

 // Layout & Responsive
 { id:"ux-015", name:"Viewport Meta", category:"Layout & Responsive", icon:"📱", color:"#10B981", keywords: ["viewport","device-width","meta-tag","responsive","mobile","initial-scale"] },
 { id:"ux-016", name:"Readable Font Size", category:"Layout & Responsive", icon:"📏", color:"#059669", keywords: ["font-size","16px","mobile","readability","typography","body-text"] },
 { id:"ux-017", name:"Horizontal Scroll Prevention", category:"Layout & Responsive", icon:"↔️", color:"#047857", keywords: ["overflow-x","horizontal-scroll","viewport","mobile-ux","flex"] },
 { id:"ux-018", name:"Z-Index Management", category:"Layout & Responsive", icon:"🃏", color:"#065F46", keywords: ["z-index","stacking-context","modal","overlay","dropdown","css-layers"] },
 { id:"ux-019", name:"CSS Grid & Flexbox", category:"Layout & Responsive", icon:"🔲", color:"#34D399", keywords: ["grid","flexbox","layout","responsive","css","alignment","columns"] },
 { id:"ux-020", name:"Responsive Breakpoints", category:"Layout & Responsive", icon:"📲", color:"#6EE7B7", keywords: ["breakpoints","sm","md","lg","xl","tailwind","responsive-design","media-queries"] },

 // Typography
 { id:"ux-021", name:"Line Height", category:"Typography", icon:"⬆️", color:"#3B82F6", keywords: ["line-height","leading","1.5","1.75","readability","typography"] },
 { id:"ux-022", name:"Line Length", category:"Typography", icon:"📏", color:"#2563EB", keywords: ["measure","65-75 chars","reading-width","column-width","prose","typography"] },
 { id:"ux-023", name:"Font Pairing", category:"Typography", icon:"🔤", color:"#1D4ED8", keywords: ["font-pairing","heading-font","body-font","serif","sans-serif","google-fonts"] },
 { id:"ux-024", name:"Type Scale", category:"Typography", icon:"🔡", color:"#1E40AF", keywords: ["type-scale","modular-scale","h1-h6","text-xs","text-sm","typographic-hierarchy"] },
 { id:"ux-025", name:"Font Weight & Style", category:"Typography", icon:"B", color:"#1E3A8A", keywords: ["font-weight","bold","semibold","italic","emphasis","visual-hierarchy"] },

 // Color
 { id:"ux-026", name:"Color System Design", category:"Color", icon:"🌈", color:"#F97316", keywords: ["color-system","palette","primary","secondary","neutral","semantic-colors","design-tokens"] },
 { id:"ux-027", name:"Dark Mode", category:"Color", icon:"🌙", color:"#EA580C", keywords: ["dark-mode","light-mode","color-scheme","next-themes","prefers-color-scheme","css-variables"] },
 { id:"ux-028", name:"Semantic Color Tokens", category:"Color", icon:"🏷️", color:"#C2410C", keywords: ["design-tokens","success","warning","error","info","css-variables"] },
 { id:"ux-029", name:"Color Blindness Support", category:"Color", icon:"👁️", color:"#9A3412", keywords: ["color-blindness","deuteranopia","protanopia","accessible-colors","a11y"] },

 // Animation
 { id:"ux-030", name:"Duration & Timing", category:"Animation", icon:"⚡", color:"#14B8A6", keywords: ["animation","150ms","300ms","easing","micro-interactions","transition-timing"] },
 { id:"ux-031", name:"Transform Performance", category:"Animation", icon:"🎞️", color:"#0D9488", keywords: ["transform","opacity","gpu","composited-layers","jank-free"] },
 { id:"ux-032", name:"Loading States & Skeletons", category:"Animation", icon:"💀", color:"#0F766E", keywords: ["skeleton","shimmer","spinner","placeholder","perceived-performance"] },
 { id:"ux-033", name:"Framer Motion", category:"Animation", icon:"🎭", color:"#134E4A", keywords: ["framer-motion","motion","animate","spring","variants","react"] },

 // UI Design
 { id:"ux-034", name:"Design System Creation", category:"UI Design", icon:"🧩", color:"#8B5CF6", keywords: ["design-system","component-library","tokens","storybook","figma"] },
 { id:"ux-035", name:"Style Matching", category:"UI Design", icon:"🎨", color:"#1FA971", keywords: ["style-match","product-type","saas","fintech","glassmorphism","neumorphism"] },
 { id:"ux-036", name:"Component Consistency", category:"UI Design", icon:"🔄", color:"#6D28D9", keywords: ["consistency","design-language","reusable-components","ui-kit","design-tokens"] },
 { id:"ux-037", name:"SVG Icon System", category:"UI Design", icon:"✏️", color:"#5B21B6", keywords: ["svg","icons","lucide","heroicons","icon-set","vector","scalable"] },

 // Charts & Data
 { id:"ux-038", name:"Chart Type Selection", category:"Charts & Data", icon:"📊", color:"#06B6D4", keywords: ["chart-type","bar","line","pie","scatter","recharts","d3"] },
 { id:"ux-039", name:"Accessible Chart Colors", category:"Charts & Data", icon:"🎰", color:"#0891B2", keywords: ["chart-colors","accessible-palette","colorblind-safe","data-viz","recharts"] },
 { id:"ux-040", name:"Data Table Accessibility", category:"Charts & Data", icon:"📋", color:"#0E7490", keywords: ["data-table","sortable","filterable","aria-table","accessibility","screen-reader"] },

 // Product Design
 { id:"ux-041", name:"Landing Page UX", category:"Product Design", icon:"🚀", color:"#F59E0B", keywords: ["landing-page","hero","cta","above-fold","conversion","marketing"] },
 { id:"ux-042", name:"Dashboard UX", category:"Product Design", icon:"📈", color:"#D97706", keywords: ["dashboard","kpi","widgets","analytics","layout","saas","admin-ui"] },
 { id:"ux-043", name:"Empty State Design", category:"Product Design", icon:"📭", color:"#B45309", keywords: ["empty-state","zero-state","onboarding","cta","illustration"] },
 { id:"ux-044", name:"Onboarding Flow", category:"Product Design", icon:"🎯", color:"#92400E", keywords: ["onboarding","walkthrough","tooltip","wizard","step-by-step","first-run"] },

 // Front-End Tech
 { id:"ux-045", name:"React Component Architecture", category:"Front-End Tech", icon:"⚛️", color:"#61DAFB", keywords: ["react","components","props","state","hooks","composition","reusable"] },
 { id:"ux-046", name:"Next.js App Router", category:"Front-End Tech", icon:"▲", color:"#6366F1", keywords: ["nextjs","app-router","server-components","rsc","layout","metadata","routing"] },
 { id:"ux-047", name:"Tailwind CSS", category:"Front-End Tech", icon:"🌬️", color:"#38BDF8", keywords: ["tailwind","utility-first","responsive","dark-mode","jit","css"] },
 { id:"ux-048", name:"shadcn/ui", category:"Front-End Tech", icon:"🧱", color:"#94A3B8", keywords: ["shadcn","radix-ui","component-library","accessible","headless-ui","tailwind"] },

 // UX Research
 { id:"ux-049", name:"Figma Prototyping", category:"UX Research", icon:"🎨", color:"#FF7262", keywords: ["figma","prototype","wireframe","mockup","design-handoff","auto-layout"] },
 { id:"ux-050", name:"User Research & Heuristics", category:"UX Research", icon:"🔬", color:"#A259FF", keywords: ["user-research","heuristics","usability-testing","personas","journey-map","ux-audit"] },
];

const ALL_CATEGORIES = ["All", ...Array.from(new Set(SKILLS.map((s) => s.category)))];

// ─── Category Color Map ────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { bg: string; border: string; text: string }> = {
 Accessibility: { bg:"#EDE9FE", border:"#1FA971", text:"#5B21B6" },
"Touch & Interaction": { bg:"#FCE7F3", border:"#DB2777", text:"#9D174D" },
 Performance: { bg:"#FEF3C7", border:"#D97706", text:"#92400E" },
"Layout & Responsive": { bg:"#D1FAE5", border:"#059669", text:"#065F46" },
 Typography: { bg:"#DBEAFE", border:"#2563EB", text:"#1E3A8A" },
 Color: { bg:"#FFEDD5", border:"#EA580C", text:"#7C2D12" },
 Animation: { bg:"#CCFBF1", border:"#0D9488", text:"#134E4A" },
"UI Design": { bg:"#EDE9FE", border:"#6D28D9", text:"#4C1D95" },
"Charts & Data": { bg:"#CFFAFE", border:"#0891B2", text:"#164E63" },
"Product Design": { bg:"#FEF9C3", border:"#CA8A04", text:"#713F12" },
"Front-End Tech": { bg:"#E0F2FE", border:"#0284C7", text:"#0C4A6E" },
"UX Research": { bg:"#F5F3FF", border:"#1FA971", text:"#4C1D95" },
};

// ─── Skill Card ─────────────────────────────────────────────────────────────

function SkillCard({ skill, copied, onCopy }: { skill: Skill; copied: boolean; onCopy: (id: string) => void }) {
 const meta = CATEGORY_META[skill.category];
 return (
 <div
 className="group relative flex flex-col gap-3 rounded-2xl border bg-[#111116] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default overflow-hidden"
 style={{ borderColor: skill.color +"55" }}
 >
 {/* Color bar top */}
 <div
 className="absolute inset-x-0 top-0 h-1 rounded-t-2xl transition-all duration-300 group-hover:h-1.5"
 style={{ background: skill.color }}
 />

 {/* Header row */}
 <div className="flex items-start justify-between gap-2 pt-1">
 <div className="flex items-center gap-3">
 {/* Icon bubble */}
 <span
 className="flex h-10 w-10 items-center justify-center rounded-xl text-xl shadow-sm shrink-0"
 style={{ background: skill.color +"22", border: `1.5px solid ${skill.color}44` }}
 >
 {skill.icon}
 </span>
 <div>
 <p className="font-semibold text-slate-800 leading-tight">{skill.name}</p>
 <span
 className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
 style={{
 background: meta?.bg ??"#F3F4F6",
 color: meta?.text ??"#374151",
 border: `1px solid ${meta?.border ??"#D1D5DB"}`,
 }}
 >
 {skill.category}
 </span>
 </div>
 </div>

 {/* Copy button */}
 <button
 onClick={() => onCopy(skill.id)}
 title="Copy skill ID"
 className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center h-7 w-7 rounded-lg bg-white/5 hover:bg-slate-200 :bg-slate-700 text-slate-500"
 >
 {copied ? (
 <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
 </svg>
 ) : (
 <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
 </svg>
 )}
 </button>
 </div>

 {/* Keywords */}
 <div className="flex flex-wrap gap-1.5">
 {skill.keywords.slice(0, 5).map((kw) => (
 <span
 key={kw}
 className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-slate-500"
 >
 {kw}
 </span>
 ))}
 {skill.keywords.length > 5 && (
 <span className="rounded-md bg-white/5 px-2 py-0.5 font-mono text-slate-400">
 +{skill.keywords.length - 5}
 </span>
 )}
 </div>

 {/* Skill ID */}
 <p className="mt-auto text-slate-400 font-mono">{skill.id}</p>
 </div>
 );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SkillsExplorer() {
 const [query, setQuery] = useState("");
 const [activeCategory, setActiveCategory] = useState("All");
 const [copiedId, setCopiedId] = useState<string | null>(null);

 const filtered = useMemo(() => {
 const q = query.toLowerCase();
 return SKILLS.filter((skill) => {
 const categoryMatch = activeCategory ==="All" || skill.category === activeCategory;
 const searchMatch =
 !q ||
 skill.name.toLowerCase().includes(q) ||
 skill.category.toLowerCase().includes(q) ||
 skill.keywords.some((kw) => kw.includes(q));
 return categoryMatch && searchMatch;
 });
 }, [query, activeCategory]);

 const handleCopy = (id: string) => {
 const skill = SKILLS.find((s) => s.id === id);
 if (skill) {
 navigator.clipboard.writeText(JSON.stringify(skill, null, 2));
 setCopiedId(id);
 setTimeout(() => setCopiedId(null), 1800);
 }
 };

 const categoryCounts = useMemo(() => {
 const counts: Record<string, number> = { All: SKILLS.length };
 SKILLS.forEach((s) => {
 counts[s.category] = (counts[s.category] ?? 0) + 1;
 });
 return counts;
 }, []);

 return (
 <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary-light/40 px-4 py-12">
 <div className="mx-auto max-w-7xl">

 {/* ── Header ── */}
 <div className="mb-10 text-center">
 <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-4 py-1.5 font-semibold text-primary uppercase tracking-widest">
 <span>⚡</span> UI/UX Pro Max
 </div>
 <h1 className="font-extrabold tracking-tight text-slate-900 sm:text-5xl">
 Skills Explorer
 </h1>
 <p className="mt-3 text-slate-500 max-w-xl mx-auto">
 50 curated UI/UX design and front-end engineering skills — searchable, filterable, and ready to copy as JSON.
 </p>
 <div className="mt-4 flex items-center justify-center gap-3 text-slate-500">
 <span className="flex items-center gap-1">
 <span className="h-2 w-2 rounded-full bg-green-400 inline-block animate-pulse" /> {SKILLS.length} Skills
 </span>
 <span className="text-slate-300">·</span>
 <span>{ALL_CATEGORIES.length - 1} Categories</span>
 </div>
 </div>

 {/* ── Search ── */}
 <div className="relative mb-6 mx-auto max-w-lg">
 <svg
 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
 >
 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z" />
 </svg>
 <input
 type="text"
 placeholder="Search skills, categories, or keywords…"
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 className="w-full rounded-xl border border-white/10 bg-[#111116] py-3 pl-11 pr-4 text-slate-800 shadow-sm placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
 />
 {query && (
 <button
 onClick={() => setQuery("")}
 className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-white/5 :bg-surface-3 text-slate-400"
 >
 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 )}
 </div>

 {/* ── Category Filters ── */}
 <div className="mb-8 flex flex-wrap gap-2 justify-center">
 {ALL_CATEGORIES.map((cat) => {
 const meta = CATEGORY_META[cat];
 const isActive = activeCategory === cat;
 return (
 <button
 key={cat}
 onClick={() => setActiveCategory(cat)}
 className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-semibold transition-all duration-200 border ${isActive ?"shadow-md scale-105" :"bg-[#111116] text-slate-500 border-white/10 hover:border-slate-300" }`}
 style={
 isActive
 ? {
 background: cat ==="All" ?"#6366F1" : meta?.bg,
 color: cat ==="All" ?"#fff" : meta?.text,
 borderColor: cat ==="All" ?"#4F46E5" : meta?.border,
 }
 : {}
 }
 >
 {cat}
 <span
 className={`rounded-full px-1.5 py-0.5 font-bold ${isActive ?"bg-white/25" :"bg-white/5 text-slate-500" }`}
 >
 {categoryCounts[cat] ?? 0}
 </span>
 </button>
 );
 })}
 </div>

 {/* ── Results count ── */}
 {query || activeCategory !=="All" ? (
 <p className="mb-5 text-center">
 Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of {SKILLS.length} skills
 </p>
 ) : null}

 {/* ── Grid ── */}
 {filtered.length > 0 ? (
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
 {filtered.map((skill) => (
 <SkillCard
 key={skill.id}
 skill={skill}
 copied={copiedId === skill.id}
 onCopy={handleCopy}
 />
 ))}
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
 <span className="text-5xl">🔍</span>
 <p className="font-medium text-lg">No skills match &ldquo;{query}&rdquo;</p>
 <p className="text-slate-400">Try a different keyword or category</p>
 <button
 onClick={() => { setQuery(""); setActiveCategory("All"); }}
 className="mt-2 rounded-xl bg-primary px-5 py-2 font-semibold text-white hover:bg-primary transition"
 >
 Clear filters
 </button>
 </div>
 )}

 {/* ── Footer ── */}
 <p className="mt-12 text-slate-400">
 Source: <span className="font-mono">skills.sh/sickn33/antigravity-awesome-skills/ui-ux-pro-max</span>
 &nbsp;·&nbsp; Hover a card and click the copy icon to get raw JSON
 </p>
 </div>
 </div>
 );
}
