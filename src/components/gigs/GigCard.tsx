"use client"
/* eslint-disable react-hooks/set-state-in-effect */
import { motion } from 'framer-motion'
import { Shield, Clock, MapPin, Zap, Bookmark, BookmarkCheck } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect, useMemo } from 'react'

import { fadeUp } from '@/lib/animations'
import { createClient } from '@/lib/supabase/client'
import { notify } from '@/lib/toast'
// import { QuickApplyModal } from './QuickApplyModal' // I'll build this later or use existing
import { cn } from '@/lib/utils'

interface GigCardProps {
  gig: {
    id: string;
    title: string;
    description: string;
    budget: number;
    duration?: string;
    work_mode?: string;
    created_at: string;
    views?: number;
    posted_by: string;
    required_skills: string[] | string;
    posted_by_user?: {
      company_name?: string;
      full_name?: string;
      avatar_url?: string;
      image?: string;
    };
  };
  matchScore: number;
  matchedSkills: string[];
  missingSkills?: string[];
  userId?: string;
  index: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function GigCard({ gig, matchScore, matchedSkills, missingSkills, userId, index }: GigCardProps) {
  const supabase = createClient()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [applyOpen, setApplyOpen] = useState(false)

  // Safe skills array — prevents .map() crash
  const skills = Array.isArray(gig.required_skills)
    ? gig.required_skills
    : typeof gig.required_skills === 'string'
      ? gig.required_skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []

  const matchColor = matchScore >= 80 ? 'hsl(var(--success, 142.1 76.2% 36.3%))' : matchScore >= 60 ? 'hsl(var(--primary))' : 'hsl(var(--warning, 38 92% 50%))'

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const timeAgo = useMemo(() => {
    if (!mounted) return ''
    const postedAt = new Date(gig.created_at)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - postedAt.getTime()) / (1000 * 60 * 60))
    return diffHours < 1 ? 'Just now'
      : diffHours < 24 ? `${diffHours}h ago`
      : `${Math.floor(diffHours / 24)}d ago`
  }, [mounted, gig.created_at])

  const handleSave = async () => {
    if (!userId) { notify.error('Sign in to save gigs'); return }
    setSaving(true)
    const { error } = await supabase.from('saved_gigs').upsert({
      user_id: userId, gig_id: gig.id
    })
    setSaving(false)
    if (error) { notify.error('Could not save gig'); return }
    setSaved(true)
    notify.success('Gig saved!')
  }

  // Track gig view
  const handleView = async () => {
    // Only increment view if not the owner
    if (userId === gig.posted_by) return;
    await supabase.from('gigs').update({ views: (gig.views ?? 0) + 1 }).eq('id', gig.id)
  }

  const companyName = gig.posted_by_user?.company_name || gig.posted_by_user?.full_name || 'Startup'
  const avatarUrl = gig.posted_by_user?.avatar_url || gig.posted_by_user?.image

  return (
    <>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: index * 0.05 }}
        onViewportEnter={handleView}
        className="group relative bg-card border border-border hover:border-border/80 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        {/* Top row: company + save */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-accent border border-border shrink-0 flex items-center justify-center relative group-hover:scale-105 transition-transform">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={companyName} fill className="object-cover" unoptimized />
              ) : (
                <span className="font-bold text-foreground">
                  {companyName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground tracking-tight">{companyName}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">{timeAgo}</p>
                {(gig.views ?? 0) > 0 && <span className="w-1 h-1 rounded-full bg-border" />}
                {(gig.views ?? 0) > 0 && <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">{gig.views} views</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Match score ring */}
            {userId && (
              <div className="flex items-center gap-1.5 bg-accent/50 border border-border px-2 py-1 rounded-full">
                <svg width="24" height="24" viewBox="0 0 28 28">
                  <circle cx="14" cy="14" r="11" fill="none" className="stroke-border" strokeWidth="3"/>
                  <circle
                    cx="14" cy="14" r="11" fill="none"
                    stroke={matchColor} strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 11 * matchScore / 100} ${2 * Math.PI * 11}`}
                    strokeLinecap="round"
                    transform="rotate(-90 14 14)"
                    className="transition-all duration-1000 ease-out"
                  />
                  <text x="14" y="18" textAnchor="middle" fill="currentColor" className="fill-foreground text-[8px] font-bold">
                    {matchScore}%
                  </text>
                </svg>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Match</span>
              </div>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="p-2 rounded-xl bg-accent/50 hover:bg-accent border border-transparent hover:border-border transition-all active:scale-95"
              aria-label="Save gig"
            >
              {saved
                ? <BookmarkCheck className="w-4 h-4 text-primary" />
                : <Bookmark className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              }
            </button>
          </div>
        </div>

        {/* Gig title */}
        <div className="mb-4">
          <h3 className="font-bold text-lg leading-tight mb-2 text-foreground group-hover:text-primary transition-colors">
            {gig.title}
          </h3>
          <p className="text-sm line-clamp-2 leading-relaxed text-muted-foreground">
            {gig.description}
          </p>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {skills.slice(0, 4).map((skill: string) => {
              const matches = matchedSkills.some((s: string) => s.toLowerCase() === skill.toLowerCase())
              return (
              <span
                key={skill}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-mono uppercase tracking-wide border transition-all",
                  matches ? "bg-primary/10 border-primary/20 text-primary" : "bg-accent/50 border-border text-muted-foreground"
                )}
              >
                {skill}
              </span>
            )})}
            {skills.length > 4 && (
              <span className="text-[10px] font-mono text-muted-foreground px-2 py-1 uppercase tracking-wide">+{skills.length - 4} more</span>
            )}
          </div>
        )}

        <div className="mt-auto pt-5 border-t border-border space-y-4">
           {/* Meta row */}
          <div className="flex items-center gap-4 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>{gig.duration || 'Flexible'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              <span className="capitalize">{gig.work_mode || 'Remote'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-primary">
              <Shield className="w-3 h-3" />
              <span>Verified</span>
            </div>
          </div>

          {/* Bottom row: budget + apply */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Budget</p>
              <span className="font-semibold text-foreground tracking-tight">
                ₹{gig.budget.toLocaleString('en-IN')}
              </span>
            </div>
            <button
              onClick={() => setApplyOpen(true)}
              className="bg-foreground text-background hover:bg-foreground/90 flex items-center gap-2 py-2 px-5 rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-background" />
              Quick Apply
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick apply modal would go here if implemented */}
      {/* <QuickApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        gig={gig}
        userId={userId}
      /> */}
    </>
  )
}
