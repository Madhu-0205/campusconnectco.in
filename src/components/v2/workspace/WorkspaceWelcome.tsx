import { Sparkles, Trophy } from"lucide-react"
import React from"react"

import { DesignNode } from"@/components/v2/inspector/DesignNode"

interface WorkspaceWelcomeProps {
 userName: string
 focusText: string
 careerScore: number
}

export const WorkspaceWelcome = ({ userName, focusText, careerScore }: WorkspaceWelcomeProps) => {
 return (
 <DesignNode
 metadata={{
 name:"WorkspaceWelcome",
 tokens: ['bg-surface-2', 'border-border', 'rounded-3xl'],
 typography:"Inter (Sans), font-black for headers",
 motionPreset:"None (handled by WorkspaceGrid)",
 borderRadius:"rounded-3xl",
 elevation:"shadow-glow-primary",
 colors:"surface-2, foreground, primary",
 spacing:"p-8",
 accessibilityNotes:"H1 header used for document outline"
 }}
 >
 <div className="relative overflow-hidden rounded-3xl bg-surface p-6 md:p-8 shadow-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-6 h-full w-full col-span-1 md:col-span-2 lg:col-span-3">
 {/* Ambient Glow */}
 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
 
 <div className="relative z-10 space-y-2">
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
 <Sparkles size={14} className="text-primary" /> Today&apos;s Focus: {focusText}
 </div>
 <h1 className="text-3xl md:text-4xl font-heading font-black text-foreground tracking-tight">
 Welcome back, <span className="text-primary">{userName}</span>
 </h1>
 </div>

 <div className="relative z-10 flex items-center gap-4 bg-surface-2 border border-border rounded-2xl p-4 shadow-sm shrink-0">
 <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary">
 <Trophy size={24} />
 </div>
 <div>
 <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Career Score</p>
 <p className="text-2xl font-black text-foreground">{careerScore}</p>
 </div>
 </div>
 </div>
 </DesignNode>
 )
}
