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
            <Card className="bg-green-50 border-green-200">
                <div className="flex items-center gap-3 text-green-700">
                    <Unlock size={20} />
                    <span className="font-bold">Payment Released</span>
                </div>
                <p className="text-sm text-green-600 mt-1">Funds have been transferred to the student.</p>
            </Card>
        )
    }

    if (currentStatus === "IN_PROGRESS") {
        return (
            <Card className="border-primary/20 bg-primary/5">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 text-primary">
                            <Lock size={20} />
                            <span className="font-bold">Funds in Escrow</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Work is in progress. Release funds when satisfied.</p>
                    </div>
                    <Button onClick={() => handleAction("RELEASE")} disabled={loading}>
                        {loading ? "Processing..." : "Release Payment"}
                    </Button>
                </div>
            </Card>
        )
    }

    return (
        <Card className="bg-slate-50">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-slate-800">Escrow Pending</h4>
                <div className="px-2 py-1 bg-slate-200 rounded text-xs">Waiting for Start</div>
            </div>
            <p className="text-sm text-slate-500 mb-4">Lock the payment to start the project securely.</p>
            <Button onClick={() => handleAction("LOCK")} disabled={loading} className="w-full">
                {loading ? "Processing..." : "Deposit & Lock Funds"}
            </Button>
        </Card>
    )
}
