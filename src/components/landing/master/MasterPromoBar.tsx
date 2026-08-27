import { ArrowRight } from "lucide-react"
import Link from "next/link"
import React from "react"

export function MasterPromoBar() {
  return (
    <div className="w-full bg-[#1FA971] text-white py-2.5 px-4 text-center z-50 relative flex items-center justify-center">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm font-medium tracking-tight">
        <span>Your next opportunity could be closer than you think.</span>
        <Link 
          href="/join" 
          className="inline-flex items-center gap-1 text-white hover:text-white/80 transition-colors font-semibold underline underline-offset-4"
        >
          Explore opportunities
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
