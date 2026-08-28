import { Target, Award, CheckCircle2 } from"lucide-react"
import React from"react"

import { DesignNode } from"@/components/v2/inspector/DesignNode"

interface CareerProgressWidgetProps {
 profileCompletion: number
 badgesEarned: number
 skillsCount: number
}

export const CareerProgressWidget = ({ profileCompletion, badgesEarned, skillsCount }: CareerProgressWidgetProps) => {
 return (
 <DesignNode
 metadata={{
 name:"CareerProgressWidget",
 tokens: ['bg-surface-2', 'border-border', 'rounded-2xl'],
 typography:"Inter (Sans)",
 motionPreset:"None",
 borderRadius:"rounded-2xl",
 elevation:"shadow-sm",
 colors:"surface-2, foreground",
 spacing:"p-6",
 accessibilityNotes:"Uses progress bar for profile completion"
 }}
 >
 <div className="rounded-2xl bg-surface border border-border p-6 flex flex-col h-full shadow-card hover:border-primary/30 transition-colors">
 <div className="flex items-center justify-between mb-6">
 <h2 className="font-black text-foreground flex items-center gap-2">
 <Target size={18} className="text-primary" /> Career Progress
 </h2>
 </div>

 <div className="flex-1 flex flex-col justify-center space-y-6">
 <div>
 <div className="flex justify-between items-end mb-2">
 <span className="text-sm font-bold text-foreground">Profile Completeness</span>
 <span className="text-xs font-black text-primary">{profileCompletion}%</span>
 </div>
 <div className="w-full bg-surface-2 rounded-full h-3 overflow-hidden border border-border">
 <div 
 className="bg-primary h-full rounded-full shadow-[0_0_10px_var(--color-primary)] transition-all duration-1000 ease-out" 
 style={{ width: `${profileCompletion}%` }}
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="p-4 bg-surface-2 rounded-xl text-center border border-transparent">
 <Award size={20} className="text-primary mx-auto mb-2" />
 <p className="text-2xl font-black text-foreground">{badgesEarned}</p>
 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Badges</p>
 </div>
 <div className="p-4 bg-surface-2 rounded-xl text-center border border-transparent">
 <CheckCircle2 size={20} className="text-success mx-auto mb-2" />
 <p className="text-2xl font-black text-foreground">{skillsCount}</p>
 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Skills</p>
 </div>
 </div>
 </div>
 </div>
 </DesignNode>
 )
}
