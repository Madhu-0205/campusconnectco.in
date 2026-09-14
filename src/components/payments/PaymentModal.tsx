"use client";

import { X, Clock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  gigId: string;
  workerId: string;
  gigTitle: string;
  budget: number;
  onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, gigTitle, budget }: PaymentModalProps) {
  if (!isOpen) return null;

  const platformFee = budget * 0.10;
  const totalAmount = budget + platformFee;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/10 animate-in slide-in-from-bottom-4 relative">
        {/* Header */}
        <div className="p-6 pb-0 flex items-center justify-between">
          <h2 className="text-xl font-black flex items-center gap-2">
            <ShieldCheck className="text-primary h-6 w-6" />
            Milestone Settlement
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Coming Soon Notice */}
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <Clock size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <p className="font-bold text-amber-300 mb-0.5">Payments Coming Soon</p>
            Secure platform escrow funding and automated settlements will be available on CampusConnectCo in a future release. Deliverable tracking remains active.
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Assignment for: <strong className="text-foreground">{gigTitle}</strong>
          </p>

          <div className="bg-background rounded-2xl p-5 space-y-3 border border-white/5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gig Budget</span>
              <span className="font-bold">₹{budget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee (10% est.)</span>
              <span className="font-bold text-muted-foreground">+ ₹{platformFee.toLocaleString()}</span>
            </div>
            <div className="pt-3 border-t border-white/5 flex justify-between items-center">
              <span className="font-black text-slate-300">Total Valuation</span>
              <span className="text-xl font-black text-primary">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 space-y-3">
          <Button 
            disabled={true}
            aria-disabled="true"
            className="w-full rounded-2xl h-14 text-sm font-black uppercase tracking-widest bg-slate-800 text-slate-400 border border-slate-700/60 cursor-not-allowed opacity-90 shadow-none hover:bg-slate-800"
          >
            <Clock size={16} className="mr-2 text-amber-400" />
            Payments Coming Soon
          </Button>

          <Button
            variant="outline"
            onClick={onClose}
            className="w-full rounded-2xl h-11 text-xs font-bold border-white/10 hover:bg-white/5"
          >
            Close
          </Button>

          <p className="text-center text-xxs text-muted-foreground">
            Direct transactions are currently gated for platform launch.
          </p>
        </div>
      </div>
    </div>
  );
}
