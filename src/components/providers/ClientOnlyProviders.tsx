"use client"

import dynamic from "next/dynamic"
import React, { useEffect, useState } from "react"
import { AnalyticsProvider } from "@/components/Analytics/AnalyticsProvider"

const CustomCursor = dynamic(() => import("@/components/ui/CustomCursor"), { ssr: false })
const GlobalBackground = dynamic(() => import("@/components/GlobalBackground").then(m => m.GlobalBackground), { ssr: false })
const SmoothScrollProvider = dynamic(() => import("@/components/ui/SmoothScroll"), { ssr: false })
const AIServiceAgent = dynamic(() => import("@/components/AIServiceAgent"), { ssr: false })
const NetworkStatusIndicator = dynamic(() => import("@/components/NetworkStatusIndicator"), { ssr: false })

export function ClientOnlyProviders({ children }: { children: React.ReactNode }) {
  const [mountedAgent, setMountedAgent] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        const handle = window.requestIdleCallback(() => {
          setMountedAgent(true)
        }, { timeout: 4000 })
        return () => window.cancelIdleCallback(handle)
      } else {
        const handle = setTimeout(() => {
          setMountedAgent(true)
        }, 1500)
        return () => clearTimeout(handle)
      }
    }
  }, [])

  return (
    <>
      <CustomCursor />
      <GlobalBackground />
      <SmoothScrollProvider>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </SmoothScrollProvider>
      {mountedAgent && <AIServiceAgent />}
      <NetworkStatusIndicator />
    </>
  )
}
