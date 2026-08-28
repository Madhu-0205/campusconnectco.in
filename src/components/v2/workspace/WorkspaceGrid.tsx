"use client"

import { motion } from"framer-motion"
import React from"react"

import { DesignNode } from"@/components/v2/inspector/DesignNode"
import { QualityGate } from"@/components/v2/QualityGate"

interface WorkspaceGridProps {
 children: React.ReactNode
}

export const WorkspaceGrid = ({ children }: WorkspaceGridProps) => {
 return (
 <DesignNode
 metadata={{
 name:"WorkspaceGrid",
 tokens: ['grid', 'gap-6'],
 typography:"Inter (Sans)",
 motionPreset:"fade-in",
 borderRadius:"rounded-2xl",
 elevation:"shadow-glow-primary",
 colors:"background, surface-2",
 spacing:"gap-6",
 accessibilityNotes:"Logical tab order maintained in the grid layout."
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
 <div
 className="flex overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 [&::-webkit-scrollbar]:hidden after:content-[''] after:shrink-0 after:w-6 md:after:hidden"
 >
 {React.Children.map(children, (child, index) => (
 <motion.div 
 initial={{ opacity: 0 }} 
 animate={{ opacity: 1 }} 
 transition={{ duration: 0.15, delay: index * 0.03 }}
 className="w-[85vw] shrink-0 snap-center md:w-auto flex flex-col h-full"
 >
 {child}
 </motion.div>
 ))}
 </div>
 </div>
 </DesignNode>
 )
}
