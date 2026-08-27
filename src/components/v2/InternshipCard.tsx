"use client"

import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import { Briefcase, MapPin, GraduationCap, ArrowUpRight } from "lucide-react"
import React, { MouseEvent } from "react"

import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic"
import { cn } from "@/lib/utils"

interface InternshipCardProps {
  role: string
  company: string
  location: string
  type: string
  stipend: string
  tags: string[]
  logoUrl?: string
  href: string
  className?: string
  isUrgent?: boolean
  collegeId?: string | null
}

import Image from "next/image"

export const InternshipCard = ({
  role,
  company,
  location,
  type,
  stipend,
  tags,
  logoUrl,
  href,
  className,
  isUrgent,
  collegeId
}: InternshipCardProps) => {
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
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface p-6 transition-all duration-300 hover:shadow-card-hover hover:border-primary/40 shadow-card border",
        isUrgent ? "border-error/30" : "border-border",
        className
      )}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              450px circle at ${mouseX}px ${mouseY}px,
              var(--color-primary) 0%,
              transparent 100%
            )
          `,
          opacity: 0.08,
        }}
      />
      {isUrgent ? (
        <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl bg-error/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-error">
          Urgent Hiring
        </div>
      ) : collegeId ? (
        <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-2xl bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
          <GraduationCap size={12} /> Campus Opportunity
        </div>
      ) : null}

      <div className="flex gap-5">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-surface border border-border shadow-sm overflow-hidden p-2">
          {logoUrl ? (
            <Image src={logoUrl} alt={company} fill className="object-contain p-2" />
          ) : (
            <span className="text-2xl font-bold text-foreground">
              {company.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex w-full flex-col justify-center">
          <div>
            <h3 className="text-lg font-heading font-semibold tracking-wide text-foreground line-clamp-1">
              {role}
            </h3>
          </div>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">
            {company}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-text-3" />
          {location}
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-text-3" />
          {type}
        </div>
        <div className="flex items-center gap-2 font-semibold text-text">
          <GraduationCap className="h-4 w-4 text-primary" />
          {stipend}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-surface-2 px-2 py-1 text-xs font-medium text-text-2"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="inline-flex items-center rounded-md bg-transparent px-1 py-1 text-xs font-medium text-muted-foreground">
              +{tags.length - 3}
            </span>
          )}
        </div>
        
        <HoverMagnetic strength={0.2}>
          <a
            href={href}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105"
          >
            <ArrowUpRight className="h-5 w-5" />
          </a>
        </HoverMagnetic>
      </div>
    </motion.div>
  )
}
