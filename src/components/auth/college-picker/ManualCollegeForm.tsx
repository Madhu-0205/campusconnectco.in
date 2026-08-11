"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Building2, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { useState } from "react"

import { INDIAN_STATES } from "@/lib/colleges-dataset"

interface ManualCollegeFormProps {
  onBack: () => void
  onSuccess: (collegeName: string, id: string) => void
  userId?: string
}

interface FormState {
  name: string
  city: string
  district: string
  state: string
  university: string
  website: string
}

const INPUT_CLS =
  "w-full bg-white/4 border border-white/8 text-white placeholder-slate-600 p-3 rounded-xl text-sm focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50 outline-none transition-all font-medium"

export default function ManualCollegeForm({
  onBack,
  onSuccess,
  userId,
}: ManualCollegeFormProps) {
  const [form, setForm] = useState<FormState>({
    name: "", city: "", district: "", state: "", university: "", website: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.name.trim() || !form.city.trim() || !form.district.trim() || !form.state) {
      setError("Please fill in college name, city, district, and state.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/colleges/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to submit college")
      setSubmitted(true)
      setTimeout(() => onSuccess(form.name.trim(), data.college.id), 1800)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold transition-colors focus:outline-none"
        style={{ color: "#64748B" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#C4B5FD" }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#64748B" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to search
      </button>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-4"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.12)", border: "1.5px solid rgba(16,185,129,0.3)" }}
            >
              <CheckCircle2 className="w-8 h-8" style={{ color: "#10B981" }} />
            </motion.div>
            <div>
              <p className="font-black text-white text-base mb-1" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
                You&apos;re the first from {form.name.trim()} 🎉
              </p>
              <p className="text-sm" style={{ color: "#64748B" }}>
                Submitted for review. You can continue signing up now.
              </p>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold" style={{ color: "#8B5CF6" }}>
              <Sparkles className="w-3.5 h-3.5" />
              Pioneering your campus on CampusConnect!
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={handleSubmit} className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}
              >
                <Building2 className="w-4.5 h-4.5" style={{ color: "#8B5CF6" }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Add Your College</p>
                <p className="text-xs" style={{ color: "#64748B" }}>
                  We couldn&apos;t find your campus yet. Add it in seconds.
                </p>
              </div>
            </div>

            {/* AI message */}
            <div
              className="text-xs p-3 rounded-xl border"
              style={{
                background: "rgba(124,58,237,0.06)",
                borderColor: "rgba(124,58,237,0.15)",
                color: "#94A3B8",
              }}
            >
              <Sparkles className="w-3 h-3 inline-block mr-1" style={{ color: "#8B5CF6" }} />
              Become the first verified student from your college. We&apos;ll notify peers at your campus!
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
                {error}
              </p>
            )}

            {/* Fields */}
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                College Name *
              </label>
              <input
                placeholder="e.g. Pragati Engineering College"
                value={form.name}
                onChange={set("name")}
                required
                className={INPUT_CLS}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  City *
                </label>
                <input
                  placeholder="e.g. Surampalem"
                  value={form.city}
                  onChange={set("city")}
                  required
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  District *
                </label>
                <input
                  placeholder="e.g. East Godavari"
                  value={form.district}
                  onChange={set("district")}
                  required
                  className={INPUT_CLS}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                State *
              </label>
              <select
                value={form.state}
                onChange={set("state")}
                required
                className={INPUT_CLS + " cursor-pointer"}
              >
                <option value="" disabled>Select state…</option>
                {INDIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                University (optional)
              </label>
              <input
                placeholder="e.g. JNTU Kakinada"
                value={form.university}
                onChange={set("university")}
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Website (optional)
              </label>
              <input
                type="url"
                placeholder="https://yourcollegename.edu"
                value={form.website}
                onChange={set("website")}
                className={INPUT_CLS}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 mt-2"
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)",
                boxShadow: "0 4px 16px rgba(124,58,237,0.25)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  Submit My College
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
