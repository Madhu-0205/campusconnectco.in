import { Award } from "lucide-react"

import { cn } from "@/lib/utils"

export interface VerificationBadgeProps {
  isVerified: boolean
  className?: string
  size?: "sm" | "md"
}

export function VerificationBadge({ isVerified, className, size = "sm" }: VerificationBadgeProps) {
  if (!isVerified) return null

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 font-black uppercase tracking-widest select-none cursor-help transition-all duration-300 shrink-0",
        "bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/15 hover:border-amber-500/30",
        size === "sm" ? "px-2 py-0.5 text-[9px] rounded-md" : "px-3 py-1 text-[10px] rounded-full",
        className
      )}
      title="Verified College Student status confirmed"
    >
      <Award size={size === "sm" ? 11 : 13} fill="currentColor" className="shrink-0" />
      <span>Verified</span>
    </div>
  )
}
