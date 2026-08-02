"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    X, Send, Sparkles, Loader2, Minimize2, Maximize2,
    Briefcase, FileText, Users, CreditCard, Brain,
    ChevronRight, RotateCcw, History, Trash2, Plus, type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface QuickAction {
    icon: LucideIcon;
    label: string;
    path: string;
    color: string;
}

// ─── Page label helper ────────────────────────────────────────────────────────

const getPageLabel = (pathname: string): string => {
    const map: Record<string, string> = {
        "/": "Landing Page",
        "/browse-gigs": "Browse Gigs",
        "/post-gig": "Post a Gig",
        "/network": "Networking / Student Discovery",
        "/messages": "Messages",
        "/payments": "Payments / Earnings",
        "/dashboard/student": "Student Dashboard",
        "/dashboard/student/profile": "My Profile",
        "/dashboard/student/smartmatch": "AI SmartMatch",
        "/dashboard/student/resume-analyzer": "Resume Analyser",
        "/dashboard/student/career-copilot": "Career Copilot / AI Chat",
        "/dashboard/student/internships": "Internships",
        "/dashboard/student/gigs": "My Gigs",
        "/dashboard": "Dashboard",
        "/dashboard/founder": "Founder Dashboard",
    };
    for (const [key, label] of Object.entries(map)) {
        if (pathname === key || pathname.startsWith(key + "/")) return label;
    }
    return pathname;
};

// ─── Context-aware welcome messages ──────────────────────────────────────────

const getWelcome = (pathname: string): { text: string; suggestions: string[] } => {
    if (pathname.includes("resume-analyzer"))
        return {
            text: "📄 I see you're on the **Resume Analyser**! Upload your resume and I'll explain how to improve your ATS score. What role are you targeting?",
            suggestions: ["How does ATS scoring work?", "What keywords should I add?", "Analyze my resume for SDE roles"],
        };
    if (pathname.includes("smartmatch"))
        return {
            text: "🎯 You're on **SmartMatch**! I can explain why certain gigs match your profile or help you improve your match score. What's your target role?",
            suggestions: ["Why is my match score low?", "How do I get 90%+ matches?", "Show me top React gigs"],
        };
    if (pathname.includes("career-copilot"))
        return {
            text: "🗺️ Welcome to **Career Copilot**! Tell me your dream role and I'll build a week-by-week roadmap just for you.",
            suggestions: ["I want to be a frontend dev", "Roadmap for Data Science", "How do I get into a YC startup?"],
        };
    if (pathname.includes("browse-gigs") || pathname.includes("gigs"))
        return {
            text: "💼 Browsing **gigs**? I can help you find the best ones for your skills, or explain how escrow protection works!",
            suggestions: ["Find React gigs under ₹2000", "How does escrow work?", "What gigs pay the most?"],
        };
    if (pathname.includes("network"))
        return {
            text: "🤝 Exploring **Networking**! I can help you connect with the right students or explain how to stand out on your profile.",
            suggestions: ["How do I get more connections?", "Find students who know Python", "How to make my profile stand out?"],
        };
    if (pathname.includes("payments"))
        return {
            text: "💳 Checking your **Payments**? I can help you understand escrow, withdrawals, and how platform fees work.",
            suggestions: ["How do I withdraw earnings?", "What is the platform fee?", "How long does escrow take?"],
        };
    if (pathname.includes("dashboard"))
        return {
            text: "🚀 Hey! I'm your **CampusConnect AI** — your personal career guide. What do you want to achieve today?",
            suggestions: ["Build my career roadmap", "Find matching internships", "Improve my profile"],
        };
    return {
        text: "👋 Hey! I'm **CampusConnect AI**. I help Indian college students launch their careers — roadmaps, gigs, resume tips, and more. How can I help?",
        suggestions: ["What is CampusConnect?", "Find internships for me", "Build a learning roadmap"],
    };
};

