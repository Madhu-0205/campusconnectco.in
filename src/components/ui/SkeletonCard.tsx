/**
 * SkeletonCard — Reusable shimmer loading state component
 * CampusConnect v2.0 Design System
 */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#131929]/80 border border-white/8 rounded-2xl p-5 ${className}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-white/8 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/8 rounded-md w-3/4" />
          <div className="h-3 bg-white/5 rounded-md w-1/2" />
        </div>
        <div className="w-11 h-11 rounded-full bg-white/5 shrink-0" />
      </div>
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 w-16 bg-white/6 rounded-md" />
        <div className="h-5 w-20 bg-white/6 rounded-md" />
        <div className="h-5 w-14 bg-white/6 rounded-md" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-6 w-20 bg-white/8 rounded-md" />
        <div className="h-8 w-24 bg-white/8 rounded-xl" />
      </div>
    </div>
  )
}

export function SkeletonRow({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse flex items-center gap-4 p-4 bg-[#131929]/60 border border-white/6 rounded-2xl ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-white/8 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/8 rounded-md w-2/3" />
        <div className="h-3 bg-white/5 rounded-md w-1/3" />
      </div>
      <div className="h-8 w-20 bg-white/6 rounded-xl" />
    </div>
  )
}

export function SkeletonStatCard({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse p-6 bg-[#131929] border border-white/8 rounded-3xl ${className}`}>
      <div className="flex justify-between items-start mb-5">
        <div className="w-10 h-10 rounded-2xl bg-white/8" />
      </div>
      <div className="h-8 w-16 bg-white/10 rounded-md mb-2" />
      <div className="h-3 w-24 bg-white/5 rounded-md" />
    </div>
  )
}

export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-white/8 rounded-md animate-pulse"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  )
}
