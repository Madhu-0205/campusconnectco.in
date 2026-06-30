import type { Metadata } from "next"
import { RefreshCcw } from "lucide-react"

export const metadata: Metadata = {
  title: "Refund Policy — CampusConnect",
}

export default function RefundPolicyPage() {
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
            <RefreshCcw className="w-4 h-4 shrink-0" style={{ color: "var(--color-primary)" }} />
            <span className="text-xs font-mono uppercase tracking-[0.2em]" style={{ color: "var(--color-text-muted)" }}>
              Policy
            </span>
          </div>

          <h1
            className="text-5xl md:text-6xl mb-6 leading-[1.05] tracking-tight"
            style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
          >
            Refund &amp; <br />
            <span style={{ color: "var(--color-text-muted)" }}>Cancellation Policy.</span>
          </h1>

          <p className="text-lg leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            Our escrow-based model ensures fair outcomes for both students and clients.
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
              title: "Cancellation by Client",
              body: "If a client cancels a gig before a worker is officially assigned or accepts the job, a full refund of any locked escrow amount will be processed back to the original payment source within 3–7 business days, minus any non-refundable gateway processing fees incurred by Razorpay.",
            },
            {
              num: "2",
              title: "Refunds on Escrow Transactions",
              body: "When a client deposits funds securely via Razorpay, funds are held in escrow pending the gig's completion. If the gig is abandoned by the student, or if the work fails to meet agreed-upon requirements despite a revision attempt, the client can raise a dispute to seek a refund.",
            },
            {
              num: "3",
              title: "Dispute Resolution",
              body: "Refunds are not guaranteed once an escrow is created, except through dispute mediation. Both parties are required to provide proof of correspondence and work. Once a refund is approved by CampusConnect dispute management, it will be executed via Razorpay and sent directly back to the client's bank account.",
            },
            {
              num: "4",
              title: "Zero Wallet Policy",
              body: "Because CampusConnect operates as a direct marketplace, we do not issue refunds as \"wallet credits.\" All funds are credited strictly to the external account used for the original transaction.",
            },
            {
              num: "5",
              title: "Fee Retention",
              body: "If work is completed successfully and a partial refund is agreed upon between the client and freelancer, the CampusConnect platform service fee (5–7%) remains non-refundable, as it corresponds to the costs of facilitating the connection and the initial payment.",
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
