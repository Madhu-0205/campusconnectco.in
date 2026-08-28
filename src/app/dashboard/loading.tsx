export default function DashboardLoading() {
 return (
 <div className="max-w-7xl mx-auto px-4 pb-16 pt-4 space-y-8 animate-in fade-in duration-500">
 {/* Header skeleton */}
 <div className="flex items-center justify-between">
 <div className="space-y-3">
 <div className="h-8 w-64 bg-white/10 rounded-xl animate-pulse" />
 <div className="h-4 w-96 bg-white/5 rounded-full animate-pulse" />
 </div>
 <div className="flex gap-3">
 <div className="h-11 w-32 bg-white/5 rounded-xl animate-pulse" />
 <div className="h-11 w-40 bg-orange-500/10 rounded-xl animate-pulse" />
 </div>
 </div>

 {/* Stats grid skeleton */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="bg-[#111116] border border-white/10 rounded-3xl p-6 flex flex-col gap-4 animate-pulse">
 <div className="h-10 w-10 bg-white/10 rounded-xl" />
 <div className="space-y-2">
 <div className="h-3 w-20 bg-white/5 rounded-full" />
 <div className="h-8 w-16 bg-white/10 rounded-lg" />
 </div>
 </div>
 ))}
 </div>

 {/* Main content skeleton */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
 <div className="lg:col-span-2 space-y-6">
 <div className="h-6 w-40 bg-white/10 rounded-lg animate-pulse" />
 {[...Array(3)].map((_, i) => (
 <div key={i} className="bg-[#111116] border border-white/10 rounded-3xl p-6 flex gap-6 animate-pulse">
 <div className="w-14 h-14 rounded-2xl bg-white/10 shrink-0" />
 <div className="flex-1 space-y-4">
 <div className="space-y-2">
 <div className="h-4 w-2/3 bg-white/10 rounded-full" />
 <div className="h-3 w-1/3 bg-white/5 rounded-full" />
 </div>
 <div className="h-3 w-full bg-white/5 rounded-full" />
 <div className="flex gap-2">
 {[70, 60, 80].map(w => (
 <div key={w} className="h-6 rounded-lg bg-white/10" style={{ width: `${w}px` }} />
 ))}
 </div>
 </div>
 </div>
 ))}
 </div>
 <div className="space-y-4">
 <div className="h-6 w-32 bg-white/10 rounded-lg animate-pulse mb-2" />
 {[180, 220, 140].map(h => (
 <div key={h} className="bg-[#111116] border border-white/10 rounded-3xl animate-pulse" style={{ height: `${h}px` }} />
 ))}
 </div>
 </div>
 </div>
 )
}
