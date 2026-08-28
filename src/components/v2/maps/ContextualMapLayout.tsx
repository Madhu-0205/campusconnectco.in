"use client"

import { motion, AnimatePresence } from"framer-motion"
import { Map as MapIcon, X } from"lucide-react"
import dynamic from"next/dynamic"
import React, { useState, useEffect } from"react"

import { MapProvider } from"./MapContext"


// Dynamically import the MapLibre component to avoid SSR issues
const ContextualMap = dynamic(() => import("./ContextualMap"), {
 ssr: false,
 loading: () => (
 <div className="w-full h-full bg-surface flex items-center justify-center border-l border-border-subtle">
 <div className="animate-pulse flex flex-col items-center">
 <div className="w-8 h-8 rounded-full border-2 border-primary/50 border-t-primary animate-spin mb-4" />
 <p className="text-slate-500 text-sm font-medium">Loading map...</p>
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
 document.body.style.overflow ="hidden"
 } else {
 document.body.style.overflow ="unset"
 }
 }, [isMobile, isMobileMapOpen])

 return (
 <MapProvider>
 <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-64px)] relative bg-bg-subtle">
 {/* Main Content Area */}
 <div className="flex-1 w-full lg:max-w-[calc(100%-400px)] xl:max-w-[calc(100%-500px)] relative z-10 bg-bg-subtle">
 {children}
 </div>

 {/* Desktop Sticky Map Area */}
 {!isMobile && (
 <div className="hidden lg:block fixed top-16 right-0 bottom-0 w-100 xl:w-125 border-l border-border-subtle z-0">
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
 className="fixed bottom-24 right-6 z-40 flex items-center justify-center gap-2 bg-primary text-white px-5 py-3.5 rounded-full shadow-[0_0_20px_rgba(31,169,113,0.4)] font-bold"
 >
 <MapIcon size={20} />
 Map View
 </motion.button>
 )}

 {/* Mobile Map Bottom Sheet / Full Screen Overlay */}
 <AnimatePresence>
 {isMobile && isMobileMapOpen && (
 <motion.div
 initial={{ y:"100%" }}
 animate={{ y: 0 }}
 exit={{ y:"100%" }}
 transition={{ type:"spring", damping: 25, stiffness: 200 }}
 className="fixed inset-0 z-50 flex flex-col bg-bg-subtle"
 >
 <div className="flex items-center justify-between p-4 bg-white border-b border-border-subtle shrink-0">
 <div className="flex items-center gap-2">
 <MapIcon size={20} className="text-primary" />
 <span className="font-bold text-slate-900">Location Intelligence</span>
 </div>
 <button 
 onClick={() => setIsMobileMapOpen(false)}
 className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900"
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
