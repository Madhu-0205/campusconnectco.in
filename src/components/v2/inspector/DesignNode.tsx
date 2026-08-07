"use client"

import React from "react"

import { cn } from "@/lib/utils"

import { useDesignInspector, DesignMetadata } from "./DesignInspectorProvider"

interface DesignNodeProps {
  children: React.ReactNode
  metadata: DesignMetadata
  className?: string
}

export const DesignNode = ({ children, metadata, className }: DesignNodeProps) => {
  const { isActive, selectedNode, setSelectedNode } = useDesignInspector()

  const isSelected = selectedNode?.name === metadata.name

  if (!isActive) {
    return <div className={className}>{children}</div>
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedNode(metadata)
  }

  return (
    <div 
      className={cn(
        "relative transition-all cursor-crosshair rounded-xl",
        "outline outline-1 outline-primary/20 bg-primary/5 hover:outline-primary hover:outline-2 hover:bg-primary/20",
        isSelected && "outline-primary outline-2 bg-primary/20 shadow-[0_0_0_4px_rgba(var(--color-primary),0.1)]",
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div className="absolute -top-3 -left-3 z-50 pointer-events-none opacity-0 group-hover:opacity-100 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm transition-opacity">
        {metadata.name}
      </div>
      <div className="pointer-events-none">{children}</div>
    </div>
  )
}
