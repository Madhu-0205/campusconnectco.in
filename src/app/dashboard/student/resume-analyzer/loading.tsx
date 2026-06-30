export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="h-10 w-48 rounded-lg bg-[#131929]" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Upload area */}
        <div className="h-96 rounded-2xl bg-[#131929] border border-white/5" />
        {/* Analysis panel */}
        <div className="space-y-4">
          <div className="h-24 rounded-2xl bg-[#131929]" />
          <div className="h-32 rounded-2xl bg-[#131929]" />
          <div className="h-48 rounded-2xl bg-[#131929]" />
        </div>
      </div>
    </div>
  );
}
