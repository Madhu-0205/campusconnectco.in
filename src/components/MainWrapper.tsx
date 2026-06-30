"use client"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLanding = pathname === "/"
  
  return (
    <main className={`relative ${isLanding ? '' : 'pt-16'} min-h-screen ${isLanding ? '' : 'pb-24 lg:pb-10'}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