// ─── Quick actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS: QuickAction[] = [
    { icon: Brain, label: "SmartMatch", path: "/dashboard/student/smartmatch", color: "text-purple-400" },
    { icon: Briefcase, label: "Find Gigs", path: "/browse-gigs", color: "text-teal-400" },
    { icon: FileText, label: "Resume AI", path: "/dashboard/student/resume-analyzer", color: "text-green-400" },
    { icon: Users, label: "Network", path: "/network", color: "text-amber-400" },
    { icon: CreditCard, label: "Payments", path: "/payments", color: "text-coral-400" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AIServiceAgent() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const [showPulse, setShowPulse] = useState(true);

    // AI Chat persistence
    const [sessions, setSessions] = useState<any[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    const pathname = usePathname();
    const router = useRouter();

    const loadSessions = useCallback(async () => {
        // Only load if Supabase authentication cookie exists to avoid 401 console errors for anonymous sessions
        const hasAuthCookie = typeof document !== "undefined" && document.cookie.split(";").some(c => c.trim().startsWith("sb-"));
        if (!hasAuthCookie) return;

        setIsLoadingSessions(true);
        try {
            const res = await fetch("/api/ai/copilot/sessions");
            if (res.status === 401) return;
            const data = await res.json();
            if (data?.success) {
                setSessions(data.data);
            }
        } catch {
            // Quiet fail
        } finally {
            setIsLoadingSessions(false);
        }
    }, []);

    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    // Hide pulse after 6s
    useEffect(() => {
        const t = setTimeout(() => setShowPulse(false), 6000);
        return () => clearTimeout(t);
    }, []);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && !isMinimized) {
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [isOpen, isMinimized]);

    // Welcome message on first open
    const handleOpen = () => {
        setIsOpen(true);
        if (!hasOpened) {
            setHasOpened(true);
            const welcome = getWelcome(pathname);
            setTimeout(() => {
                setMessages([{
                    id: "welcome",
                    role: "assistant",
                    content: welcome.text,
                    timestamp: new Date(),
                }]);
                // Add suggestions as a special system message
                setMessages(prev => [...prev, {
                    id: "suggestions",
                    role: "assistant",
                    content: `__SUGGESTIONS__${JSON.stringify(welcome.suggestions)}`,
                    timestamp: new Date(),
                }]);
            }, 300);
        }
    };

    // Update welcome on route change
    useEffect(() => {
        if (isOpen && messages.length > 0) {
            // do nothing — don't reset chat on navigation
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const sendMessage = useCallback(async (text?: string) => {
        const userText = (text || inputValue).trim();
        if (!userText || isStreaming) return;

        setInputValue("");

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: userText,
            timestamp: new Date(),
        };

        const assistantId = (Date.now() + 1).toString();
        const assistantMsg: Message = {
            id: assistantId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
        };

        setMessages(prev => {
            // Filter out suggestion bubbles
            const filtered = prev.filter(m => !m.content.startsWith("__SUGGESTIONS__"));
            return [...filtered, userMsg, assistantMsg];
        });
        setIsStreaming(true);

        // Build history (filter suggestion messages, limit to last 10)
        const history = messages
            .filter(m => !m.content.startsWith("__SUGGESTIONS__"))
            .slice(-10)
            .map(m => ({ role: m.role, content: m.content }));

        abortRef.current = new AbortController();

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...history, { role: "user", content: userText }],
                    context: { mode: "general", studentName: "Student", currentPage: getPageLabel(pathname) },
                }),
                signal: abortRef.current.signal,
            });

            if (!res.ok || !res.body) {
                throw new Error("Failed to reach AI");
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let fullText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6).trim();
                        if (data === "[DONE]") break;
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.delta) {
                                fullText += parsed.delta;
                                setMessages(prev =>
                                    prev.map(m =>
                                        m.id === assistantId
                                            ? { ...m, content: fullText }
                                            : m
                                    )
                                );
                            }
                        } catch {
                            // ignore parse errors
                        }
                    }
                }
            }

            // Stream completed! Save the final messages to the DB
            const finalAssistantMsg: Message = {
                id: assistantId,
                role: "assistant",
                content: fullText,
                timestamp: new Date()
            };
            const finalMessages = [
                ...messages.filter(m => !m.content.startsWith("__SUGGESTIONS__")),
                userMsg,
                finalAssistantMsg
            ];

            try {
                const saveRes = await fetch("/api/ai/copilot/sessions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: activeSessionId || undefined,
                        messages: finalMessages.map(m => ({
                            id: m.id,
                            role: m.role,
                            content: m.content,
                            timestamp: m.timestamp
                        })),
                    }),
                });
                const saveResult = await saveRes.json();
                if (saveResult.success) {
                    if (!activeSessionId) {
                        setActiveSessionId(saveResult.data.id);
                    }
                    loadSessions();
                }
            } catch (dbErr) {
                console.error("DB Save failed:", dbErr);
            }
        } catch (err: unknown) {
            if ((err as { name?: string })?.name !== "AbortError") {
                setMessages(prev =>
                    prev.map(m =>
                        m.id === assistantId
                            ? { ...m, content: "⚠️ I couldn't reach the AI right now. Please try again in a moment." }
                            : m
                    )
                );
            }
        } finally {
            setIsStreaming(false);
        }
    }, [inputValue, isStreaming, messages, pathname, activeSessionId, loadSessions]);

    const selectSession = useCallback((session: any) => {
        setActiveSessionId(session.id);
        // Map messages back with Date timestamps
        const mappedMsgs = (session.messages || []).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
        }));
        setMessages(mappedMsgs);
        setShowHistory(false);
        setIsMinimized(false);
    }, []);

    const deleteSession = useCallback(async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/ai/copilot/sessions?id=${sessionId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                if (activeSessionId === sessionId) {
                    setActiveSessionId(null);
                    setMessages([]);
                }
                loadSessions();
            }
        } catch (err) {
            console.error("Failed to delete session", err);
        }
    }, [activeSessionId, loadSessions]);

    const startNewSession = useCallback(() => {
        setActiveSessionId(null);
        setMessages([]);
        setShowHistory(false);
        const welcome = getWelcome(pathname);
        setMessages([
            {
                id: "welcome",
                role: "assistant",
                content: welcome.text,
                timestamp: new Date(),
            },
            {
                id: "suggestions",
                role: "assistant",
                content: `__SUGGESTIONS__${JSON.stringify(welcome.suggestions)}`,
                timestamp: new Date(),
            }
        ]);
    }, [pathname]);

    const handleReset = () => {
        abortRef.current?.abort();
        setIsStreaming(false);
        setInputValue("");
        startNewSession();
    };

    const handleClose = () => {
        abortRef.current?.abort();
        setIsOpen(false);
        setIsMinimized(false);
        setShowHistory(false);
    };

    // ─── Render message content (with basic markdown) ─────────────────────────

    const renderContent = (content: string) => {
        // Bold **text**
        const parts = content.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) =>
            part.startsWith("**") && part.endsWith("**")
                ? <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
                : <span key={i}>{part}</span>
        );
    };

    const suggestions = (() => {
        const last = messages.findLast(m => m.content.startsWith("__SUGGESTIONS__"));
        if (!last) return null;
        try {
            return JSON.parse(last.content.replace("__SUGGESTIONS__", "")) as string[];
        } catch {
            return null;
        }
    })();

    // ─── JSX ──────────────────────────────────────────────────────────────────

    return (
        <div className="fixed bottom-6 right-6 z-9999 flex flex-col items-end pointer-events-none select-none">

            {/* ── Chat Panel ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="chat-panel"
                        initial={{ opacity: 0, y: 16, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.96 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className={`pointer-events-auto mb-4 flex flex-col rounded-2xl overflow-hidden border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.6)] bg-[#0D1120] backdrop-blur-xl transition-all duration-300 ${isMinimized ? "w-80" : "w-[calc(100vw-3rem)] sm:w-[380px] md:w-[400px] h-[70vh] min-h-[400px] max-h-[620px]" }`}
                    >
                        {/* Header */}
                        <div
                            className="h-[60px] shrink-0 flex items-center justify-between px-4"
                            style={{
                                background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 50%, #0EA5E9 100%)",
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                                    <Sparkles size={16} className="text-white" />
                                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-[#0D1120]" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm leading-none">CampusConnect AI</p>
                                    <p className="text-[10px] mt-0.5">
                                        {isStreaming ? "Typing…" : "Online · Powered by Groq"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setShowHistory(h => !h)}
                                    title="View Chat History"
                                    className={`p-1.5 hover:bg-white/15 rounded-lg transition-colors ${showHistory ? 'text-white bg-white/10' : 'text-white/70 hover:text-white'}`}
                                >
                                    <History size={14} />
                                </button>
                                <button
                                    onClick={handleReset}
                                    title="Reset chat"
                                    className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white/70 hover:text-white"
                                >
                                    <RotateCcw size={14} />
                                </button>
                                <button
                                    onClick={() => setIsMinimized(v => !v)}
                                    className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white/70 hover:text-white"
                                >
                                    {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white/70 hover:text-white"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {showHistory ? (
                                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#0D1120] custom-scrollbar">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-xs text-slate-300">Previous Conversations</h3>
                                            <button
                                                onClick={startNewSession}
                                                className="flex items-center gap-1 text-[10px] font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 active:scale-95 transition-all"
                                            >
                                                <Plus size={10} /> New Chat
                                            </button>
                                        </div>
                                        {isLoadingSessions ? (
                                            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-purple-500" /></div>
                                        ) : sessions.length === 0 ? (
                                            <div className="text-center py-8 text-xs text-slate-500 italic">No saved conversations yet. Start a new one!</div>
                                        ) : (
                                            sessions.map((s) => (
                                                <div
                                                    key={s.id}
                                                    onClick={() => selectSession(s)}
                                                    className={`group w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${activeSessionId === s.id ? 'bg-purple-600/15 border-purple-500/40' : 'bg-[#131929] border-white/5 hover:border-white/15 hover:bg-white/2'}`}
                                                >
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <p className="font-bold text-xs text-slate-200 truncate group-hover:text-purple-300 transition-colors">
                                                            {s.title || "Untitled Chat"}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 mt-1 font-medium">
                                                            {new Date(s.updatedAt || s.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => deleteSession(s.id, e)}
                                                        className="p-1 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Delete conversation"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {/* Quick Nav Pills */}
                                        <div className="shrink-0 flex gap-2 px-3 py-2.5 overflow-x-auto scrollbar-none border-white/5 bg-[#0A0F1E]">
                                            {QUICK_ACTIONS.map((a, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => { router.push(a.path); setIsOpen(false); }}
                                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 transition-all whitespace-nowrap shrink-0 animate-in fade-in"
                                                >
                                                    {(() => { const Icon = a.icon; return <Icon size={12} className={a.color} />; })()}
                                                    <span className="text-slate-300 font-medium text-xs">{a.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Messages */}
                                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
                                            {messages.filter(m => !m.content.startsWith("__SUGGESTIONS__")).map((msg) => (
                                                <motion.div
                                                    key={msg.id}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                                >
                                                    {/* Avatar */}
                                                    <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-bold mt-0.5 ${msg.role === "user" ? "bg-purple-600/30 border border-purple-500/20" : "bg-linear-to-br from-purple-600 to-blue-600 text-white" }`}>
                                                        {msg.role === "user" ? "U" : <Sparkles size={12} />}
                                                    </div>

                                                    {/* Bubble */}
                                                    <div className={`max-w-[82%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                                                        <div className={`px-3.5 py-2.5 leading-relaxed rounded-2xl ${msg.role === "user" ? "bg-purple-600 shadow-[0_0_20px_rgba(124,58,237,0.3)] text-white rounded-tr-sm" : "bg-[#131929] text-slate-200 rounded-tl-sm border border-white/8 text-xs" }`}>
                                                            {msg.role === "assistant" && msg.content === "" ? (
                                                                <span className="flex gap-1 items-center py-0.5">
                                                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                                                </span>
                                                            ) : (
                                                                <span className="whitespace-pre-wrap">{renderContent(msg.content)}</span>
                                                            )}
                                                        </div>
                                                        <span className="text-[9px] text-slate-600 mt-1 px-1">
                                                            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ))}

                                            {/* Suggestion pills (appear after welcome) */}
                                            {suggestions && !isStreaming && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex flex-wrap gap-2 ml-9"
                                                >
                                                    {suggestions.map((s, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => sendMessage(s)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-[10px] font-medium transition-all hover:border-purple-400/40"
                                                        >
                                                            <ChevronRight size={11} className="text-purple-400" />
                                                            {s}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}

                                            <div ref={messagesEndRef} className="h-1" />
                                        </div>

                                        {/* Input */}
                                        <div className="shrink-0 p-3 bg-[#0D1120] border-t border-white/5">
                                            <form
                                                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                                                className="flex items-center gap-2 bg-[#131929] border border-white/10 rounded-xl px-3 py-2 focus-within:border-purple-500/50 transition-colors"
                                            >
                                                <input
                                                    ref={inputRef}
                                                    type="text"
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    placeholder="Ask anything about your career…"
                                                    className="flex-1 bg-transparent text-white placeholder:text-slate-500 focus:outline-none text-xs"
                                                    disabled={isStreaming}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!inputValue.trim() || isStreaming}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors disabled:opacity-40 disabled:bg-white/5 shrink-0"
                                                >
                                                    {isStreaming
                                                        ? <Loader2 size={14} className="text-white animate-spin" />
                                                        : <Send size={14} className="text-white" />
                                                    }
                                                </button>
                                            </form>
                                            <p className="text-[10px] text-slate-600 mt-1.5 text-center">
                                                Powered by Groq · llama-3.3-70b
                                            </p>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Trigger Button ── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        key="trigger"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.07 }}
                        whileTap={{ scale: 0.93 }}
                        onClick={handleOpen}
                        className="pointer-events-auto relative w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(124,58,237,0.5)] hover:shadow-[0_12px_40px_rgba(124,58,237,0.7)] transition-shadow duration-300 border border-white/10"
                        style={{
                            background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 50%, #0EA5E9 100%)",
                        }}
                    >
                        <Sparkles size={22} className="text-white" />

                        {/* Live indicator */}
                        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-[#0A0F1E] rounded-full">
                            {showPulse && (
                                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                            )}
                        </span>

                        {/* Tooltip */}
                        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-[#131929] border border-white/10 text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none shadow-xl transition-opacity">
                            AI Career Guide
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
