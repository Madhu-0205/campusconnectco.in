"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"
import React from "react"

import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  icon?: React.ReactNode
  className?: string
}

export const MetricCard = ({
  title,
  value,
  trend,
  icon,
  className
}: MetricCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-surface/60 p-6 backdrop-blur-xl border border-border shadow-card flex flex-col",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-muted-foreground tracking-tight">
          {title}
        </h4>
        {icon && (
          <div className="text-muted-foreground/50">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </span>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-2 text-xs font-medium">
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5",
              trend.isPositive !== false
                ? "bg-success/10 text-success"
                : "bg-error/10 text-error"
            )}
          >
            {trend.isPositive !== false ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend.value)}%
          </span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </motion.div>
  )
}
