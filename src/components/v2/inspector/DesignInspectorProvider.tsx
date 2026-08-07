"use client"

import React, { createContext, useContext, useState } from "react"

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

const DesignInspectorContext = createContext<DesignInspectorContextType | undefined>(undefined)

export const DesignInspectorProvider = ({ children }: { children: React.ReactNode }) => {
  const [isActive, setIsActive] = useState(false)
  const [selectedNode, setSelectedNode] = useState<DesignMetadata | null>(null)

  return (
    <DesignInspectorContext.Provider value={{ isActive, setIsActive, selectedNode, setSelectedNode }}>
      {children}
    </DesignInspectorContext.Provider>
  )
}

export const useDesignInspector = () => {
  const context = useContext(DesignInspectorContext)
  if (!context) {
    throw new Error("useDesignInspector must be used within a DesignInspectorProvider")
  }
  return context
}
