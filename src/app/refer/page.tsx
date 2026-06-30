import type { Metadata } from "next"
import { ReferralDashboard } from "@/components/growth/ReferralDashboard"
import { getSession } from "@/lib/auth-checks"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Crown } from "lucide-react"

export const metadata: Metadata = {
  title: "Refer & Earn | CampusConnect",
  description: "Refer your college friends to CampusConnect. Both of you earn XP + ₹100 when they complete their first gig.",
  robots: "noindex", // private page
}

export default async function ReferralPage() {
  const user = await getSession()
  if (!user) redirect("/auth/sign-in")

  return (
    <div
      className="min-h-screen text-slate-100"
      style={{ background: "var(--color-background, #080D1A)", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}
    >
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/3 w-96 h-96 blur-[150px] rounded-full" style={{ background: "rgba(124,58,237,0.07)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 blur-[120px] rounded-full" style={{ background: "rgba(245,158,11,0.05)" }} />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Breadcrumb */}
        <Link
          href="/dashboard/student"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft size={13} /> Dashboard
        </Link>

        {/* Hero */}
        <div
          className="p-6 rounded-3xl relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(255,69,0,0.08))", border: "1px solid rgba(124,58,237,0.2)" }}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 blur-3xl rounded-full bg-[#7C3AED]/20" />
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "rgba(124,58,237,0.2)" }}>
              🎁
            </div>
            <div>
              <h1 className="text-xl font-black text-white" style={{ fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}>
                Refer & Earn
              </h1>
              <p className="text-xs text-slate-400">Invite friends. Earn together.</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 relative z-10 leading-relaxed">
            Share your unique link. When a friend signs up and completes their first gig, you both earn <span className="text-white font-bold">100 XP + ₹100</span>. The more you refer, the higher your tier — and the bigger the bonus per referral.
          </p>
        </div>

        {/* Ambassador upsell */}
        <Link
          href="/ambassador"
          className="flex items-center justify-between p-4 rounded-2xl group transition-all"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <div className="flex items-center gap-3">
            <Crown size={18} className="text-[#F59E0B]" />
            <div>
              <p className="text-sm font-black text-white">Want to earn even more?</p>
              <p className="text-xs text-slate-500">Apply to be a Campus Captain — earn 5% of every gig from your campus.</p>
            </div>
          </div>
          <ArrowLeft size={14} className="text-[#F59E0B] rotate-180 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Main referral dashboard */}
        <ReferralDashboard userId={user.id} />
      </div>
    </div>
  )
}
