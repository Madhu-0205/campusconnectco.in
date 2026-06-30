"use client"
import { motion } from "framer-motion"
import { CheckCircle2, X, Minus } from "lucide-react"
import { useState, useCallback } from "react"

const rows = [
  "AI Career Roadmap",
  "Escrow-Protected Payments",
  "India Student Focus",
  "WhatsApp Gig Alerts",
  "Free for Students Forever",
  "Micro-Gig Marketplace",
]

const data: Record<string, ("yes" | "partial" | "no")[]> = {
  "CampusConnect": ["yes", "yes", "yes", "yes", "yes", "yes"],
  "Internshala": ["no", "no", "partial", "no", "no", "no"],
  "Fiverr": ["no", "partial", "no", "no", "no", "yes"],
  "LinkedIn": ["partial", "no", "no", "no", "no", "no"],
}

const cols = Object.keys(data)

function Cell({ val }: { val: "yes" | "partial" | "no" }) {
  if (val === "yes") return <CheckCircle2 size={18} className="mx-auto" style={{ color: "var(--success)" }} />
  if (val === "partial") return <Minus size={18} className="mx-auto" style={{ color: "var(--gold)" }} />
  return <X size={18} className="mx-auto" style={{ color: "var(--text-3)" }} />
}

export default function LandingComparison() {
  const [visibleRows, setVisibleRows] = useState(0)

  const handleInView = useCallback(
    (inView: boolean) => {
      if (inView && visibleRows < rows.length) {
        const timer = setInterval(() => {
          setVisibleRows((v) => {
            if (v >= rows.length) { clearInterval(timer); return v }
            return v + 1
          })
        }, 150)
      }
    },
    [visibleRows]
  )

  return (
    <section className="py-28 px-4 sm:px-6 relative" id="comparison">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          onViewportEnter={() => handleInView(true)}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6"
            style={{
              background: "rgba(6,182,212,0.08)",
              border: "1px solid rgba(6,182,212,0.2)",
              color: "var(--accent)",
              fontFamily: "var(--font-mono)",
            }}
          >
            ✦ Comparison
          </div>
          <h2
            className="text-4xl sm:text-5xl mb-5 tracking-tight"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 700, color: "var(--text)" }}
          >
            Why students are switching.
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-2)" }}>
            We&apos;re not another job board. See exactly what sets CampusConnect apart from legacy platforms.
          </p>
        </motion.div>

        <div
          className="overflow-x-auto rounded-3xl shadow-2xl backdrop-blur-sm"
          style={{ border: "1px solid var(--border)", background: "rgba(17,17,39,0.5)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="text-left px-6 py-5 font-semibold w-56" style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>Feature</th>
                {cols.map((col, i) => (
                  <th
                    key={col}
                    className="px-6 py-5 text-center font-bold relative"
                    style={{ color: i === 0 ? "var(--primary-light)" : "var(--text-3)", fontFamily: "var(--font-heading)" }}
                  >
                    {i === 0 && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: "rgba(124,58,237,0.04)",
                          borderLeft: "1px solid rgba(124,58,237,0.2)",
                          borderRight: "1px solid rgba(124,58,237,0.2)",
                        }}
                      />
                    )}
                    <span className="relative text-base">{col}</span>
                    {i === 0 && (
                      <div
                        className="block mt-1 text-[8px] font-bold px-2 py-0.5 rounded-full mx-auto w-max uppercase tracking-widest"
                        style={{ color: "var(--primary-light)", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}
                      >
                        Ideal
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <motion.tr
                  key={row}
                  initial={{ opacity: 0, x: -12 }}
                  animate={rowIdx < visibleRows ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                  transition={{ duration: 0.4, delay: rowIdx * 0.05 }}
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <td className="px-6 py-4 font-medium" style={{ color: "var(--text-2)" }}>{row}</td>
                  {cols.map((col, ci) => (
                    <td key={col} className="px-6 py-4 text-center relative">
                      {ci === 0 && (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: "rgba(124,58,237,0.02)",
                            borderLeft: "1px solid rgba(124,58,237,0.12)",
                            borderRight: "1px solid rgba(124,58,237,0.12)",
                          }}
                        />
                      )}
                      <span className="relative"><Cell val={data[col][rowIdx]} /></span>
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-xs mt-6 text-center"
          style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}
        >
          ✓ = Full support · — = Partial · ✗ = Not supported
        </motion.p>
      </div>
    </section>
  )
}

