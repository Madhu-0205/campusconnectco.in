"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Wifi, WifiOff, RefreshCw } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export default function NetworkStatusIndicator() {
  const mountedRef = useRef(false)
  const [state, setState] = useState<{
    isOnline: boolean
    hasChanged: boolean
    visible: boolean
    ready: boolean
  }>({ isOnline: true, hasChanged: false, visible: false, ready: false })

  useEffect(() => {
    // Define all state updaters as named event-handler callbacks
    const handleOnline = () => {
      setState({ isOnline: true, hasChanged: true, visible: true, ready: true })
      const timer = setTimeout(() => {
        setState(s => ({ ...s, visible: false }))
      }, 4000)
      return () => clearTimeout(timer)
    }

    const handleOffline = () => {
      setState({ isOnline: false, hasChanged: true, visible: true, ready: true })
    }

    const handleMount = () => {
      if (mountedRef.current) return
      mountedRef.current = true
      // Dispatch a synthetic offline event if we're already offline at mount time
      if (!navigator.onLine) {
        handleOffline()
      } else {
        setState(s => ({ ...s, ready: true }))
      }
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Defer the initial check to the next tick so it behaves like an event callback
    const t = setTimeout(handleMount, 0)

    return () => {
      clearTimeout(t)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!state.ready) return null
  if (state.isOnline && !state.hasChanged) return null

  return (
    <AnimatePresence>
      {state.visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-full border shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl pointer-events-auto ${
              state.isOnline
                ? "bg-emerald-950/70 border-emerald-500/30 text-emerald-100"
                : "bg-amber-950/70 border-amber-500/30 text-amber-100"
            }`}
          >
            <div className="relative flex h-3 w-3">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                  state.isOnline ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  state.isOnline ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </div>

            {state.isOnline ? (
              <Wifi size={18} className="text-emerald-400" />
            ) : (
              <WifiOff size={18} className="text-amber-400" />
            )}

            <span className="text-sm font-medium tracking-wide">
              {state.isOnline ? (
                "Back Online — Connection restored. Syncing data..."
              ) : (
                "Offline Mode — Dashboard and messaging are paused. Retrying..."
              )}
            </span>

            {!state.isOnline && (
              <RefreshCw size={14} className="animate-spin text-amber-400/80 ml-1" />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
