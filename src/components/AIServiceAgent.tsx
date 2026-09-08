"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  X, Send, Sparkles, Loader2, Minimize2, Maximize2,
  Briefcase, FileText, Users, Brain,
  ChevronRight, RotateCcw, RefreshCw, type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface QuickAction {
  icon: LucideIcon;
  label: string;
  path: string;
  color: string;
}

// ─── Page Label Helper ────────────────────────────────────────────────────────

const getPageLabel = (pathname: string): string => {
  if (pathname === "/") return "Homepage";
  if (pathname === "/opportunities") return "Opportunities Discovery";
  if (pathname.startsWith("/gigs/")) return "Gig Details";
  if (pathname.startsWith("/internships/")) return "Internship Details";
  if (pathname.includes("resume-analyzer")) return "Resume Analyser";
  if (pathname.includes("smartmatch")) return "AI SmartMatch";
  if (pathname.includes("career-copilot")) return "Career Copilot";
  if (pathname.includes("applications")) return "Application Tracker";
  if (pathname.includes("profile")) return "Student Profile";
  if (pathname === "/network") return "CampusConnectCo Network";
  if (pathname === "/messages") return "Messages";
  if (pathname === "/payments") return "Payments & Milestones";
  if (pathname.startsWith("/dashboard/student")) return "Student Dashboard";
  if (pathname.startsWith("/dashboard/founder") || pathname.startsWith("/dashboard/client")) return "Client & Founder Hub";
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  return pathname;
};

// ─── Context-Aware Welcome & Suggestions ──────────────────────────────────────

interface ContextWelcome {
  text: string;
  suggestions: string[];
}

const getWelcome = (pathname: string): ContextWelcome => {
  // Opportunity Details - Gig
  if (pathname.startsWith("/gigs/")) {
    return {
      text: "💼 You're viewing a **student gig**! I can clarify deliverable expectations, explain milestone payments, or give tips on writing a standout application.",
      suggestions: [
        "Tips for a winning gig proposal",
        "How do milestone deliverables work?",
        "What questions should I ask the client?",
      ],
    };
  }

  // Opportunity Details - Internship
  if (pathname.startsWith("/internships/")) {
    return {
      text: "🎓 You're viewing an **internship opportunity**! I can help you tailor your application, prepare for potential interviews, or explain the role.",
      suggestions: [
        "How should I tailor my resume for this role?",
        "What do hiring managers look for in interns?",
        "Common interview questions for tech interns",
      ],
    };
  }

  // Opportunities Discovery / Explorer
  if (pathname === "/opportunities" || pathname.startsWith("/opportunities")) {
    return {
      text: "🔍 You're exploring **CampusConnectCo Opportunities**! You can search by keywords, filter by gigs or internships, or explore nearby roles on the map.",
      suggestions: [
        "How do I find gigs near my location?",
        "What tech skills are most in demand right now?",
        "How does the map view help me find roles?",
      ],
    };
  }

  // Resume Analyzer
  if (pathname.includes("resume-analyzer")) {
    return {
      text: "📄 You're on the **Resume Analyser**! I can explain ATS scoring, suggest high-impact keywords, and guide your project descriptions.",
      suggestions: [
        "How does ATS resume scoring work?",
        "Which action verbs strengthen project points?",
        "How should I structure a student tech resume?",
      ],
    };
  }

  // SmartMatch
  if (pathname.includes("smartmatch")) {
    return {
      text: "🎯 You're on **SmartMatch**! I can explain how skill-matching works or give advice on closing skill gaps for higher compatibility.",
      suggestions: [
        "How does SmartMatch calculate compatibility?",
        "How can I boost my match score for top gigs?",
        "Which skills pair best with React and Node.js?",
      ],
    };
  }

  // Career Copilot
  if (pathname.includes("career-copilot")) {
    return {
      text: "🗺️ Welcome to **Career Copilot**! Share your target role, and I can suggest a structured weekly learning roadmap.",
      suggestions: [
        "Roadmap for Full-Stack Web Development",
        "How to prepare for AI/ML engineering roles",
        "What portfolio projects impress recruiters?",
      ],
    };
  }

  // Applications Tracker
  if (pathname.includes("applications")) {
    return {
      text: "📋 You're viewing your **Application Tracker**! Need advice on follow-up etiquette or preparing for an interview?",
      suggestions: [
        "What should I do while waiting on an application?",
        "How to follow up professionally with a client",
        "How to prepare when a proposal is accepted",
      ],
    };
  }

  // Profile
  if (pathname.includes("profile")) {
    return {
      text: "✨ You're reviewing your **Student Profile**! A complete profile with verified GitHub links and highlighted skills gets significantly more client views.",
      suggestions: [
        "What makes a student profile stand out to clients?",
        "How many skills should I feature?",
        "How to write an engaging student bio",
      ],
    };
  }

  // Network
  if (pathname === "/network" || pathname.startsWith("/network")) {
    return {
      text: "🤝 Welcome to the **CampusConnectCo Network**! Connect with fellow student builders, developers, and designers across colleges in India.",
      suggestions: [
        "How to start a friendly networking conversation",
        "Finding student collaborators for a hackathon",
        "How to showcase my work to fellow students",
      ],
    };
  }

  // Payments / Milestones
  if (pathname === "/payments" || pathname.startsWith("/payments")) {
    return {
      text: "💳 Checking **Payments & Milestones**? I can explain milestone releases, deliverable verification, and platform guidelines.",
      suggestions: [
        "How does milestone deliverable protection work?",
        "When is milestone payment released?",
        "What if a client requests extra revisions?",
      ],
    };
  }

  // Dashboard
  if (pathname.startsWith("/dashboard")) {
    return {
      text: "🚀 Welcome to your **Dashboard**! I'm CampusConnectCo AI. How can I help you advance your career and discover opportunities today?",
      suggestions: [
        "Find high-match opportunities for my skills",
        "How to build a competitive student portfolio",
        "Tips for completing freelance milestones on time",
      ],
    };
  }

  // Homepage / Default
  return {
    text: "👋 Welcome to **CampusConnectCo**! I'm your AI career and opportunity assistant. How can I help you explore student gigs, internships, or platform tools today?",
    suggestions: [
      "What is CampusConnectCo?",
      "How do student gigs and milestones work?",
      "How do I find opportunities near me?",
    ],
  };
};

