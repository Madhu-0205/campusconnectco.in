"use client"

import { CheckCircle2, Circle, ChevronDown, ChevronUp, ShieldCheck } from"lucide-react"
import React, { useState } from"react"

import { cn } from"@/lib/utils"

export interface QualityGateChecks {
 accessibility: boolean
 responsive: boolean
 darkMode: boolean
 lightMode: boolean
 keyboardNavigation: boolean
 motion: boolean
 loadingState: boolean
 emptyState: boolean
 errorState: boolean
 performance: boolean
}

export const QualityGate = ({ checks, componentName }: { checks: QualityGateChecks, componentName: string }) => {
 const [expanded, setExpanded] = useState(false)

 const checkArray = [
 { key:"accessibility", label:"Accessibility (WCAG)" },
 { key:"responsive", label:"Responsive Layout" },
 { key:"darkMode", label:"Dark Mode" },
 { key:"lightMode", label:"Light Mode" },
 { key:"keyboardNavigation", label:"Keyboard Nav" },
 { key:"motion", label:"Motion & Physics" },
 { key:"loadingState", label:"Loading States" },
 { key:"emptyState", label:"Empty States" },
 { key:"errorState", label:"Error States" },
 { key:"performance", label:"Performance (60fps)" },
 ] as const

 const passedCount = checkArray.filter(c => checks[c.key]).length
 const totalCount = checkArray.length
 const isProductionReady = passedCount === totalCount

 return (
 <div className="w-full mt-4 mb-8">
 <button 
 onClick={() => setExpanded(!expanded)}
 className={cn(
"w-full flex items-center justify-between p-3 rounded-lg border text-sm font-medium transition-colors",
 isProductionReady 
 ?"bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20" 
 :"bg-surface-2 border-border hover:bg-surface-2/80 text-foreground"
 )}
 >
 <div className="flex items-center gap-2">
 <ShieldCheck className={cn("w-4 h-4", isProductionReady ?"text-emerald-500" :"text-muted-foreground")} />
 <span>Quality Gate: {componentName}</span>
 <span className={cn(
"px-2 py-0.5 rounded-full text-[10px] font-bold ml-2",
 isProductionReady ?"bg-emerald-500/20" :"bg-bg text-muted-foreground"
 )}>
 {passedCount}/{totalCount} Passed
 </span>
 </div>
 {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
 </button>

 {expanded && (
 <div className="p-4 mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 rounded-lg bg-surface-2/50">
 {checkArray.map(check => {
 const passed = checks[check.key]
 return (
 <div key={check.key} className="flex items-center gap-2 text-xs">
 {passed ? (
 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
 ) : (
 <Circle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
 )}
 <span className={passed ?"text-foreground" :"text-muted-foreground"}>{check.label}</span>
 </div>
 )
 })}
 </div>
 )}
 </div>
 )
}
