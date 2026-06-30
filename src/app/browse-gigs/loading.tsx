import { GigCardSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="h-10 w-48 rounded-lg bg-[#131929]" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <GigCardSkeleton count={6} />
      </div>
    </div>
  );
}
