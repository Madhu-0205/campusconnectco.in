"use client"

import dynamic from "next/dynamic"
import React from "react"

const CustomCursor = dynamic(() => import("@/components/ui/CustomCursor"), { ssr: false })
const GlobalBackground = dynamic(() => import("@/components/GlobalBackground").then(m => m.GlobalBackground), { ssr: false })
const SmoothScrollProvider = dynamic(() => import("@/components/ui/SmoothScroll"), { ssr: false })
const AIServiceAgent = dynamic(() => import("@/components/AIServiceAgent"), { ssr: false })
const NetworkStatusIndicator = dynamic(() => import("@/components/NetworkStatusIndicator"), { ssr: false })

export function ClientOnlyProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomCursor />
      <GlobalBackground />
      <SmoothScrollProvider>
        {children}
      </SmoothScrollProvider>
      <AIServiceAgent />
      <NetworkStatusIndicator />
    </>
  )
}
