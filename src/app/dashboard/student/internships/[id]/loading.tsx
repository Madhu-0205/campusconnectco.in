export default function Loading() {
  return (
    <div className="min-h-screen pb-20 p-4 max-w-5xl mx-auto space-y-8 animate-pulse">
      <div className="flex gap-4 items-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-800" />
        <div className="flex-1 space-y-3">
          <div className="h-8 bg-slate-800 rounded-xl w-3/4 max-w-md" />
          <div className="h-5 bg-slate-800 rounded-xl w-1/3" />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <div className="h-8 w-24 bg-slate-800 rounded-xl" />
        <div className="h-8 w-32 bg-slate-800 rounded-xl" />
        <div className="h-8 w-28 bg-slate-800 rounded-xl" />
      </div>

      <div className="h-px bg-slate-800 w-full" />

      <div className="space-y-4">
        <div className="h-6 w-40 bg-slate-800 rounded-xl" />
        <div className="h-4 w-full bg-slate-800 rounded-xl" />
        <div className="h-4 w-full bg-slate-800 rounded-xl" />
        <div className="h-4 w-3/4 bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
