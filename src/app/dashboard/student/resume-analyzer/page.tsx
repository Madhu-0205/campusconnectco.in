"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "react-hot-toast";
import { 
    FileText, Search, Star, AlertCircle, CheckCircle2, 
    Loader2, UploadCloud, BrainCircuit, X, Sparkles, TrendingUp,
    ChevronRight, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type SectionScores = {
    skills_match: number;
    structure: number;
    content_depth: number;
    keyword_density: number;
};

type AnalysisResult = {
    resume_id?: string;
    score?: number;
    grade?: string;
    skills?: string[];
    missingSkills?: string[];
    suggestions?: string[];
    section_scores?: SectionScores;
    word_count?: number;
    processing_time_ms?: number;
    // Derived display fields
    strengths?: string[];
    weaknesses?: string[];
};

const RESUME_ANALYZE_ENDPOINT = "/api/ai/resume-analyzer";

export default function ResumeAnalyzerPage() {
    const [resumeText, setResumeText] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isParsing, setIsParsing] = useState(false); // Added for file reading
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);

    useEffect(() => {
        if (error) {
            toast.error(error || "Analysis failed. Backend might be busy.");
        }
    }, [error]);

    const processFile = async (selectedFile: File) => {
        setFile(selectedFile);
        setResumeText("");
        setIsParsing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await fetch("/api/ai/parse-file", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error ?? "Failed to read file");
            }

            const data = await res.json();
            setResumeText(data.text);
            toast.success(`Extracted ${data.text.length} characters from ${selectedFile.name}`);
        } catch (err: any) {
            console.error("processFile error:", err);
            setError(err.message ?? "Failed to parse resume");
            setFile(null);
        } finally {
            setIsParsing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
            const isTxt = selectedFile.name.endsWith(".txt");
            
            if (!validTypes.includes(selectedFile.type) && !isTxt) {
                toast.error("Please upload a PDF, DOCX, or TXT file.");
                return;
            }
            processFile(selectedFile);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    const handleAnalyze = async () => {
      // Guard: must have text before calling API
      if (!resumeText || resumeText.trim().length === 0) {
        setError("Please upload your resume or paste its text first.");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Required debug logs as per Step 2
        console.log("resumeText value:", resumeText);
        console.log("resumeText length:", resumeText?.length);
        console.log("Sending resumeText, length:", resumeText.length);

        const response = await fetch("/api/ai/resume-analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            resumeText: resumeText.slice(0, 10000) 
          }),
        });

        // Handle non-OK responses properly
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const message = errData?.error ?? 
            `Server error: ${response.status}`;
          throw new Error(message);
        }

        const result = await response.json();
        setResult(result.data); // NOTE: Modified from setAnalysisResult to match the existing state variable

      } catch (err: any) {
        console.error("handleAnalyze error:", err);
        
        // Show specific error message to user
        if (err.message.includes("API key")) {
          setError("AI service is not configured. Contact support.");
        } else if (err.message.includes("rate limit")) {
          setError("Too many requests. Please wait a moment.");
        } else if (err.message.includes("502") || 
                   err.message.includes("Bad Gateway")) {
          setError("AI service is temporarily unavailable. Please try again in a few seconds.");
        } else {
          setError(err.message ?? "Something went wrong.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    const hasResult = result && result.score !== undefined;

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24 p-4 md:p-10 min-h-screen">
            {/* Header section with gradient */}
            <header className="relative p-4 md:p-12 rounded-5xl overflow-hidden bg-[#0F172A] border border-white/5 shadow-3xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none z-0" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none z-0" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="text-center md:text-left">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-xs font-black uppercase tracking-widest border border-orange-500/20 mb-6"
                  >
                    <BrainCircuit size={14} /> AI Recruitment Intelligence v3.0
                  </motion.div>
                  <h1 className="md:text-7xl font-black text-white tracking-tighter mb-4 leading-tight">
                    ATS <span className="text-transparent bg-linear-to-r from-orange-400 via-blue-400 to-emerald-400">Score Master</span>
                  </h1>
                  <p className="text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
                    Instantly uncover hidden gaps in your resume. Our Silicon Valley trained AI benchmarks you against top-tier tech standards to maximize your job callback rate.
                  </p>
                </div>
                
                <div className="hidden lg:block relative group">
                  <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full transition-all group-hover:scale-110" />
                  <div className="relative w-52 h-52 flex items-center justify-center rounded-[3rem] border-white/10 bg-slate-900/80 backdrop-blur-2xl shadow-2xl overflow-hidden">
                    <Zap size={80} className="text-orange-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
                  </div>
                </div>
              </div>
            </header>

            <div className={`grid grid-cols-1 ${hasResult ? 'xl:grid-cols-2' : 'max-w-4xl mx-auto w-full'} gap-12 items-start transition-all duration-700`}>
                
                {/* ── STEP 1: UPLOAD / INPUT ────────────────────────────────── */}
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <Card className="bg-[#111827]/40 backdrop-blur-xl overflow-hidden border-2 shadow-2xl rounded-4xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="font-black text-white flex items-center gap-3">
                                <div className="p-2 bg-orange-500/20 rounded-xl text-orange-400">
                                    <UploadCloud size={24} />
                                </div>
                                Resume Laboratory
                            </CardTitle>
                            <CardDescription className="text-sm font-medium">
                                Choose how you want our AI to process your professional profile.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            
                            {/* Tabs Simplified */}
                            <div className="flex p-1 bg-black/20 rounded-2xl border border-white/5 gap-1 mb-2">
                                <button 
                                    onClick={() => { setFile(null); setResumeText(""); }}
                                    className={cn(
                                        "flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                        !file ? "bg-orange-600/20 text-orange-400 border border-orange-500/20 shadow-lg" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    Text Paste
                                </button>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={cn(
                                        "flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                        file ? "bg-orange-600/20 text-orange-400 border border-orange-500/20 shadow-lg" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    PDF Upload
                                </button>
                            </div>

                            {file ? (
                                <div 
                                    className="relative p-12 border-orange-500/30 bg-orange-500/5 rounded-3xl flex flex-col items-center justify-center text-center gap-4 transition-all hover:bg-orange-500/10"
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                >
                                    <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-400">
                                        <FileText size={32} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">{file.name}</p>
                                        <p className="font-medium text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis</p>
                                    </div>
                                    <button 
                                        onClick={() => setFile(null)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X size={20} className="text-slate-400" />
                                    </button>
                                </div>
                            ) : (
                                <div 
                                    className={cn(
                                        "relative group transition-all duration-500",
                                        isDragging ? "scale-[1.02]" : ""
                                    )}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                >
                                    <textarea
                                        className="w-full h-80 rounded-4xl border-white/5 bg-black/20 p-4 md:p-8 resize-none focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/40 transition-all text-slate-200 placeholder:text-slate-600 tracking-wide leading-relaxed font-mono custom-scrollbar"
                                        placeholder="Paste your raw resume content here for deep inspection..."
                                        value={resumeText}
                                        onChange={(e) => setResumeText(e.target.value)}
                                    />
                                    {!resumeText && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                                            <UploadCloud size={48} className="text-slate-700 mb-4 group-hover:scale-110 transition-transform duration-500" />
                                            <p className="font-bold uppercase text-[10px] tracking-[0.2em]">Drop PDF or Paste Text</p>
                                        </div>
                                    )}
                                    
                                    {isDragging && (
                                        <div className="absolute inset-0 bg-orange-600/90 backdrop-blur-sm rounded-4xl flex flex-col items-center justify-center border-white/40 animate-in fade-in duration-200">
                                            <UploadCloud size={64} className="text-white animate-bounce mb-4" />
                                            <p className="text-xl font-black uppercase tracking-widest">Drop it here!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".pdf,.docx,.txt" 
                                onChange={handleFileChange} 
                            />
                        </CardContent>
                        <CardFooter className="bg-white/2 py-6 px-8 border-white/5 flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Processing Engine</span>
                                <span className="text-orange-400 font-bold">FastAPI + MLflow Core</span>
                            </div>
                            <Button 
                                onClick={handleAnalyze} 
                                disabled={isLoading || isParsing || !resumeText}
                                size="lg"
                                className="bg-orange-600 hover:bg-orange-500 rounded-2xl shadow-xl shadow-orange-600/20 gap-3 px-10 py-7 text-lg font-black uppercase tracking-wider scale-effect active:scale-95 transition-all w-full md:w-auto"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} /> 
                                        Analyzing...
                                    </>
                                ) : isParsing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} /> 
                                        Reading...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} className="text-emerald-400" />
                                        Initialize Analysis
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="bg-orange-500/5 border-orange-500/10 rounded-4xl overflow-hidden group">
                      <CardContent className="p-4 md:p-8 flex items-start gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 group-hover:rotate-12 transition-transform">
                          <AlertCircle size={24} />
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-black uppercase text-xs tracking-[0.15em] mb-1">
                            ATS Compliance Protocol
                          </h4>
                          <p className="text-slate-400 leading-relaxed font-medium">
                            Modern ATS (Applicant Tracking Systems) look for quantification. Ensure your resume highlights <span className="text-white font-bold italic">measurable impacts</span> (e.g., &quot;Increased sales by 40%&quot;) rather than just duties.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                </div>

                {/* ── STEP 2: STREAMING RESULTS ─────────────────────────────── */}
                <div className="space-y-8 min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {!hasResult && !isLoading ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full min-h-[600px] border-white/5 rounded-5xl flex flex-col items-center justify-center p-12 text-center"
                            >
                                <div className="w-24 h-24 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-8 relative">
                                    <div className="absolute inset-0 bg-orange-500/5 blur-xl rounded-full" />
                                    <Search size={40} className="text-slate-700 relative z-10" />
                                </div>
                                <h3 className="font-black text-slate-500 uppercase tracking-widest mb-4">Awaiting Signal</h3>
                                <p className="text-slate-600 max-w-sm font-medium leading-relaxed">
                                    Load your resume data into the laboratory terminal to begin the deep intelligence scanning process.
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div 
                                className="space-y-8"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                {/* Score Indicator */}
                                <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-3xl rounded-5xl relative overflow-hidden group">
                                    <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full" />
                                    <CardContent className="p-10 flex flex-col md:flex-row items-center gap-12 relative z-10">
                                        <div className="relative flex items-center justify-center">
                                            <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full" />
                                            <svg className="w-48 h-48 transform -rotate-90">
                                                <circle cx="96" cy="96" r="86" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                                                <motion.circle 
                                                    cx="96" cy="96" r="86" stroke="currentColor" strokeWidth="12" fill="transparent" 
                                                    strokeDasharray={540} 
                                                    initial={{ strokeDashoffset: 540 }}
                                                    animate={{ strokeDashoffset: 540 - (540 * (result?.score || 0)) / 100 }}
                                                    transition={{ duration: 2, ease: "easeOut" }}
                                                    className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="font-black text-white tracking-tighter tabular-nums drop-shadow-lg">
                                                    {result?.score ?? "0"}
                                                </span>
                                                {result?.grade && (
                                                    <span className="font-black text-emerald-400 mt-1">{result.grade}</span>
                                                )}
                                                <span className="font-black text-emerald-400 uppercase tracking-[0.3em] mt-1">ATS Rating</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 space-y-6 text-center md:text-left">
                                            <div className="space-y-2">
                                                <motion.h3 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="font-black text-white"
                                                >
                                                    Analysis Diagnostic
                                                </motion.h3>
                                                <p className="font-medium text-lg leading-relaxed">
                                                    {result?.score && result.score >= 80 ? 
                                                        "Exceptional. Your profile demonstrates high-impact outcomes and optimal formatting." : 
                                                        (result?.score && result.score >= 60 ? 
                                                            "Competitive. You have a solid core, but optimization is needed for elite roles." : 
                                                            "Developing. Critical structural gaps are preventing your resume from passing automated screenings.")
                                                    }
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                                <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 shadow-inner">
                                                    <TrendingUp size={16} className="text-emerald-400" />
                                                    <div className="flex flex-col text-left">
                                                        <span className="font-black text-slate-500 uppercase tracking-widest">Market Status</span>
                                                        <span className="font-black text-white uppercase tracking-widest">VALIDATED</span>
                                                    </div>
                                                </div>
                                                <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 shadow-inner">
                                                    <Sparkles size={16} className="text-orange-400" />
                                                    <div className="flex flex-col text-left">
                                                        <span className="font-black text-slate-500 uppercase tracking-widest">AI Confidence</span>
                                                        <span className="font-black text-white uppercase tracking-widest">REAL-TIME</span>
                                                    </div>
                                                </div>
                                                {result?.processing_time_ms && (
                                                    <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 shadow-inner">
                                                        <Zap size={16} className="text-amber-400" />
                                                        <div className="flex flex-col text-left">
                                                            <span className="font-black text-slate-500 uppercase tracking-widest">Speed</span>
                                                            <span className="font-black text-white uppercase tracking-widest">{result.processing_time_ms.toFixed(0)}ms</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Section sub-scores */}
                                            {result?.section_scores && (
                                                <div className="space-y-3 pt-2">
                                                    {Object.entries(result.section_scores).map(([key, val]) => (
                                                        <div key={key} className="flex items-center gap-3">
                                                            <span className="text-slate-500 uppercase tracking-widest w-28 shrink-0">{key.replace("_", " ")}</span>
                                                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${val}%` }}
                                                                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                                                                    className="h-full bg-emerald-500 rounded-full"
                                                                />
                                                            </div>
                                                            <span className="font-black tabular-nums w-10 text-right">{Math.round(val)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                    {/* Strengths */}
                                    <div className="space-y-4">
                                        <h4 className="font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-3 px-2">
                                            <CheckCircle2 size={18} /> High Impact Strengths
                                        </h4>
                                        <div className="space-y-3">
                                            {result?.strengths?.map((str, idx) => (
                                                <motion.div 
                                                    key={idx} 
                                                    initial={{ opacity: 0, x: -20 }} 
                                                    animate={{ opacity: 1, x: 0 }} 
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="p-5 rounded-2xl bg-white/2 border border-white/5 font-semibold text-slate-300 leading-relaxed hover:bg-white/5 hover:border-emerald-500/20 transition-all flex items-start gap-4 shadow-sm"
                                                >
                                                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                                        <ChevronRight size={14} strokeWidth={3} />
                                                    </div>
                                                    {str}
                                                </motion.div>
                                            ))}
                                            {isLoading && (!result?.strengths || result.strengths.length === 0) && (
                                              <div className="p-4 md:p-8 border border-white/5 rounded-2xl animate-pulse flex items-center justify-center bg-white/2">
                                                <div className="flex gap-2">
                                                  <div className="w-2 h-2 rounded-full bg-emerald-500/20 animate-bounce" />
                                                  <div className="w-2 h-2 rounded-full bg-emerald-500/20 animate-bounce delay-75" />
                                                  <div className="w-2 h-2 rounded-full bg-emerald-500/20 animate-bounce delay-150" />
                                                </div>
                                              </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Weaknesses */}
                                    <div className="space-y-4">
                                        <h4 className="font-black text-rose-400 uppercase tracking-[0.2em] flex items-center gap-3 px-2">
                                            <AlertCircle size={18} /> Critical Fail Points
                                        </h4>
                                        <div className="space-y-3">
                                            {result?.weaknesses?.map((weak, idx) => (
                                                <motion.div 
                                                    key={idx} 
                                                    initial={{ opacity: 0, x: -20 }} 
                                                    animate={{ opacity: 1, x: 0 }} 
                                                    transition={{ delay: 0.2 + idx * 0.1 }}
                                                    className="p-5 rounded-2xl bg-white/2 border border-white/5 font-semibold text-slate-300 leading-relaxed hover:bg-white/5 hover:border-rose-500/20 transition-all flex items-start gap-4 shadow-sm"
                                                >
                                                    <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                                                        <X size={14} strokeWidth={3} />
                                                    </div>
                                                    {weak}
                                                </motion.div>
                                            ))}
                                            {isLoading && (!result?.weaknesses || result.weaknesses.length === 0) && (
                                              <div className="p-4 md:p-8 border border-white/5 rounded-2xl animate-pulse flex items-center justify-center bg-white/2">
                                                <div className="flex gap-2">
                                                  <div className="w-2 h-2 rounded-full bg-rose-500/20 animate-bounce" />
                                                  <div className="w-2 h-2 rounded-full bg-rose-500/20 animate-bounce delay-75" />
                                                  <div className="w-2 h-2 rounded-full bg-rose-500/20 animate-bounce delay-150" />
                                                </div>
                                              </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Missing Skills */}
                                <div className="space-y-4 pt-4">
                                    <h4 className="font-black text-orange-400 uppercase tracking-[0.2em] flex items-center gap-3 px-2">
                                        Target Market Skills Gap
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {result?.missingSkills?.map((skill, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: 0.4 + idx * 0.05 }}
                                            >
                                                <Badge variant="premium" className="px-5 py-3 rounded-2xl text-[11px] font-black tracking-widest uppercase border-white/10 shadow-lg hover:shadow-orange-500/20 hover:border-orange-500/30 transition-all cursor-default flex items-center gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                                                    {skill}
                                                </Badge>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Suggestions */}
                                <Card className="border-white/5 bg-[#111827] shadow-3xl rounded-5xl overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] pointer-events-none" />
                                    <CardContent className="p-10">
                                        <h4 className="font-black text-white mb-8 flex items-center gap-4">
                                            <Star className="text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" size={32} /> 
                                            Strategic Battle Plan
                                        </h4>
                                        <div className="space-y-6">
                                            {result?.suggestions?.map((sug, idx) => (
                                                <motion.div 
                                                    key={idx} 
                                                    className="flex gap-6 group/item"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.6 + idx * 0.1 }}
                                                >
                                                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center font-black text-orange-400 shrink-0 border border-white/5 group-hover/item:bg-orange-600 group-hover/item:text-white group-hover/item:scale-110 transition-all duration-300">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="space-y-1 pt-1">
                                                       <p className="text-base leading-relaxed font-bold group-hover/item:text-white transition-colors">
                                                          {sug}
                                                       </p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
