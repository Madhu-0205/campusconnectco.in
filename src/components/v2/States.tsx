"use client"

import { motion } from "framer-motion"
import { Inbox, FileText, Compass, AlertCircle, RefreshCcw } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/Button"
import { springSmooth } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface BaseStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const EmptyState = ({
  title,
  description,
  icon,
  action,
  className
}: BaseStateProps) => {
  return (
    <div
      className={cn(
        "flex min-h-100 w-full flex-col items-center justify-center rounded-2xl border border-border border-dashed bg-surface/30 p-8 text-center animate-in fade-in duration-500",
        className
      )}
    >
      <div className="mb-6 rounded-full bg-surface-2 p-4">
        {icon || <Inbox className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="secondary">
          {action.label}
        </Button>
      )}
    </div>
  )
}

export const ErrorState = ({
  title,
  description,
  icon,
  action,
  className
}: BaseStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springSmooth}
      className={cn(
        "flex min-h-75 w-full flex-col items-center justify-center rounded-2xl border border-error/20 bg-error/5 p-8 text-center",
        className
      )}
    >
      <div className="mb-6 rounded-full bg-error/10 p-4">
        {icon || <AlertCircle className="h-8 w-8 text-error" />}
      </div>
      <h3 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="outline" className="border-error/20 hover:bg-error/10">
          <RefreshCcw className="mr-2 h-4 w-4" />
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}
