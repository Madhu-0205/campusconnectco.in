"use client"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion } from 'framer-motion'

export function GigGridSkeleton({ count = 12 }) {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between border-white/5 pb-6">
          <div className="h-4 w-24 bg-white/5 rounded-full mb-2" />
          <div className="h-6 w-48 bg-white/5 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="bg-[#111116] border border-white/5 rounded-4xl p-6 h-[400px] flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-white/5 rounded-full" />
                <div className="h-3 w-20 bg-white/5 rounded-full" />
              </div>
            </div>
            <div className="h-8 w-full bg-white/5 rounded-xl" />
            <div className="space-y-3">
               <div className="h-4 w-full bg-white/5 rounded-full" />
               <div className="h-4 w-5/6 bg-white/5 rounded-full" />
            </div>
            <div className="flex gap-2">
               {[1,2,3].map(j => <div key={j} className="h-8 w-20 bg-white/5 rounded-xl" />)}
            </div>
            <div className="mt-auto flex justify-between pt-6 border-white/5">
                <div className="h-10 w-24 bg-white/5 rounded-xl" />
                <div className="h-12 w-32 bg-indigo-500/10 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
