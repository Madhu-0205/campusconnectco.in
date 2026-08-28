export default function Loading() {
 return (
 <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
 {/* Header */}
 <div className="h-10 w-56 rounded-lg bg-(--surface)" />
 {/* Chat area */}
 <div className="h-[60vh] rounded-2xl bg-(--surface) border border-white/5 p-4 space-y-4">
 {[1, 2, 3].map((i) => (
 <div key={i} className={`flex gap-3 ${i === 2 ?"flex-row-reverse" :""}`}>
 <div className="w-8 h-8 rounded-lg bg-[#1A2240] shrink-0" />
 <div className={`h-14 rounded-2xl bg-[#1A2240] ${i === 2 ?"w-2/5" :"w-3/5"}`} />
 </div>
 ))}
 </div>
 {/* Input */}
 <div className="h-12 rounded-xl bg-(--surface)" />
 </div>
 );
}
