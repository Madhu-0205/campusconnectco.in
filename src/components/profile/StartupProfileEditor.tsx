"use client"

import { 
 
 
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 Building2, Globe, Mail, User, ShieldCheck, 
 
 
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 MapPin, Calendar, LayoutDashboard, Briefcase 
} from"lucide-react"

import { AvatarUpload } from"./AvatarUpload"
import { EditableField } from"./EditableField"

interface StartupProfileEditorProps {
 profile: {
 id: string
 name: string | null
 email: string
 bio: string | null
 portfolio: string | null
 image: string | null
 role: string
 }
}

export default function StartupProfileEditor({ profile }: StartupProfileEditorProps) {
 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12 animate-in fade-in duration-700">
 
 {/* ── HEADER ──────────────────────────────────────────────── */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-white/5 pb-8">
 <div>
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent border border-border text-[11px] font-black uppercase tracking-widest mb-6">
 <Building2 size={14} /> Founder WorkOS v2.0
 </div>
 <h1 className="md:text-5xl font-black text-foreground tracking-tight leading-tight mb-2">
 Command <span className="text-transparent bg-linear-to-r from-[#F59E0B] to-[#1FA971]">Center</span>
 </h1>
 <p className="text-lg max-w-xl font-medium">
 Manage your company identity and hiring preferences.
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
 
 {/* ── LEFT: COMPANY IDENTITY ────────────────────────────────── */}
 <div className="lg:col-span-4 space-y-8">
 <div className="bg-[#111116] border border-white/8 rounded-5xl p-10 flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
 <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#F59E0B]/10 blur-[100px] rounded-full" />
 
 <div className="relative z-10 space-y-6 flex flex-col items-center px-4 w-full">
 <AvatarUpload initialImage={profile.image} userId={profile.id} />
 
 <div className="w-full text-center">
 <h2 className="font-black text-foreground mb-1 truncate">{profile.name ||"Startup Name"}</h2>
 <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
 <ShieldCheck size={12} className="text-[#10B981]" /> Verified Startup
 </div>
 </div>

 <div className="w-full h-px bg-accent" />

 <div className="w-full space-y-3">
 <div className="bg-white/2 border border-white/5 rounded-2xl p-4 text-left">
 <p className="font-black text-muted-foreground uppercase tracking-widest mb-1">Company Email</p>
 <p className="font-black text-foreground truncate">{profile.email}</p>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* ── RIGHT: SETTINGS ───────────────────────────────────────── */}
 <div className="lg:col-span-8 space-y-12">
 
 <section className="space-y-8">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B]">
 <Building2 size={20} />
 </div>
 <h3 className="font-black text-foreground px-1">Organization Basics</h3>
 </div>
 
 <div className="grid grid-cols-1 gap-10">
 <EditableField
 label="Public Company Name"
 field="name"
 initialValue={profile.name ||""}
 placeholder="e.g. Acme AI Corp"
 />
 
 <EditableField
 label="Website URL"
 field="portfolio"
 initialValue={profile.portfolio ||""}
 placeholder="https://company.io"
 />

 <EditableField
 label="Tagline / Short Pitch"
 field="bio"
 initialValue={profile.bio ||""}
 type="textarea"
 placeholder="Brief summary of your mission. What are you building?"
 />
 </div>
 </section>

 <section className="space-y-8 border-white/5 pt-12">
 <div className="flex items-center gap-3">
 <div className="p-2 rounded-xl bg-[#1FA971]/10 text-[#1FA971]">
 <Briefcase size={20} />
 </div>
 <h3 className="font-black text-foreground px-1">Startup Preferences</h3>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
 <div className="p-6 bg-surface border border-white/5 rounded-2xl space-y-2">
 <p className="font-black text-muted-foreground uppercase tracking-widest">Automatic Hiring</p>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Allow SmartMatch sourcing</span>
 <div className="w-10 h-5 bg-primary rounded-full flex items-center justify-end px-1 cursor-not-allowed opacity-50">
 <div className="w-3 h-3 bg-white rounded-full" />
 </div>
 </div>
 </div>
 
 <div className="p-6 bg-surface border border-white/5 rounded-2xl space-y-2">
 <p className="font-black text-muted-foreground uppercase tracking-widest">Visibility</p>
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Listing Priority</span>
 <span className="font-black bg-accent text-foreground border border-border px-2 py-0.5 rounded-lg uppercase">Premium</span>
 </div>
 </div>
 </div>
 </section>

 </div>
 </div>
 </div>
 )
}
