"use client"

import { motion, AnimatePresence } from"framer-motion"
import { X, Layers, Type, Wind, Maximize, Droplet, Box, Keyboard } from"lucide-react"
import React from"react"

import { Badge } from"@/components/ui/Badge"

import { useDesignInspector } from"./DesignInspectorProvider"



export const DesignPropertiesPanel = () => {
 const { isActive, selectedNode, setSelectedNode } = useDesignInspector()

 if (!isActive) return null

 return (
 <AnimatePresence>
 {selectedNode && (
 <motion.div
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ type:"spring", stiffness: 400, damping: 30 }}
 className="fixed right-6 top-24 z-50 w-80 bg-surface/90 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]"
 >
 <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2/50">
 <div>
 <h3 className="font-bold text-sm tracking-tight">{selectedNode.name}</h3>
 <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono mt-0.5">Properties Panel</p>
 </div>
 <button 
 onClick={() => setSelectedNode(null)}
 className="w-6 h-6 rounded-md hover:bg-surface flex items-center justify-center text-muted-foreground transition-colors"
 >
 <X className="w-3.5 h-3.5" />
 </button>
 </div>
 
 <div className="p-4 overflow-y-auto space-y-6 flex-1 scrollbar-none">
 
 {/* Tokens */}
 <div className="space-y-3">
 <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Layers className="w-3.5 h-3.5"/> Design Tokens</h4>
 <div className="flex flex-wrap gap-1.5">
 {selectedNode.tokens.map(token => (
 <Badge key={token} variant="outline" className="text-[10px] font-mono bg-surface-2/50 rounded-md px-1.5 py-0.5">{token}</Badge>
 ))}
 </div>
 </div>

 <div className="h-px w-full bg-border" />

 {/* Typography & Spacing */}
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1">
 <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1"><Type className="w-3 h-3"/> Typography</span>
 <p className="text-xs font-mono">{selectedNode.typography}</p>
 </div>
 <div className="space-y-1">
 <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1"><Maximize className="w-3 h-3"/> Spacing</span>
 <p className="text-xs font-mono">{selectedNode.spacing}</p>
 </div>
 </div>

 {/* Colors & Elevation */}
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1">
 <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1"><Droplet className="w-3 h-3"/> Colors</span>
 <p className="text-xs font-mono">{selectedNode.colors}</p>
 </div>
 <div className="space-y-1">
 <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1"><Layers className="w-3 h-3"/> Elevation</span>
 <p className="text-xs font-mono">{selectedNode.elevation}</p>
 </div>
 </div>

 {/* Border Radius & Motion */}
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1">
 <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1"><Box className="w-3 h-3"/> Radius</span>
 <p className="text-xs font-mono">{selectedNode.borderRadius}</p>
 </div>
 <div className="space-y-1">
 <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1"><Wind className="w-3 h-3"/> Motion</span>
 <p className="text-xs font-mono">{selectedNode.motionPreset}</p>
 </div>
 </div>

 <div className="h-px w-full bg-border" />

 {/* Accessibility Notes */}
 <div className="space-y-2">
 <h4 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Keyboard className="w-3.5 h-3.5"/> Accessibility</h4>
 <p className="text-xs text-text-2 leading-relaxed bg-surface-2 p-3 rounded-xl -subtle">{selectedNode.accessibilityNotes}</p>
 </div>

 </div>
 </motion.div>
 )}
 </AnimatePresence>
 )
}
