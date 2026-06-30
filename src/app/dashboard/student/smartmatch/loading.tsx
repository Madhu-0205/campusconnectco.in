export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="h-10 w-48 rounded-lg bg-[#131929]" />
      {/* Match cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-52 rounded-2xl bg-[#131929] border border-white/5" />
        ))}
      </div>
      {/* Radar chart */}
      <div className="h-72 rounded-2xl bg-[#131929]" />
    </div>
  );
}
