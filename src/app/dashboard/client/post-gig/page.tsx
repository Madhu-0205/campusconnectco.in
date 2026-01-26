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

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Gig Title</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Build a React Landing Page"
                            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:outline-none"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                        <textarea
                            required
                            rows={6}
                            placeholder="Describe the deliverables, timeline, and requirements..."
                            className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Budget ($)</label>
                            <input
                                required
                                type="number"
                                min="5"
                                placeholder="200"
                                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Deadline</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Posting..." : "Post Gig"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
