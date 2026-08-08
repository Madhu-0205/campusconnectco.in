"use client"

import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import { Clock, MapPin, DollarSign, ArrowRight, GraduationCap } from "lucide-react"
import React, { MouseEvent } from "react"

import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic"
import { cn } from "@/lib/utils"

interface GigCardProps {
  title: string
  company: string
  location: string
  compensation: string
  duration: string
  tags: string[]
  logoUrl?: string
  href: string
  className?: string
  isFeatured?: boolean
  collegeId?: string | null
}

import Image from "next/image"

export const GigCard = ({
  title,
  company,
  location,
  compensation,
  duration,
  tags,
  logoUrl,
  href,
  className,
  isFeatured,
  collegeId
}: GigCardProps) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface/80 p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-card-hover shadow-card border",
        isFeatured ? "border-primary/30" : "border-border",
        className
      )}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              var(--color-primary) 0%,
              transparent 100%
            )
          `,
          opacity: 0.1,
        }}
      />
      
      {/* Glow Effect for Featured */}
      {isFeatured && (
        <div className="absolute -right-20 -top-20 -z-10 h-40 w-40 rounded-full bg-primary/20 blur-[60px]" />
      )}

      {collegeId && (
        <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl bg-violet-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-400 backdrop-blur-md flex items-center gap-1">
          <GraduationCap size={12} /> Campus Opportunity
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2 overflow-hidden">
            {logoUrl ? (
              <Image src={logoUrl} alt={company} fill className="object-cover" />
            ) : (
              <span className="text-xl font-bold text-muted-foreground">
                {company.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground line-clamp-1">
              {title}
            </h3>
            <p className="text-sm font-medium text-muted-foreground">
              {company}
            </p>
          </div>
        </div>
        <HoverMagnetic strength={0.1}>
          <a
            href={href}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <ArrowRight className="h-4 w-4" />
          </a>
        </HoverMagnetic>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {location}
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-text">
          <DollarSign className="h-3.5 w-3.5 text-primary" />
          {compensation}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {duration}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-2 -subtle"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
