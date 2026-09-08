"use client"

import dynamic from"next/dynamic"
import React, { useEffect, useState } from"react"

import { AnalyticsProvider } from"@/components/Analytics/AnalyticsProvider"

const CustomCursor = dynamic(() => import("@/components/ui/CustomCursor"), { ssr: false })
const GlobalBackground = dynamic(() => import("@/components/GlobalBackground").then(m => m.GlobalBackground), { ssr: false })
const SmoothScrollProvider = dynamic(() => import("@/components/ui/SmoothScroll"), { ssr: false })
const AIServiceAgent = dynamic(() => import("@/components/AIServiceAgent"), { ssr: false })
const NetworkStatusIndicator = dynamic(() => import("@/components/NetworkStatusIndicator"), { ssr: false })

export function ClientOnlyProviders({ children }: { children: React.ReactNode }) {
 const [mountedAgent, setMountedAgent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMountedAgent(true)
    }, 0)
    return () => clearTimeout(timer)
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
