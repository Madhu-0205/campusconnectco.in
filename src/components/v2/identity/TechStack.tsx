import { Code2 } from"lucide-react"
import React from"react"

import { Badge } from"@/components/ui/Badge"

interface TechStackProps {
 skills: { name: string; level: string }[]
}

export const TechStack = ({ skills }: TechStackProps) => {
 if (!skills || skills.length === 0) return null

 return (
 <div className="bg-surface rounded-4xl p-8 shadow-sm">
 <div className="flex items-center gap-3 mb-6">
 <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-foreground">
 <Code2 size={20} />
 </div>
 <h2 className="text-xl font-black text-foreground">Tech Stack</h2>
 </div>
 
 <div className="flex flex-wrap gap-2">
 {skills.map((skill) => (
 <Badge key={skill.name} variant="outline" className="px-4 py-2 text-sm font-bold bg-background">
 {skill.name}
 </Badge>
 ))}
 </div>
 </div>
 )
}
