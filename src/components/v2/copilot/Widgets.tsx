"use client"

import { 
  Sun, Compass, FileText, Target, Presentation, 
  Users, Calendar, TrendingUp, CheckSquare, Zap,
  AlertTriangle, ChevronRight,
  ShieldCheck
} from "lucide-react"
import React from "react"

import { Badge } from "@/components/ui/Badge"
import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic"
import { SpotlightCard } from "@/components/v2/SpotlightCard"

import { useCopilot } from "./CopilotProvider"

export const BriefingWidget = () => {
  return (
    <SpotlightCard className="bg-primary text-primary-foreground p-8 rounded-4xl relative overflow-hidden shadow-glow-primary col-span-1 md:col-span-2 lg:col-span-3">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Sun size={120} />
      </div>
      <div className="relative z-10">
        <h2 className="text-2xl font-black mb-2">Good morning, Madhu.</h2>
        <p className="text-primary-foreground/80 font-medium mb-6 max-w-lg leading-relaxed">
          You have 2 upcoming project deliverables and a new internship match at Microsoft. I&apos;ve also analyzed your recent resume update.
        </p>
        <div className="flex gap-3">
          <Badge variant="outline" className="bg-background/20 text-primary-foreground border-transparent font-bold px-3 py-1.5 backdrop-blur-md">
            2 Deadlines
          </Badge>
          <Badge variant="outline" className="bg-background/20 text-primary-foreground border-transparent font-bold px-3 py-1.5 backdrop-blur-md">
            1 New Match
          </Badge>
        </div>
      </div>
    </SpotlightCard>
  )
}

export const RecommendedOpportunitiesWidget = () => {
  const { promptChat } = useCopilot()
  
  return (
    <SpotlightCard className="bg-surface p-6 rounded-4xl shadow-sm col-span-1 lg:col-span-2 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <Compass size={20} />
          </div>
          <h3 className="font-black text-lg">Smart Matches</h3>
        </div>
        <button onClick={() => promptChat("Find me more internships like these")} className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
          View All
        </button>
      </div>
      <div className="space-y-3 flex-1">
        {[
          { title: "Frontend Engineering Intern", company: "Microsoft", match: 94 },
          { title: "React Developer (Freelance)", company: "Stripe", match: 88 }
        ].map((job, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-background rounded-2xl group hover:border-primary/50 transition-colors cursor-pointer" onClick={() => promptChat(`Tell me more about the ${job.title} role at ${job.company}`)}>
             <div>
                <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{job.title}</h4>
                <p className="text-xs text-muted-foreground font-medium">{job.company}</p>
             </div>
             <Badge variant="outline" className="bg-success/10 text-success border-transparent font-black">
                {job.match}% Match
             </Badge>
          </div>
        ))}
      </div>
    </SpotlightCard>
  )
}

export const ResumeInsightsWidget = () => {
  const { promptChat } = useCopilot()
  
  return (
    <SpotlightCard className="bg-surface p-6 rounded-4xl shadow-sm col-span-1 lg:col-span-2 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <FileText size={20} />
          </div>
          <h3 className="font-black text-lg">Resume Score</h3>
        </div>
        <span className="text-2xl font-black text-blue-500">72<span className="text-sm text-muted-foreground">/100</span></span>
      </div>
      
      <div className="flex-1 flex flex-col justify-end gap-3">
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-2xl flex gap-3 items-start cursor-pointer hover:bg-destructive/15 transition-colors" onClick={() => promptChat("Help me add quantifiable metrics to my work experience")}>
          <AlertTriangle size={16} className="text-destructive mt-0.5 shrink-0" />
          <p className="text-xs font-medium text-foreground">Missing quantifiable metrics in &quot;Work Experience&quot;</p>
        </div>
        <button onClick={() => promptChat("Review my entire resume")} className="w-full py-3 bg-background rounded-2xl text-xs font-bold hover:bg-surface-2 transition-colors">
          Run Full AI Audit
        </button>
      </div>
    </SpotlightCard>
  )
}

