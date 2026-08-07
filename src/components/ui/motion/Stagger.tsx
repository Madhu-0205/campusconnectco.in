"use client"

import { motion, useInView } from "framer-motion"
import React, { useRef } from "react"

interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  delayChildren?: number
  staggerChildren?: number
}

export const StaggerContainer = ({
  children,
  className,
  delayChildren = 0.1,
  staggerChildren = 0.05
}: StaggerContainerProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-40px" })

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren,
            delayChildren
          }
        }
      }}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  )
}

export const StaggerItem = ({
  children,
  className,
  yOffset = 20
}: {
  children: React.ReactNode
  className?: string
  yOffset?: number
}) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: yOffset },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
      }}
    >
      {children}
    </motion.div>
  )
}
