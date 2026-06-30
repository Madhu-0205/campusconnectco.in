"use client"
import { useState, useCallback } from "react"
import { motion } from "framer-motion"

interface FeeCalculatorProps {
  defaultValue?: number
  className?: string
}

const tiers = [
  { label: "Free (15% cut)", cut: 0.15 },
  { label: "Starter ₹999/mo (8%)", cut: 0.08 },
  { label: "Growth ₹2,499/mo (5%)", cut: 0.05 },
]

export default function FeeCalculator({ defaultValue = 2000, className = "" }: FeeCalculatorProps) {
  const [gigValue, setGigValue] = useState(defaultValue)
  const [tierIdx, setTierIdx] = useState(0)

  const cut = tiers[tierIdx].cut
  const studentReceives = Math.round(gigValue * (1 - cut))
  const platformEarns = Math.round(gigValue * cut)

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setGigValue(Number(e.target.value))
  }, [])

  const sliderPct = ((gigValue - 500) / (50_000 - 500)) * 100

  return (
    <div className={`bg-[#0D1527]/80 border border-[#7C3AED]/25 rounded-3xl p-8 backdrop-blur-sm shadow-[0_0_60px_rgba(124,58,237,0.10)] ${className}`}>
      <h3 className="font-black mb-1 text-center" style={{ fontFamily: "var(--cc-font-display)" }}>
        💰 Live Fee Calculator
      </h3>
      <p className="text-center mb-8">See exactly how the fee split works in real time</p>

      <div className="max-w-xl mx-auto space-y-6">
        {/* Gig Value Slider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold">Gig Value</label>
            <span className="font-black text-xl">₹{gigValue.toLocaleString("en-IN")}</span>
          </div>
          <input
            type="range"
            min={500}
            max={50_000}
            step={100}
            value={gigValue}
            onChange={handleSlider}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #7C3AED ${sliderPct}%, rgba(255,255,255,0.1) ${sliderPct}%)`,
            }}
          />
          <div className="flex justify-between text-slate-600 mt-1">
            <span>₹500</span><span>₹50,000</span>
          </div>
        </div>

        {/* Tier Selector */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest mb-2 block">
            Startup Subscription Tier
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            {tiers.map((t, i) => (
              <button
                key={i}
                onClick={() => setTierIdx(i)}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold border transition-all ${ tierIdx === i ? "bg-[#7C3AED] border-[#7C3AED] shadow-[0_0_20px_rgba(124,58,237,0.4)]" : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white" }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: "Startup Pays", value: `₹${gigValue.toLocaleString("en-IN")}`, color: "text-white", bg: "bg-white/5 border-white/8" },
            { label: "Student Receives", value: `₹${studentReceives.toLocaleString("en-IN")}`, color: "text-[#10B981]", bg: "bg-[#10B981]/10 border-[#10B981]/20" },
            { label: "Platform Earns", value: `₹${platformEarns.toLocaleString("en-IN")}`, color: "text-[#7C3AED]", bg: "bg-[#7C3AED]/10 border-[#7C3AED]/20" },
          ].map((item) => (
            <motion.div
              key={item.label}
              layout
              className={`border rounded-2xl p-4 ${item.bg}`}
            >
              <div className={`text-xl sm:text-2xl font-black ${item.color} mb-1`}>{item.value}</div>
              <div className="text-[11px] font-medium">{item.label}</div>
            </motion.div>
          ))}
        </div>

        <p className="text-slate-600">
          Platform cut: <strong className="text-slate-400">{Math.round(cut * 100)}%</strong> ·
          Charged to startup · Student gets full amount shown above
        </p>
      </div>
    </div>
  )
}
