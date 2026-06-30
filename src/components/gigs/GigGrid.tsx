'use client'
import { GigCard } from './GigCard'
// import { GigPagination } from './GigPagination' // I'll check if exists or build

interface GigGridProps {
  gigs: Record<string, unknown>[]
  userSkills: string[]
  userId?: string
  totalCount: number
  currentPage: number
}

export function GigGrid({ gigs, userSkills, userId, totalCount, currentPage }: GigGridProps) {
  return (
    <div className="space-y-8 pb-32">
      {/* Results count & active info */}
      <div className="flex items-center justify-between border-white/5 pb-6">
        <div>
           <p className="font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Results Found</p>
           <h3 className="font-black text-white">
             {gigs.length} <span className="text-slate-500">Active</span> Opportunities
           </h3>
        </div>
        <div className="flex items-center gap-4">
           {/* Placeholder for sort dropdown */}
           <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl font-black text-white cursor-pointer hover:bg-white/10 transition-colors uppercase tracking-widest">
              Newest First
           </div>
        </div>
      </div>

      {/* Gig cards grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
        {gigs.map((gig, index) => {
          // Calculate real match % from user's actual skills
          const requiredSkills = Array.isArray(gig.required_skills)
            ? gig.required_skills
            : typeof gig.required_skills === 'string'
              ? gig.required_skills.split(',').map((s: string) => s.trim()).filter(Boolean)
              : []

          const matchedSkills = requiredSkills.filter((skill: string) =>
            userSkills.some(us => us.toLowerCase() === skill.toLowerCase())
          )

          const matchScore = requiredSkills.length === 0
            ? 50
            : Math.round((matchedSkills.length / requiredSkills.length) * 100)

          return (
            <GigCard
              key={gig.id as string}
              gig={gig as Parameters<typeof GigCard>[0]['gig']}
              matchScore={matchScore}
              matchedSkills={matchedSkills}
              missingSkills={requiredSkills.filter((s: string) => !matchedSkills.includes(s))}
              userId={userId}
              index={index}
            />
          )
        })}
      </div>

      {/* Simple Pagination Footer */}
      {totalCount > 20 && (
         <div className="flex items-center justify-between pt-12 border-white/5">
            <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl font-black text-slate-500 uppercase tracking-widest disabled:opacity-30" disabled={currentPage === 0}>
               Previous Page
            </button>
            <div className="flex items-center gap-2">
               {[...Array(Math.ceil(totalCount / 20))].map((_, i) => (
                  <button key={i} className={`w-8 h-8 rounded-lg font-black transition-all ${currentPage === i ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}>
                     {i + 1}
                  </button>
               ))}
            </div>
            <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
               Next Page
            </button>
         </div>
      )}
    </div>
  )
}
