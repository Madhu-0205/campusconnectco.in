"use client";

import { AlertTriangle, RotateCcw, Home } from"lucide-react";
import Link from"next/link";
import { useEffect } from"react";

export default function DashboardError({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 useEffect(() => {
 console.error("[Dashboard Error]", error);
 }, [error]);

 return (
 <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
 <div className="w-16 h-16 rounded-2xl bg-[#F43F5E]/10 border border-[#F43F5E]/20 flex items-center justify-center mb-6">
 <AlertTriangle size={28} className="text-[#F43F5E]" />
 </div>
 <h2 className="font-black text-white mb-2">
 Something went wrong
 </h2>
 <p className="text-slate-400 max-w-md mb-6">
 {error.message ||"An unexpected error occurred. Please try again."}
 </p>
 <div className="flex items-center gap-3">
 <button
 onClick={reset}
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1FA971] text-sm font-semibold hover:bg-[#1FA971]/90 hover:shadow-[0_0_20px_rgba(31,169,113,0.5)] active:scale-[0.97] transition-all"
 >
 <RotateCcw size={15} />
 Try Again
 </button>
 <Link
 href="/dashboard/student"
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-transparent text-sm font-semibold border border-white/15 hover:bg-white/5 hover:border-white/30 active:scale-[0.97] transition-all"
 >
 <Home size={15} />
 Go Home
 </Link>
 </div>
 </div>
 );
}