export const SkillGapWidget = () => {
  const { promptChat } = useCopilot()
  return (
    <SpotlightCard className="bg-surface p-6 rounded-4xl shadow-sm col-span-1 lg:col-span-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
          <Target size={20} />
        </div>
        <h3 className="font-black text-lg">Skill Gap</h3>
      </div>
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Target: <span className="text-foreground font-bold">Full Stack Developer</span></p>
        <div>
           <div className="flex justify-between text-xs font-bold mb-2">
             <span>System Design</span>
             <span className="text-destructive">Missing</span>
           </div>
           <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
             <div className="w-1/4 h-full bg-destructive rounded-full" />
           </div>
        </div>
        <div>
           <div className="flex justify-between text-xs font-bold mb-2">
             <span>Node.js</span>
             <span className="text-warning">Improving</span>
           </div>
           <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
             <div className="w-2/3 h-full bg-warning rounded-full" />
           </div>
        </div>
        <button onClick={() => promptChat("Create a 2-week learning plan for System Design")} className="mt-4 text-xs font-bold text-primary hover:underline">
          Generate Learning Plan
        </button>
      </div>
    </SpotlightCard>
  )
}

export const InterviewPrepWidget = () => {
  const { promptChat } = useCopilot()
  return (
    <SpotlightCard className="bg-surface p-6 rounded-4xl shadow-sm col-span-1 md:col-span-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
          <Presentation size={20} />
        </div>
        <h3 className="font-black text-lg">Interview Prep</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div onClick={() => promptChat("Start a mock behavioral interview for a Frontend role")} className="p-4 bg-background rounded-3xl cursor-pointer hover:border-primary/50 transition-colors group">
           <h4 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">Mock Interview</h4>
           <p className="text-xs text-muted-foreground font-medium">Practice behavioral questions with AI</p>
        </div>
        <div onClick={() => promptChat("What are the most common technical questions asked at Microsoft?")} className="p-4 bg-background rounded-3xl cursor-pointer hover:border-primary/50 transition-colors group">
           <h4 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">Company Intel</h4>
           <p className="text-xs text-muted-foreground font-medium">Microsoft technical question bank</p>
        </div>
      </div>
    </SpotlightCard>
  )
}

export const ConnectionsWidget = () => {
  return (
    <SpotlightCard className="bg-surface p-6 rounded-4xl shadow-sm col-span-1">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
          <Users size={20} />
        </div>
        <h3 className="font-black text-lg">Network</h3>
      </div>
      <div className="flex -space-x-3 justify-center mb-6 py-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="w-12 h-12 rounded-full border-2 border-surface bg-surface-2 flex items-center justify-center text-xs font-bold z-10 hover:z-20 hover:-translate-y-1 transition-transform">
             A{i}
          </div>
        ))}
      </div>
      <p className="text-xs text-center text-muted-foreground font-medium">4 alumni from your college work at target companies.</p>
    </SpotlightCard>
  )
}

export const DeadlinesWidget = () => {
  return (
    <SpotlightCard className="bg-surface p-6 rounded-4xl shadow-sm col-span-1">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
          <Calendar size={20} />
        </div>
        <h3 className="font-black text-lg">Deadlines</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-4 p-3 bg-background rounded-2xl">
           <div className="w-12 h-12 rounded-xl bg-surface-2 flex flex-col items-center justify-center shrink-0">
             <span className="text-[10px] font-bold text-muted-foreground uppercase">Aug</span>
             <span className="text-sm font-black">12</span>
           </div>
           <div>
             <h4 className="font-bold text-sm text-foreground leading-tight">UI Design Deliverable</h4>
             <p className="text-xs text-destructive font-bold mt-1">Due in 5 days</p>
           </div>
        </div>
      </div>
    </SpotlightCard>
  )
}

