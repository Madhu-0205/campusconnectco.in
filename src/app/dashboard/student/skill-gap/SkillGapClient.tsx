"use client";

import { motion, AnimatePresence } from"framer-motion";
import {
 Brain, Loader2, CheckCircle, AlertTriangle, BookOpen,
 ArrowRight, Target, Shield, Compass, ExternalLink
} from"lucide-react";
import Link from"next/link";
import { useState } from"react";
import { toast } from"sonner";

import { Badge } from"@/components/ui/Badge";
import { Button } from"@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from"@/components/ui/Card";
import { Input } from"@/components/ui/Input";


const PRESETS = [
"Full Stack Web Developer",
"AI / Machine Learning Engineer",
"Cloud & DevOps Specialist",
"iOS / Android Mobile Engineer",
"Blockchain Developer",
"Cybersecurity Analyst",
"Data Scientist & Analyst"
];

interface AnalysisResult {
 matchedSkills: string[];
 missingSkills: string[];
 learningPlan: string[];
}

export default function SkillGapPage() {
 const [targetRole, setTargetRole] = useState(PRESETS[0]);
 const [customRole, setCustomRole] = useState("");
 const [isAnalyzing, setIsAnalyzing] = useState(false);
 const [result, setResult] = useState<AnalysisResult | null>(null);

 const handleRunAnalysis = async () => {
 const finalRole = customRole.trim() ? customRole : targetRole;
 setIsAnalyzing(true);
 setResult(null);

 try {
 const response = await fetch("/api/ai/skill-gap", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ targetRole: finalRole })
 });

 const data = await response.json();
 if (!response.ok) throw new Error(data.error ||"Failed to calculate skill gap.");

 setResult(data.data);
 toast.success("Gap analysis complete! Review your learning path.");
 } catch (error: any) {
 toast.error(error.message ||"Failed to complete audit.");
 } finally {
 setIsAnalyzing(false);
 }
 };

 return (
 <div className="max-w-7xl mx-auto pb-32 p-4 md:p-8 min-h-screen text-slate-100 space-y-10">
 {/* Header section */}
 <div className="space-y-3">
 <div className="w-16 h-16 rounded-[24px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-2xl">
 <Target size={32} />
 </div>
 <h1 className="font-black text-white tracking-tighter leading-none">
 AI Skill Gap <span className="text-emerald-400">Analyzer</span>
 </h1>
 <p className="font-bold text-lg text-slate-400 max-w-2xl">
 Audit your capabilities against real-world tech requirements. Connect gaps dynamically to learning paths and local opportunities.
 </p>
 </div>

 {/* Split layout: Input details on left, presets/intro on right */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Audit trigger workspace */}
 <Card className="lg:col-span-2 border-white/10 bg-[#111116] p-8 md:p-10 rounded-[32px] shadow-2xl relative overflow-hidden flex flex-col justify-between">
 <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[60px] pointer-events-none" />
 
 <CardContent className="p-0 space-y-8">
 <div className="space-y-4">
 <label className="font-black uppercase tracking-widest text-slate-400 text-xs flex items-center gap-2">
 <Compass size={14} className="text-emerald-400" /> Predefined Career Tracks
 </label>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <select
 value={targetRole}
 onChange={(e) => { setTargetRole(e.target.value); setCustomRole(""); }}
 className="w-full h-14 px-4 bg-[#0a0a0f] border border-white/10 rounded-2xl text-white font-bold focus:border-emerald-500 focus:outline-none transition-colors"
 >
 {PRESETS.map(p => (
 <option key={p} value={p}>{p}</option>
 ))}
 </select>

 <Input
 placeholder="Or type custom track (e.g. QA Automator)"
 value={customRole}
 onChange={(e) => setCustomRole(e.target.value)}
 className="h-14 rounded-2xl border-white/10 font-bold bg-[#0a0a0f]"
 />
 </div>
 </div>

 <Button
 onClick={handleRunAnalysis}
 disabled={isAnalyzing}
 className="w-full bg-white hover:bg-slate-200 text-slate-950 font-black h-16 rounded-[20px] text-lg flex items-center justify-center gap-2 shadow-xl active:scale-98 transition-all"
 >
 {isAnalyzing ? (
 <><Loader2 className="animate-spin" /> Compiling Gap Audit...</>
 ) : (
 <><Brain size={18} /> Run AI Skill Gap Audit</>
 )}
 </Button>
 </CardContent>
 </Card>

 {/* Information Card */}
 <Card className="lg:col-span-1 border-white/10 bg-[#111116] p-8 rounded-[32px] flex flex-col justify-center shadow-xl">
 <h3 className="font-black text-white mb-4 flex items-center gap-2 text-base">
 <Shield size={16} className="text-emerald-400" /> Programmatic Links
 </h3>
 <p className="text-sm text-slate-400 leading-relaxed font-semibold mb-4">
 Any identified skills link directly to our sitemap-indexed directories. Click any skill tag in the results to browse:
 </p>
 <ul className="space-y-3 text-xs font-bold text-slate-500">
 <li className="flex gap-2 items-center"><ArrowRight size={12} className="text-emerald-400"/> Other students who have this skill</li>
 <li className="flex gap-2 items-center"><ArrowRight size={12} className="text-emerald-400"/> Active campus gigs requiring it</li>
 <li className="flex gap-2 items-center"><ArrowRight size={12} className="text-emerald-400"/> Average budget allocations for developers</li>
 </ul>
 </Card>
 </div>

 {/* Results Panel */}
 <AnimatePresence>
 {result && (
 <motion.div
 initial={{ opacity: 0, y: 25 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 20 }}
 className="space-y-8"
 >
 {/* Skills breakdown section */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Matched skills */}
 <Card className="border-white/10 bg-[#111116] p-8 rounded-[32px] shadow-lg">
 <CardHeader className="p-0 mb-5 flex flex-row items-center gap-3">
 <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
 <CheckCircle size={18} />
 </div>
 <div>
 <CardTitle className="text-base font-black text-white leading-none">Matched Capabilities</CardTitle>
 <CardDescription className="text-xs text-slate-500 font-medium">You meet these requirements already</CardDescription>
 </div>
 </CardHeader>
 <CardContent className="p-0">
 {result.matchedSkills.length === 0 ? (
 <p className="text-xs text-slate-500 italic">No matching skills found in your profile for this track.</p>
 ) : (
 <div className="flex flex-wrap gap-2.5">
 {result.matchedSkills.map(skill => (
 <Link key={skill} href={`/skills/${skill.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`}>
 <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 text-xs font-black uppercase tracking-wider py-1.5 px-3 rounded-xl cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all">
 {skill} <ExternalLink size={10} />
 </Badge>
 </Link>
 ))}
 </div>
 )}
 </CardContent>
 </Card>

 {/* Missing skills */}
 <Card className="border-white/10 bg-[#111116] p-8 rounded-[32px] shadow-lg">
 <CardHeader className="p-0 mb-5 flex flex-row items-center gap-3">
 <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
 <AlertTriangle size={18} />
 </div>
 <div>
 <CardTitle className="text-base font-black text-white leading-none">Identified Gaps</CardTitle>
 <CardDescription className="text-xs text-slate-500 font-medium">Add these to match corporate criteria</CardDescription>
 </div>
 </CardHeader>
 <CardContent className="p-0">
 {result.missingSkills.length === 0 ? (
 <p className="text-xs text-slate-500 italic">No missing skills detected! You are fully matching.</p>
 ) : (
 <div className="flex flex-wrap gap-2.5">
 {result.missingSkills.map(skill => (
 <Link key={skill} href={`/skills/${skill.toLowerCase().replace(/[^a-z0-9]+/g,"-")}`}>
 <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 text-xs font-black uppercase tracking-wider py-1.5 px-3 rounded-xl cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all">
 {skill} <ExternalLink size={10} />
 </Badge>
 </Link>
 ))}
 </div>
 )}
 </CardContent>
 </Card>
 </div>

 {/* Learning plan strategy */}
 <Card className="border-white/10 bg-[#111116] p-8 md:p-10 rounded-[32px] shadow-xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[50px] pointer-events-none" />
 
 <CardHeader className="p-0 mb-6 flex flex-row items-center gap-3">
 <div className="p-2 bg-primary/10 border border-primary/20 text-primary rounded-xl">
 <BookOpen size={18} />
 </div>
 <div>
 <CardTitle className="text-base font-black text-white leading-none">Bridge Strategy Plan</CardTitle>
 <CardDescription className="text-xs text-slate-500 font-medium">Step-by-step roadmap to acquire missing skills</CardDescription>
 </div>
 </CardHeader>

 <CardContent className="p-0 space-y-4">
 {result.learningPlan.map((step, idx) => (
 <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/3 transition-all">
 <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 text-primary font-black text-xs flex items-center justify-center shrink-0">
 {idx + 1}
 </div>
 <p className="text-sm font-semibold text-slate-300 leading-relaxed pt-0.5">{step}</p>
 </div>
 ))}
 </CardContent>
 </Card>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
