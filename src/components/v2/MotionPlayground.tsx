"use client"

import { motion} from "framer-motion"
import React, { useState } from "react"


export const MotionPlayground = () => {
  const [stiffness, setStiffness] = useState(300)
  const [damping, setDamping] = useState(20)
  const [mass, setMass] = useState(1)
  const [active, setActive] = useState(false)

  return (
    <div className="rounded-2xl bg-surface p-8 shadow-card flex flex-col md:flex-row gap-12 items-center">
      <div className="flex-1 space-y-6 w-full max-w-sm">
        <div>
          <h3 className="text-lg font-bold mb-1">Spring Physics</h3>
          <p className="text-sm text-muted-foreground mb-6">Tweak the values to feel the motion.</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-text-2">Stiffness</span>
              <span className="text-text-3 font-mono">{stiffness}</span>
            </div>
            <input 
              type="range" min="50" max="600" value={stiffness} 
              onChange={(e) => setStiffness(Number(e.target.value))}
              className="accent-primary"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-text-2">Damping</span>
              <span className="text-text-3 font-mono">{damping}</span>
            </div>
            <input 
              type="range" min="5" max="50" value={damping} 
              onChange={(e) => setDamping(Number(e.target.value))}
              className="accent-primary"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-text-2">Mass</span>
              <span className="text-text-3 font-mono">{mass}</span>
            </div>
            <input 
              type="range" min="0.1" max="5" step="0.1" value={mass} 
              onChange={(e) => setMass(Number(e.target.value))}
              className="accent-primary"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full min-h-[300px] rounded-xl bg-surface-2 -subtle overflow-hidden relative">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <motion.div
          layout
          onClick={() => setActive(!active)}
          transition={{ type: "spring", stiffness, damping, mass }}
          className="relative z-10 flex cursor-pointer items-center justify-center rounded-2xl bg-primary text-primary-foreground font-semibold shadow-lg"
          style={{
            width: active ? 200 : 100,
            height: active ? 200 : 100,
            borderRadius: active ? 32 : 16,
          }}
        >
          Click Me
        </motion.div>
        
        <div className="absolute bottom-4 left-0 w-full text-center text-xs text-muted-foreground font-mono">
          transition={`{{ type: "spring", stiffness: ${stiffness}, damping: ${damping}, mass: ${mass} }}`}
        </div>
      </div>
    </div>
  )
}
