"use client"

import { Button } from "@/components/ui/Button"
import { useState } from "react"
import { toast } from "sonner"

export function ApplyButton({ gigId }: { gigId: string }) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

    const handleApply = async (e: React.MouseEvent) => {
        e.stopPropagation()
        setStatus("loading")
        try {
            const res = await fetch("/api/applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gigId })
            })

            if (res.status === 409) {
                toast.error("You have already applied to this gig.")
                setStatus("error")
                return
            }

            if (!res.ok) throw new Error("Failed")

            toast.success("Application submitted successfully!")
            setStatus("success")
        } catch (error) {
            toast.error("Failed to submit application.")
            setStatus("error")
        }
    }

    if (status === "success") {
        return <Button size="sm" variant="outline" disabled className="text-green-600 border-green-200 bg-green-50">Applied</Button>
    }

    return (
        <Button
            size="sm"
            variant="outline"
            onClick={handleApply}
            disabled={status === "loading"}
        >
            {status === "loading" ? "Sending..." : "Apply Now"}
        </Button>
    )
}
