"use client"

import { Eye, EyeOff } from"lucide-react"
import React, { useState } from"react"

import { cn } from"@/lib/utils"

export const DesignInspector = ({ children }: { children: React.ReactNode }) => {
 const [active, setActive] = useState(false)

 return (
 <div className="relative group/inspector">
 <div className="absolute -top-12 right-0 z-50 flex items-center justify-end opacity-0 group-hover/inspector:opacity-100 transition-opacity">
 <button
 onClick={() => setActive(!active)}
 className={cn(
"flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-colors border",
 active 
 ?"bg-primary text-primary-foreground border-primary" 
 :"bg-surface text-muted-foreground border-border hover:text-foreground"
 )}
 >
 {active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
 {active ?"Inspector On" :"Inspector Off"}
 </button>
 </div>
 
 <div 
 className={cn(
"transition-all duration-300 relative",
 active &&"**:outline **:outline-1 **:outline-primary/40 **:bg-primary/5 hover:**:outline-primary hover:**:bg-primary/20 hover:**:outline-2"
 )}
 >
 {children}
 </div>
 </div>
 )
}
