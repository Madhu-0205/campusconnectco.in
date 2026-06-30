export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-[#131929]" />
        <div className="space-y-3 flex-1">
          <div className="h-6 w-48 rounded bg-[#131929]" />
          <div className="h-4 w-64 rounded bg-[#131929]" />
          <div className="flex gap-2">
            <div className="h-6 w-16 rounded-full bg-[#131929]" />
            <div className="h-6 w-20 rounded-full bg-[#131929]" />
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-4 border-white/5 pb-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 rounded-lg bg-[#131929]" />
        ))}
      </div>
      {/* Content */}
      <div className="space-y-4">
        <div className="h-32 rounded-2xl bg-[#131929]" />
        <div className="h-48 rounded-2xl bg-[#131929]" />
      </div>
    </div>
  );
}
