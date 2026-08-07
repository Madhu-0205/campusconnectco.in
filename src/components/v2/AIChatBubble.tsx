"use client"

import { motion } from "framer-motion"
import { Sparkles, User } from "lucide-react"
import React from "react"

import { springSmooth } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface AIChatBubbleProps {
  content: string | React.ReactNode
  role: "user" | "assistant"
  isGenerating?: boolean
  className?: string
}

export const AIChatBubble = ({
  content,
  role,
  isGenerating,
  className
}: AIChatBubbleProps) => {
  const isAssistant = role === "assistant"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={springSmooth}
      className={cn(
        "flex w-full gap-4 p-4",
        isAssistant ? "justify-start" : "justify-end",
        className
      )}
    >
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 border border-border shadow-sm">
          <Sparkles className="h-4 w-4 text-foreground" />
        </div>
      )}

      <div
        className={cn(
          "relative max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed",
          isAssistant
            ? "bg-surface-2 text-foreground shadow-sm rounded-tl-sm"
            : "bg-primary text-primary-foreground rounded-tr-sm",
          isGenerating && "overflow-hidden"
        )}
      >
        {isGenerating && (
           <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent" />
        )}
        {content}
      </div>

      {!isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-3 border border-border shadow-sm">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </motion.div>
  )
}
