"use client"

import { Briefcase } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

export default function FounderPostGigPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        budget: "",
        deadline: ""
    })

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

            toast.success("Gig posted successfully as Admin!")
            router.push("/dashboard/founder/gigs")
            router.refresh()
        } catch (err: any) {
            toast.error(err.message || "Something went wrong while posting the gig.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto relative z-10 p-6 pt-10">
            <div className="mb-8 flex items-center gap-4">
                <div className="p-3 bg-(--primary) text-white rounded-2xl shadow-lg">
                    <Briefcase size={24} />
                </div>
                <div>
                    <h2 className="font-black mb-1 text-white tracking-tight">Create Official Listing</h2>
                    <p className="text-slate-500 font-medium">Post a gig, internship, or job on behalf of Campus Connect.</p>
                </div>
            </div>

            <Card className="border border-white/10 shadow-xl bg-[#111116] rounded-4xl overflow-hidden">
                <div className="p-10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="font-bold text-white uppercase tracking-wider ml-1">Title</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Campus Ambassador Program 2024"
                                className="w-full px-6 py-4 rounded-xl border-white/5 bg-[#111116] focus:border-blue-500 focus:ring-0 outline-none transition-all font-bold text-white placeholder:text-slate-400"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="font-bold text-white uppercase tracking-wider ml-1">Detailed Description</label>
                            <textarea
                                required
                                rows={6}
                                placeholder="Outline the responsibilities, perks, and requirements..."
                                className="w-full px-6 py-4 rounded-xl border-white/5 bg-[#111116] focus:border-blue-500 focus:ring-0 outline-none transition-all font-medium text-white placeholder:text-slate-400 resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                            <div className="space-y-3">
                                <label className="font-bold text-white uppercase tracking-wider ml-1">Stipend / Budget (₹)</label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    placeholder="5000"
                                    className="w-full px-6 py-4 rounded-xl border-white/5 bg-[#111116] focus:border-blue-500 focus:ring-0 outline-none transition-all font-bold text-white placeholder:text-slate-400"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="font-bold text-white uppercase tracking-wider ml-1">Deadline</label>
                                <input
                                    type="date"
                                    className="w-full px-6 py-4 rounded-xl border-white/5 bg-[#111116] focus:border-blue-500 focus:ring-0 outline-none transition-all font-bold text-white placeholder:text-slate-400"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-4">
                            <Button type="button" variant="ghost" onClick={() => router.back()} className="rounded-xl font-bold px-6">Cancel</Button>
                            <Button type="submit" disabled={loading} className="rounded-xl font-bold px-10 h-12 bg-(--primary) hover:bg-blue-600 text-white shadow-lg active:scale-95 transition-all">
                                {loading ? "Publishing..." : "Publish Listing"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    )
}
