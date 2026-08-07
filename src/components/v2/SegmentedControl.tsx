"use client"

import { motion } from "framer-motion"
import React, { useState } from "react"

import { cn } from "@/lib/utils"

interface SegmentedControlProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export const SegmentedControl = ({
  options,
  value,
  onChange,
  className
}: SegmentedControlProps) => {
  return (
    <div
      className={cn(
        "relative flex w-max items-center rounded-lg bg-surface-2 p-1",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            "relative z-10 px-4 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md",
            value === option
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {value === option && (
            <motion.div
              layoutId="segmented-control-active"
              className="absolute inset-0 -z-10 rounded-md bg-surface shadow-sm border border-border/50"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          {option}
        </button>
      ))}
    </div>
  )
}
