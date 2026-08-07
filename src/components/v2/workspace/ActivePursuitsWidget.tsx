import { Activity, CircleDot } from "lucide-react"
import Link from "next/link"
import React from "react"

import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic"
import { DesignNode } from "@/components/v2/inspector/DesignNode"

interface Pursuit {
  id: string
  title: string
  company: string
  status: "WORKING" | "PENDING" | "ACCEPTED"
  deadline?: Date | null
  href: string
}

interface ActivePursuitsWidgetProps {
  pursuits: Pursuit[]
}

export const ActivePursuitsWidget = ({ pursuits }: ActivePursuitsWidgetProps) => {
  return (
    <DesignNode
      metadata={{
        name: "ActivePursuitsWidget",
        tokens: ['bg-surface-2', 'border-border', 'rounded-2xl'],
        typography: "Inter (Sans)",
        motionPreset: "HoverMagnetic on items",
        borderRadius: "rounded-2xl",
        elevation: "shadow-sm",
        colors: "surface-2, foreground",
        spacing: "p-6, space-y-4",
        accessibilityNotes: "List format for pursuits"
      }}
    >
      <div className="rounded-2xl bg-surface-2 p-6 flex flex-col h-full shadow-sm hover:border-primary/30 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-foreground flex items-center gap-2">
            <Activity size={18} className="text-primary" /> Active Pursuits
          </h2>
          <Link href="/dashboard/student/applications" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
            View All
          </Link>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          {pursuits.length > 0 ? (
            pursuits.map((pursuit) => (
              <HoverMagnetic key={pursuit.id} strength={0.05}>
                <Link href={pursuit.href} className="block">
                  <div className="p-4 rounded-xl bg-background hover:border-primary/50 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center font-black text-foreground shadow-inner">
                        {pursuit.company.charAt(0)}
                      </div>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        pursuit.status === 'WORKING' ? 'bg-primary/20 text-primary' : 
                        pursuit.status === 'ACCEPTED' ? 'bg-success/20 text-success' : 
                        'bg-accent text-muted-foreground'
                      }`}>
                        {pursuit.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-foreground text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">{pursuit.title}</h4>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      {pursuit.status === 'WORKING' && pursuit.deadline && (
                        <span className="flex items-center gap-1 text-primary">
                          <CircleDot size={10} className="animate-pulse" /> Due {new Date(pursuit.deadline).toLocaleDateString()}
                        </span>
                      )}
                      {pursuit.status !== 'WORKING' && (
                        <span>{pursuit.company}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </HoverMagnetic>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 py-8 text-center bg-background rounded-xl border border-dashed border-border">
              <Activity size={24} className="text-muted-foreground/50 mb-2" />
              <p className="text-sm font-bold text-muted-foreground">No active pursuits</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Start applying to see them here.</p>
            </div>
          )}
        </div>
      </div>
    </DesignNode>
  )
}
