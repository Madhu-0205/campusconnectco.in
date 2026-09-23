import { CheckCircle2, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Email Preferences | CampusConnectCo",
  description: "Manage your email preferences and unsubscribe from marketing communications.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
      <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-8 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} className="text-primary" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Email Preferences Updated
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Your request has been processed. If an account matches this request, marketing and promotional communications have been opted out.
        </p>

        <div className="bg-surface-2 border border-border rounded-xl p-4 text-xs text-muted-foreground mb-8 text-left space-y-2">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <ShieldCheck size={14} className="text-primary" />
            <span>Essential Notifications</span>
          </div>
          <p>
            You will continue to receive critical security, account verification, and transaction-related notices required for platform operation.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