export const CareerProgressWidget = () => {
  return (
    <SpotlightCard className="bg-surface p-6 rounded-4xl shadow-sm col-span-1 md:col-span-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
          <TrendingUp size={20} />
        </div>
        <h3 className="font-black text-lg">Career Trajectory</h3>
      </div>
      <div className="relative pt-8 pb-4 px-4">
         <div className="absolute top-1/2 left-4 right-4 h-1 bg-surface-2 rounded-full -translate-y-1/2" />
         <div className="absolute top-1/2 left-4 w-1/3 h-1 bg-primary rounded-full -translate-y-1/2" />
         
         <div className="flex justify-between relative z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary border-4 border-surface shadow-sm" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Student</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary border-4 border-surface shadow-sm" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Intern</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-surface-2 border-4 border-surface shadow-sm" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Junior Dev</span>
            </div>
         </div>
      </div>
    </SpotlightCard>
  )
}

export const WeeklyGoalsWidget = () => {
  const { promptChat } = useCopilot()
  return (
    <SpotlightCard className="bg-surface p-6 rounded-4xl shadow-sm col-span-1 md:col-span-2 lg:col-span-3">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
            <CheckSquare size={20} />
          </div>
          <h3 className="font-black text-lg">Weekly AI Goals</h3>
        </div>
        <span className="text-xs font-bold text-muted-foreground">1/3 Completed</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-background rounded-3xl flex items-start gap-3">
           <div className="w-5 h-5 rounded-md bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
             <ShieldCheck size={12} />
           </div>
           <div>
             <h4 className="font-bold text-sm line-through text-muted-foreground">Update GitHub Link</h4>
             <p className="text-xs text-muted-foreground/50 font-medium">Done Tuesday</p>
           </div>
        </div>
        <div className="p-4 bg-background border border-primary/30 rounded-3xl flex items-start gap-3 cursor-pointer hover:border-primary/60 transition-colors" onClick={() => promptChat("Help me draft a cover letter for a frontend role")}>
           <div className="w-5 h-5 rounded-md border-2 border-muted-foreground flex items-center justify-center shrink-0 mt-0.5" />
           <div>
             <h4 className="font-bold text-sm text-foreground">Draft Cover Letter</h4>
             <p className="text-xs text-muted-foreground font-medium">Pending</p>
           </div>
        </div>
        <div className="p-4 bg-background rounded-3xl flex items-start gap-3 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => promptChat("Start a mock interview for React basics")}>
           <div className="w-5 h-5 rounded-md border-2 border-muted-foreground flex items-center justify-center shrink-0 mt-0.5" />
           <div>
             <h4 className="font-bold text-sm text-foreground">Complete Mock Interview</h4>
             <p className="text-xs text-muted-foreground font-medium">Pending</p>
           </div>
        </div>
      </div>
    </SpotlightCard>
  )
}

export const QuickActionsWidget = () => {
  const { promptChat } = useCopilot()
  
  const actions = [
    { label: "Review Profile", prompt: "Review my public profile and tell me what I should improve." },
    { label: "Find Remote Work", prompt: "Find me high-paying remote freelance gigs." },
    { label: "Salary Negotation", prompt: "How do I negotiate my stipend for the upcoming internship?" },
    { label: "Analyze JD", prompt: "I am going to paste a Job Description. Please analyze if I am a good fit based on my skills." }
  ]

  return (
    <SpotlightCard className="bg-surface-2 p-6 rounded-4xl shadow-sm col-span-1 lg:col-span-3">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
          <Zap size={20} />
        </div>
        <h3 className="font-black text-lg">Quick Actions</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {actions.map((action, i) => (
          <HoverMagnetic key={i} strength={0.1}>
            <button 
              onClick={() => promptChat(action.prompt)}
              className="px-5 py-3 bg-background rounded-2xl text-sm font-bold flex items-center gap-2 hover:border-primary/50 hover:text-primary transition-colors"
            >
              {action.label} <ChevronRight size={14} className="opacity-50" />
            </button>
          </HoverMagnetic>
        ))}
      </div>
    </SpotlightCard>
  )
}
