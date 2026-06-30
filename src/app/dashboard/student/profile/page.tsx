"use client"

import { ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"

import ProfileEditor from "@/components/profile/ProfileEditor"
import { Skeleton } from "@/components/ui/Skeleton"

export default function StudentProfilePage() {
   
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile")
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        
        // Ensure skills is an array for the editor
        const normalizedData = {
          ...data,
          skills: data.skills 
            ? (Array.isArray(data.skills) ? data.skills : data.skills.split(',').map((s: string) => s.trim()).filter(Boolean))
            : []
        }
        setProfile(normalizedData)
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
      <div className="min-h-screen bg-[#0A0F1E] space-y-10 p-10 max-w-7xl mx-auto">
        <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            <Skeleton className="lg:col-span-2 h-[600px] rounded-3xl bg-white/5" />
            <div className="space-y-6">
                <Skeleton className="h-64 rounded-3xl bg-white/5" />
                <Skeleton className="h-96 rounded-3xl bg-white/5" />
            </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center p-6">
        <div className="bg-[#111116] border border-red-500/20 rounded-3xl p-10 text-center max-w-lg shadow-2xl">
          <ShieldCheck size={40} className="mx-auto text-red-400 mb-4" />
          <h2 className="font-bold text-white mb-2">Profile Missing</h2>
          <p className="text-slate-400">We couldn&apos;t load your profile data. Please refresh or contact support.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <ProfileEditor profile={profile} />
    </div>
  )
}
