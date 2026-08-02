"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

export default function ClientOnboardingPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/employer/organization", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            })

            const data = await res.json()

            if (!res.ok) {
                // If they already have an org, just let them proceed
                if (res.status === 409) {
                    toast.success("Organization profile loaded.")
                    router.push("/client-hub")
                    return
                }
                throw new Error(data.error || "Failed to create organization")
            }

            toast.success("Organization created successfully!")
            router.push("/client-hub")
            router.refresh()
        } catch (err: any) {
            toast.error(err.message || "Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-md w-full relative z-10">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black mb-2 tracking-tight">Create Organization</h1>
                    <p className="text-slate-400 font-medium">Set up your startup profile to start posting gigs.</p>
                </div>

                <Card className="border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl rounded-3xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <label className="font-bold text-slate-300 text-sm tracking-wide uppercase">Organization Name</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Acme Corp"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-5 py-3 rounded-xl border border-white/10 bg-slate-800/50 focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-medium text-white placeholder:text-slate-500"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            disabled={loading || !name.trim()} 
                            className="w-full rounded-xl font-bold py-4 bg-white hover:bg-slate-200 text-slate-950 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                            {loading ? "Creating..." : "Continue to Hub"}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    )
}
