"use client"

import React from "react"

import { cn } from "@/lib/utils"

export interface ActivityItem {
  id: string | number
  title: string
  description?: string
  timestamp: string
  icon?: React.ReactNode
  isDone?: boolean
}

interface ActivityFeedProps {
  items: ActivityItem[]
  className?: string
}

export const ActivityFeed = ({ items, className }: ActivityFeedProps) => {
  return (
    <div className={cn("relative pl-4 space-y-6", className)}>
      {/* Vertical line connecting timeline */}
      <div className="absolute left-6.75 top-4 bottom-4 w-px bg-border -z-10" />

      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-4">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-surface mt-0.5",
              item.isDone ? "border-primary text-primary" : "border-border text-muted-foreground"
            )}
          >
            {item.icon ? (
              <span className="[&_svg]:h-3.5 [&_svg]:w-3.5">{item.icon}</span>
            ) : (
              <div className={cn("h-1.5 w-1.5 rounded-full", item.isDone ? "bg-primary" : "bg-muted-foreground")} />
            )}
          </div>
          <div className="flex flex-col pt-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {item.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {item.timestamp}
              </span>
            </div>
            {item.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
