"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Navigation, Map, ListChecks, Code, Rocket, BookOpen, MessageSquare, Loader2, Sparkle, History, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";


interface CopilotResult {
    roadmapSteps: string[];
    learningPath: string[];
    projects: string[];
    jobPrepTips: string[];
}

interface SavedRoadmap {
    id: string;
    targetCareer: string;
    currentSkills: string;
    roadmapData: CopilotResult;
    createdAt: string;
}

export default function CareerCopilotPage() {
    const [targetCareer, setTargetCareer] = useState("");
    const [currentSkills, setCurrentSkills] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<CopilotResult | null>(null);
    const [history, setHistory] = useState<SavedRoadmap[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    const fetchHistory = async () => {
        try {
            const res = await fetch("/api/career-roadmap");
            const data = await res.json();
            if (data.success) {
                setHistory(data.data);
            }
        } catch (error) {
            console.error("Failed to load history", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleGenerate = async () => {
        if (!targetCareer.trim()) {
            toast.error("Please enter your target career goal.");
            return;
        }

        setIsGenerating(true);
        setResult(null);

        try {
            const response = await fetch("/api/career-roadmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetCareer,
                    currentSkills: currentSkills.split(",").map(s => s.trim()).filter(s => s)
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Generation failed.");

            setResult(data.data.roadmapData);
            setHistory([data.data, ...history]);
            toast.success("Strategy generated and saved! Your roadmap is ready.");
        } catch (error: unknown) {
            toast.error((error as Error).message || "Failed to generate roadmap.");
        } finally {
            setIsGenerating(false);
        }
    };

    const loadHistoricalRoadmap = (roadmap: SavedRoadmap) => {
        setTargetCareer(roadmap.targetCareer);
        setCurrentSkills(roadmap.currentSkills);
        setResult(roadmap.roadmapData);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const startNewSession = () => {
        setTargetCareer("");
        setCurrentSkills("");
        setResult(null);
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-4 md:gap-8 pb-32 p-4 md:p-8 overflow-hidden min-h-screen">
            {/* Sidebar for History */}
            <aside className="xl:w-80 shrink-0 space-y-6">
                <Card className="border-white/10 bg-[#111116] p-6 rounded-3xl sticky top-24 shadow-sm h-[calc(100vh-140px)] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-black text-white flex items-center gap-2">
                            <History size={18} className="text-blue-500" /> My Strategies
                        </h2>
                        <Button variant="ghost" size="icon" onClick={startNewSession} className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/20 rounded-full h-8 w-8">
                            <Plus size={18} />
                        </Button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {isLoadingHistory ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>
                        ) : history.length === 0 ? (
                            <p className="text-center italic">No saved strategies yet. Generate one to save it here!</p>
                        ) : (
                            history.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => loadHistoricalRoadmap(item)}
                                    className="w-full text-left p-4 rounded-2xl bg-[#0a0a0f] border border-white/10 hover:border-blue-500/50 hover:bg-white/5 transition-all group"
                                >
                                    <p className="font-bold text-white line-clamp-1 mb-1 group-hover:text-blue-400">
                                        {item.targetCareer}
                                    </p>
                                    <p className="text-slate-500 font-medium">
                                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </Card>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 space-y-12">
                {/* Conversational Interaction Header */}
                <div className="flex flex-col items-center xl:items-start text-center xl:text-left space-y-6">
                    <div className="w-20 h-20 rounded-[32px] bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500/30">
                        <Brain size={44} />
                    </div>
                    <div className="space-y-3">
                        <h1 className="font-black text-white tracking-tighter leading-none">
                            Your AI Career <span className="text-blue-600">Copilot</span>
                        </h1>
                        <p className="font-bold text-lg leading-relaxed max-w-xl">
                            Where do you want to be in <span className="text-white font-black underline decoration-blue-500 decoration-4 underline-offset-4">6 months?</span> Let&apos;s build the shortcut.
                        </p>
                    </div>
                </div>

                {/* Input Phase */}
                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div 
                            key="input"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full"
                        >
                            <Card className="border-white/10 bg-[#111116] p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-[50px] pointer-events-none" />
                                <CardContent className="p-0 space-y-10">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                <Navigation size={14} className="text-blue-500" /> Target Career Objective
                                            </label>
                                            <Input 
                                                suppressHydrationWarning
                                                placeholder="e.g., Senior Frontend Architect, Data Scientist at Google" 
                                                value={targetCareer}
                                                onChange={(e) => setTargetCareer(e.target.value)}
                                                className="text-xl h-16 rounded-[24px] border-white/10 font-black focus:ring-blue-500/20 shadow-sm transition-all"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                <ListChecks size={14} className="text-blue-500" /> Current Skillset (Comma separated)
                                            </label>
                                            <Input 
                                                suppressHydrationWarning
                                                placeholder="e.g., JavaScript, React, UI Design" 
                                                value={currentSkills}
                                                onChange={(e) => setCurrentSkills(e.target.value)}
                                                className="h-14 rounded-[20px] border-white/10 font-bold placeholder:font-medium placeholder:text-slate-400"
                                            />
                                        </div>
                                    </div>
                                    <Button 
                                        className="w-full bg-white hover:bg-slate-200 h-20 rounded-[28px] text-xl font-black shadow-xl shadow-slate-900/10 group overflow-hidden relative"
                                        onClick={handleGenerate}
                                        disabled={isGenerating || !targetCareer}
                                    >
                                        {isGenerating ? (
                                            <><Loader2 className="animate-spin mr-3" /> Architecting Strategy...</>
                                        ) : (
                                            <>
                                                <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                                <span className="relative z-1 flex items-center">
                                                    Initialize Copilot <Sparkles className="ml-3 group-hover:animate-pulse" />
                                                </span>
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="result"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="space-y-10"
                        >
                            {/* Dynamic Roadmap Timeline */}
                            <div className="relative pt-10 pb-16">
                                <div className="absolute top-0 left-1/2 -ml-[2px] w-1 h-full border-white/10 -z-1 hidden md:block" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {result.roadmapSteps.map((step, idx) => (
                                        <motion.div 
                                            key={idx}
                                            initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.15 }}
                                            className={`flex items-center ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-4 md:gap-8 w-full`}
                                        >
                                            <div className="shrink-0 w-16 h-16 rounded-[24px] bg-slate-900 font-black text-2xl flex items-center justify-center shadow-xl z-10 border-[#111116] ring-4 ring-[#0a0a0f]">
                                                {idx + 1}
                                            </div>
                                            <Card className="flex-1 bg-(--surface) border-none shadow-xl rounded-[32px] group hover:scale-[1.02] transition-transform overflow-hidden relative">
                                                <div className="absolute inset-0 bg-linear-to-tr from-blue-500/5 to-transparent pointer-events-none" />
                                                <CardContent className="p-4 md:p-8">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <Badge className="bg-(--surface-2) font-black tracking-widest text-[9px] px-3 py-1 uppercase rounded-lg">Milestone Plan</Badge>
                                                        <Map size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                                    </div>
                                                    <h4 className="font-black text-white leading-tight">{step}</h4>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Learning & Projects Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Learning Path */}
                                <Card className="bg-[#111116] p-10 rounded-[44px] shadow-inner border border-white/10 transition-all hover:bg-white/5 group">
                                    <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
                                        <div className="space-y-2">
                                            <CardTitle className="text-3xl font-black flex items-center gap-3">
                                                <BookOpen className="text-blue-600" /> Learning Path
                                            </CardTitle>
                                            <CardDescription className="font-bold text-slate-400">Master these advanced concepts</CardDescription>
                                        </div>
                                        <div className="bg-blue-600/10 p-3 rounded-2xl text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
                                            <Sparkle fill="currentColor" size={24} />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0 space-y-4">
                                        {result.learningPath.map((item, i) => (
                                            <div key={i} className="flex items-center gap-5 p-5 bg-(--surface) rounded-[24px] shadow-sm border border-white/5 hover:shadow-md transition-shadow">
                                                <div className="w-10 h-10 rounded-2xl bg-(--surface-2) text-white flex items-center justify-center font-black">
                                                    {i + 1}
                                                </div>
                                                <p className="font-black text-slate-300 tracking-tight leading-none pt-1">{item}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Project Ideas */}
                                <Card className="border-none bg-blue-600 p-10 rounded-[44px] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 blur-[100px] -mr-40 group-hover:scale-110 transition-transform duration-700" />
                                    <CardHeader className="p-0 mb-8">
                                        <CardTitle className="text-3xl font-black flex items-center gap-3">
                                            <Code size={30} /> Project Blueprint
                                        </CardTitle>
                                        <CardDescription className="text-blue-100 font-bold opacity-80">Build these to prove your skills</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0 space-y-5">
                                        {result.projects.map((proj, i) => (
                                            <div key={i} className="flex gap-5 p-6 bg-white/10 backdrop-blur-md rounded-[32px] border border-white/20 hover:bg-white/20 transition-all group/item shadow-2xl shadow-black/10">
                                                <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-lg group-hover/item:rotate-6 transition-transform">
                                                    <Rocket size={24} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-black text-lg tracking-tight leading-none pt-1">Strategy #{i+1}</p>
                                                    <p className="text-sm font-medium opacity-80 leading-relaxed">{proj}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Interview Prep / Tips */}
                            <Card className="border-white/10 shadow-none rounded-[48px] overflow-hidden bg-[#111116] group hover:shadow-2xl hover:shadow-blue-500/10 transition-all">
                                 <div className="p-12 md:p-16 flex flex-col md:flex-row items-center gap-12">
                                    <div className="shrink-0 space-y-6 text-center md:text-left">
                                        <div className="w-20 h-20 rounded-[32px] bg-blue-600 text-white flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                            <MessageSquare size={40} />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-black text-white leading-tight whitespace-nowrap">Career <span className="opacity-60">Edge Tips</span></h3>
                                            <p className="text-slate-400 font-bold">Expert advice for your move.</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {result.jobPrepTips.map((tip, i) => (
                                            <div key={i} className="flex gap-4 p-4 md:p-8 bg-(--surface-2) border border-white/5 rounded-3xl hover:bg-white/10 transition-all">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2.5 shrink-0" />
                                                <p className="text-sm font-black leading-relaxed tracking-tight">{tip}</p>
                                            </div>
                                        ))}
                                    </div>
                                 </div>
                            </Card>

                            {/* Reset Button */}
                            <div className="flex justify-center pt-8">
                                <Button 
                                    variant="ghost" 
                                    size="lg" 
                                    onClick={startNewSession} 
                                    className="hover:text-red-500 rounded-2xl font-black gap-2 hover:bg-red-500/5 transition-all text-sm uppercase tracking-widest"
                                >
                                    Start New Career Strategy
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
