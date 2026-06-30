"use client"
import { useInView } from "framer-motion"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

interface MatchRingProps {
  value: number          // 0–100
  size?: number          // SVG diameter in px, default 56
  strokeWidth?: number   // default 5
  className?: string
  showLabel?: boolean
  animate?: boolean
}

function getColor(value: number) {
  if (value >= 81) return "#10B981"  // green
  if (value >= 61) return "#0EA5E9"  // teal
  return "#F59E0B"                   // amber
}

export default function MatchRing({
  value,
  size = 56,
  strokeWidth = 5,
  className,
  showLabel = true,
  animate = true,
}: MatchRingProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const [displayed, setDisplayed] = useState(animate ? 0 : value)

  const cx = size / 2
  const r = cx - strokeWidth
  const circumference = 2 * Math.PI * r
  const progress = (displayed / 100) * circumference
  const color = getColor(value)

  useEffect(() => {
    if (!animate || !inView) return

    let start: number | null = null
    const duration = 1200

    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * value))
      if (elapsed < duration) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [inView, animate, value])

  return (
    <div
      ref={ref}
      className={cn("relative flex items-center justify-center shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cx}
          r={r}
          strokeWidth={strokeWidth}
          fill="transparent"
          stroke="rgba(255,255,255,0.08)"
        />
        {/* Progress */}
        <circle
          cx={cx}
          cy={cx}
          r={r}
          strokeWidth={strokeWidth}
          fill="transparent"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ transition: "stroke 0.3s ease" }}
        />
      </svg>
      {showLabel && (
        <span
          className="absolute text-white font-black tabular-nums"
          style={{ fontSize: size * 0.22, lineHeight: 1 }}
        >
          {displayed}%
        </span>
      )}
    </div>
  )
}
