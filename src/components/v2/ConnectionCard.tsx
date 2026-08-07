"use client"

import { motion } from "framer-motion"
import { UserPlus, MessageCircle, MapPin } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/Button"
import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic"
import { cn } from "@/lib/utils"

import { UserAvatar } from "./UserAvatar"

interface ConnectionCardProps {
  name: string
  headline: string
  location?: string
  avatarUrl?: string
  isConnection?: boolean
  mutualCount?: number
  onConnect?: () => void
  onMessage?: () => void
  className?: string
}

export const ConnectionCard = ({
  name,
  headline,
  location,
  avatarUrl,
  isConnection,
  mutualCount,
  onConnect,
  onMessage,
  className
}: ConnectionCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "group flex flex-col items-center overflow-hidden rounded-2xl bg-surface/80 p-6 text-center backdrop-blur-xl transition-all duration-300 hover:shadow-card-hover shadow-card ",
        className
      )}
    >
      <UserAvatar
        src={avatarUrl}
        alt={name}
        fallback={name}
        size="xl"
        className="mb-4"
      />
      
      <h4 className="text-lg font-bold tracking-tight text-foreground line-clamp-1">
        {name}
      </h4>
      
      <p className="mt-1 text-xs font-medium text-muted-foreground line-clamp-2 min-h-8">
        {headline}
      </p>

      {location && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-text-3">
          <MapPin className="h-3.5 w-3.5" />
          {location}
        </div>
      )}

      {mutualCount !== undefined && mutualCount > 0 && (
        <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {mutualCount} mutual connections
        </p>
      )}

      <div className="mt-6 flex w-full gap-3">
        {isConnection ? (
          <Button
            variant="secondary"
            className="w-full font-medium"
            onClick={onMessage}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Message
          </Button>
        ) : (
          <HoverMagnetic strength={0.1}>
            <Button
              className="w-full font-medium"
              onClick={onConnect}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Connect
            </Button>
          </HoverMagnetic>
        )}
      </div>
    </motion.div>
  )
}
