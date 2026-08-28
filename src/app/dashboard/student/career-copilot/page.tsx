import { motion } from"framer-motion"
import type { Metadata } from"next"
import React from"react"

import { 
 BriefingWidget, 
 RecommendedOpportunitiesWidget,
 ResumeInsightsWidget,
 SkillGapWidget,
 InterviewPrepWidget,
 ConnectionsWidget,
 DeadlinesWidget,
 CareerProgressWidget,
 WeeklyGoalsWidget,
 QuickActionsWidget
} from"@/components/v2/copilot/Widgets"


export const metadata: Metadata = {
 title:"Career Copilot | CampusConnect",
 description:"Your intelligent AI career mentor.",
}

export default async function CareerCopilotPage() {
 return (
 <div className="min-h-screen bg-background pb-32 pt-8">
 <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 
 <div className="mb-8">
 <h1 className="text-3xl font-black text-foreground mb-2">Career Command Center</h1>
 <p className="text-muted-foreground font-medium">Your personalized trajectory and AI insights.</p>
 </div>

 <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full md:w-auto md:col-span-2 lg:col-span-3">
 <BriefingWidget />
 </motion.div>

 {/* Secondary Widgets Row (Horizontal Scroll on Mobile) */}
 <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:pb-0 md:contents gap-6 [&::-webkit-scrollbar]:hidden">
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.05 }} className="w-[85vw] shrink-0 snap-center md:w-auto md:col-span-1 lg:col-span-2">
 <RecommendedOpportunitiesWidget />
 </motion.div>

 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.05 }} className="w-[85vw] shrink-0 snap-center md:w-auto md:col-span-1 lg:col-span-1">
 <DeadlinesWidget />
 </motion.div>
 </div>

 {/* Tertiary Widgets Row (Horizontal Scroll on Mobile) */}
 <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 md:mx-0 md:px-0 md:pb-0 md:contents gap-6 [&::-webkit-scrollbar]:hidden">
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.1 }} className="w-[85vw] shrink-0 snap-center md:w-auto md:col-span-1 lg:col-span-2">
 <ResumeInsightsWidget />
 </motion.div>

 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.1 }} className="w-[85vw] shrink-0 snap-center md:w-auto md:col-span-1 lg:col-span-1">
 <ConnectionsWidget />
 </motion.div>

 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.15 }} className="w-[85vw] shrink-0 snap-center md:w-auto md:col-span-1 lg:col-span-2">
 <SkillGapWidget />
 </motion.div>

 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.15 }} className="w-[85vw] shrink-0 snap-center md:w-auto md:col-span-2 lg:col-span-1">
 <InterviewPrepWidget />
 </motion.div>
 </div>

 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.2 }} className="w-full md:w-auto md:col-span-2 lg:col-span-2">
 <CareerProgressWidget />
 </motion.div>
 
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.25 }} className="w-full md:w-auto md:col-span-2 lg:col-span-3">
 <WeeklyGoalsWidget />
 </motion.div>

 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.3 }} className="w-full md:w-auto md:col-span-2 lg:col-span-3">
 <QuickActionsWidget />
 </motion.div>
 </div>

 </main>
 </div>
 )
}
