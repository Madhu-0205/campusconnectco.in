import { Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-10">
      {/* Header Skeleton */}
      <Skeleton className="h-[300px] w-full rounded-[2rem] bg-orange-500/5 border border-white/10" />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-40 rounded-3xl bg-white/5" />
        ))}
      </div>

      {/* Tools Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-20 rounded-2xl bg-white/5" />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-[400px] rounded-3xl bg-white/5" />
          <Skeleton className="h-[300px] rounded-3xl bg-white/5" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-96 rounded-3xl bg-white/5" />
          <Skeleton className="h-64 rounded-3xl bg-white/5" />
        </div>
      </div>
    </div>
  )
}
