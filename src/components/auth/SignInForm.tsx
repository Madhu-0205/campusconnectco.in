"use client"

import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

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

export default function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  // Show error from OAuth callback
  useEffect(() => {
    const oauthError = searchParams.get("error")
    if (oauthError === "oauth_failed") setError("Google sign-in failed. Please try again.")
    if (oauthError === "no_user") setError("Could not retrieve account. Please try again.")
  }, [searchParams])

  // Auto redirect if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.replace("/dashboard/student")
    }
    checkUser()
  }, [supabase, router])

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError("")
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed")
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw new Error(signInError.message)

      if (data.user) {
        const role = data.user.user_metadata?.role
        if (role === "CLIENT" || role === "STARTUP") {
          router.replace("/client-hub")
        } else if (role === "FOUNDER") {
          router.replace("/dashboard/founder")
        } else {
          router.replace("/dashboard/student")
        }
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md bg-(--surface)/80 border border-(--border) rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl"
      style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
    >
      {/* Top accent line */}
      <div className="h-1.5 w-full bg-linear-to-r from-[#10B981] via-[#0EA5E9] to-[#7C3AED]" />

      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-(--surface-2) border border-(--border) rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <Sparkles size={22} className="text-(--primary-light)" />
          </div>
          <h1 className="font-black text-white" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
            Welcome Back
          </h1>
          <p className="text-sm mt-1">Sign in to your CampusConnect account</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-start gap-2 bg-[#F43F5E]/10 border border-[#F43F5E]/20 text-sm p-3.5 rounded-xl mb-6 font-medium"
          >
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl border border-(--border) bg-(--surface-2) hover:bg-white/10 transition-all font-bold text-white shadow-sm active:scale-[0.98] disabled:opacity-50"
        >
          {googleLoading ? <Loader2 size={18} className="animate-spin text-muted-foreground" /> : <GoogleIcon />}
          {googleLoading ? "Redirecting to Google..." : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-white/5" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-(--surface) font-bold text-[10px] uppercase tracking-widest">or sign in with email</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-black text-muted-foreground uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-(--surface-2) border border-(--border) text-white placeholder-slate-600 p-3.5 rounded-xl focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50 outline-none transition-all font-medium"
            />
          </div>

          <div>
            <label className="block font-black text-muted-foreground uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-(--surface-2) border border-(--border) text-white placeholder-slate-600 p-3.5 rounded-xl focus:ring-2 focus:ring-[#7C3AED]/50 focus:border-[#7C3AED]/50 outline-none transition-all pr-12 font-medium"
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
            <div className="mt-2.5 text-right">
              <Link href="/auth/forgot-password" className="text-(--primary-light) hover:text-white font-bold transition-colors">
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || googleLoading}
            className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] shadow-[0_0_20px_rgba(124,58,237,0.3)] mt-2"
          >
            {isLoading ? <><Loader2 className="animate-spin" size={18} /> Signing In...</> : "Sign In Securely"}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="text-white font-black hover:text-(--primary-light) transition-colors">Create Free Profile</Link>
          </p>
          
          <div className="border-white/5 pt-4">
            <Link href="/auth/founder" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-(--surface-2) hover:bg-white/10 border border-(--border) hover:text-white transition-all text-xs font-bold">
              🛠️ Founder Login
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
