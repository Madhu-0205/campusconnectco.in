"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Target, GraduationCap, Zap, TrendingUp, ArrowRight, Loader2, Compass } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";


interface Recommendation {
    id: string;
    title: string;
    description: string;
    matchScore: number;
    type: "Internship" | "Gig";
}

interface SmartMatchResult {
    internships: Recommendation[];
    gigs: Recommendation[];
    skillsToLearn: string[];
    roadmap: string[];
}

export default function SmartMatchPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SmartMatchResult | null>(null);
    const [activeTab, setActiveTab] = useState<"all" | "internships" | "gigs">("all");

    const fetchMatches = async () => {
        setIsLoading(true);
        try {
            // We use the new dedicated AI route to compute the match based on real user skills vs market opportunities
            // This is a direct deterministic call to the intelligence engine
            
            const response = await fetch("/api/ai/smartmatch", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Matching failed.");
            
            setResult(data.data);
            toast.success("AI Matching generated your live opportunities!");
        } catch (error: unknown) {
            toast.error((error as Error).message || "Failed to generate matches.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    const filteredMatches = () => {
        if (!result) return [];
        const internships = result.internships || [];
        const gigs = result.gigs || [];
        const all = [...internships, ...gigs].sort((a, b) => b.matchScore - a.matchScore);
        
        if (activeTab === "all") return all;
        if (activeTab === "internships") return internships;
        return gigs;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 p-4 md:p-8 overflow-hidden">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row items-end justify-between gap-6 border-white/10 pb-10">
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-xs font-black uppercase tracking-widest border border-orange-500/20">
                        <Sparkles size={14} /> Intelligence Engine v2.0
                    </div>
                    <h1 className="font-black text-white tracking-tighter leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                        Your Personalized <span className="text-transparent bg-linear-to-r from-orange-400 to-amber-400">SmartMatch</span>
                    </h1>
                    <p className="text-lg font-medium leading-relaxed">
                        Our neural network analyzes your unique skill graph against active roles to find your perfect professional alignment.
                    </p>
                </div>
                
                <div className="flex bg-[#111116] p-1.5 rounded-2xl border border-white/10 shadow-inner">
                    <Button 
                        onClick={() => setActiveTab("all")} 
                        variant={activeTab === "all" ? "default" : "ghost"}
                        className={activeTab === "all" ? "bg-white/5 shadow-md rounded-xl font-bold" : "rounded-xl font-bold text-slate-500"}
                    >
                        All Matches
                    </Button>
                    <Button 
                        onClick={() => setActiveTab("internships")} 
                        variant={activeTab === "internships" ? "default" : "ghost"}
                        className={activeTab === "internships" ? "bg-white/5 shadow-md rounded-xl font-bold" : "rounded-xl font-bold text-slate-500"}
                    >
                        Internships
                    </Button>
                    <Button 
                        onClick={() => setActiveTab("gigs")} 
                        variant={activeTab === "gigs" ? "default" : "ghost"}
                        className={activeTab === "gigs" ? "bg-white/5 shadow-md rounded-xl font-bold" : "rounded-xl font-bold text-slate-500"}
                    >
                        Gigs
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                
                {/* Sidebar: Profile Summary & Skill Gaps */}
                <aside className="lg:col-span-1 space-y-8">
                    <Card className="border-white/10 bg-[#111116] shadow-2xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-[50px] pointer-events-none group-hover:bg-orange-500/40 transition-all duration-700" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl font-black">
                                <Target size={20} className="text-orange-400" /> Match DNA
                            </CardTitle>
                            <CardDescription className="text-slate-400 font-medium pt-1">Current Intelligence Profile</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="blue" className="bg-white/5 border-white/10 text-slate-300 font-bold px-3 py-1">React</Badge>
                                <Badge variant="blue" className="bg-white/5 border-white/10 text-slate-300 font-bold px-3 py-1">TypeSript</Badge>
                                <Badge variant="blue" className="bg-white/5 border-white/10 text-slate-300 font-bold px-3 py-1">Logic</Badge>
                                <Badge variant="blue" className="bg-white/5 border-white/10 text-slate-300 font-bold px-3 py-1">Scale</Badge>
                            </div>
                            
                            <div className="h-px bg-white/10 w-full" />
                            
                            <div className="space-y-4">
                                <h4 className="font-black text-orange-400 uppercase tracking-widest flex items-center justify-between">
                                    Strategic Skills to Acquire
                                    {isLoading && <Loader2 className="animate-spin" size={12} />}
                                </h4>
                                <div className="space-y-3">
                                    {(result?.skillsToLearn || ["Cloud Computing", "System Design", "T-SQL"]).map((skill, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group/item">
                                            <div className="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center font-black text-[10px] group-hover/item:bg-orange-500 group-hover/item:text-white transition-all">
                                                {i+1}
                                            </div>
                                            <span className="text-xs font-bold">{skill}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-linear-to-br from-orange-500/10 via-transparent to-transparent border-orange-500/10">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-tight">
                                <TrendingUp size={16} /> Market Sentiment
                            </div>
                            <p className="text-slate-500 leading-relaxed font-medium">
                                High demand for Frontend Engineers with proficiency in <span className="text-orange-500 font-bold">shadcn/ui</span> and <span className="text-orange-500 font-bold">Framer Motion</span>. Match scores are weighted by trending skills.
                            </p>
                        </CardContent>
                    </Card>
                </aside>

                {/* Main Content: Recommendations Grid */}
                <main className="lg:col-span-3 space-y-8">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="h-[280px] rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                {filteredMatches().map((match, idx) => (
                                    <motion.div
                                        key={match.id + idx}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05, duration: 0.5, ease: "easeOut" }}
                                    >
                                        <Card className="group border shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 rounded-[32px] overflow-hidden border-white/5 hover:border-orange-500/30 h-full flex flex-col bg-[#111116]">
                                            <div className="relative h-32 bg-[#0a0a0f] flex items-center justify-center border-white/5 overflow-hidden shrink-0">
                                                <div className="absolute top-0 right-0 p-4">
                                                    <div className="px-5 py-2 rounded-2xl bg-[#111116] shadow-xl shadow-slate-900/5 group-hover:scale-110 transition-transform duration-500 flex items-center gap-3 border border-white/5">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-black text-slate-400 uppercase tracking-widest">Score</span>
                                                            <span className={`text-xl font-black ${match.matchScore >= 90 ? 'text-emerald-500' : 'text-orange-500'}`}>{match.matchScore}%</span>
                                                        </div>
                                                        <div className={`w-2 h-10 rounded-full ${match.matchScore >= 90 ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                                                    </div>
                                                </div>
                                                
                                                <div className="absolute bottom-0 left-0 p-6 flex items-center gap-3">
                                                    <div className={`p-3 rounded-2xl shadow-lg ${match.type === 'Internship' ? 'bg-[#ff4d1c] shadow-orange-500/20' : 'bg-emerald-600 text-white shadow-emerald-500/20'}`}>
                                                        {match.type === 'Internship' ? <GraduationCap size={24} /> : <Zap size={24} />}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <CardHeader className="pt-6">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant={match?.type?.toLowerCase() === 'internship' ? 'blue' : 'success'} className="rounded-md font-black text-[10px]">
                                                        {(match?.type || 'Opportunity').toUpperCase()}
                                                    </Badge>

                                                    <span className="font-bold text-slate-400 flex items-center gap-1"><Target size={12} /> Optimization Active</span>
                                                </div>
                                                <CardTitle className="font-black text-white group-hover:text-orange-500 transition-colors leading-tight">
                                                    {match.title}
                                                </CardTitle>
                                            </CardHeader>
                                            
                                            <CardContent className="flex-1">
                                                <p className="text-sm font-medium leading-relaxed line-clamp-3">
                                                    {match.description}
                                                </p>
                                            </CardContent>
                                            
                                            <CardFooter className="pt-0 pb-8 px-6">
                                                <Button className="w-full bg-white text-black hover:bg-slate-200 rounded-2xl py-6 font-black group/btn h-auto shadow-xl">
                                                    Unlock Analysis & Apply
                                                    <ArrowRight size={18} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                    
                    {/* Roadmap Section */}
                    {result && (
                        <Card className="mt-12 bg-linear-to-r from-orange-500 to-amber-500 border-none shadow-2xl shadow-orange-500/20 rounded-[40px] overflow-hidden relative">
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] -z-1" />
                            <CardContent className="p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[100px] pointer-events-none -mr-40" />
                                
                                <div className="max-w-sm space-y-6 text-center md:text-left">
                                    <div className="w-20 h-20 rounded-[32px] bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center mx-auto md:mx-0 shadow-2xl">
                                        <Compass size={40} className="text-white" />
                                    </div>
                                    <h3 className="md:text-4xl font-black text-white leading-tight">Your AI Generated <span className="opacity-60 italic">Career Roadmap</span></h3>
                                    <p className="text-lg font-medium">Strategic steps to land these top 3 matches within 6 months.</p>
                                    <Button className="bg-white text-orange-600 hover:bg-orange-50 rounded-2xl px-8 py-6 font-black h-auto" style={{ color: "var(--color-primary)" }}>View Full Strategy</Button>
                                </div>
                                
                                <div className="flex-1 space-y-4 w-full">
                                    {(result.roadmap || []).map((step, i) => (
                                        <motion.div 
                                            key={i} 
                                            initial={{ opacity: 0, x: 20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center gap-6 p-5 rounded-3xl bg-white/10 border border-white/10 hover:bg-white/15 transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-xl shadow-xl group-hover:scale-110 transition-transform tracking-tight shrink-0" style={{ color: "var(--color-primary)" }}>
                                                0{i+1}
                                            </div>
                                            <p className="font-black text-lg sm:text-xl tracking-tight leading-none group-hover:translate-x-1 transition-transform">{step}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        </div>
    );
}
