import { Calendar, Clock } from "lucide-react"
import React from "react"

import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic"
import { DesignNode } from "@/components/v2/inspector/DesignNode"

interface DeadlineItem {
  id: string
  title: string
  date: Date
  type: "APPLICATION" | "EVENT" | "INTERVIEW"
}

interface DeadlinesWidgetProps {
  deadlines: DeadlineItem[]
}

export const DeadlinesWidget = ({ deadlines }: DeadlinesWidgetProps) => {
  return (
    <DesignNode
      metadata={{
        name: "DeadlinesWidget",
        tokens: ['bg-surface-2', 'border-border', 'rounded-2xl'],
        typography: "Inter (Sans)",
        motionPreset: "HoverMagnetic on items",
        borderRadius: "rounded-2xl",
        elevation: "shadow-sm",
        colors: "surface-2, foreground",
        spacing: "p-6, space-y-4",
        accessibilityNotes: "List format for deadlines"
      }}
    >
      <div className="rounded-2xl bg-surface border border-border p-6 flex flex-col h-full shadow-card hover:border-primary/30 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-foreground flex items-center gap-2">
            <Calendar size={18} className="text-primary" /> Upcoming Deadlines
          </h2>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          {deadlines.length > 0 ? (
            deadlines.map((item) => {
              const isUrgent = (item.date.getTime() - new Date().getTime()) < (3 * 24 * 60 * 60 * 1000); // within 3 days
              
              return (
                <HoverMagnetic key={item.id} strength={0.03}>
                  <div className={`p-4 rounded-xl bg-surface-2 border transition-all group flex items-start gap-4 ${isUrgent ? 'border-amber-500/30 hover:border-amber-500/60' : 'border-transparent hover:border-primary/50'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-border ${isUrgent ? 'bg-amber-500/20 text-amber-500 border-amber-500/20' : 'bg-surface text-muted-foreground'}`}>
                      {item.type === 'INTERVIEW' ? <Clock size={16} /> : <Calendar size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">{item.type}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={`text-xs font-black ${isUrgent ? 'text-amber-500' : 'text-foreground'}`}>
                        {item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </HoverMagnetic>
              )
            })
          ) : (
             <div className="flex flex-col items-center justify-center flex-1 py-8 text-center bg-surface-2 rounded-xl border border-dashed border-border">
              <Calendar size={24} className="text-muted-foreground/50 mb-2" />
              <p className="text-sm font-bold text-muted-foreground">Clear schedule</p>
              <p className="text-xs text-muted-foreground/70 mt-1">No upcoming deadlines.</p>
            </div>
          )}
        </div>
      </div>
    </DesignNode>
  )
}
