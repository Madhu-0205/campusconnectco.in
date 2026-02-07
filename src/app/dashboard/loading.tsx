export default function DashboardLoading() {
    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar Skeleton */}
            <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6 space-y-6">
                <div className="h-8 w-32 bg-slate-200 rounded animate-pulse mb-6" />
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-10 w-full bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1 flex flex-col">
                <div className="h-14 bg-white/80 border-b border-slate-200 p-4 flex items-center gap-4">
                    <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
                                <div className="h-10 w-10 bg-slate-200 rounded-full mb-4" />
                                <div className="h-4 w-24 bg-slate-200 rounded mb-2" />
                                <div className="h-6 w-16 bg-slate-200 rounded" />
                            </div>
                        ))}
                    </div>
                    <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                </div>
            </div>
        </div>
    )
}
