import { ExternalLink, Github, Linkedin, Mail,  Download } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/Button"
import { VerificationBadge } from "@/components/ui/VerificationBadge"
import { UserAvatar } from "@/components/v2/UserAvatar"

interface IdentityCardProps {
  profile: {
    name: string
    username: string
    isVerified?: boolean
    college?: string
    branch?: string
    year?: string
    avatar?: string
    available?: boolean
    linkedin?: string
    github?: string
    portfolio?: string
    joinedAt?: string
  }
}

export const IdentityCard = ({ profile }: IdentityCardProps) => {
  return (
    <div className="sticky top-24 bg-surface-2/50 backdrop-blur-xl rounded-4xl p-8 flex flex-col items-center text-center shadow-glow-primary">
      <div className="relative mb-6">
        <UserAvatar
          src={profile.avatar}
          alt={profile.name}
          fallback={profile.name?.charAt(0) || "S"}
          size="xl"
          className="w-32 h-32 text-4xl shadow-2xl border-4 border-background"
        />
        {profile.available && (
          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-success border-4 border-background flex items-center justify-center">
             <div className="w-2.5 h-2.5 bg-background rounded-full animate-pulse" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-1 justify-center flex-wrap">
        <h1 className="text-2xl font-black text-foreground">{profile.name}</h1>
        {profile.isVerified && <VerificationBadge isVerified size="sm" />}
      </div>
      
      <p className="text-muted-foreground font-medium text-sm mb-4">
        {profile.branch} · {profile.college} · {profile.year}
      </p>

      {profile.available && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold uppercase tracking-widest mb-6">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Available for Internships
        </div>
      )}

      <div className="w-full space-y-3 mb-8">
        <a href={`mailto:hire@campusconnectco.in?subject=Hiring ${profile.name}`}>
          <Button variant="default" className="w-full font-bold h-12 text-sm shadow-glow-primary">
            <Mail size={16} className="mr-2" /> Message
          </Button>
        </a>
        <Button variant="outline" className="w-full font-bold h-12 text-sm">
          <Download size={16} className="mr-2" /> Download Resume
        </Button>
      </div>

      <div className="w-full h-px bg-border mb-6" />

      <div className="w-full flex flex-col gap-3">
        {profile.linkedin && (
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3 rounded-2xl bg-background hover:border-primary/50 transition-colors group">
            <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
              <Linkedin size={18} />
              <span className="text-sm font-bold">LinkedIn</span>
            </div>
            <ExternalLink size={14} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
          </a>
        )}
        {profile.github && (
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3 rounded-2xl bg-background hover:border-primary/50 transition-colors group">
            <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
              <Github size={18} />
              <span className="text-sm font-bold">GitHub</span>
            </div>
            <ExternalLink size={14} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
          </a>
        )}
        {profile.portfolio && (
          <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-4 py-3 rounded-2xl bg-background hover:border-primary/50 transition-colors group">
            <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
              <ExternalLink size={18} />
              <span className="text-sm font-bold">Portfolio</span>
            </div>
            <ExternalLink size={14} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
          </a>
        )}
      </div>

      {profile.joinedAt && (
        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-muted-foreground/50 flex items-center gap-2">
          Joined {profile.joinedAt}
        </p>
      )}
    </div>
  )
}
