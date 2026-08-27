import { Upload, Sparkles, UserCircle } from "lucide-react"
import Link from "next/link"
import React from "react"

import { Button } from "@/components/ui/Button"
import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic"
import { DesignNode } from "@/components/v2/inspector/DesignNode"

export const QuickActionsWidget = () => {
  return (
    <DesignNode
      metadata={{
        name: "QuickActionsWidget",
        tokens: ['bg-surface-2', 'border-border', 'rounded-2xl'],
        typography: "Inter (Sans)",
        motionPreset: "HoverMagnetic on items",
        borderRadius: "rounded-2xl",
        elevation: "shadow-sm",
        colors: "surface-2, foreground",
        spacing: "p-6",
        accessibilityNotes: "Buttons use visible focus rings"
      }}
    >
      <div className="rounded-2xl bg-surface border border-border p-6 flex flex-col h-full shadow-card hover:border-primary/30 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-foreground flex items-center gap-2">
             Quick Actions
          </h2>
        </div>

        <div className="flex-1 flex flex-col gap-3 justify-center">
          <HoverMagnetic strength={0.03}>
            <Link href="/dashboard/student/resume" className="block">
              <Button variant="outline" className="w-full justify-start h-12 bg-surface-2 border-border hover:bg-accent hover:border-primary/30 rounded-xl font-bold">
                <Upload size={16} className="mr-3 text-muted-foreground" /> Upload Resume
              </Button>
            </Link>
          </HoverMagnetic>
          
          <HoverMagnetic strength={0.03}>
            <Link href="/dashboard/student/smartmatch" className="block">
              <Button variant="outline" className="w-full justify-start h-12 bg-surface-2 border-border hover:bg-accent hover:border-primary/30 rounded-xl font-bold">
                <Sparkles size={16} className="mr-3 text-primary" /> Open AI Copilot
              </Button>
            </Link>
          </HoverMagnetic>

          <HoverMagnetic strength={0.03}>
            <Link href="/dashboard/student/profile" className="block">
              <Button variant="outline" className="w-full justify-start h-12 bg-surface-2 border-border hover:bg-accent hover:border-primary/30 rounded-xl font-bold">
                <UserCircle size={16} className="mr-3 text-muted-foreground" /> Update Profile
              </Button>
            </Link>
          </HoverMagnetic>
        </div>
      </div>
    </DesignNode>
  )
}
