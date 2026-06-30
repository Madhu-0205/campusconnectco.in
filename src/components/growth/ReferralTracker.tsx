"use client"

import { useEffect } from "react"

export function ReferralTracker() {
  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return

    const code = localStorage.getItem("campusconnect_ref_code")
    if (!code) return

    async function registerReferral() {
      try {
        const res = await fetch("/api/growth/referral/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        })

        const data = await res.json()
        if (res.ok || data.message === "User is already associated with a referral link") {
          console.log("[ReferralTracker] Registered referral code:", code)
          localStorage.removeItem("campusconnect_ref_code")
        } else {
          console.warn("[ReferralTracker] Registration failed or invalid code:", data.error || data.message)
          // Also clear it to prevent infinite loops of bad codes
          localStorage.removeItem("campusconnect_ref_code")
        }
      } catch (err) {
        console.error("[ReferralTracker] Error registering referral:", err)
      }
    }

    // Delay slightly to ensure session is fully resolved if loading slowly
    const timer = setTimeout(() => {
      registerReferral()
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return null
}
