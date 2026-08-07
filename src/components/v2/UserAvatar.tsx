"use client"

import React from "react"

import { cn } from "@/lib/utils"

interface UserAvatarProps {
  src?: string | null
  alt: string
  fallback: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  isOnline?: boolean
}
import Image from "next/image"

export const UserAvatar = ({
  src,
  alt,
  fallback,
  size = "md",
  className,
  isOnline
}: UserAvatarProps) => {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  }

  const badgeSizeClasses = {
    sm: "h-2 w-2 right-0 top-0",
    md: "h-2.5 w-2.5 right-0 top-0",
    lg: "h-3 w-3 right-0.5 top-0.5",
    xl: "h-4 w-4 right-1 top-1",
  }

  return (
    <div className={cn("relative inline-flex shrink-0", sizeClasses[size], className)}>
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-surface-2 shadow-sm">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
          />
        ) : (
          <span className="font-medium text-muted-foreground uppercase">
            {fallback.slice(0, 2)}
          </span>
        )}
      </div>
      {isOnline && (
        <span
          className={cn(
            "absolute block rounded-full bg-success ring-2 ring-background",
            badgeSizeClasses[size]
          )}
        />
      )}
    </div>
  )
}
