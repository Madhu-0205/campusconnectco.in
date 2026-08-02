"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Brain, Loader2, ChevronRight, Award, Plus,
    TrendingUp, Terminal, RefreshCw, BarChart2,
    CheckCircle, AlertCircle, History, Shield, Play
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";


interface MockInterview {
    id: string;
    roleTitle: string;
    difficulty: string;
    score: number | null;
    feedback: any;
    chatHistory: any[];
    createdAt: string;
}

const DEFAULT_ROLES = [
    "Next.js Frontend Engineer",
    "Python Backend Developer",
    "Full Stack Web Developer",
    "Data Scientist",
    "UI/UX Designer",
    "Product Manager",
    "Mobile iOS/Android Engineer"
];

export default function InterviewSimulatorPage() {
    const [phase, setPhase] = useState<"setup" | "interviewing" | "completed">("setup");
    const [roleTitle, setRoleTitle] = useState(DEFAULT_ROLES[0]);
    const [customRole, setCustomRole] = useState("");
    const [difficulty, setDifficulty] = useState("MEDIUM");
    
    // Active states
    const [activeInterview, setActiveInterview] = useState<MockInterview | null>(null);
    const [, setCurrentQuestion] = useState("");
    const [userAnswer, setUserAnswer] = useState("");
    const [questionIndex, setQuestionIndex] = useState(1);
    const [isStarting, setIsStarting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // History
    const [history, setHistory] = useState<MockInterview[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    const chatEndRef = useRef<HTMLDivElement>(null);

    const fetchHistory = async () => {
        try {
            const res = await fetch("/api/ai/mock-interview");
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

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeInterview?.chatHistory]);

    const handleStartInterview = async () => {
        const finalRole = customRole.trim() ? customRole : roleTitle;
        setIsStarting(true);

        try {
            const response = await fetch("/api/ai/mock-interview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roleTitle: finalRole, difficulty })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to initialize interview.");

            setActiveInterview(data.data);
            const initialQuestion = data.data.chatHistory[0]?.content || "";
            setCurrentQuestion(initialQuestion);
            setQuestionIndex(1);
            setPhase("interviewing");
            setUserAnswer("");
            toast.success("Simulation initialized. Ready for Question 1.");
        } catch (error: any) {
            toast.error(error.message || "Failed to start interview.");
        } finally {
            setIsStarting(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!userAnswer.trim()) {
            toast.error("Please provide an answer before submitting.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/ai/mock-interview", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    interviewId: activeInterview?.id,
                    answer: userAnswer
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to submit answer.");

            // Update chatHistory local state
            const updatedHistory = [
                ...(activeInterview?.chatHistory || []),
                { role: "user", content: userAnswer, timestamp: new Date() }
            ];

            if (data.status === "ongoing") {
                updatedHistory.push({ role: "assistant", content: data.nextQuestion, timestamp: new Date() });
                setActiveInterview({
                    ...activeInterview!,
                    chatHistory: updatedHistory
                });
                setCurrentQuestion(data.nextQuestion);
                setQuestionIndex(data.questionNumber);
                setUserAnswer("");
                toast.success(`Question ${data.questionNumber} loaded.`);
            } else if (data.status === "completed") {
                setActiveInterview(data.data);
                setPhase("completed");
                setHistory(prev => [data.data, ...prev.filter(h => h.id !== data.data.id)]);
                toast.success("Interview completed! Grade report is ready.");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to submit answer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const loadHistoricalAttempt = (attempt: MockInterview) => {
        setActiveInterview(attempt);
        if (attempt.score !== null) {
            setPhase("completed");
        } else {
            // Unfinished interview, load last assistant question
            const lastAssistant = [...attempt.chatHistory].reverse().find(h => h.role === "assistant");
            setCurrentQuestion(lastAssistant?.content || "Ready to proceed.");
            const qCount = attempt.chatHistory.filter(h => h.role === "assistant").length;
            setQuestionIndex(qCount);
            setPhase("interviewing");
            setUserAnswer("");
        }
    };

    const returnToSetup = () => {
        setActiveInterview(null);
        setPhase("setup");
        setCustomRole("");
        setUserAnswer("");
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-4 md:gap-8 pb-32 p-4 md:p-8 min-h-screen text-slate-100">
            {/* Sidebar with history */}
            <aside className="xl:w-80 shrink-0 space-y-6">
                <Card className="border-white/10 bg-[#111116] p-6 rounded-3xl sticky top-24 shadow-2xl h-[calc(100vh-140px)] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-black text-white flex items-center gap-2">
                            <History size={18} className="text-purple-500" /> Simulations
                        </h2>
                        {phase !== "setup" && (
                            <Button variant="ghost" size="icon" onClick={returnToSetup} className="text-purple-500 hover:text-purple-400 hover:bg-purple-500/20 rounded-full h-8 w-8">
                                <Plus size={18} />
                            </Button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                        {isLoadingHistory ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-8 text-xs text-slate-500 italic">No past attempts.</div>
                        ) : (
                            history.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => loadHistoricalAttempt(item)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all group ${activeInterview?.id === item.id ? 'bg-purple-500/10 border-purple-500/40' : 'bg-[#0a0a0f] border-white/5 hover:border-purple-500/30'}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-bold text-white line-clamp-1 group-hover:text-purple-400 transition-colors text-sm">
                                            {item.roleTitle}
                                        </p>
                                        {item.score !== null && (
                                            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] py-0">
                                                {item.score}%
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                                        <span className="font-black uppercase tracking-wider">{item.difficulty}</span>
                                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </Card>
            </aside>

            {/* Main Area */}
            <div className="flex-1 space-y-8">
                <AnimatePresence mode="wait">
                    {/* Setup Phase */}
                    {phase === "setup" && (
                        <motion.div
                            key="setup"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            <div className="space-y-3">
                                <div className="w-16 h-16 rounded-3xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-2xl">
                                    <Brain size={32} />
                                </div>
                                <h1 className="font-black text-white tracking-tighter leading-none">
                                    AI Interview <span className="text-purple-500">Simulator</span>
                                </h1>
                                <p className="font-bold text-lg text-slate-400">
                                    Test your tech limits. Face realistic startup engineering challenges with detailed scorecard diagnostics.
                                </p>
                            </div>

                            <Card className="border-white/10 bg-[#111116] p-8 md:p-10 rounded-4xl shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 blur-[60px] pointer-events-none" />
                                <CardContent className="p-0 space-y-8">
                                    {/* Role Selector */}
                                    <div className="space-y-3">
                                        <label className="font-black uppercase tracking-widest text-slate-400 text-xs flex items-center gap-2">
                                            <Shield size={14} className="text-purple-500" /> Target Engineering Role
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-2">
                                                <select
                                                    value={roleTitle}
                                                    onChange={(e) => { setRoleTitle(e.target.value); setCustomRole(""); }}
                                                    className="w-full h-14 px-4 bg-[#0a0a0f] border border-white/10 rounded-2xl text-white font-bold focus:border-purple-500 focus:outline-none transition-colors"
                                                >
                                                    {DEFAULT_ROLES.map(r => (
                                                        <option key={r} value={r}>{r}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Input
                                                    placeholder="Or type a custom role (e.g. Solidity Architect)"
                                                    value={customRole}
                                                    onChange={(e) => setCustomRole(e.target.value)}
                                                    className="h-14 rounded-2xl border-white/10 font-bold bg-[#0a0a0f]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Difficulty */}
                                    <div className="space-y-3">
                                        <label className="font-black uppercase tracking-widest text-slate-400 text-xs flex items-center gap-2">
                                            <TrendingUp size={14} className="text-purple-500" /> Difficulty Level
                                        </label>
                                        <div className="flex gap-4">
                                            {["EASY", "MEDIUM", "HARD"].map(lvl => (
                                                <button
                                                    key={lvl}
                                                    onClick={() => setDifficulty(lvl)}
                                                    className={`flex-1 h-14 rounded-2xl border font-black text-xs transition-all active:scale-95 ${difficulty === lvl ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-transparent text-slate-400 border-white/10 hover:border-white/20'}`}
                                                >
                                                    {lvl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleStartInterview}
                                        disabled={isStarting}
                                        className="w-full bg-white hover:bg-slate-200 text-slate-950 font-black h-16 rounded-[20px] text-lg flex items-center justify-center gap-2 shadow-xl shadow-black/30 active:scale-98 transition-all"
                                    >
                                        {isStarting ? (
                                            <><Loader2 className="animate-spin" /> Spin Up Simulator...</>
                                        ) : (
                                            <><Play size={18} fill="currentColor" /> Initialize Simulation</>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Interviewing Phase */}
                    {phase === "interviewing" && activeInterview && (
                        <motion.div
                            key="interviewing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Header details */}
                            <div className="flex justify-between items-center bg-[#111116] border border-white/10 rounded-2xl p-5">
                                <div>
                                    <h2 className="font-black text-white text-base">{activeInterview.roleTitle}</h2>
                                    <p className="text-xs text-slate-400 font-medium">Difficulty: {activeInterview.difficulty} • Progress: Question {questionIndex} of 5</p>
                                </div>
                                <Badge className="bg-purple-600/20 text-purple-400 border border-purple-500/30 font-black px-3 py-1">
                                    LIVE INTERVIEW
                                </Badge>
                            </div>

                            {/* Two-Column split workspace */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Side: Interviewer chat */}
                                <div className="flex flex-col h-120 bg-[#111116] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                                    <div className="p-4 bg-white/2 border-b border-white/5 flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">AI Interviewer Terminal</span>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                        {activeInterview.chatHistory.map((msg: any, i: number) => (
                                            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-black text-xs ${msg.role === "user" ? "bg-purple-500/20 border border-purple-500/30 text-purple-300" : "bg-linear-to-br from-purple-500 to-indigo-600 text-white"}`}>
                                                    {msg.role === "user" ? "U" : "AI"}
                                                </div>
                                                <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${msg.role === "user" ? "bg-purple-600/15 border border-purple-500/20 text-slate-200" : "bg-[#0a0a0f] border border-white/5 text-slate-300"}`}>
                                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={chatEndRef} />
                                    </div>
                                </div>

                                {/* Right Side: Code editor / Answer board */}
                                <div className="flex flex-col h-120 bg-[#0A0A0F] border border-white/10 rounded-3xl overflow-hidden shadow-xl relative">
                                    <div className="p-4 bg-[#111116] border-b border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Terminal size={14} className="text-purple-400" />
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Workspace Editor</span>
                                        </div>
                                        <Badge className="bg-white/5 border border-white/10 text-slate-400 text-[9px] font-black uppercase">
                                            Text/Markdown
                                        </Badge>
                                    </div>

                                    <textarea
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        placeholder="Draft your solution here. Provide architectural strategies, pseudo-code, or clear technical reasoning..."
                                        className="flex-1 p-6 bg-transparent text-slate-200 font-mono text-sm leading-relaxed focus:outline-none resize-none placeholder:text-slate-600"
                                        disabled={isSubmitting}
                                    />

                                    <div className="p-4 bg-[#111116]/80 border-t border-white/10 flex justify-between items-center backdrop-blur-md">
                                        <p className="text-[10px] text-slate-500 font-medium">Use Ctrl+Enter to submit</p>
                                        <Button
                                            onClick={handleSubmitAnswer}
                                            disabled={isSubmitting || !userAnswer.trim()}
                                            className="bg-purple-600 hover:bg-purple-500 text-white font-black px-6 h-11 rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                                        >
                                            {isSubmitting ? (
                                                <><Loader2 className="animate-spin" /> Evaluating Answer...</>
                                            ) : (
                                                <>Submit Answer <ChevronRight size={14} /></>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Completed Phase (Scorecard) */}
                    {phase === "completed" && activeInterview && (
                        <motion.div
                            key="completed"
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="space-y-8"
                        >
                            {/* Congratulations header */}
                            <div className="text-center space-y-3">
                                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl">
                                    <Award size={32} />
                                </div>
                                <h1 className="font-black text-white tracking-tighter leading-none">
                                    Simulation <span className="text-emerald-400">Complete</span>
                                </h1>
                                <p className="font-bold text-slate-400 text-base max-w-xl mx-auto">
                                    Excellent work completing the interview simulator for the **{activeInterview.roleTitle}** workspace. Here are your performance diagnostics.
                                </p>
                            </div>

                            {/* Performance Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Large Scorecard Panel */}
                                <Card className="lg:col-span-1 border-white/10 bg-[#111116] p-8 rounded-4xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] pointer-events-none" />
                                    
                                    <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs mb-6">Overall Grade</h3>
                                    
                                    {/* Radial Score Gauge */}
                                    <div className="relative w-40 h-40">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="80" cy="80" r="70" strokeWidth="10" fill="transparent" className="text-white/5 stroke-current" />
                                            <circle cx="80" cy="80" r="70" strokeWidth="10" fill="transparent" strokeDasharray="440"
                                                strokeDashoffset={440 - (440 * (activeInterview.score || 0)) / 100}
                                                className="text-emerald-400 stroke-current transition-all duration-1000" strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="font-black text-5xl text-white tracking-tight">{activeInterview.score}%</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Grade Score</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 space-y-2">
                                        <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-black tracking-widest uppercase px-3 py-1">
                                            {activeInterview.score && activeInterview.score >= 80 ? "Vetted Expert" : activeInterview.score && activeInterview.score >= 60 ? "Proficient" : "Needs Upskilling"}
                                        </Badge>
                                        <p className="text-xs text-slate-500 mt-2 font-medium">Difficulty profile: {activeInterview.difficulty}</p>
                                    </div>
                                </Card>

                                {/* Diagnostics & Category Metrics */}
                                <Card className="lg:col-span-2 border-white/10 bg-[#111116] p-8 rounded-4xl shadow-2xl">
                                    <h3 className="font-black text-white flex items-center gap-2 mb-6 text-lg">
                                        <BarChart2 className="text-emerald-400" size={20} /> Diagnostic Metrics
                                    </h3>
                                    
                                    <div className="space-y-6">
                                        {[
                                            { label: "Technical Accuracy & Depth", value: activeInterview.feedback?.technical || 70, color: "bg-emerald-400" },
                                            { label: "Communication & Explanation Clarity", value: activeInterview.feedback?.communication || 70, color: "bg-cyan-400" },
                                            { label: "Structure, Logic & Systematic Approach", value: activeInterview.feedback?.structure || 70, color: "bg-violet-400" }
                                        ].map(({ label, value, color }) => (
                                            <div key={label} className="space-y-2">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-400 font-bold">{label}</span>
                                                    <span className="font-black text-white">{value}%</span>
                                                </div>
                                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${value}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className={`h-full ${color} rounded-full`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>

                            {/* Strengths & Improvements */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Strengths */}
                                <Card className="border-white/10 bg-[#111116] p-8 rounded-4xl shadow-lg">
                                    <h3 className="font-black text-white flex items-center gap-2 mb-5 text-base">
                                        <CheckCircle className="text-emerald-400" size={18} /> Top Strengths
                                    </h3>
                                    <ul className="space-y-3">
                                        {(activeInterview.feedback?.strengths || ["Well-structured logic flow", "Good attempt addressing all corner cases", "Clear technical focus"]).map((s: string, idx: number) => (
                                            <li key={idx} className="flex gap-3 text-sm font-semibold text-slate-300 leading-relaxed">
                                                <span className="text-emerald-400 shrink-0 mt-0.5">✔</span>
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>

                                {/* Improvements */}
                                <Card className="border-white/10 bg-[#111116] p-8 rounded-4xl shadow-lg">
                                    <h3 className="font-black text-white flex items-center gap-2 mb-5 text-base">
                                        <AlertCircle className="text-amber-400" size={18} /> Target Improvement Areas
                                    </h3>
                                    <ul className="space-y-3">
                                        {(activeInterview.feedback?.improvements || ["Clarify complexity limits of algorithms", "Explain system design tradeoffs", "Provide code syntax samples"]).map((s: string, idx: number) => (
                                            <li key={idx} className="flex gap-3 text-sm font-semibold text-slate-300 leading-relaxed">
                                                <span className="text-amber-400 shrink-0 mt-0.5">➜</span>
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            </div>

                            {/* Options buttons */}
                            <div className="flex justify-center gap-4">
                                <Button
                                    onClick={returnToSetup}
                                    className="bg-white hover:bg-slate-200 text-slate-950 font-black px-8 h-14 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-md"
                                >
                                    <RefreshCw size={16} /> Start New Attempt
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="border border-white/10 text-white font-black px-8 h-14 rounded-2xl hover:bg-white/5 active:scale-95 transition-all"
                                >
                                    View Chat Transcript
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