// ─── Quick Actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS: QuickAction[] = [
  { icon: Briefcase, label: "Opportunities", path: "/opportunities", color: "text-emerald-500" },
  { icon: Brain, label: "SmartMatch", path: "/dashboard/student/smartmatch", color: "text-teal-500" },
  { icon: FileText, label: "Resume Analyser", path: "/dashboard/student/resume-analyzer", color: "text-green-500" },
  { icon: Users, label: "Network", path: "/network", color: "text-emerald-600" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AIServiceAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [aiStatus, setAiStatus] = useState<"ready" | "thinking" | "unavailable">("ready");
  const [hasOpened, setHasOpened] = useState(false);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [messages, prefersReducedMotion]);

  // Focus management
  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized]);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Welcome message when opened
  const handleOpen = () => {
    setIsOpen(true);
    if (!hasOpened) {
      setHasOpened(true);
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
        },
      ]);
    }
  };

  const handleClose = () => {
    abortRef.current?.abort();
    setIsOpen(false);
    setIsMinimized(false);
    // Return focus to trigger button for screen readers / keyboard users
    setTimeout(() => triggerRef.current?.focus(), 100);
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setAiStatus("ready");
    setInputValue("");
    setLastFailedQuery(null);
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
      },
    ]);
  };

  // ─── Send Message via Unified Phase 7A Puter-Only Architecture ─────────────

  const sendMessage = useCallback(async (text?: string) => {
    const userText = (text || inputValue).trim();
    if (!userText || isStreaming) return;

    setInputValue("");
    setLastFailedQuery(null);

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date(),
    };

    const assistantId = `a-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const filtered = prev.filter((m) => !m.content.startsWith("__SUGGESTIONS__"));
      return [...filtered, userMsg, assistantMsg];
    });

    setIsStreaming(true);
    setAiStatus("thinking");

    const history = messages
      .filter((m) => !m.content.startsWith("__SUGGESTIONS__") && !m.isError)
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content }));

    abortRef.current = new AbortController();

    try {
      let fullText = "";

      // Post to unified /api/ai/chat endpoint (Puter-only with rate limiting & scrubbing)
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content: userText }],
          context: {
            mode: "general",
            currentPage: getPageLabel(pathname),
          },
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(res.status === 429 ? "Rate limit reached. Please wait a moment." : "Failed to connect to AI");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const data = line.slice(5).trim();
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.delta) {
                fullText += parsed.delta;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, content: fullText } : m))
                );
              }
            } catch {
              // Ignore partial JSON parse chunks
            }
          }
        }
      }

      setAiStatus("ready");
    } catch (err: unknown) {
      if ((err as { name?: string })?.name !== "AbortError") {
        setAiStatus("unavailable");
        setLastFailedQuery(userText);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  isError: true,
                  content:
                    "⚠️ CampusConnectCo AI is momentarily unavailable. Please check your connection or retry in a moment.",
                }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
    }
  }, [inputValue, isStreaming, messages, pathname]);

  // ─── Render Message Content with Basic Markdown ───────────────────────────

  const renderContent = (content: string) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const suggestions = (() => {
    const last = messages.findLast((m) => m.content.startsWith("__SUGGESTIONS__"));
    if (!last) return null;
    try {
      return JSON.parse(last.content.replace("__SUGGESTIONS__", "")) as string[];
    } catch {
      return null;
    }
  })();

  // ─── Render JSX ───────────────────────────────────────────────────────────

  return (
    <aside
      aria-label="CampusConnectCo AI Assistant"
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5rem)] right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-none select-none"
    >
      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            id="campusconnect-ai-panel"
            role="dialog"
            aria-label="CampusConnectCo AI Assistant Chat"
            aria-modal="false"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`pointer-events-auto mb-3 flex flex-col rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.18)] bg-[#FAFCFA] dark:bg-slate-900 transition-all duration-200 ${
              isMinimized
                ? "w-80"
                : "w-[calc(100vw-2rem)] max-w-97.5 sm:w-95 md:w-100 h-[min(560px,calc(100vh-140px))] max-h-150"
            }`}
          >
            {/* Header: CampusConnectCo Vivid Green Theme */}
            <header
              className="h-14.5 shrink-0 flex items-center justify-between px-4"
              style={{
                background: "linear-gradient(135deg, #1FA971 0%, #15803D 55%, #0D9488 100%)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
                  <Sparkles size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-sm leading-none text-white tracking-tight">CampusConnectCo AI</h2>
                  <p className="text-[10.5px] mt-1 text-emerald-50/90 font-medium">
                    {isStreaming
                      ? "Thinking… · Powered by Puter"
                      : aiStatus === "unavailable"
                      ? "AI Temporarily Unavailable"
                      : "AI Ready · Powered by Puter"}
                  </p>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white/80 hover:text-white cursor-pointer"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => setIsMinimized((v) => !v)}
                  title={isMinimized ? "Expand assistant" : "Minimize assistant"}
                  aria-label={isMinimized ? "Expand assistant" : "Minimize assistant"}
                  className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white/80 hover:text-white cursor-pointer"
                >
                  {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                </button>
                <button
                  onClick={handleClose}
                  title="Close assistant (Esc)"
                  aria-label="Close assistant"
                  className="p-1.5 hover:bg-white/15 rounded-lg transition-colors text-white/80 hover:text-white cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </header>

            {!isMinimized && (
              <>
                {/* Context Quick Links */}
                <nav
                  aria-label="Quick Navigation"
                  className="shrink-0 flex gap-2 px-3 py-2 overflow-x-auto scrollbar-none border-b border-slate-200/70 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60"
                >
                  {QUICK_ACTIONS.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        router.push(a.path);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap shrink-0 shadow-2xs cursor-pointer text-left"
                    >
                      {(() => {
                        const Icon = a.icon;
                        return <Icon size={12} className={a.color} />;
                      })()}
                      <span className="text-slate-700 dark:text-slate-200 font-medium text-[11px]">
                        {a.label}
                      </span>
                    </button>
                  ))}
                </nav>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3.5 bg-[#FAFCFA] dark:bg-slate-900 scroll-smooth">
                  {messages
                    .filter((m) => !m.content.startsWith("__SUGGESTIONS__"))
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs mt-0.5 ${
                            msg.role === "user"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700"
                              : "bg-linear-to-br from-emerald-600 to-teal-700 text-white"
                          }`}
                        >
                          {msg.role === "user" ? "U" : <Sparkles size={12} />}
                        </div>

                        {/* Bubble */}
                        <div
                          className={`max-w-[84%] flex flex-col ${
                            msg.role === "user" ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`px-3.5 py-2.5 leading-relaxed rounded-2xl text-xs font-normal ${
                              msg.role === "user"
                                ? "bg-[#1FA971] text-white shadow-xs rounded-tr-sm"
                                : msg.isError
                                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 rounded-tl-sm shadow-2xs"
                                : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-sm shadow-2xs"
                            }`}
                          >
                            {msg.role === "assistant" && msg.content === "" ? (
                              <span className="flex gap-1.5 items-center py-1 px-1">
                                <span
                                  className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"
                                  style={{ animationDelay: "0ms" }}
                                />
                                <span
                                  className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"
                                  style={{ animationDelay: "150ms" }}
                                />
                                <span
                                  className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"
                                  style={{ animationDelay: "300ms" }}
                                />
                              </span>
                            ) : (
                              <span className="whitespace-pre-wrap">{renderContent(msg.content)}</span>
                            )}
                          </div>

                          {/* Retry button on error */}
                          {msg.isError && lastFailedQuery && (
                            <button
                              onClick={() => sendMessage(lastFailedQuery)}
                              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 underline cursor-pointer"
                            >
                              <RefreshCw size={11} /> Retry question
                            </button>
                          )}

                          <span className="text-[9.5px] text-slate-400 dark:text-slate-500 mt-1 px-1 font-medium">
                            {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    ))}

                  {/* Context-Aware Suggestion Chips */}
                  {suggestions && !isStreaming && (
                    <div className="flex flex-wrap gap-1.5 ml-9 pt-1">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(s)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium transition-colors text-left cursor-pointer"
                        >
                          <ChevronRight size={11} className="text-emerald-600 shrink-0" />
                          <span>{s}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div ref={messagesEndRef} className="h-1" />
                </div>

                {/* Input Form with Puter Attribution */}
                <footer className="shrink-0 p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300/80 dark:border-slate-700 rounded-xl px-3 py-1.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-2xs"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask CampusConnectCo AI a question…"
                      aria-label="Message CampusConnectCo AI"
                      className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden text-xs"
                      disabled={isStreaming}
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isStreaming}
                      aria-label="Send question to AI"
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1FA971] hover:bg-[#178759] text-white transition-colors disabled:opacity-30 disabled:bg-slate-300 dark:disabled:bg-slate-700 shrink-0 cursor-pointer"
                    >
                      {isStreaming ? (
                        <Loader2 size={13} className="text-white animate-spin" />
                      ) : (
                        <Send size={13} className="text-white" />
                      )}
                    </button>
                  </form>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 text-center font-medium">
                    CampusConnectCo AI · Powered by Puter
                  </p>
                </footer>
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Persistent Floating Launcher ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            ref={triggerRef}
            key="trigger"
            initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
            onClick={handleOpen}
            id="campusconnect-ai-trigger"
            aria-label="Open CampusConnectCo AI Assistant"
            aria-expanded={isOpen}
            aria-controls="campusconnect-ai-panel"
            className="pointer-events-auto relative w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(31,169,113,0.45)] hover:shadow-[0_10px_36px_rgba(31,169,113,0.65)] transition-shadow duration-200 border-2 border-white/40 cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-emerald-400/40"
            style={{
              background: "linear-gradient(135deg, #1FA971 0%, #15803D 55%, #0D9488 100%)",
            }}
          >
            <Sparkles size={22} className="text-white" />

            {/* Subtle Brand Dot */}
            <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-emerald-300 border-2 border-white rounded-full shadow-2xs" />

            {/* Desktop Tooltip */}
            <span className="hidden sm:block absolute right-16 top-1/2 -translate-y-1/2 bg-slate-900/95 text-white border border-slate-700 text-xs font-medium px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 pointer-events-none shadow-xl transition-opacity">CampusConnectCo AI</span>
          </motion.button>
        )}
      </AnimatePresence>
    </aside>
  );
}
