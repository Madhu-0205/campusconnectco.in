"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function PostGigPage() {
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

            if (!res.ok) throw new Error("Failed to post gig")

            toast.success("Gig posted successfully!")
            router.push("/dashboard/client")
            router.refresh()
        } catch (error) {
            toast.error("Something went wrong while posting the gig.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Post a New Gig</h2>
                <p className="text-slate-500">Find the perfect student for your task.</p>
            </div>

            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2.5rem] overflow-hidden">
                <div className="p-10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Gig Title</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Build a React Landing Page"
                                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-medium text-slate-900"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Description</label>
                            <textarea
                                required
                                rows={6}
                                placeholder="Describe the deliverables, timeline, and requirements..."
                                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-medium text-slate-900 resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Budget (₹)</label>
                                <input
                                    required
                                    type="number"
                                    min="5"
                                    placeholder="200"
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-medium text-slate-900"
                                    value={formData.budget}
                                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Deadline</label>
                                <input
                                    type="date"
                                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all font-medium text-slate-900"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-5">
                            <Button type="button" variant="ghost" onClick={() => router.back()} className="rounded-xl font-bold px-8">Cancel</Button>
                            <Button type="submit" disabled={loading} className="rounded-xl font-black px-12 h-14 bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
                                {loading ? "Posting..." : "Post Gig"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    )
}
