import { CheckCircle2, Circle, ArrowRight, BookOpen, Briefcase, Code } from"lucide-react";
import Link from"next/link";
import React from"react";

import { PersonalizedRoadmap, RoadmapStep } from"@/lib/recommendation-engine";

export function CareerRoadmapTracker({ roadmap }: { roadmap: PersonalizedRoadmap }) {
 
 const getStepIcon = (type: RoadmapStep['type']) => {
 switch(type) {
 case"skill_gap": return <Code size={18} />;
 case"course": return <BookOpen size={18} />;
 case"project": return <Code size={18} />;
 case"internship": return <Briefcase size={18} />;
 case"interview_prep": return <Briefcase size={18} />;
 case"apply": return <ArrowRight size={18} />;
 default: return <Circle size={18} />;
 }
 };

 return (
 <div className="bg-surface/60 border border-white/5 rounded-3xl p-6 lg:p-8">
 <div className="mb-8">
 <h2 className="text-2xl font-bold text-foreground mb-2">
 Your Path to <span className="text-foreground capitalize">{roadmap.targetCareer}</span>
 </h2>
 <p className="text-muted-foreground">
 Based on your current skills ({roadmap.currentSkills.length}), here is your AI-generated roadmap.
 </p>
 </div>

 <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-white/10 before:to-transparent">
 {roadmap.steps.map((step, idx) => {
 const isCompleted = step.isCompleted;
 
 return (
 <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
 {/* Timeline dot */}
 <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#08080F] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow transition-colors ${
 isCompleted ? 'bg-primary text-foreground' : 'bg-card text-muted-foreground'
 }`}>
 {isCompleted ? <CheckCircle2 size={18} /> : getStepIcon(step.type)}
 </div>
 
 {/* Content card */}
 <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-black/40 border border-white/5 hover:border-border transition-colors">
 <div className="flex items-center justify-between mb-2">
 <h3 className={`font-bold text-lg ${isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}>
 {step.title}
 </h3>
 {step.actionableLink && !isCompleted && (
 <Link href={step.actionableLink} className="text-xs text-foreground font-bold uppercase tracking-wider flex items-center gap-1 hover:text-cyan-300">
 Take Action <ArrowRight size={12} />
 </Link>
 )}
 </div>
 <p className={`text-sm ${isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
 {step.description}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}
