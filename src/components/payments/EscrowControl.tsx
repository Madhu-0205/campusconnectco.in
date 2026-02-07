"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Lock, Unlock } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function EscrowControl({ gigId, status }: { gigId: string, status: string }) {
    const [loading, setLoading] = useState(false)
    const [currentStatus, setCurrentStatus] = useState(status)

    const handleAction = async (action: "LOCK" | "RELEASE") => {
        setLoading(true)
        try {
            const res = await fetch("/api/escrow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gigId, action })
            })

            if (!res.ok) throw new Error("Failed")

            // Update local state to reflect change (in real app would revalidate)
            if (action === "LOCK") {
                setCurrentStatus("IN_PROGRESS")
                toast.success("Funds securely locked in escrow.")
            }
            if (action === "RELEASE") {
                setCurrentStatus("COMPLETED")
                toast.success("Payment released to student!")
            }

        } catch (error) {
            toast.error(`Failed to ${action.toLowerCase()} funds.`)
        } finally {
            setLoading(false)
        }
    }

    if (currentStatus === "COMPLETED") {
        return (
            <Card className="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20">
                <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                    <Unlock size={20} />
                    <span className="font-bold">Payment Released</span>
                </div>
                <p className="text-sm text-emerald-600 dark:text-emerald-300 mt-1 font-medium">Funds have been transferred to the student.</p>
            </Card>
        )
    }

    if (currentStatus === "IN_PROGRESS") {
        return (
            <Card className="border-electric/20 bg-blue-50/50 dark:bg-blue-900/10">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 text-electric dark:text-blue-400">
                            <Lock size={20} />
                            <span className="font-bold">Funds in Escrow</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Work is in progress. Release funds when satisfied.</p>
                    </div>
                    <Button onClick={() => handleAction("RELEASE")} disabled={loading} className="font-bold bg-emerald-500 hover:bg-emerald-600 text-white">
                        {loading ? "Processing..." : "Release Payment"}
                    </Button>
                </div>
            </Card>
        )
    }

    return (
        <Card className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-slate-800 dark:text-white">Escrow Pending</h4>
                <div className="px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs font-bold text-slate-600 dark:text-slate-400">Waiting for Start</div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">Lock the payment to start the project securely.</p>
            <Button onClick={() => handleAction("LOCK")} disabled={loading} className="w-full font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200">
                {loading ? "Processing..." : "Deposit & Lock Funds"}
            </Button>
        </Card>
    )
}
