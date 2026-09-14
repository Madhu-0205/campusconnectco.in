"use client";

import { Flag, X, Loader2, CheckCircle } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: "gig" | "internship" | "user";
  title?: string;
}

const REPORT_REASONS = [
  "Misleading compensation or deliverables",
  "Contact info or off-platform payment bypass",
  "Suspected scam, fraud, or phishing",
  "Opportunity is expired or inactive",
  "Inappropriate or offensive content",
  "Other violation of Community Guidelines",
];

export function ReportModal({
  isOpen,
  onClose,
  entityId,
  entityType,
  title,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityId,
          entityType,
          reason: selectedReason,
          details: details.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit report");
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-destructive/10 text-destructive">
            <Flag size={20} />
          </div>
          <div>
            <h3 id="report-modal-title" className="font-bold text-lg text-foreground">
              Report Opportunity
            </h3>
            <p className="text-xs text-muted-foreground">
              Reports are confidential and reviewed by the CampusConnectCo trust team.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-foreground">Report Received</h4>
            <p className="text-xs text-muted-foreground">
              Thank you for keeping CampusConnectCo safe. Our moderation team has been notified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {title && (
              <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Listing:</span> {title}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Reason for report
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
              >
                {REPORT_REASONS.map((r, idx) => (
                  <option key={idx} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Provide any context that helps us evaluate this listing..."
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary outline-none resize-none"
              />
              <p className="text-[10px] text-muted-foreground text-right">
                {details.length}/500
              </p>
            </div>

            {errorMessage && (
              <p className="text-xs text-destructive font-medium">{errorMessage}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" size="sm" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
