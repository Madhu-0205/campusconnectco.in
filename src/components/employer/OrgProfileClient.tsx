"use client"

import type { JsonValue } from"@prisma/client/runtime/library"
import { Edit3, X, Loader2, Building2, CheckCircle, Plus } from"lucide-react"
import { useRouter } from"next/navigation"
import { useState, useTransition } from"react"

const TECH_OPTIONS = [
"React","Next.js","TypeScript","JavaScript","Python","Node.js",
"Go","Rust","Java","PostgreSQL","MongoDB","Redis","Docker",
"AWS","GCP","Firebase","GraphQL","Flutter","Swift","Kotlin",
]

const INDUSTRY_OPTIONS = [
"Technology","FinTech","EdTech","HealthTech","E-Commerce",
"Gaming","SaaS","Consulting","Media","D2C","DeepTech","Other",
]

const SIZE_OPTIONS = ["1-10","11-50","51-200","201-500","500+"]

interface Org {
 id: string
 name: string
 slug: string
 logo?: string | null
 website?: string | null
 industry?: string | null
 size?: string | null
 bio?: string | null
 techStack: string[]
 socialLinks?: JsonValue | null
}

function EditButton({ org }: { org: Org }) {
 const [open, setOpen] = useState(false)
 const router = useRouter()
 const [, startTransition] = useTransition()
 const [form, setForm] = useState({
 name: org.name ||"",
 website: org.website ||"",
 industry: org.industry ||"",
 size: org.size ||"",
 bio: org.bio ||"",
 techStack: org.techStack || [],
 linkedin: (org.socialLinks as Record<string, string>)?.linkedin ||"",
 twitter: (org.socialLinks as Record<string, string>)?.twitter ||"",
 github: (org.socialLinks as Record<string, string>)?.github ||"",
 })
 const [saving, setSaving] = useState(false)
 const [success, setSuccess] = useState(false)

 const toggleTech = (t: string) => {
 setForm((f) => ({
 ...f,
 techStack: f.techStack.includes(t) ? f.techStack.filter((x) => x !== t) : [...f.techStack, t],
 }))
 }

 const handleSave = async (e: React.FormEvent) => {
 e.preventDefault()
 setSaving(true)
 try {
 const res = await fetch(`/api/employer/organization/${org.id}`, {
 method:"PATCH",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({
 name: form.name,
 website: form.website || null,
 industry: form.industry || null,
 size: form.size || null,
 bio: form.bio || null,
 techStack: form.techStack,
 socialLinks: {
 linkedin: form.linkedin || null,
 twitter: form.twitter || null,
 github: form.github || null,
 },
 }),
 })
 if (res.ok) {
 setSuccess(true)
 setTimeout(() => {
 setOpen(false)
 setSuccess(false)
 startTransition(() => router.refresh())
 }, 1200)
 }
 } finally {
 setSaving(false)
 }
 }

 return (
 <>
 <button
 onClick={() => setOpen(true)}
 className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-white/15 text-slate-400 hover:text-white hover:border-white/25 transition-all"
 style={{ background:"var(--color-surface)" }}
 >
 <Edit3 size={13} />
 Edit Profile
 </button>

 {open && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
 <div
 className="relative w-full max-w-2xl rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
 style={{ background:"var(--color-surface)", border:"1px solid rgba(31,169,113,0.3)" }}
 >
 <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-slate-500 hover:text-white">
 <X size={18} />
 </button>

 <h2 className="text-xl font-black text-white mb-6" style={{ fontFamily:"var(--font-display)" }}>
 Edit Company Profile
 </h2>

 {success ? (
 <div className="flex flex-col items-center py-10 gap-4">
 <div className="w-14 h-14 bg-[#10B981]/20 rounded-2xl flex items-center justify-center">
 <CheckCircle size={28} className="text-[#10B981]" />
 </div>
 <p className="font-black text-white">Profile updated!</p>
 </div>
 ) : (
 <form onSubmit={handleSave} className="space-y-5">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Company Name</label>
 <input
 value={form.name}
 onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#1FA971]/50"
 />
 </div>
 <div>
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Website</label>
 <input
 value={form.website}
 onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
 placeholder="https://"
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#1FA971]/50 placeholder:text-slate-700"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Industry</label>
 <select
 value={form.industry}
 onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#1FA971]/50"
 >
 <option value="">Select...</option>
 {INDUSTRY_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
 </select>
 </div>
 <div>
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Company Size</label>
 <select
 value={form.size}
 onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#1FA971]/50"
 >
 <option value="">Select...</option>
 {SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>
 </div>

 <div>
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Bio</label>
 <textarea
 value={form.bio}
 onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
 rows={3}
 placeholder="Describe your company culture, mission, and what makes you unique..."
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#1FA971]/50 resize-none placeholder:text-slate-700"
 />
 </div>

 {/* Tech Stack */}
 <div>
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
 Tech Stack ({form.techStack.length} selected)
 </label>
 <div className="flex flex-wrap gap-2">
 {TECH_OPTIONS.map((t) => (
 <button
 key={t}
 type="button"
 onClick={() => toggleTech(t)}
 className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
 form.techStack.includes(t)
 ?"bg-[#1FA971]/20 border-[#1FA971]/50 text-[#A78BFA]"
 :"border-white/10 text-slate-500 hover:border-white/20"
 }`}
 >
 {t}
 </button>
 ))}
 </div>
 </div>

 {/* Social Links */}
 <div>
 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Social Links</label>
 <div className="space-y-2">
 {[
 { key:"linkedin", placeholder:"https://linkedin.com/company/..." },
 { key:"twitter", placeholder:"https://twitter.com/..." },
 { key:"github", placeholder:"https://github.com/..." },
 ].map(({ key, placeholder }) => (
 <input
 key={key}
 value={form[key as keyof typeof form] as string}
 onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
 placeholder={placeholder}
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#1FA971]/50 placeholder:text-slate-700"
 />
 ))}
 </div>
 </div>

 <button
 type="submit"
 disabled={saving}
 className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-60"
 style={{ background:"linear-gradient(135deg, #1FA971, var(--color-primary))", boxShadow:"0 4px 16px rgba(31,169,113,0.3)" }}
 >
 {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={14} />}
 {saving ?"Saving..." :"Save Profile"}
 </button>
 </form>
 )}
 </div>
 </div>
 )}
 </>
 )
}

function CreateOrgButton({ userId }: { userId?: string }) {
 const [open, setOpen] = useState(false)
 const router = useRouter()
 const [, startTransition] = useTransition()
 const [name, setName] = useState("")
 const [saving, setSaving] = useState(false)

 const handleCreate = async (e: React.FormEvent) => {
 e.preventDefault()
 if (!userId || !name) return
 setSaving(true)
 try {
 const res = await fetch("/api/employer/organization", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ name, userId }),
 })
 if (res.ok) {
 setOpen(false)
 startTransition(() => router.refresh())
 }
 } finally {
 setSaving(false)
 }
 }

 return (
 <>
 <button
 onClick={() => setOpen(true)}
 className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95"
 style={{ background:"var(--color-primary)", boxShadow:"0 4px 16px rgba(255,77,28,0.3)" }}
 >
 <Plus size={14} />
 Create Organization
 </button>

 {open && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
 <div
 className="relative w-full max-w-md rounded-3xl p-6 shadow-2xl"
 style={{ background:"var(--color-surface)", border:"1px solid rgba(31,169,113,0.3)" }}
 >
 <button onClick={() => setOpen(false)} className="absolute right-4 top-4 text-slate-500 hover:text-white">
 <X size={18} />
 </button>
 <div className="flex items-center gap-3 mb-5">
 <div className="w-10 h-10 rounded-xl bg-[#1FA971]/20 flex items-center justify-center">
 <Building2 size={18} className="text-[#A78BFA]" />
 </div>
 <div>
 <h2 className="font-black text-white">Create Organization</h2>
 <p className="text-xs text-slate-500">Set up your employer profile</p>
 </div>
 </div>
 <form onSubmit={handleCreate} className="space-y-4">
 <input
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="Company name"
 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#1FA971]/50 placeholder:text-slate-700"
 />
 <button
 type="submit"
 disabled={saving}
 className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm"
 style={{ background:"linear-gradient(135deg, #1FA971, var(--color-primary))" }}
 >
 {saving ? <Loader2 size={14} className="animate-spin" /> : <Building2 size={14} />}
 {saving ?"Creating..." :"Create Organization"}
 </button>
 </form>
 </div>
 </div>
 )}
 </>
 )
}

export const OrgProfileClient = { EditButton, CreateOrgButton }
