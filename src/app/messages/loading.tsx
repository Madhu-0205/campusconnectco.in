import { MessageSkeleton } from"@/components/ui/Skeletons";

export default function Loading() {
 return (
 <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex animate-pulse">
 {/* Conversation list */}
 <div className="w-80 border-white/5 p-4 space-y-3 hidden md:block">
 {Array.from({ length: 6 }).map((_, i) => (
 <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
 <div className="w-10 h-10 rounded-full bg-card" />
 <div className="space-y-2 flex-1">
 <div className="w-24 h-3 rounded bg-card" />
 <div className="w-32 h-2.5 rounded bg-card" />
 </div>
 </div>
 ))}
 </div>
 {/* Chat area */}
 <div className="flex-1">
 <MessageSkeleton count={6} />
 </div>
 </div>
 );
}
