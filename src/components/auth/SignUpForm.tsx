"use client"

import { motion, AnimatePresence } from"framer-motion"
import { Loader2, UserPlus, AlertCircle, CheckCircle2, Eye, EyeOff, GraduationCap, Building2, ArrowRight } from"lucide-react"
import Link from"next/link"
import { useRouter, useSearchParams } from"next/navigation"
import { useState } from"react"

import CollegePicker from"@/components/auth/college-picker/CollegePicker"
import { createClient } from"@/lib/supabase/client"


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

// CollegePicker replaces the old hardcoded CollegeDropdown

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
 transition={{ duration: 0.4, ease:"easeOut" }}
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
 const initialRole = roleParam ==="CLIENT" ?"CLIENT" :"STUDENT"

 const [step, setStep] = useState(1)
 const [form, setForm] = useState({
 name:"",
 email:"",
 password:"",
 role: initialRole,
 college:"",
 collegeId:"",
 })
 const [showPassword, setShowPassword] = useState(false)
 const [loading, setLoading] = useState(false)
 const [googleLoading, setGoogleLoading] = useState(false)
 const [error, setError] = useState("")
 const [success, setSuccess] = useState(false)
 const [acceptedTerms, setAcceptedTerms] = useState(false)
 const [marketingConsent, setMarketingConsent] = useState(false)

 const handleGoogleSignUp = async () => {
 setGoogleLoading(true)
 setError("")
 try {
 const { error } = await supabase.auth.signInWithOAuth({
 provider:"google",
 options: {
 redirectTo: `${window.location.origin}/auth/callback?role=${form.role}`,
 queryParams: { access_type:"offline", prompt:"consent" },
 },
 })
 if (error) throw error
 } catch (err: unknown) {
 setError(err instanceof Error ? err.message :"Google sign-up failed")
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
 if (form.role ==="STUDENT" && !form.college) {
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
 if (!acceptedTerms) {
 throw new Error("You must agree to the Terms & Conditions and Privacy Policy to create an account.")
 }

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
 data: { name: form.name, role: form.role, college: form.college, collegeId: form.collegeId },
 },
 })

 if (signUpError) throw signUpError
 if (!data.user) throw new Error("No user created")

 if (data.session) {
 const res = await fetch("/api/user/profile", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({
 id: data.user.id,
 email: form.email,
 name: form.name,
 role: form.role,
 college: form.college,
 collegeId: form.collegeId,
 acceptedTerms,
 marketingConsent,
 }),
 })

 if (!res.ok) throw new Error("Failed to create profile")

 if (form.role ==="STUDENT") {
 router.replace("/onboarding?step=1")
 } else if (form.role ==="CLIENT") {
 router.replace("/client-hub")
 } else {
 router.replace("/dashboard/student")
 }
 router.refresh()
 } else {
 setSuccess(true)
 }
 } catch (err: unknown) {
 setError(err instanceof Error ? err.message :"Failed to create account")
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
 style={{ fontFamily:"var(--font-body, 'DM Sans', sans-serif)" }}
 >
 <div className="w-20 h-20 bg-[#10B981]/20 border border-[#10B981]/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
 <CheckCircle2 size={40} className="text-emerald-500" />
 </div>
 <h2 className="font-black text-white mb-3" style={{ fontFamily:"var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
 Check your email!
 </h2>
 <p className="text-base leading-relaxed mb-8">
 We&apos;ve sent a confirmation link to <span className="font-bold text-white">{form.email}</span>.
 Click it to activate your account and get started.
 </p>
 <Link href="/auth/sign-in" className="inline-block w-full px-6 py-4 bg-[#1FA971] hover:bg-[#6D28D9] text-white rounded-xl font-bold shadow-[0_0_20px_rgba(31,169,113,0.3)] transition-all">
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
 style={{ fontFamily:"var(--font-body, 'DM Sans', sans-serif)" }}
 >
 {/* Top accent line */}
 <div className="h-1.5 w-full bg-primary" />

 <div className="p-8">
 {/* Header */}
 <div className="text-center mb-6">
 <div className="mx-auto w-12 h-12 bg-(--surface-2) border border-(--border) rounded-2xl flex items-center justify-center mb-4 shadow-inner">
 <UserPlus size={22} className="text-(--primary-light)" />
 </div>
 <h1 className="font-black text-foreground" style={{ fontFamily:"var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
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
 animate={{ opacity: 1, height:"auto", scale: 1 }}
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
 onClick={() => setForm({ ...form, role:"STUDENT" })}
 className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-bold rounded-lg transition-all ${ form.role ==="STUDENT" ?"bg-primary text-primary-foreground shadow-lg" :"text-muted-foreground hover:text-foreground" }`}
 >
 <GraduationCap size={15} /> Student
 </button>
 <button
 type="button"
 onClick={() => setForm({ ...form, role:"CLIENT" })}
 className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-bold rounded-lg transition-all ${ form.role ==="CLIENT" ?"bg-[#F59E0B] text-[#0A1628] shadow-lg" :"text-muted-foreground hover:text-foreground" }`}
 >
 <Building2 size={15} /> Startup
 </button>
 </div>
 </div>

 {/* Full name */}
 <div>
 <label className="block font-black text-muted-foreground uppercase tracking-widest mb-2">
 {form.role ==="CLIENT" ?"Founder Name" :"Full Name"}
 </label>
 <input
 placeholder={form.role ==="CLIENT" ?"Sathwik Kumar" :"Priya Sharma"}
 value={form.name}
 onChange={(e) => setForm({ ...form, name: e.target.value })}
 required minLength={2}
 className="w-full bg-(--surface-2) border border-(--border) text-foreground placeholder-muted-foreground p-3.5 rounded-xl focus:ring-2 focus:ring-(--primary)/50 focus:border-(--primary)/50 outline-none transition-all font-medium"
 />
 </div>

 {/* Email */}
 <div>
 <label className="block font-black text-muted-foreground uppercase tracking-widest mb-2">Email</label>
 <input
 type="email"
 placeholder={form.role ==="STUDENT" ?"student@university.edu" :"founder@startup.com"}
 value={form.email}
 onChange={(e) => setForm({ ...form, email: e.target.value })}
 required
 className="w-full bg-(--surface-2) border border-(--border) text-foreground placeholder-muted-foreground p-3.5 rounded-xl focus:ring-2 focus:ring-(--primary)/50 focus:border-(--primary)/50 outline-none transition-all font-medium"
 />
 </div>

 {/* College (students only) */}
 {form.role ==="STUDENT" && (
 <div>
 <label className="block font-black text-muted-foreground uppercase tracking-widest mb-2">Your College</label>
 <CollegePicker
 value={form.college}
 onChange={(v, id) => setForm({ ...form, college: v, collegeId: id })}
 />
 </div>
 )}

 {/* Google sign-up */}
 <div className="relative my-2">
 <div className="absolute inset-0 flex items-center">
 <div className="w-full border-b border-border" />
 </div>
 <div className="relative flex justify-center">
 <span className="px-3 bg-(--surface) font-bold text-[10px] uppercase tracking-widest">or sign up with Google</span>
 </div>
 </div>

 <button
 type="button"
 onClick={handleGoogleSignUp}
 disabled={googleLoading || loading}
 className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl border border-(--border) bg-(--surface-2) hover:bg-accent transition-all font-bold text-foreground shadow-sm active:scale-[0.98] disabled:opacity-50"
 >
 {googleLoading ? <Loader2 size={18} className="animate-spin text-muted-foreground" /> : <GoogleIcon />}
 {googleLoading ?"Redirecting to Google..." :"Continue with Google"}
 </button>

 {/* Next button */}
 <button
 type="button"
 onClick={handleNextStep}
 className={`w-full font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${ form.role ==="CLIENT" ?"bg-[#F59E0B] shadow-sm" :"bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" }`}
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
 <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3">
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${form.role ==="CLIENT" ?"bg-[#F59E0B]/20" :"bg-primary/20"}`}>
 {form.role ==="CLIENT" ? <Building2 size={18} className="text-[#F59E0B]" /> : <GraduationCap size={18} className="text-(--primary)" />}
 </div>
 <div className="min-w-0">
 <p className="text-sm font-bold truncate">{form.name ||"—"}</p>
 <p className="text-xs truncate">{form.email}</p>
 </div>
 <button type="button" onClick={() => setStep(1)} className="font-bold text-(--primary) hover:text-foreground transition-colors shrink-0 ml-auto">
 Edit
 </button>
 </div>

 {/* Password field */}
 <div>
 <label className="block font-black text-muted-foreground uppercase tracking-widest mb-2">Create Password</label>
 <div className="relative">
 <input
 type={showPassword ?"text" :"password"}
 placeholder="Min. 8 chars, uppercase & numbers"
 value={form.password}
 onChange={(e) => setForm({ ...form, password: e.target.value })}
 required minLength={8}
 className="w-full bg-(--surface-2) border border-(--border) text-foreground placeholder-muted-foreground p-3.5 pr-12 rounded-xl focus:ring-2 focus:ring-(--primary)/50 focus:border-(--primary)/50 outline-none transition-all font-medium"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-4 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
 aria-label={showPassword ?"Hide password" :"Show password"}
 >
 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
 </button>
 </div>
 {/* Password strength hints */}
 {form.password.length > 0 && (
 <div className="mt-2 flex gap-2 flex-wrap">
 {[
 { label:"8+ chars", ok: form.password.length >= 8 },
 { label:"Uppercase", ok: /[A-Z]/.test(form.password) },
 { label:"Number", ok: /\d/.test(form.password) },
 ].map(({ label, ok }) => (
 <span key={label} className={`font-bold px-2 py-0.5 rounded-full ${ok ?"bg-[#10B981]/15" :"bg-(--surface-2) text-muted-foreground"}`}>
 {ok ?"✓" :"○"}{label}
 </span>
 ))}
 </div>
 )}
 </div>

 {/* Consent Checkboxes */}
 <div className="space-y-4 pt-2">
 <label className="flex items-start gap-3 cursor-pointer group">
 <div className="relative flex items-center justify-center mt-0.5 shrink-0">
 <input 
 type="checkbox" 
 required
 checked={acceptedTerms}
 onChange={(e) => setAcceptedTerms(e.target.checked)}
 className="peer sr-only" 
 />
 <div className="w-5 h-5 rounded border border-border bg-surface peer-checked:bg-(--primary) peer-checked:border-(--primary) peer-focus:ring-2 peer-focus:ring-(--primary)/50 transition-all flex items-center justify-center">
 <CheckCircle2 size={14} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
 </div>
 </div>
 <p className="text-sm text-muted-foreground leading-snug">
 I have read and agree to the <Link href="/terms" className="text-foreground font-medium hover:text-(--primary) transition-colors hover:underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-foreground font-medium hover:text-(--primary) transition-colors hover:underline">Privacy Policy</Link>.
 </p>
 </label>

 <label className="flex items-start gap-3 cursor-pointer group">
 <div className="relative flex items-center justify-center mt-0.5 shrink-0">
 <input 
 type="checkbox" 
 checked={marketingConsent}
 onChange={(e) => setMarketingConsent(e.target.checked)}
 className="peer sr-only" 
 />
 <div className="w-5 h-5 rounded border border-border bg-surface peer-checked:bg-(--primary) peer-checked:border-(--primary) peer-focus:ring-2 peer-focus:ring-(--primary)/50 transition-all flex items-center justify-center">
 <CheckCircle2 size={14} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
 </div>
 </div>
 <p className="text-sm text-muted-foreground leading-snug">
 I would like to receive updates about internships, jobs, events, scholarships and new features by email.
 </p>
 </label>
 </div>

 {/* Submit */}
 <button
 type="submit"
 disabled={loading || googleLoading || !acceptedTerms}
 className={`w-full font-black py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] mt-2 ${ form.role ==="CLIENT" ?"bg-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.3)]" :"bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" }`}
 >
 {loading ? <><Loader2 className="animate-spin" size={18} /> Creating Account...</> :"Create Account"}
 </button>

 <button type="button" onClick={() => setStep(1)} className="w-full text-muted-foreground hover:text-muted-foreground transition-colors">
 ← Back
 </button>
 </motion.form>
 )}
 </AnimatePresence>

 <p className="text-muted-foreground mt-5 leading-relaxed text-center">
 Join CampusConnect and supercharge your career.
 </p>

 <div className="mt-5 text-center pt-4 border-t border-border">
 <p className="text-muted-foreground">
 Already have an account?{""}
 <Link href="/auth/sign-in" className="text-foreground font-black hover:text-(--primary) transition-colors">Sign In</Link>
 </p>
 </div>
 </div>
 </motion.div>
 )
}
