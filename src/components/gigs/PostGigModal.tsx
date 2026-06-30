"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, Briefcase, IndianRupee, Calendar, FileText, Loader2, Zap } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function PostGigModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        budget: "",
        deadline: ""
    })

    const parsedBudget = parseFloat(formData.budget) || 0;
    const platformFee = parsedBudget * 0.1;
    const studentGets = parsedBudget - platformFee;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/gigs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    budget: parseFloat(formData.budget)
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to post gig")
            }

            toast.success("Gig posted successfully!")
            setIsOpen(false)
            setFormData({ title: "", description: "", budget: "", deadline: "" })
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Something went wrong while posting the gig.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Header Button */}
            <Button
                onClick={() => setIsOpen(true)}
                className="hidden sm:flex bg-electric hover:bg-blue-600 focus:ring-2 focus:ring-electric/50 focus:outline-none text-white dark:text-white rounded-full px-4 lg:px-6 py-2 h-auto font-black tracking-wide shadow-lg shadow-electric/20 transition-all hover:-translate-y-0.5 gap-2 items-center shrink-0"
            >
                <Plus size={18} strokeWidth={3} />
                <span className="whitespace-nowrap">Post a Gig</span>
            </Button>

            {/* Mobile Icon Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="sm:hidden flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-electric hover:bg-blue-600 text-white shadow-lg shadow-electric/20 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-electric/50 focus:outline-none"
                aria-label="Post a Gig"
            >
                <Plus size={20} strokeWidth={3} />
            </button>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-4xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative"
                        >
                            {/* Decorative Top */}
                            <div className="h-2 w-full bg-linear-to-r from-blue-500 via-electric to-indigo-500" />

                            <div className="px-6 py-5 border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-electric/10 rounded-xl">
                                        <Briefcase className="text-electric" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="font-black text-slate-900 dark:text-white tracking-tight">Post a Gig</h2>
                                        <p className="font-bold text-slate-500 dark:text-slate-400">Find talent perfectly matched to your task</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5 flex flex-col max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {/* Title */}
                                <div className="space-y-2">
                                    <label className="font-black text-slate-400 uppercase tracking-widest pl-1">Project Title</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-3.5 text-slate-400" size={16} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Build a Landing Page"
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-electric/50 focus:border-electric outline-none transition-all font-bold dark:text-white placeholder:text-slate-400 text-sm shadow-sm"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-3.5 text-slate-400" size={16} />
                                        <textarea
                                            required
                                            rows={4}
                                            placeholder="Describe deliverables and requirements..."
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-electric/50 focus:border-electric outline-none transition-all font-medium dark:text-white placeholder:text-slate-400 resize-none text-sm shadow-sm"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Budget & Deadline Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="font-black text-slate-400 uppercase tracking-widest pl-1">Fixed Budget</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-4 top-3.5 text-slate-400" size={16} />
                                            <input
                                                required
                                                type="number"
                                                min="50"
                                                placeholder="2000"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-electric/50 focus:border-electric outline-none transition-all font-black dark:text-white placeholder:text-slate-400 text-sm shadow-sm"
                                                value={formData.budget}
                                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="font-black text-slate-400 uppercase tracking-widest pl-1">Deadline</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-3.5 text-slate-400" size={16} />
                                            <input
                                                type="date"
                                                required
                                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-electric/50 focus:border-electric outline-none transition-all font-bold dark:text-white text-sm shadow-sm"
                                                value={formData.deadline}
                                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Transparent Fee Breakdown */}
                                {parsedBudget > 0 && (
                                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 mt-4">
                                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">Escrow Details</h3>
                                        <div className="flex justify-between items-center font-bold text-slate-600 dark:text-slate-400">
                                            <span>Gig value</span>
                                            <span>₹{parsedBudget.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center font-bold text-slate-600 dark:text-slate-400">
                                            <span>Platform fee (10%)</span>
                                            <span>-₹{platformFee.toLocaleString()}</span>
                                        </div>
                                        <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                                        <div className="flex justify-between items-center font-black text-emerald-600 dark:text-emerald-400">
                                            <span>Student receives</span>
                                            <span>₹{studentGets.toLocaleString()}</span>
                                        </div>
                                        <p className="text-slate-500 mt-2 font-semibold">CampusConnect Payment Protection: Your payment is held securely in escrow until work is completed.</p>
                                    </div>
                                )}

                                {/* Footer Actions */}
                                <div className="pt-4 flex justify-end gap-3 items-center">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-slate-900 dark:bg-white dark:text-slate-900 px-8 py-2.5 rounded-xl font-black text-sm active:scale-95 transition-all shadow-lg hover:bg-slate-800 dark:hover:bg-slate-200 flex items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} className={loading ? "hidden" : "block"} />}
                                        {loading ? "Publishing..." : "Post Gig"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
