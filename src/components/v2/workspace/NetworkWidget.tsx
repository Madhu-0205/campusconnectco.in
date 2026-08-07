import { MessageSquare, Users } from "lucide-react"
import Link from "next/link"
import React from "react"

import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic"
import { DesignNode } from "@/components/v2/inspector/DesignNode"

interface NetworkWidgetProps {
  unreadMessages: number
  pendingConnections: number
}

export const NetworkWidget = ({ unreadMessages, pendingConnections }: NetworkWidgetProps) => {
  return (
    <DesignNode
      metadata={{
        name: "NetworkWidget",
        tokens: ['bg-surface-2', 'border-border', 'rounded-2xl'],
        typography: "Inter (Sans)",
        motionPreset: "HoverMagnetic on items",
        borderRadius: "rounded-2xl",
        elevation: "shadow-sm",
        colors: "surface-2, foreground",
        spacing: "p-6",
        accessibilityNotes: "Displays counts for notifications"
      }}
    >
      <div className="rounded-2xl bg-surface-2 p-6 flex flex-col h-full shadow-sm hover:border-primary/30 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-foreground flex items-center gap-2">
            <Users size={18} className="text-primary" /> Network & Comm
          </h2>
        </div>

        <div className="flex-1 flex flex-col gap-4 justify-center">
          <HoverMagnetic strength={0.03}>
            <Link href="/dashboard/student/messages" className="block">
              <div className="p-4 rounded-xl bg-background hover:border-primary/50 transition-colors group flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${unreadMessages > 0 ? 'bg-primary/20 text-primary' : 'bg-surface-2 text-muted-foreground'}`}>
                    <MessageSquare size={16} />
                  </div>
                  <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">Messages</h4>
                </div>
                {unreadMessages > 0 ? (
                  <span className="w-6 h-6 flex items-center justify-center bg-primary text-background rounded-full text-xs font-black shadow-[0_0_10px_-2px_var(--color-primary)]">
                    {unreadMessages}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">0 Unread</span>
                )}
              </div>
            </Link>
          </HoverMagnetic>

          <HoverMagnetic strength={0.03}>
            <Link href="/network" className="block">
              <div className="p-4 rounded-xl bg-background hover:border-primary/50 transition-colors group flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${pendingConnections > 0 ? 'bg-primary/20 text-primary' : 'bg-surface-2 text-muted-foreground'}`}>
                    <Users size={16} />
                  </div>
                  <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">Connections</h4>
                </div>
                {pendingConnections > 0 ? (
                  <span className="w-6 h-6 flex items-center justify-center bg-primary text-background rounded-full text-xs font-black shadow-[0_0_10px_-2px_var(--color-primary)]">
                    {pendingConnections}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">0 Pending</span>
                )}
              </div>
            </Link>
          </HoverMagnetic>
        </div>
      </div>
    </DesignNode>
  )
}
