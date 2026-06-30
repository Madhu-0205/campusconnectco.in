"use client"

import { createClient } from "@/lib/supabase/client"
import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Loader2, UserPlus, AlertCircle, Sparkles, CheckCircle2, ChevronDown, Search, Eye, EyeOff, GraduationCap, Building2, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

// ── Indian colleges list ─────────────────────────────────────────────────────
const COLLEGES = [
  "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
  "IIT Roorkee", "IIT Guwahati", "IIT Hyderabad", "IIT BHU", "IIT Patna",
  "NIT Trichy", "NIT Warangal", "NIT Surathkal", "NIT Calicut", "NIT Rourkela",
  "BITS Pilani", "BITS Goa", "BITS Hyderabad", "BITS Pilani (Pilani Campus)",
  "IIIT Hyderabad", "IIIT Bangalore", "IIIT Allahabad",
  "VIT Vellore", "VIT Chennai", "VIT Bhopal", "VIT-AP",
  "SRM Institute of Science and Technology", "Manipal Institute of Technology",
  "PSG College of Technology", "Amrita School of Engineering",
  "Jadavpur University", "Anna University", "Osmania University",
  "Delhi Technological University", "NSUT Delhi", "IGDTUW",
  "PES University", "RV College of Engineering", "BMS College of Engineering",
  "SASTRA University", "Vellore Institute of Technology", "Sri Sivasubramaniya Nadar College",
  "Karpagam Academy of Higher Education", "Kumaraguru College of Technology",
  "Thiagarajar College of Engineering", "Coimbatore Institute of Technology",
  "Birla Institute of Technology Mesra", "Thapar Institute of Engineering",
  "Chandigarh University", "LPU (Lovely Professional University)",
  "KIIT University", "Kalinga Institute of Industrial Technology",
  "Other College / University",
]

