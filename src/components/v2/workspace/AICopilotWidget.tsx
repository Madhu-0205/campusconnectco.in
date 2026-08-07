import React from "react"
import { Brain, ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/Button"
import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic"
import { DesignNode } from "@/components/v2/inspector/DesignNode"

interface AICopilotWidgetProps {
  insight: string
  actionLabel: string
  actionHref: string
}

export const AICopilotWidget = ({ insight, actionLabel, actionHref }: AICopilotWidgetProps) => {
  return (
    <DesignNode
      metadata={{
        name: "AICopilotWidget",
        tokens: ['bg-card', 'border-primary/20', 'rounded-2xl'],
        typography: "Inter (Sans)",
        motionPreset: "HoverMagnetic",
        borderRadius: "rounded-2xl",
        elevation: "shadow-lg",
        colors: "card, primary",
        spacing: "p-6",
        accessibilityNotes: "Uses semantic Link button"
      }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-card border border-primary/30 p-6 shadow-xl h-full flex flex-col justify-between col-span-1 md:col-span-2 lg:col-span-3">
        <div className="absolute top-0 right-0 w-full h-full bg-linear-to-r from-transparent to-primary/5 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-background shrink-0 shadow-[0_0_15px_-3px_var(--color-primary)]">
              <Brain size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">AI Copilot Insight</p>
              <h3 className="text-xl font-bold text-foreground leading-snug">{insight}</h3>
            </div>
          </div>
          
          <HoverMagnetic>
            <Link href={actionHref}>
              <Button className="w-full md:w-auto bg-primary text-background hover:bg-primary/90 font-bold rounded-xl shadow-[0_0_20px_-5px_var(--color-primary)]">
                {actionLabel} <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </HoverMagnetic>
        </div>
      </div>
    </DesignNode>
  )
}
