"use client"

import { motion, AnimatePresence } from"framer-motion"
import { Menu, X, Search, Globe, ChevronDown } from"lucide-react"
import Link from"next/link"
import React, { useState } from"react"

export function V2Navbar() {
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

 const openSearch = () => {
 document.dispatchEvent(new CustomEvent('open-command-center'))
 }

 return (
 <>
 {/* Promotional Top Bar - Evolution style dark green */}
 <div className="w-full bg-[#2B4B3C] text-white flex items-center justify-center py-2.5 px-4 text-xs md:text-sm font-medium z-50 relative">
 <span className="hidden sm:inline">Build your career from scratch and start earning in 30 minutes.</span>
 <span className="sm:hidden">Start earning in 30 minutes.</span>
 
 <div className="mx-4 h-4 w-px bg-white/20 hidden md:block"></div>
 
 <div className="hidden md:flex items-center gap-3">
 <span className="opacity-90">Enrollment closes in:</span>
 <div className="flex items-center gap-1.5 font-mono bg-white/10 px-2 py-1 rounded">
 <div className="flex flex-col items-center leading-none">
 <span className="text-sm font-bold">04</span>
 <span className="text-[8px] opacity-70">DAYS</span>
 </div>
 <span>:</span>
 <div className="flex flex-col items-center leading-none">
 <span className="text-sm font-bold">08</span>
 <span className="text-[8px] opacity-70">HRS</span>
 </div>
 <span>:</span>
 <div className="flex flex-col items-center leading-none">
 <span className="text-sm font-bold">15</span>
 <span className="text-[8px] opacity-70">MIN</span>
 </div>
 </div>
 </div>

 <Link 
 href="/join" 
 className="ml-4 bg-white/10 hover:bg-white/20 transition-colors px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
 >
 Secure my spot <span className="opacity-70">→</span>
 </Link>
 </div>

 {/* Main Navbar - Solid White */}
 <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-40 transition-all duration-300">
 <div className="max-w-350 mx-auto px-6 h-16 flex items-center justify-between">
 
 {/* Logo Left */}
 <Link href="/" className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-lg bg-[#2B4B3C] text-white flex items-center justify-center font-bold text-lg">
 C
 </div>
 <span className="font-bold text-xl tracking-tight text-[#2B4B3C]">
 campus<span className="text-[#1FA971]">connect</span>
 </span>
 </Link>

 {/* Center Links */}
 <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-gray-700">
 <Link href="/freelance-jobs" className="hover:text-[#1FA971] transition-colors">How it works</Link>
 <Link href="/internships" className="hover:text-[#1FA971] transition-colors">The platform</Link>
 <Link href="/companies" className="hover:text-[#1FA971] transition-colors">Startups</Link>
 <Link href="/community-guidelines" className="hover:text-[#1FA971] transition-colors">Support</Link>
 </div>

 {/* Right Actions */}
 <div className="hidden md:flex items-center gap-3">
 {/* Language/Region selector mock */}
 <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors">
 <Globe className="w-4 h-4" />
 <span>EN</span>
 <ChevronDown className="w-3 h-3 ml-1" />
 </div>

 <div className="h-6 w-px bg-gray-200 mx-2"></div>

 <button 
 onClick={openSearch}
 className="text-gray-600 hover:text-[#1FA971] transition-colors p-2"
 >
 <Search className="w-5 h-5" />
 </button>
 <Link href="/auth/sign-in" className="text-sm font-bold text-gray-800 hover:text-[#1FA971] transition-colors px-2">
 Log in
 </Link>
 <Link href="/join" className="h-10 px-5 rounded-full bg-[#1FA971] hover:bg-[#199160] text-white text-sm font-bold flex items-center justify-center transition-colors">
 Join Network
 </Link>
 </div>

 {/* Mobile Menu Toggle */}
 <div className="md:hidden flex items-center gap-2">
 <button 
 onClick={openSearch}
 className="p-2 text-gray-700 hover:text-[#1FA971] transition-colors"
 >
 <Search className="w-5 h-5" />
 </button>
 <button 
 className="p-2 text-gray-700 hover:text-[#1FA971] transition-colors"
 onClick={() => setMobileMenuOpen(true)}
 >
 <Menu className="w-6 h-6" />
 </button>
 </div>

 </div>
 </nav>

 {/* Mobile Menu */}
 <AnimatePresence>
 {mobileMenuOpen && (
 <motion.div
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 className="fixed inset-0 z-50 bg-white flex flex-col p-6"
 >
 <div className="flex justify-end">
 <button 
 className="p-2 text-gray-500 hover:text-black transition-colors"
 onClick={() => setMobileMenuOpen(false)}
 >
 <X className="w-8 h-8" />
 </button>
 </div>
 
 <div className="flex flex-col items-center justify-center flex-1 gap-8 text-2xl font-bold text-gray-800">
 <Link href="/freelance-jobs" onClick={() => setMobileMenuOpen(false)}>How it works</Link>
 <Link href="/internships" onClick={() => setMobileMenuOpen(false)}>The platform</Link>
 <Link href="/companies" onClick={() => setMobileMenuOpen(false)}>Startups</Link>
 <div className="h-px w-16 bg-gray-200 my-4" />
 <Link href="/auth/sign-in" className="text-gray-500 text-xl font-semibold" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
 <Link href="/join" className="text-[#1FA971] text-xl font-semibold" onClick={() => setMobileMenuOpen(false)}>Join Network</Link>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </>
 )
}
