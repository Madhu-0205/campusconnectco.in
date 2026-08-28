"use client"

// Campus recruitment client component
import {
 Plus, X, Calendar, GraduationCap, Loader2,
 Target, CheckCircle
} from"lucide-react"
import { useRouter } from"next/navigation"
import { useState, useTransition } from"react"

const COLLEGE_OPTIONS = [
"IIT Delhi","IIT Bombay","IIT Madras","IIT Kanpur","IIT Kharagpur",
"IIT Roorkee","IIT Guwahati","IIT Hyderabad","BITS Pilani",
"NIT Trichy","NIT Warangal","NIT Surathkal","IIIT Hyderabad",
"VIT Vellore","Manipal Institute of Technology","Jadavpur University",
"Anna University","Delhi Technological University","VJTI Mumbai",
"Amrita Vishwa Vidyapeetham","SRM Institute of Science and Technology",
]

function CreateButton({ orgId, variant ="primary" }: { orgId?: string; variant?:"primary" |"secondary" }) {
 const [open, setOpen] = useState(false)
 const [, startTransition] = useTransition()
 const router = useRouter()
 const [form, setForm] = useState({
 title:"",
 description:"",
 startDate:"",
 endDate:"",
 colleges: [] as string[],
 })
 const [saving, setSaving] = useState(false)
 const [success, setSuccess] = useState(false)

 const toggleCollege = (c: string) => {
 setForm((f) => ({
 ...f,
 colleges: f.colleges.includes(c) ? f.colleges.filter((x) => x !== c) : [...f.colleges, c],
 }))
 }

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 if (!orgId) return
 setSaving(true)
 try {
 const res = await fetch("/api/employer/drives", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ ...form, organizationId: orgId }),
 })
 if (res.ok) {
 setSuccess(true)
 setTimeout(() => {
 setOpen(false)
 setSuccess(false)
 setForm({ title:"", description:"", startDate:"", endDate:"", colleges: [] })
 startTransition(() => router.refresh())
 }, 1500)
 }
 } catch (err) {
 console.error(err)
 } finally {
 setSaving(false)
 }
 }

 return (
 <>
 <button
 onClick={() => setOpen(true)}
 className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95 ${
 variant ==="primary"
 ?""
 :"border border-[#10B981]/40 text-[#34D399] hover:bg-[#10B981]/10"
 }`}
 style={
 variant ==="primary"
 ? { background:"var(--color-primary)", boxShadow:"0 4px 20px rgba(255,77,28,0.3)" }
 : {}
 }
 >
 <Plus size={14} />
 New Drive
 </button>

 {open && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
 <div
 className="relative w-full max-w-2xl rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
 style={{ background:"var(--color-surface)", border:"1px solid rgba(16,185,129,0.3)" }}
 >
 <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-slate-500 hover:text-white">
 <X size={18} />
 </button>

 <div className="mb-6">
 <h2 className="text-xl font-black text-white" style={{ fontFamily:"var(--font-display)" }}>
 Create Campus Drive
 </h2>
 <p className="text-slate-500 text-sm mt-1">Target multiple colleges with a single virtual recruitment drive</p>
 </div>

 {success ? (
 <div className="flex flex-col items-center justify-center py-10 gap-4">
 <div className="w-14 h-14 bg-[#10B981]/20 rounded-2xl flex items-center justify-center">
 <CheckCircle size={28} className="text-[#10B981]" />
 </div>
 <p className="font-black text-white">Drive created successfully!</p>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-5">
 {/* Title */}
 <div>
 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Drive Title *</label>
 <input
 required
 value={form.title}
 onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
 placeholder="e.g. Summer 2025 Engineering Drive"
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#10B981]/50 transition-colors"
 />
 </div>

 {/* Description */}
 <div>
 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Description *</label>
 <textarea
 required
 value={form.description}
 onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
 placeholder="Describe the drive objectives, roles available, and selection process..."
 rows={3}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#10B981]/50 transition-colors resize-none"
 />
 </div>

 {/* Dates */}
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
 <Calendar size={10} /> Start Date *
 </label>
 <input
 required
 type="date"
 value={form.startDate}
 onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#10B981]/50 transition-colors"
 />
 </div>
 <div>
 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
 <Calendar size={10} /> End Date *
 </label>
 <input
 required
 type="date"
 value={form.endDate}
 onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#10B981]/50 transition-colors"
 />
 </div>
 </div>

 {/* College Selection */}
 <div>
 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
 <GraduationCap size={10} /> Target Colleges ({form.colleges.length} selected)
 </label>
 <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-white/3 border border-white/8 rounded-xl">
 {COLLEGE_OPTIONS.map((c) => (
 <button
 key={c}
 type="button"
 onClick={() => toggleCollege(c)}
 className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
 form.colleges.includes(c)
 ?"bg-[#10B981]/20 border-[#10B981]/50 text-[#34D399]"
 :"border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"
 }`}
 >
 {c}
 </button>
 ))}
 </div>
 </div>

 <button
 type="submit"
 disabled={saving}
 className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-60"
 style={{ background:"var(--color-primary)", boxShadow:"0 4px 16px rgba(255,77,28,0.3)" }}
 >
 {saving ? <Loader2 size={16} className="animate-spin" /> : <Target size={14} />}
 {saving ?"Creating Drive..." :"Launch Drive"}
 </button>
 </form>
 )}
 </div>
 </div>
 )}
 </>
 )
}

export const CampusDriveClient = { CreateButton }
