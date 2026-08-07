"use client"

import { Sparkles, Gift, ShieldCheck, Users, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

function JoinPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const refCode = searchParams.get("ref") || ""

  const [referrer, setReferrer] = useState<{
    name: string
    college: string
    avatar: string | null
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!refCode) return

    async function fetchReferrer() {
      setLoading(true)
      try {
        const res = await fetch(`/api/growth/referral/lookup?code=${refCode}`)
        if (res.ok) {
          const data = await res.json()
          setReferrer({
            name: data.referrerName,
            college: data.referrerCollege,
            avatar: data.referrerAvatar,
          })
          // Save code in localStorage immediately on land
          localStorage.setItem("campusconnect_ref_code", refCode)
        } else {
          setError("Referral code invalid or expired")
        }
      } catch (err) {
        console.error("Failed to load referrer details", err)
      } finally {
        setLoading(false)
      }
    }

    fetchReferrer()
  }, [refCode])

  const handleClaim = () => {
    if (refCode) {
      localStorage.setItem("campusconnect_ref_code", refCode)
    }
    router.push("/auth/sign-up?role=STUDENT")
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#030712] text-white overflow-hidden" style={{ fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-gray-950 to-black pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex justify-center items-center shadow-[0_0_20px_rgba(124,58,237,0.4)] group-hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all">
              <span className="font-black text-xl tracking-tighter text-white">CC</span>
            </div>
            <span className="font-black text-2xl text-white group-hover:text-slate-200 transition-colors tracking-tight" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
              CampusConnect
            </span>
          </Link>
        </div>

        {/* Invitation Card */}
        <div className="bg-[#0b0f19]/80 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl" />

          {/* Invitation Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-400 uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles size={12} /> Special Invitation Link
          </div>

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-4">
              <Loader2 size={36} className="animate-spin text-violet-500" />
              <p className="text-slate-400 text-sm font-semibold">Loading invitation details...</p>
            </div>
          ) : (
            <>
              {referrer ? (
                <div className="space-y-6">
                  {/* Referrer info */}
                  <div className="flex flex-col items-center gap-3">
                    {referrer.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={referrer.avatar}
                        alt={referrer.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-violet-500/50 shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center border-2 border-violet-500/50 shadow-lg">
                        <span className="text-2xl font-black text-white">
                          {referrer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-extrabold text-white">
                        {referrer.name} invited you!
                      </h2>
                      {referrer.college && (
                        <p className="text-sm text-slate-400 font-semibold mt-1">
                          {referrer.college}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="h-[1px] bg-white/5 my-4" />

                  {/* Reward explanation */}
                  <div className="bg-[#111827]/60 border border-white/5 rounded-2xl p-5 space-y-4">
                    <p className="text-base text-slate-300">
                      Sign up, build your reputation, and earn on your own terms. By using this link, you&apos;ve unlocked:
                    </p>
                    <div className="flex flex-col gap-3 text-left">
                      <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                        <Gift className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-bold text-white text-sm">₹100 Signup Bonus Credit</p>
                          <p className="text-xs text-slate-400">Credited to your wallet when you complete your first gig</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-violet-500/10 border border-violet-500/20 p-3 rounded-xl">
                        <Sparkles className="text-violet-400 shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-bold text-white text-sm">100 XP Startup Boost</p>
                          <p className="text-xs text-slate-400">Level up faster to unlock high-paying premium gigs</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 py-4">
                  <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto border border-violet-500/20">
                    <Gift className="text-violet-400" size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">Join CampusConnect</h2>
                    <p className="text-slate-400 mt-2 max-w-sm mx-auto">
                      {error || "Claim ₹100 cash back + 100 XP boost when you complete your first gig on the platform."}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleClaim}
                className="w-full mt-8 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] transition-all font-black py-4 rounded-xl text-white shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_35px_rgba(124,58,237,0.5)] flex items-center justify-center gap-2 group cursor-pointer"
              >
                Claim Reward & Register <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          )}

          {/* Social Proof Row */}
          <div className="mt-8 pt-6 border-t border-white/5 flex justify-center gap-8 text-xs text-slate-400 font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" /> Secure Escrow
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-violet-400" /> 5,000+ Students
            </span>
          </div>
        </div>

        {/* Bottom helper */}
        <p className="text-center text-xs text-slate-500 mt-6 leading-relaxed">
          Need help? Contact our support team. Terms of service apply to all reward referral payouts.
        </p>
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-violet-500" />
      </div>
    }>
      <JoinPageClient />
    </Suspense>
  )
}
