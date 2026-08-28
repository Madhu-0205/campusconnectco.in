"use client"

import React, { createContext, useContext, useState } from"react"

export interface DesignMetadata {
 name: string
 tokens: string[]
 typography: string
 motionPreset: string
 borderRadius: string
 elevation: string
 colors: string
 spacing: string
 accessibilityNotes: string
}

interface DesignInspectorContextType {
 isActive: boolean
 setIsActive: (active: boolean) => void
 selectedNode: DesignMetadata | null
 setSelectedNode: (node: DesignMetadata | null) => void
}

// Exported so DesignNode can call useContext() directly (safe – returns undefined
// when no provider is present, instead of throwing).
export const DesignInspectorContext = createContext<DesignInspectorContextType | undefined>(undefined)

export const DesignInspectorProvider = ({ children }: { children: React.ReactNode }) => {
 const [isActive, setIsActive] = useState(false)
 const [selectedNode, setSelectedNode] = useState<DesignMetadata | null>(null)

 return (
 <DesignInspectorContext.Provider value={{ isActive, setIsActive, selectedNode, setSelectedNode }}>
 {children}
 </DesignInspectorContext.Provider>
 )
}

/**
 * A no-op context value used as a safe fallback outside the Design Lab.
 * Production pages that accidentally import a Design-Lab-only component
 * will receive this value instead of crashing.
 */
const NOOP_CONTEXT: DesignInspectorContextType = {
 isActive: false,
 setIsActive: () => {},
 selectedNode: null,
 setSelectedNode: () => {},
}

/**
 * useDesignInspector
 *
 * Usage contract:
 * - MUST be called inside <DesignInspectorProvider> (i.e. within /design-system).
 * - In development: throws a descriptive error if called outside the provider,
 * so engineers catch the misuse immediately.
 * - In production: returns a safe no-op fallback so the app never crashes.
 * Inspector features are silently disabled.
 */
export const useDesignInspector = (): DesignInspectorContextType => {
 const context = useContext(DesignInspectorContext)

 if (!context) {
 if (process.env.NODE_ENV ==="development") {
 throw new Error(
"[DesignInspector] useDesignInspector() was called outside <DesignInspectorProvider>.\n\n" +
"This hook is only valid inside /design-system (the Design Lab).\n\n" +
"If you are using <DesignNode> in a production page, it already handles the\n" +
"missing provider gracefully. You do NOT need useDesignInspector there.\n\n" +
"If you are building a new Design Lab component that needs this hook, ensure\n" +
"it is rendered as a descendant of <DesignInspectorProvider>."
 )
 }

 // Production: return a safe no-op so the app never hard-crashes.
 // Inspector features are simply disabled.
 return NOOP_CONTEXT
 }

 return context
}
