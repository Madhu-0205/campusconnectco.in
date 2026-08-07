"use client"

import { motion, useInView, UseInViewOptions } from "framer-motion"
import React, { useRef } from "react"

import { springGentle, springSmooth } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface RevealProps {
  children: React.ReactNode
  width?: "fit-content" | "100%"
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  gentle?: boolean
  inViewOptions?: UseInViewOptions
}

export const Reveal = ({
  children,
  width = "fit-content",
  className,
  delay = 0,
  direction = "up",
  gentle = true,
  inViewOptions = { once: true, margin: "-40px" }
}: RevealProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, inViewOptions)

  const getDirectionOffset = () => {
    switch (direction) {
      case "up": return { y: 20 }
      case "down": return { y: -20 }
      case "left": return { x: 20 }
      case "right": return { x: -20 }
      case "none": return {}
      default: return { y: 20 }
    }
  }

  const offset = getDirectionOffset()
  const physics = gentle ? springGentle : springSmooth

  return (
    <div ref={ref} style={{ width }} className={cn("relative overflow-hidden", className)}>
      <motion.div
        variants={{
          hidden: { opacity: 0, ...offset },
          visible: { opacity: 1, x: 0, y: 0 }
        }}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ ...physics, delay }}
      >
        {children}
      </motion.div>
    </div>
  )
}
