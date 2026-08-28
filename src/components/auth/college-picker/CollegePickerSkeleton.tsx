export default function CollegePickerSkeleton() {
 return (
 <div className="space-y-2 animate-pulse" role="status" aria-label="Loading colleges…">
 {/* Search bar shimmer */}
 <div className="h-11 w-full rounded-xl bg-white/5 border border-white/5" />
 {/* Section label shimmer */}
 <div className="h-3 w-32 rounded bg-white/5 mt-3 mb-2" />
 {/* Card shimmers */}
 {[...Array(5)].map((_, i) => (
 <div
 key={i}
 className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/3"
 >
 <div className="w-8 h-8 rounded-lg bg-white/8 shrink-0" />
 <div className="flex-1 space-y-1.5">
 <div className="h-3 w-3/4 rounded bg-white/8" />
 <div className="h-2.5 w-1/2 rounded bg-white/5" />
 </div>
 <div className="h-5 w-14 rounded-full bg-white/5 shrink-0" />
 </div>
 ))}
 </div>
 )
}
