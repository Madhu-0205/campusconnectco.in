import { Briefcase, ShieldCheck } from "lucide-react"
import React from "react"

interface Experience {
  id: string
  title: string
  company: string
  date: string
  type: string
  skills?: string[]
}

interface ExperienceTimelineProps {
  experiences: Experience[]
}

export const ExperienceTimeline = ({ experiences }: ExperienceTimelineProps) => {
  if (!experiences || experiences.length === 0) return null

  return (
    <div className="bg-surface rounded-4xl p-8 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
        <ShieldCheck size={120} />
      </div>
      
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success">
          <Briefcase size={20} />
        </div>
        <h2 className="text-xl font-black text-foreground">Verified Experience</h2>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="absolute left-[19px] top-16 bottom-4 w-px bg-border/50" />
        
        {experiences.map((exp) => (
          <div key={exp.id} className="relative pl-12">
            <div className="absolute left-0 top-1.5 w-10 h-10 bg-surface-2 border-2 border-background rounded-full flex items-center justify-center text-muted-foreground z-10">
              <ShieldCheck size={16} className="text-success" />
            </div>
            
            <div className="bg-background rounded-3xl p-6 group hover:border-primary/50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{exp.title}</h3>
                <span className="text-sm font-bold text-muted-foreground">{exp.date}</span>
              </div>
              <p className="text-sm font-medium text-foreground mb-4">
                {exp.company} <span className="text-muted-foreground/50 mx-1">•</span> <span className="text-muted-foreground">{exp.type}</span>
              </p>
              
              {exp.skills && exp.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {exp.skills.map((skill) => (
                    <span key={skill} className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground bg-surface-2 px-2.5 py-1 rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