// ── College Searchable Dropdown ──────────────────────────────────────────────
function CollegeDropdown({
  value, onChange
}: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = COLLEGES.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleOut(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOut)
    return () => document.removeEventListener("mousedown", handleOut)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setTimeout(() => inputRef.current?.focus(), 100) }}
        className="w-full bg-(--surface-2) border border-(--border) text-left p-3.5 rounded-xl focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50 outline-none transition-all flex items-center justify-between"
      >
        <span className={value ? "text-white font-medium" : "text-slate-600"}>
          {value || "Select your college…"}
        </span>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-[#1A2240] border border-(--border) rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Search input */}
            <div className="p-2 border-white/5 flex items-center gap-2 px-3">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search college…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none py-2"
              />
            </div>
            {/* College list */}
            <ul className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-center">No colleges found</li>
              ) : filtered.map(college => (
                <li key={college}>
                  <button
                    type="button"
                    onClick={() => { onChange(college); setOpen(false); setSearch("") }}
                    className={`w-full px-4 py-2.5 transition-colors hover:bg-[#7C3AED]/20 hover:text-white ${value === college ? "bg-[#7C3AED]/20 text-white font-bold" : "text-muted-foreground"}`}
                  >
                    {college}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Step Progress Bar ────────────────────────────────────────────────────────
function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="font-black uppercase tracking-widest text-muted-foreground">
          Step {current} of {total}
        </span>
        <span className="font-bold text-(--primary-light)">
          {Math.round((current / total) * 100)}% complete
        </span>
      </div>
      <div className="w-full h-1.5 bg-(--surface-2) rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(current / total) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full bg-linear-to-r from-(--primary) to-(--accent) rounded-full"
        />
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const roleParam = searchParams.get("role")?.toUpperCase()
  const initialRole = roleParam === "CLIENT" ? "CLIENT" : "STUDENT"

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: initialRole,
    college: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    setError("")
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=${form.role}`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-up failed")
      setGoogleLoading(false)
    }
  }

  const validateStep1 = () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters)")
      return false
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (form.role === "STUDENT" && !form.college) {
      setError("Please select your college")
      return false
    }
    return true
  }

  const handleNextStep = () => {
    setError("")
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (form.password.length < 8) throw new Error("Password must be at least 8 characters")
      const hasComplexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)
      if (!hasComplexity) throw new Error("Password must include uppercase, lowercase and numbers")

      const { checkPasswordBreach } = await import("@/lib/security/breach-check")
      const isBreached = await checkPasswordBreach(form.password)
      if (isBreached) throw new Error("This password has been found in a data breach. Please choose a more secure password.")

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { name: form.name, role: form.role, college: form.college },
        },
      })

      if (signUpError) throw signUpError
      if (!data.user) throw new Error("No user created")

      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.user.id,
          email: form.email,
          name: form.name,
          role: form.role,
          college: form.college,
        }),
      })

      if (!res.ok) throw new Error("Failed to create profile")

      if (data.session) {
        router.replace(form.role === "CLIENT" ? "/dashboard" : "/dashboard/student")
        router.refresh()
      } else {
        setSuccess(true)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-(--surface)/80 rounded-3xl border border-(--border) shadow-[0_0_50px_rgba(0,0,0,0.5)] p-10 text-center backdrop-blur-xl"
        style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
      >
        <div className="w-20 h-20 bg-[#10B981]/20 border border-[#10B981]/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h2 className="font-black text-white mb-3" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
          Check your email!
        </h2>
        <p className="text-base leading-relaxed mb-8">
          We&apos;ve sent a confirmation link to <span className="font-bold text-white">{form.email}</span>.
          Click it to activate your account and get started.
        </p>
        <Link href="/auth/sign-in" className="inline-block w-full px-6 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all">
          Go to Sign In
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md bg-(--surface)/80 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-(--border) overflow-hidden backdrop-blur-xl"
      style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
    >
      {/* Top accent line */}
      <div className="h-1.5 w-full bg-linear-to-r from-[#10B981] via-[#0EA5E9] to-[#7C3AED]" />

      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-(--surface-2) border border-(--border) rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <UserPlus size={22} className="text-(--primary-light)" />
          </div>
          <h1 className="font-black text-white" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
            Create Account
          </h1>
          <p className="text-sm mt-1">Join thousands on CampusConnect</p>
        </div>

        {/* Step Progress */}
        <StepProgress current={step} total={2} />

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 bg-[#F43F5E]/10 border border-[#F43F5E]/20 text-sm p-3.5 rounded-xl mb-5 font-medium"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── STEP 1: Role + Basic Info ──────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {/* Role Tabs */}
              <div>
                <label className="block font-black text-muted-foreground uppercase tracking-widest mb-2">I am a…</label>
                <div className="flex bg-(--surface-2) p-1 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: "STUDENT" })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-bold rounded-lg transition-all ${ form.role === "STUDENT" ? "bg-[#7C3AED] text-white shadow-lg" : "text-muted-foreground hover:text-white" }`}
                  >
                    <GraduationCap size={15} /> Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: "CLIENT" })}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-bold rounded-lg transition-all ${ form.role === "CLIENT" ? "bg-[#F59E0B] text-[#0A1628] shadow-lg" : "text-muted-foreground hover:text-white" }`}
                  >
                    <Building2 size={15} /> Startup
                  </button>
                </div>
              </div>

              {/* Full name */}
              <div>
                <label className="block font-black text-muted-foreground uppercase tracking-widest mb-2">
                  {form.role === "CLIENT" ? "Founder Name" : "Full Name"}
                </label>
                <input
                  placeholder={form.role === "CLIENT" ? "Sathwik Kumar" : "Priya Sharma"}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required minLength={2}
                  className="w-full bg-(--surface-2) border border-(--border) text-white placeholder-slate-600 p-3.5 rounded-xl focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50 outline-none transition-all font-medium"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-black text-muted-foreground uppercase tracking-widest mb-2">Email</label>
                <input
                  type="email"
                  placeholder={form.role === "STUDENT" ? "student@university.edu" : "founder@startup.com"}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full bg-(--surface-2) border border-(--border) text-white placeholder-slate-600 p-3.5 rounded-xl focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50 outline-none transition-all font-medium"
                />
              </div>

              {/* College (students only) */}
              {form.role === "STUDENT" && (
                <div>
                  <label className="block font-black text-muted-foreground uppercase tracking-widest mb-2">Your College</label>
                  <CollegeDropdown value={form.college} onChange={(v) => setForm({ ...form, college: v })} />
                </div>
              )}

              {/* Google sign-up */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-white/5" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-(--surface) font-bold text-[10px] uppercase tracking-widest">or sign up with Google</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl border border-(--border) bg-(--surface-2) hover:bg-white/10 transition-all font-bold text-white shadow-sm active:scale-[0.98] disabled:opacity-50"
              >
                {googleLoading ? <Loader2 size={18} className="animate-spin text-muted-foreground" /> : <GoogleIcon />}
                {googleLoading ? "Redirecting to Google..." : "Continue with Google"}
              </button>

              {/* Next button */}
              <button
                type="button"
                onClick={handleNextStep}
                className={`w-full font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${ form.role === "CLIENT" ? "bg-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]" }`}
              >
                Continue <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* ─── STEP 2: Password ──────────────────────────────────────────── */}
          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Account summary */}
              <div className="bg-white/4 border border-white/8 rounded-2xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${form.role === "CLIENT" ? "bg-[#F59E0B]/20" : "bg-[#7C3AED]/20"}`}>
                  {form.role === "CLIENT" ? <Building2 size={18} className="text-[#F59E0B]" /> : <GraduationCap size={18} className="text-(--primary-light)" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{form.name || "—"}</p>
                  <p className="text-xs truncate">{form.email}</p>
                </div>
                <button type="button" onClick={() => setStep(1)} className="font-bold text-(--primary-light) hover:text-white transition-colors shrink-0 ml-auto">
                  Edit
                </button>
              </div>

              {/* Password field */}
              <div>
                <label className="block font-black text-muted-foreground uppercase tracking-widest mb-2">Create Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 chars, uppercase & numbers"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required minLength={8}
                    className="w-full bg-(--surface-2) border border-(--border) text-white placeholder-slate-600 p-3.5 pr-12 rounded-xl focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50 outline-none transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[14px] text-muted-foreground hover:text-white transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Password strength hints */}
                {form.password.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {[
                      { label: "8+ chars", ok: form.password.length >= 8 },
                      { label: "Uppercase", ok: /[A-Z]/.test(form.password) },
                      { label: "Number", ok: /\d/.test(form.password) },
                    ].map(({ label, ok }) => (
                      <span key={label} className={`font-bold px-2 py-0.5 rounded-full ${ok ? "bg-[#10B981]/15" : "bg-(--surface-2) text-muted-foreground"}`}>
                        {ok ? "✓ " : "○ "}{label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className={`w-full font-black py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] mt-2 ${ form.role === "CLIENT" ? "bg-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]" }`}
              >
                {loading ? <><Loader2 className="animate-spin" size={18} /> Creating Account...</> : "Create Account"}
              </button>

              <button type="button" onClick={() => setStep(1)} className="w-full text-muted-foreground hover:text-muted-foreground transition-colors">
                ← Back
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-muted-foreground mt-5 leading-relaxed">
          By signing up, you agree to our{" "}
          <Link href="/terms-and-conditions" className="text-(--primary-light) hover:text-white transition-colors font-bold hover:underline">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy-policy" className="text-(--primary-light) hover:text-white transition-colors font-bold hover:underline">Privacy Policy</Link>
        </p>

        <div className="mt-5 text-center pt-4 border-white/5">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="text-white font-black hover:text-(--primary-light) transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
