"use client"

import { AnimatePresence, motion } from "framer-motion"
import { GraduationCap, ChevronDown, X } from "lucide-react"
import { useState, useCallback } from "react"

import CollegePickerSkeleton from "./CollegePickerSkeleton"
import CollegeSearchList from "./CollegeSearchList"
import LocationPermissionCard from "./LocationPermissionCard"
import ManualCollegeForm from "./ManualCollegeForm"

type PickerState = "idle" | "permission" | "locating" | "list" | "manual"

interface CollegePickerProps {
  value: string
  onChange: (name: string, id: string) => void
  userId?: string
}

export default function CollegePicker({ value, onChange, userId }: CollegePickerProps) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<PickerState>("permission")
  const [hasLocation, setHasLocation] = useState(false)
  const [userLat, setUserLat] = useState<number | undefined>()
  const [userLng, setUserLng] = useState<number | undefined>()
  const [isRequesting, setIsRequesting] = useState(false)

  const openPicker = useCallback(() => {
    setOpen(true)
    // If already used location before, skip to list
    if (hasLocation || state === "list") {
      setState("list")
    } else {
      setState("permission")
    }
  }, [hasLocation, state])

  const handleAllowLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState("list")
      return
    }
    setIsRequesting(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
        setHasLocation(true)
        setIsRequesting(false)
        setState("locating")
        // Brief "locating" shimmer before showing list
        setTimeout(() => setState("list"), 600)
      },
      () => {
        // Permission denied or error → skip to list
        setIsRequesting(false)
        setState("list")
      },
      { timeout: 8000, maximumAge: 300000 }
    )
  }, [])

  const handleSkipLocation = useCallback(() => {
    setIsRequesting(false)
    setState("list")
  }, [])

  const handleSelect = useCallback(
    (name: string, id: string) => {
      onChange(name, id)
      setOpen(false)
      setState("list") // keep list ready for next open
    },
    [onChange]
  )

  const handleManualSuccess = useCallback(
    (name: string, id: string) => {
      onChange(name, id)
      setTimeout(() => {
        setOpen(false)
        setState("list")
      }, 400)
    },
    [onChange]
  )

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("", "")
  }

  return (
    <div className="relative" id="college-picker-container">
      {/* Trigger button */}
      <button
        type="button"
        onClick={openPicker}
        id="college-picker-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="w-full flex items-center gap-2 text-left p-3.5 rounded-xl border outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#7C3AED]/50"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: value ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.08)",
          boxShadow: value ? "0 0 0 1px rgba(124,58,237,0.15)" : "none",
        }}
      >
        <GraduationCap
          className="w-4 h-4 shrink-0"
          style={{ color: value ? "#8B5CF6" : "#475569" }}
        />
        <span
          className="flex-1 text-sm font-medium truncate"
          style={{ color: value ? "#E2E8F0" : "#475569" }}
        >
          {value || "Search or select your college…"}
        </span>
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear college selection"
            className="shrink-0 text-slate-500 hover:text-white transition-colors p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown
            className="w-4 h-4 shrink-0"
            style={{ color: "#475569" }}
          />
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.3)" }}
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl border shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden"
              style={{
                background: "rgba(10,14,33,0.96)",
                borderColor: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(24px)",
              }}
              role="dialog"
              aria-modal="true"
              aria-label="College picker"
            >
              {/* Top accent */}
              <div
                className="h-px w-full"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(124,58,237,0.6), rgba(99,102,241,0.4), transparent)",
                }}
              />

              <div className="p-4">
                <AnimatePresence mode="wait">
                  {state === "permission" && (
                    <motion.div key="permission" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <LocationPermissionCard
                        onAllow={handleAllowLocation}
                        onSkip={handleSkipLocation}
                        isRequesting={isRequesting}
                      />
                    </motion.div>
                  )}

                  {state === "locating" && (
                    <motion.div key="locating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <CollegePickerSkeleton />
                    </motion.div>
                  )}

                  {state === "list" && (
                    <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <CollegeSearchList
                        selectedValue={value}
                        onSelect={handleSelect}
                        onCantFind={() => setState("manual")}
                        hasLocation={hasLocation}
                        userLat={userLat}
                        userLng={userLng}
                      />
                    </motion.div>
                  )}

                  {state === "manual" && (
                    <motion.div key="manual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ManualCollegeForm
                        onBack={() => setState("list")}
                        onSuccess={handleManualSuccess}
                        userId={userId}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
