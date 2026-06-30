import { Scale } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms & Conditions — CampusConnect",
}

export default function TermsPage() {
  return (
    <main
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: "var(--color-background)",
        color:           "var(--color-text)",
        fontFamily:      "var(--font-body)",
      }}
    >
      {/* Radial glow */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none opacity-10"
        style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
      />

      <div className="max-w-[860px] mx-auto px-6 sm:px-12 pt-36 pb-28 relative z-10">

        {/* Header */}
        <div className="mb-16">
          <div
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full border mb-8"
            style={{ borderColor: "var(--color-border)", background: "rgba(255,255,255,0.03)" }}
          >
            <Scale className="w-4 h-4 shrink-0" style={{ color: "var(--color-primary)" }} />
            <span className="text-xs font-mono uppercase tracking-[0.2em]" style={{ color: "var(--color-text-muted)" }}>
              Legal
            </span>
          </div>

          <h1
            className="text-5xl md:text-6xl mb-6 leading-[1.05] tracking-tight"
            style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
          >
            Terms &amp; <br />
            <span style={{ color: "var(--color-text-muted)" }}>Conditions.</span>
          </h1>

          <p className="text-lg leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            By using CampusConnect, you agree to the following terms. Please read them carefully.
          </p>

          <div
            className="mt-8 pt-8 flex items-center gap-4"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <span className="text-xs font-mono uppercase tracking-[0.2em]" style={{ color: "var(--color-text-muted)" }}>
              Effective Date
            </span>
            <span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
              Immediate
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-10">
          {[
            {
              num: "1",
              title: "Introduction",
              body: "Welcome to CampusConnect. By accessing or using our platform, you agree to comply with and be bound by the following Terms and Conditions.",
            },
            {
              num: "2",
              title: "Marketplace Role",
              body: "CampusConnect operates strictly as a marketplace facilitator connecting clients (users posting jobs/gigs) with freelancers (students applying for jobs/gigs). CampusConnect does NOT store, hold, or manage user funds in any internal wallet.",
            },
            {
              num: "3",
              title: "Payment Gateway",
              body: "All payments on the platform are securely processed through our authorized payment gateway partner, Razorpay. By making or receiving payments on the platform, you agree to Razorpay's Terms of Service and Privacy Policy. CampusConnect charges a transparent service fee for facilitating the marketplace transaction, which is visible during the checkout process.",
            },
            {
              num: "4",
              title: "Escrow & Disbursements",
              body: "Payments made by clients for gigs are held securely in an escrow-like mechanism processed directly by Razorpay (via Route or similar compliant models). Funds are disbursed to the freelancer only upon successful completion and client approval of the work. If a dispute arises, the resolution process is governed by CampusConnect's dispute policies without CampusConnect touching the capital.",
            },
            {
              num: "5",
              title: "User Conduct",
              body: "Users agree to provide accurate information and respect the professional environment of the platform. Any misuse of the platform, fraudulent gig postings, or attempts to circumvent the CampusConnect payment system may result in account termination.",
            },
            {
              num: "6",
              title: "Changes to Terms",
              body: "CampusConnect reserves the right to modify these terms at any time. Continued use of the platform after changes have been communicated implies acceptance of the updated terms.",
            },
          ].map(({ num, title, body }) => (
            <div
              key={num}
              className="rounded-3xl p-8"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              <div className="flex items-start gap-5">
                <span
                  className="text-3xl font-black leading-none shrink-0 select-none"
                  style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.06)" }}
                >
                  {num.padStart(2, "0")}
                </span>
                <div>
                  <h2
                    className="text-xl font-black mb-3"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
                  >
                    {title}
                  </h2>
                  <p className="leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
