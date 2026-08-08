"use client"

import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { MapProvider } from "./MapContext"
import { Map as MapIcon, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Dynamically import the MapLibre component to avoid SSR issues
const ContextualMap = dynamic(() => import("./ContextualMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0A0A0F] flex items-center justify-center border-l border-white/5">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/50 border-t-indigo-500 animate-spin mb-4" />
        <p className="text-muted-foreground text-sm">Loading map...</p>
      </div>
    </div>
  )
})

export function ContextualMapLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMapOpen, setIsMobileMapOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Prevent background scrolling when mobile map is open
  useEffect(() => {
    if (isMobile && isMobileMapOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
  }, [isMobile, isMobileMapOpen])

  return (
    <MapProvider>
      <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-64px)] relative bg-[#050508]">
        {/* Main Content Area */}
        <div className="flex-1 w-full lg:max-w-[calc(100%-400px)] xl:max-w-[calc(100%-500px)] relative z-10 bg-[#050508]">
          {children}
        </div>

        {/* Desktop Sticky Map Area */}
        {!isMobile && (
          <div className="hidden lg:block fixed top-[64px] right-0 bottom-0 w-[400px] xl:w-[500px] border-l border-white/5 z-0">
            <ContextualMap />
          </div>
        )}

        {/* Mobile FAB to open Map */}
        {isMobile && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMapOpen(true)}
            className="fixed bottom-24 right-6 z-40 flex items-center justify-center gap-2 bg-[#7c3aed] text-white px-5 py-3.5 rounded-full shadow-[0_0_20px_rgba(124,58,237,0.4)] font-medium"
          >
            <MapIcon size={20} />
            Map View
          </motion.button>
        )}

        {/* Mobile Map Bottom Sheet / Full Screen Overlay */}
        <AnimatePresence>
          {isMobile && isMobileMapOpen && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-50 flex flex-col bg-[#050508]"
            >
              <div className="flex items-center justify-between p-4 bg-[#0A0A0F] border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <MapIcon size={20} className="text-[#7c3aed]" />
                  <span className="font-medium text-white">Location Intelligence</span>
                </div>
                <button 
                  onClick={() => setIsMobileMapOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 relative">
                <ContextualMap />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MapProvider>
  )
}
