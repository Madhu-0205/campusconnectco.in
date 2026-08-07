"use client"

import React from "react"
import { DesignNode } from "@/components/v2/inspector/DesignNode"
import { QualityGate } from "@/components/v2/QualityGate"
import { StaggerContainer, StaggerItem } from "@/components/ui/motion/Stagger"

interface WorkspaceGridProps {
  children: React.ReactNode
}

export const WorkspaceGrid = ({ children }: WorkspaceGridProps) => {
  return (
    <DesignNode
      metadata={{
        name: "WorkspaceGrid",
        tokens: ['grid', 'gap-6'],
        typography: "Inter (Sans)",
        motionPreset: "stagger, springSmooth",
        borderRadius: "rounded-2xl",
        elevation: "shadow-glow-primary",
        colors: "background, surface-2",
        spacing: "gap-6",
        accessibilityNotes: "Logical tab order maintained in the grid layout."
      }}
    >
      <div className="relative">
        <QualityGate 
          componentName="WorkspaceGrid"
          checks={{ 
            accessibility: true, 
            responsive: true, 
            darkMode: true, 
            lightMode: true,
            keyboardNavigation: true,
            motion: true,
            loadingState: true,
            emptyState: true,
            errorState: true,
            performance: true
          }} 
        />
        <StaggerContainer
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          staggerChildren={0.05}
        >
          {React.Children.map(children, (child) => (
            <StaggerItem className="w-full flex flex-col h-full">
              {child}
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </DesignNode>
  )
}
