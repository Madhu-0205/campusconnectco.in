"use client"

import { ShieldCheck, Loader2 } from"lucide-react"
import { useEffect, useState } from"react"

import StartupProfileEditor from"@/components/profile/StartupProfileEditor"

export default function ClientSettingsPage() {
 
 const [profile, setProfile] = useState<any>(null)
 const [loading, setLoading] = useState(true)

 useEffect(() => {
 async function fetchProfile() {
 try {
 const res = await fetch("/api/user/profile")
 if (!res.ok) throw new Error("Failed to fetch")
 const data = await res.json()
 setProfile(data)
 } catch (err) {
 console.error(err)
 } finally {
 setLoading(false)
 }
 }
 fetchProfile()
 }, [])

 if (loading) {
 return (
 <div className="min-h-screen bg-background flex flex-col items-center justify-center">
 <Loader2 className="w-12 h-12 text-[#F59E0B] animate-spin mb-4" />
 <p className="font-black uppercase tracking-widest text-sm animate-pulse">
 Opening Company Center...
 </p>
 </div>
 )
 }

 if (!profile) {
 return (
 <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
 <div className="bg-(--surface) border border-red-500/20 rounded-3xl p-10 max-w-lg shadow-2xl">
 <ShieldCheck size={40} className="mx-auto text-red-400 mb-4" />
 <h2 className="font-bold text-white mb-2">Workspace Not Found</h2>
 <p className="text-slate-400">Unable to load your company settings. Please try again or refresh.</p>
 </div>
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-background">
 <StartupProfileEditor profile={profile} />
 </div>
 )
}
