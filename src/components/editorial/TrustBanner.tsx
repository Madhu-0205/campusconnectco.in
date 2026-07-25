import { ShieldCheck, Info } from "lucide-react";
import Link from "next/link";
import React from "react";

export function TrustBanner() {
  return (
    <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-2xl p-4 flex gap-4 items-start">
      <div className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center shrink-0">
        <ShieldCheck className="w-4 h-4 text-[#10B981]" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-[#10B981] flex items-center gap-2">
          Editorial Integrity Checked
        </h4>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          This article adheres to CampusConnect&apos;s strict editorial guidelines. The content is fact-checked, written by domain experts, and free from undisclosed sponsorships.
        </p>
        <Link 
          href="/editorial" 
          className="inline-flex items-center gap-1 text-xs text-[#10B981] font-semibold mt-2 hover:underline"
        >
          <Info size={12} /> Read our Editorial Policy
        </Link>
      </div>
    </div>
  );
}
