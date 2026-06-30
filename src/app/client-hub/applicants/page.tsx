"use client"

import { motion, AnimatePresence } from "framer-motion"
import { User, MessageSquare, Check, X, Clock, Sparkles, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

export default function ClientApplicantsPage() {
    const router = useRouter()
     
    const [applications, setApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        fetch("/api/client-hub/applicants")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setApplications(data)
                }
            })
            .catch(err => {
                toast.error("Failed to load applicants")
                console.error(err)
            })
            .finally(() => setLoading(false))
    }, [])

    const handleStatusChange = async (applicationId: string, status: "ACCEPTED" | "REJECTED") => {
        try {
            const res = await fetch(`/api/applications/${applicationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            })

            if (res.ok) {
                toast.success(status === "ACCEPTED" ? "Applicant hired successfully!" : "Application declined")
                setApplications(prev => prev.map(app => app.id === applicationId ? { ...app, status } : app))
            } else {
                toast.error("Failed to update status")
            }
        } catch {
            toast.error("An error occurred");
        }
    }

    const handleMessage = async (applicantId: string) => {
        try {
            const res = await fetch("/api/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otherUserId: applicantId })
            })
            if (res.ok) {
                router.push(`/messages?userId=${applicantId}`)
            } else {
                toast.error("Unable to start conversation")
            }
        } catch {
            toast.error("Something went wrong.")
        }
    }

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-(--primary)" />
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="font-black tracking-tight text-white">Review Applicants</h2>
                    <p className="text-slate-500 mt-2 font-medium">Manage and hire students who have applied to your gigs.</p>
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="text-center py-20 bg-white/2 dark:bg-slate-900/40 rounded-3xl border border-white/10">
                    <User className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                    <h3 className="font-black text-white mb-2">No Applicants Yet</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto">Applications for your posted gigs will appear here. Try sharing your gig links to attract more talent.</p>
                </div>
            ) : (
                <div className="grid gap-5">
                    <AnimatePresence>
                        {applications.map((application, idx) => {
                            const applicant = application.applicant
                            const gig = application.gig
                            const skillsStr = applicant.skills || "General"

                            const now = new Date().getTime();
                            const isNew = new Date(application.createdAt).getTime() > now - 86400000;

                            return (
                                <motion.div
                                    key={application.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className={`p-6 rounded-3xl overflow-hidden transition-all ${application.status === 'ACCEPTED' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50 shadow-sm' : application.status === 'REJECTED' ? 'opacity-60 dark:bg-slate-900/30 grayscale-50' : 'hover:shadow-lg dark:bg-slate-900 bg-white'}`}>
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">

                                            {/* Applicant Info Section */}
                                            <div className="flex items-start gap-5 flex-1">
                                                <div className="h-14 w-14 shrink-0 rounded-2xl bg-(--primary)/10 border border-(--primary)/20 flex items-center justify-center text-(--primary) overflow-hidden shadow-inner">
                                                    {applicant.image ? (
                                                        <Image src={applicant.image} alt={applicant.name} className="w-full h-full object-cover" fill />
                                                    ) : (
                                                        <User size={24} />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                                                        <h3 className="font-black text-white leading-none">{applicant.name || "Student"}</h3>
                                                        {application.status === 'PENDING' && isNew && (
                                                            <span className="bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
                                                                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" /> New
                                                            </span>
                                                        )}
                                                        {application.status === 'ACCEPTED' && (
                                                            <span className="bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-200 dark:border-emerald-800/40">
                                                                <Check size={10} /> Hired
                                                            </span>
                                                        )}
                                                        {application.status === 'REJECTED' && (
                                                            <span className="bg-(--surface-2) dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                                                Declined
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="font-bold text-slate-600 dark:text-slate-400 mb-2">
                                                        Applied for: <span className="text-(--primary)">{gig.title}</span>
                                                    </p>
                                                    {application.coverLetter && (
                                                        <p className="font-medium text-slate-500 bg-(--surface-2) p-3 rounded-xl border border-white/5 dark:border-slate-700 mb-3 italic">
                                                            &quot;{application.coverLetter.length > 120 ? application.coverLetter.substring(0, 120) + "..." : application.coverLetter}&quot;
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-3 font-bold text-slate-500">
                                                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300"><Sparkles size={12} className="text-(--accent)" /> {skillsStr}</span>
                                                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(application.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions Section */}
                                            <div className="flex flex-col items-center gap-3 w-full md:w-[160px] shrink-0 pt-4 md:pt-0 border-white/5 md:border-t-0">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleMessage(applicant.id)}
                                                    className="w-full h-10 rounded-xl font-bold border-white/10 hover:border-(--primary)/40 hover:bg-white/2 dark:hover:bg-slate-800 transition-all gap-2 shrink-0"
                                                >
                                                    <MessageSquare size={16} className="text-(--primary)" /> Message
                                                </Button>

                                                {application.status === 'ACCEPTED' && gig.status === 'OPEN' && (
                                                    <div className="w-full h-10 px-4 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-2">
                                                        ✓ Hired — Contact to get started
                                                    </div>
                                                )}

                                                {application.status === 'PENDING' && (
                                                    <div className="flex gap-2 w-full">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => handleStatusChange(application.id, "REJECTED")}
                                                            className="h-10 px-3 rounded-xl border-white/10 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:border-red-900/50 dark:hover:bg-red-900/20 transition-all shrink-0"
                                                        >
                                                            <X size={18} />
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleStatusChange(application.id, "ACCEPTED")}
                                                            className="flex-1 h-10 px-4 rounded-xl bg-(--primary) hover:bg-blue-600 text-white font-black shadow-lg shadow-electric/20 active:scale-95 transition-all gap-2"
                                                        >
                                                            Hire
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            )}

        </div>
    )
}
