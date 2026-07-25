"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface AnalyticsContextType {
  track: (event: string, data?: any) => void;
  sessionId: string;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children, userId }: { children: React.ReactNode; userId?: string }) {
  const [sessionId, setSessionId] = useState<string>("");
  const pathname = usePathname();

  const track = React.useCallback((event: string, data?: any) => {
    const currentSessionId = sessionStorage.getItem("cc_session_id");
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        data,
        userId: userId || null,
        sessionId: currentSessionId
      })
    }).catch(err => console.error("Analytics track failed", err));
  }, [userId]);

  useEffect(() => {
    // Generate or retrieve session ID
    let currentSessionId = sessionStorage.getItem("cc_session_id");
    if (!currentSessionId) {
      currentSessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("cc_session_id", currentSessionId);
      
      // Track session start
      track("session_start", { url: window.location.href });
    }
    const finalSessionId = currentSessionId;
    
    // Avoid synchronous cascading render
    queueMicrotask(() => {
      setSessionId(finalSessionId);
    });

    // Track session end (duration)
    const handleBeforeUnload = () => {
      // Use navigator.sendBeacon for reliable delivery on close
      const payload = JSON.stringify({
        event: "session_end",
        userId: userId || null,
        sessionId: currentSessionId,
        data: { url: window.location.href }
      });
      navigator.sendBeacon("/api/analytics/track", payload);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [track, userId]);

  // Track page views when pathname changes
  useEffect(() => {
    if (sessionId) {
      track("page_view", { path: pathname });
    }
  }, [pathname, sessionId, track]);

  return (
    <AnalyticsContext.Provider value={{ track, sessionId }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    // Return a dummy tracker if used outside provider (e.g. tests)
    return { track: () => {}, sessionId: "" };
  }
  return context;
}
