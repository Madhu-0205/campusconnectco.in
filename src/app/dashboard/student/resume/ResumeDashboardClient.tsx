"use client";

import { 
    CheckCircle2, TrendingUp, AlertCircle, Loader2, Sparkles, BrainCircuit, Zap, LayoutTemplate
} from "lucide-react";
import { useState, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

import { ResumeUploader } from "@/components/resume/ResumeUploader";

export default function ResumeDashboardClient() {
    const [analyses, setAnalyses] = useState<any[]>([]);
    const [roadmaps, setRoadmaps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeAnalysis, setActiveAnalysis] = useState<any | null>(null);
    const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch("/api/user/resume-history");
            const data = await res.json();
            if (res.ok) {
                setAnalyses(data.analyses || []);
                setRoadmaps(data.roadmaps || []);
                if (data.analyses?.length > 0) {
                    setActiveAnalysis(data.analyses[0]);
                }
            }
        } catch {
            toast.error("Failed to load resume history");
        } finally {
            setLoading(false);
        }
    };

    const handleUploadComplete = async (url: string) => {
        setLoading(true);
        toast.info("Extracting insights with AI...");
        try {
            const res = await fetch("/api/ai/parse-resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileUrl: url }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("Resume parsed successfully!");
            await fetchHistory(); // refresh to get the latest DB record
        } catch (e: any) {
            toast.error(e.message || "Failed to parse resume");
            setLoading(false);
        }
    };

    const generateRoadmap = async () => {
        setGeneratingRoadmap(true);
        toast.info("AI is building your personalized roadmap...");
        try {
            const res = await fetch("/api/ai/career-guidance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetRole: "Software Engineer" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("Roadmap generated!");
            await fetchHistory();
        } catch (e: any) {
            toast.error(e.message || "Failed to generate roadmap");
        } finally {
            setGeneratingRoadmap(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-125">
                <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Intelligence...</p>
            </div>
        );
    }

    const radarData = activeAnalysis?.result?.atsScore?.categoryScores ? [
        { subject: 'Structure', A: activeAnalysis.result.atsScore.categoryScores.structure, fullMark: 100 },
        { subject: 'Format', A: activeAnalysis.result.atsScore.categoryScores.formatting, fullMark: 100 },
        { subject: 'Skills', A: activeAnalysis.result.atsScore.categoryScores.skills, fullMark: 100 },
        { subject: 'Projects', A: activeAnalysis.result.atsScore.categoryScores.projects, fullMark: 100 },
        { subject: 'Impact', A: activeAnalysis.result.atsScore.categoryScores.experience, fullMark: 100 },
        { subject: 'Keywords', A: activeAnalysis.result.atsScore.categoryScores.keywords, fullMark: 100 },
    ] : [];

    return (
        <div className="max-w-7xl mx-auto py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <BrainCircuit className="text-violet-500" /> Resume Intelligence
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">AI-powered parsing, ATS scoring, and actionable career guidance.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COL: Upload & History */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-(--surface) border border-(--border) rounded-3xl p-6">
                        <h3 className="font-bold text-white mb-4">Upload New Resume</h3>
                        <ResumeUploader onUploadComplete={handleUploadComplete} />
                    </div>

                    <div className="bg-(--surface) border border-(--border) rounded-3xl p-6">
                        <h3 className="font-bold text-white mb-4">Analysis History</h3>
                        <div className="space-y-3">
                            {analyses.length === 0 ? (
                                <p className="text-sm text-slate-500">No resumes analyzed yet.</p>
                            ) : analyses.map((a: any) => (
                                <button 
                                    key={a.id}
                                    onClick={() => setActiveAnalysis(a)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${activeAnalysis?.id === a.id ? 'bg-violet-600/10 border-violet-500/50' : 'bg-(--surface-2) border-(--border) hover:border-white/20'}`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-white truncate max-w-37.5">{a.fileName || "Resume"}</span>
                                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${a.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : a.score >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {a.score} ATS
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">
                                        {new Date(a.createdAt).toLocaleDateString()}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: Insights & Roadmap */}
                <div className="lg:col-span-8 space-y-6">
                    {!activeAnalysis ? (
                        <div className="bg-(--surface) border border-(--border) rounded-3xl p-12 text-center flex flex-col items-center">
                            <LayoutTemplate className="w-16 h-16 text-slate-700 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Awaiting Resume</h3>
                            <p className="text-slate-400 max-w-md">Upload your resume on the left to see your ATS score, radar analysis, and personalized career roadmaps.</p>
                        </div>
                    ) : (
                        <>
                            {/* ATS Score Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-(--surface) border border-(--border) rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-[50px]" />
                                    <h3 className="font-bold text-slate-400 text-sm uppercase tracking-widest mb-6">Overall ATS Score</h3>
                                    
                                    <div className="relative w-48 h-48 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="96" cy="96" r="80" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                                            <circle 
                                                cx="96" cy="96" r="80" 
                                                stroke={activeAnalysis.score >= 80 ? "#10B981" : activeAnalysis.score >= 60 ? "#F59E0B" : "#EF4444"} 
                                                strokeWidth="12" fill="none" 
                                                strokeDasharray="502" 
                                                strokeDashoffset={502 - (502 * activeAnalysis.score) / 100} 
                                                className="transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center">
                                            <span className="text-5xl font-black text-white">{activeAnalysis.score}</span>
                                            <span className="text-sm font-bold text-slate-500">/ 100</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 flex justify-center w-full">
                                        <div className="px-4 py-2 bg-white/5 rounded-full text-xs font-bold text-white flex items-center gap-2">
                                            Grade: <span className={activeAnalysis.grade === 'A' ? "text-emerald-400" : activeAnalysis.grade === 'B' ? "text-amber-400" : "text-red-400"}>{activeAnalysis.grade}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-(--surface) border border-(--border) rounded-3xl p-6">
                                    <h3 className="font-bold text-slate-400 text-sm uppercase tracking-widest mb-4">Competency Radar</h3>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                <Radar name="ATS" dataKey="A" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.4} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Strengths & Weaknesses */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6">
                                    <h3 className="font-bold text-emerald-400 flex items-center gap-2 mb-4">
                                        <CheckCircle2 className="w-5 h-5" /> Key Strengths
                                    </h3>
                                    <ul className="space-y-3">
                                        {activeAnalysis.result?.atsScore?.strengths?.map((s: string, i: number) => (
                                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                                <span className="text-emerald-500 mt-0.5">•</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6">
                                    <h3 className="font-bold text-red-400 flex items-center gap-2 mb-4">
                                        <AlertCircle className="w-5 h-5" /> Critical Weaknesses
                                    </h3>
                                    <ul className="space-y-3">
                                        {activeAnalysis.result?.atsScore?.weaknesses?.map((w: string, i: number) => (
                                            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                                <span className="text-red-500 mt-0.5">•</span> {w}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Improvements */}
                            <div className="bg-(--surface) border border-(--border) rounded-3xl p-6">
                                <h3 className="font-bold text-white flex items-center gap-2 mb-6">
                                    <Sparkles className="w-5 h-5 text-violet-400" /> Suggested Improvements
                                </h3>
                                
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Missing Skills for ATS</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {activeAnalysis.result?.improvements?.missingSkills?.map((s: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300 font-medium">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Better Action Verbs to Use</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {activeAnalysis.result?.improvements?.suggestedActionVerbs?.map((v: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-lg text-xs font-bold">
                                                    {v}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Rewritten Summary</h4>
                                        <p className="text-sm text-slate-300 italic bg-white/5 p-4 rounded-xl border border-white/10">
                                            &quot;{activeAnalysis.result?.improvements?.summary}&quot;
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Career Roadmap */}
                            <div className="bg-linear-to-br from-violet-600/20 to-cyan-500/10 border border-violet-500/20 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 blur-[80px]" />
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                                    <div>
                                        <h3 className="font-bold text-white text-xl flex items-center gap-2 mb-2">
                                            <TrendingUp className="text-cyan-400" /> Generate Career Roadmap
                                        </h3>
                                        <p className="text-sm text-slate-400 max-w-md">Use this parsed resume to generate a month-by-month career roadmap and technical interview prep guide.</p>
                                    </div>
                                    <button 
                                        onClick={generateRoadmap}
                                        disabled={generatingRoadmap}
                                        className="shrink-0 px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                                    >
                                        {generatingRoadmap ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                        {generatingRoadmap ? "Generating..." : "Generate AI Roadmap"}
                                    </button>
                                </div>

                                {roadmaps.length > 0 && (
                                    <div className="mt-8 border-t border-white/10 pt-8">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-white mb-6">Latest Roadmap: {roadmaps[0].targetCareer}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h5 className="text-xs font-bold text-slate-400 uppercase">Timeline</h5>
                                                {roadmaps[0].roadmapData?.roadmap?.timeline?.map((t: string, i: number) => (
                                                    <div key={i} className="bg-black/20 p-4 rounded-xl border border-white/5 text-sm text-slate-300">
                                                        {t}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="space-y-4">
                                                <h5 className="text-xs font-bold text-slate-400 uppercase">Interview Prep (Behavioral)</h5>
                                                {roadmaps[0].roadmapData?.interviewPrep?.behavioralQuestions?.slice(0, 3).map((q: any, i: number) => (
                                                    <div key={i} className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-1">
                                                        <div className="text-xs font-bold text-violet-400">{q.difficulty}</div>
                                                        <div className="text-sm text-slate-300">{q.question}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
