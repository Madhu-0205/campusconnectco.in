"use client"

import React, { useState } from "react"
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Menu, X, Search } from "lucide-react"

import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic"
import { springSnappy } from "@/lib/motion"

export function V2Navbar() {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious()
    if (previous && latest > previous && latest > 150) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  })

  const openSearch = () => {
    document.dispatchEvent(new CustomEvent('open-command-center'))
  }

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-100%", opacity: 0 }
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={springSnappy}
        className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <div className="pointer-events-auto flex items-center justify-between px-6 py-3 rounded-full bg-surface/70 backdrop-blur-xl border border-white/10 shadow-card w-full max-w-4xl">
          
          <HoverMagnetic strength={0.1}>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-lg">
                C
              </div>
              <span className="font-semibold text-lg hidden sm:block tracking-tight">CampusConnect</span>
            </Link>
          </HoverMagnetic>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-2">
            <Link href="/freelance-jobs" className="hover:text-white transition-colors">Gigs</Link>
            <Link href="/internships" className="hover:text-white transition-colors">Internships</Link>
            <Link href="/companies" className="hover:text-white transition-colors">Startups</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={openSearch}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-text-3 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
            <Link href="/auth/sign-in" className="text-sm font-medium text-text-2 hover:text-white transition-colors px-2">
              Log in
            </Link>
            <HoverMagnetic strength={0.15}>
              <Link href="/join" className="h-10 px-5 rounded-full bg-white text-black text-sm font-medium flex items-center justify-center transition-transform active:scale-95">
                Join Network
              </Link>
            </HoverMagnetic>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={openSearch}
              className="p-2 text-text-2 hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              className="p-2 text-text-2 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-xl flex flex-col p-6"
          >
            <div className="flex justify-end">
              <button 
                className="p-2 text-text-2 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="flex flex-col items-center justify-center flex-1 gap-8 text-2xl font-semibold">
              <Link href="/freelance-jobs" onClick={() => setMobileMenuOpen(false)}>Gigs</Link>
              <Link href="/internships" onClick={() => setMobileMenuOpen(false)}>Internships</Link>
              <Link href="/companies" onClick={() => setMobileMenuOpen(false)}>Startups</Link>
              <div className="h-px w-16 bg-white/10 my-4" />
              <Link href="/auth/sign-in" className="text-text-2" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
              <Link href="/join" className="text-primary" onClick={() => setMobileMenuOpen(false)}>Join Network</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
