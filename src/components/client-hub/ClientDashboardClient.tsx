"use client"
import { motion } from "framer-motion"
import { 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    PlusCircle, Users, Briefcase, 
     
     
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ChevronRight, Star, ShieldCheck,
} from "lucide-react"
import Link from "next/link"

interface GigRecord {
    id: string;
    title: string;
    budget: number;
    status: string;
    _count: { applications: number };
}

interface ApplicantRecord {
    id: string;
     
    applicant?: any;
     
    gig?: any;
}

interface KanbanProps {
    recentGigs: GigRecord[]
}

export function KanbanBoard({ recentGigs }: KanbanProps) {
    if (recentGigs.length === 0) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-10 text-center rounded-2xl border border-white/10 bg-white/2"
            >
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Briefcase size={24} className="text-slate-600" />
                </div>
                <h3 className="font-bold text-white mb-2">Build Your Dream Team</h3>
                <p className="text-slate-500 mb-5">Post your first gig to start building the pipeline.</p>
                <Link href="/client-hub/post-gig">
                    <button className="h-10 px-5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                        Post First Gig
                    </button>
                </Link>
            </motion.div>
        )
    }

    const columns = [
        { id: "OPEN", label: "Open", color: "text-sky-400", dot: "bg-sky-400", gigs: recentGigs.filter(g => g.status === "OPEN") },
        { id: "IN_PROGRESS", label: "In Progress", color: "text-amber-400", dot: "bg-amber-400", gigs: recentGigs.filter(g => g.status === "IN_PROGRESS") },
        { id: "COMPLETED", label: "Completed", color: "text-emerald-400", dot: "bg-emerald-400", gigs: recentGigs.filter(g => g.status === "COMPLETED") },
    ]

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
            {columns.map((col) => (
                <motion.div 
                    variants={item}
                    key={col.id} 
                    className="rounded-2xl border border-white/5 bg-white/2 p-3 flex flex-col min-h-[200px]"
                >
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${col.color}`}>{col.label}</span>
                        <span className="ml-auto font-bold text-slate-500 bg-white/5 w-5 h-5 rounded-full flex items-center justify-center">
                            {col.gigs.length}
                        </span>
                    </div>

                    <div className="space-y-3 flex-1">
                        {col.gigs.map((gig) => (
                            <Link
                                key={gig.id}
                                href={`/client-hub/applicants?gigId=${gig.id}`}
                                className="block bg-[#131929] border border-white/5 hover:border-indigo-500/30 rounded-xl p-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] group relative overflow-hidden active:scale-[0.98]"
                            >
                                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <p className="font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mb-3 relative z-10">
                                    {gig.title}
                                </p>
                                <div className="flex items-center justify-between relative z-10">
                                    <span className="text-xs font-black">
                                        ₹{gig.budget.toLocaleString("en-IN")}
                                    </span>
                                    <span className="font-bold flex items-center gap-1.5 text-slate-500 group-hover:text-slate-300">
                                        <Users size={12} /> {gig._count.applications}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    )
}

export function TopApplicants({ applicants }: { applicants: ApplicantRecord[] }) {
    if (applicants.length === 0) return null;

    return (
        <div className="space-y-3">
            {applicants.map((app, i) => (
                <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-white/3 border border-white/5 hover:border-white/10 rounded-2xl transition-all group cursor-pointer"
                >
                    <div className="w-11 h-11 rounded-xl bg-linear-to-br from-indigo-600 to-sky-500 flex items-center justify-center font-black shrink-0 text-sm shadow-lg shadow-indigo-500/10 transition-transform group-hover:scale-105">
                        {(app.applicant?.name || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate group-hover:text-indigo-400 transition-colors">{app.applicant?.name || "Anonymous"}</p>
                        <p className="text-xs truncate">For: {app.gig?.title}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-black">₹{app.gig?.budget?.toLocaleString("en-IN")}</span>
                        <Link
                            href={`/client-hub/applicants`}
                            className="flex items-center gap-1 font-bold px-3 py-1.5 bg-indigo-500 text-white hover:bg-indigo-600 rounded-lg transition-all shadow-md shadow-indigo-500/20 active:scale-95"
                        >
                            Review
                        </Link>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
