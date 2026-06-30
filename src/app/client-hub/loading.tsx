import { Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div className="flex gap-4 items-center">
            <Skeleton className="w-12 h-12 rounded-xl bg-(--surface-2)" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-32 bg-(--surface-2)" />
                <Skeleton className="h-4 w-48 bg-(--surface-2)" />
            </div>
        </div>
        <Skeleton className="h-10 w-40 rounded-xl bg-(--surface-2)" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-3xl bg-(--surface-2)" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-[400px] rounded-3xl bg-(--surface-2)" />
          <Skeleton className="h-[300px] rounded-3xl bg-(--surface-2)" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-80 rounded-3xl bg-(--surface-2)" />
          <Skeleton className="h-60 rounded-3xl bg-(--surface-2)" />
        </div>
      </div>
    </div>
  )
}
