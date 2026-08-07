import React from "react"
import { Sparkles } from "lucide-react"

interface CareerStoryProps {
  bio?: string
}

export const CareerStory = ({ bio }: CareerStoryProps) => {
  return (
    <div className="bg-surface border border-border rounded-4xl p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Sparkles size={20} />
        </div>
        <h2 className="text-xl font-black text-foreground">The Story</h2>
      </div>
      <p className="text-muted-foreground leading-relaxed font-medium text-base">
        {bio || "This student hasn't written their professional story yet. But we know they're building something great."}
      </p>
    </div>
  )
}
