"use client"

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { 
    Activity, 
    AlertTriangle, 
    ShieldAlert, 
    ShieldCheck, 
    Network, 
    Lock, 
    Search,
    BrainCircuit,
    Zap,
    TrendingUp,
    ChevronDown,
    XOctagon
} from "lucide-react"
import { useState, useEffect, useRef } from "react"

gsap.registerPlugin(ScrollTrigger)

// --- MOCK DATA FOR DEMO ---
const RISK_FEED = [
    { id: "TX-9921", user: "Vikram S.", amount: "₹45,000", risk: 94, type: "Velocity", status: "blocked", time: "2 min ago" },
    { id: "TX-9920", user: "Neha R.", amount: "₹1,200", risk: 12, type: "Normal", status: "cleared", time: "5 min ago" },
    { id: "TX-9919", user: "Arjun K.", amount: "₹8,500", risk: 82, type: "Graph Anomaly", status: "flagged", time: "12 min ago" },
    { id: "TX-9918", user: "Priya M.", amount: "₹3,400", risk: 45, type: "Device ID", status: "review", time: "18 min ago" },
    { id: "TX-9917", user: "Rahul T.", amount: "₹120,000", risk: 98, type: "Ring Struct", status: "blocked", time: "1 hr ago" },
]

export default function FraudEngineClient() {
    const containerRef = useRef<HTMLDivElement>(null)
    const statsRef = useRef<HTMLDivElement>(null)
    const [mounted, setMounted] = useState(false)
    const [activeTab, setActiveTab] = useState("live")
    const [events, setEvents] = useState<any[]>([])

    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] })
    const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)

        fetch("/api/admin/moderation-events")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.events) {
                    setEvents(data.events)
                }
            })
            .catch(err => console.error("Failed to load moderation events:", err))

        // GSAP Premium Scroll Animations
        if (statsRef.current) {
            const cards = statsRef.current.querySelectorAll('.stat-card')
            gsap.fromTo(cards, 
                { y: 60, opacity: 0, rotateX: 10 },
                {
                    y: 0, opacity: 1, rotateX: 0, 
                    duration: 1.2, 
                    stagger: 0.15,
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: statsRef.current,
                        start: "top 85%",
                    }
                }
            )
        }
    }, [])

    if (!mounted) return null

    return (
        <div ref={containerRef} className="min-h-screen bg-[#050508] relative overflow-hidden pb-32">
            {/* Dynamic Background */}
            <motion.div 
                style={{ y: bgY }}
                className="absolute inset-0 z-0 pointer-events-none opacity-40"
            >
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#ff4d1c]/20 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-[#6c2bd9]/15 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] bg-[#00c9a7]/10 blur-[150px] rounded-full" />
                {/* Micro-grid overlay */}
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0" style={{
                    backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
                    backgroundSize: "64px 64px"
                }} />
            </motion.div>

            {/* Header Section */}
            <div className="relative z-10 px-6 pt-24 pb-12 max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-4 md:gap-8">
                <motion.div 
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-sm font-bold tracking-wide mb-6">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        Live Neural Network Defense Active
                    </div>
                    <h1 className="md:text-7xl font-black text-white tracking-tighter leading-none mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Fraud <span className="text-transparent bg-linear-to-r from-[#ff4d1c] to-[#ffa585]">Engine</span>
                    </h1>
                    <p className="text-lg font-medium max-w-xl leading-relaxed">
                        Continuous graph anomaly detection using Isolation Forests and Graph Neural Networks to protect escrow liquidity.
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-4 bg-[#101018] border border-white/5 p-2 rounded-2xl shadow-2xl backdrop-blur-xl"
                >
                    <button onClick={() => setActiveTab("live")} className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "live" ? "bg-[#252530] text-white shadow-lg" : "text-[#6b6b80] hover:text-white"}`}>Live Feed</button>
                    <button onClick={() => setActiveTab("graph")} className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "graph" ? "bg-[#252530] text-white shadow-lg" : "text-[#6b6b80] hover:text-white"}`}>Graph Analytics</button>
                    <button onClick={() => setActiveTab("models")} className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "models" ? "bg-[#252530] text-white shadow-lg" : "text-[#6b6b80] hover:text-white"}`}>ML Models</button>
                </motion.div>
            </div>

            {/* Key Metrics */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 mb-16" ref={statsRef}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: "Defended Escrow", value: "₹2.4M", trend: "+14%", icon: ShieldCheck, color: "#00c9a7" },
                        { title: "Anomaly Rate", value: "1.24%", trend: "-0.5%", icon: Activity, color: "#6c2bd9" },
                        { title: "Auto-Blocked", value: "248 TX", trend: "+45", icon: XOctagon, color: "#ff4d1c" },
                        { title: "Avg Resolution", value: "400ms", trend: "0ms", icon: Zap, color: "#eab308" }
                    ].map((stat, i) => (
                        <div key={i} className="stat-card bg-[#0f0f16]/80 backdrop-blur-xl border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-white/15 transition-colors">
                            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-white/80">
                                        <stat.icon size={20} style={{ color: stat.color }} />
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 ${stat.trend.startsWith('+') && stat.title !== "Auto-Blocked" ? 'text-green-400' : 'text-slate-400'}`}>
                                        {stat.trend}
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-1">{stat.title}</h3>
                                <div className="font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Live Feed Component */}
            <AnimatePresence mode="wait">
                {activeTab === "live" && (
                    <motion.div 
                        key="live"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
                    >
                        {/* Feed List */}
                        <div className="lg:col-span-2 bg-[#0f0f16]/90 backdrop-blur-2xl border border-white/5 rounded-4xl overflow-hidden shadow-2xl">
                            <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
                                <h2 className="font-black text-white flex items-center gap-3">
                                    <Activity className="text-[#ff4d1c]" /> Transaction Stream
                                </h2>
                                <div className="flex items-center gap-2 bg-black/40 rounded-full px-4 py-2 border border-white/5">
                                    <Search size={16} className="text-[#8f8f9d]" />
                                    <input type="text" placeholder="Search TX ID..." className="bg-transparent border-none outline-none text-white placeholder:text-[#8f8f9d] w-32 focus:w-48 transition-all" />
                                </div>
                            </div>
                            <div className="divide-y divide-white/5">
                                {events.map((tx, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={tx.id} 
                                        className="p-6 flex items-center gap-6 hover:bg-white/2 transition-colors cursor-pointer group"
                                    >
                                        <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-black border border-white/5 font-bold text-[#8f8f9d] group-hover:border-white/15">
                                            {tx.riskScore > 0.8 ? <ShieldAlert className="text-red-500 mb-1" size={18}/> : tx.riskScore > 0.4 ? <AlertTriangle className="text-yellow-500 mb-1" size={18}/> : <ShieldCheck className="text-green-500 mb-1" size={18}/>}
                                            {Math.round((tx.riskScore || 0) * 100)}%
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-lg">{tx.entityId.substring(0, 8)}</span>
                                                    <span className="px-2 py-0.5 rounded uppercase font-black tracking-wider bg-white/5 text-[#8f8f9d]">{tx.id.substring(0, 8)}</span>
                                                </div>
                                                <span className="font-extrabold text-white font-mono">{tx.entityType}</span>
                                            </div>
                                            <div className="flex items-center gap-4 font-medium text-[#6b6b80]">
                                                <span className="flex items-center gap-1.5"><TrendingUp size={14} className="text-[#00c9a7]"/> {tx.reason || "Flagged"}</span>
                                                <span>•</span>
                                                <span>{new Date(tx.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border" style={{
                                            backgroundColor: tx.action === 'REJECT' ? 'rgba(239,68,68,0.1)' : tx.action === 'APPROVE' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                                            borderColor: tx.action === 'REJECT' ? 'rgba(239,68,68,0.2)' : tx.action === 'APPROVE' ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.2)',
                                            color: tx.action === 'REJECT' ? '#ef4444' : tx.action === 'APPROVE' ? '#22c55e' : '#eab308'
                                        }}>
                                            {tx.action}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* ML Inspector Panel */}
                        <div className="flex flex-col gap-6">
                            <div className="bg-linear-to-b from-[#2a133f] to-[#100b1a] rounded-4xl p-px shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.15),transparent_50%)]" />
                                <div className="bg-[#0f0f16]/95 backdrop-blur-3xl rounded-[31px] p-4 md:p-8 h-full">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                                            <BrainCircuit size={20} />
                                        </div>
                                        <h3 className="font-black text-lg">Isolation Forest</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between text-sm font-bold mb-2">
                                                <span className="text-[#8f8f9d]">Outlier Score Threshold</span>
                                                <span className="text-white">0.85</span>
                                            </div>
                                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                                <div className="bg-[#c084fc] h-full w-[85%] rounded-full shadow-[0_0_10px_#c084fc]" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm font-bold mb-2">
                                                <span className="text-[#8f8f9d]">Graph Connectivity</span>
                                                <span className="text-white">High</span>
                                            </div>
                                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden flex divide-x divide-black/20">
                                                <div className="bg-[#ff4d1c] h-full w-[30%]" />
                                                <div className="bg-[#eab308] h-full w-[40%]" />
                                                <div className="bg-[#00c9a7] h-full w-[30%]" />
                                            </div>
                                            <div className="flex justify-between font-black uppercase text-[#6b6b80] mt-2">
                                                <span>Linear</span>
                                                <span>Normal</span>
                                                <span>Ring/Dense</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#0f0f16]/90 border border-white/5 backdrop-blur-xl rounded-4xl p-4 md:p-8 shadow-2xl flex flex-col justify-center items-center text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />
                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                    <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-3xl shadow-[0_0_30px_rgba(99,102,241,0.2)] ring-1 ring-white/10 flex items-center justify-center">
                                        <Lock size={32} />
                                    </div>
                                </div>
                                <h3 className="font-black text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Secure Enclave Active</h3>
                                <p className="font-medium text-[#8f8f9d] mb-6">All transactions pass through GNN behavioral tracking before escrow generation.</p>
                                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm transition-all flex items-center gap-2 z-10 relative">
                                    Configure Engine <ChevronDown size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Graph Analytics Stub */}
                {activeTab !== "live" && (
                    <motion.div 
                        key="other"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 max-w-7xl mx-auto px-6 h-[50vh] flex flex-col items-center justify-center text-center border border-white/5 rounded-[40px] bg-[#0f0f16]/50 backdrop-blur-xl"
                    >
                        <Network size={64} className="text-white/20 mb-6" />
                        <h2 className="font-black text-white mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>Graph Visualization Loading...</h2>
                        <p className="text-[#8f8f9d] max-w-md font-medium">The full multi-node relation visualizer requires Canvas rendering capabilities. The data pipeline is online and streaming.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
