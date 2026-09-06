"use client"

import Link from"next/link"
import React from"react"

import { Reveal } from"@/components/ui/motion/Reveal"

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
 <Link href={href} className="text-text-2 hover:text-foreground transition-colors">
 {children}
 </Link>
)

export function V2Footer() {
 return (
 <footer className="pt-24 pb-8 relative overflow-hidden bg-bg border-t border-border">
 
 <div className="container mx-auto px-6 max-w-7xl relative z-10">
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
 
 <div className="lg:col-span-1">
 <Reveal>
 <div className="flex items-center gap-3 mb-6">
 <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-glow-primary">
 CC
 </div>
 <span className="font-heading font-semibold text-lg tracking-wide">CampusConnect</span>
 </div>
 <p className="text-text-2 mb-6 max-w-xs">
 The premium network for ambitious students to find internships and freelance gigs.
 </p>
 </Reveal>
 </div>

 <div>
 <Reveal delay={0.1}>
 <h4 className="font-semibold mb-6">Platform</h4>
 <ul className="space-y-4 flex flex-col">
 <FooterLink href="/freelance-jobs">Browse Gigs</FooterLink>
 <FooterLink href="/internships">Internships</FooterLink>
 <FooterLink href="/companies">Startups</FooterLink>
 <FooterLink href="/leaderboard">Leaderboard</FooterLink>
 </ul>
 </Reveal>
 </div>

 <div>
 <Reveal delay={0.2}>
 <h4 className="font-semibold mb-6">Company</h4>
 <ul className="space-y-4 flex flex-col">
 <FooterLink href="/about">About Us</FooterLink>
 <FooterLink href="/manifesto">Manifesto</FooterLink>
 <FooterLink href="/contact">Contact</FooterLink>
 <FooterLink href="/success-stories">Success Stories</FooterLink>
 </ul>
 </Reveal>
 </div>

 <div>
 <Reveal delay={0.3}>
 <h4 className="font-semibold mb-6">Legal</h4>
 <ul className="space-y-4 flex flex-col">
 <FooterLink href="/privacy">Privacy Policy</FooterLink>
 <FooterLink href="/terms">Terms of Service</FooterLink>
 <FooterLink href="/refund-policy">Refund Policy</FooterLink>
 <FooterLink href="/community-guidelines">Guidelines</FooterLink>
 </ul>
 </Reveal>
 </div>

 </div>

 <Reveal delay={0.4}>
 <div className="w-full flex justify-center py-12 border-t border-border">
 <h2 className="text-[12vw] md:text-[14vw] font-extrabold tracking-tighter text-black/5 select-none text-center leading-none">
 CAMPUSCONNECT
 </h2>
 </div>
 </Reveal>
 
 <Reveal delay={0.5}>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border text-sm text-text-3">
          <div className="flex items-center gap-3">
            <p>© {new Date().getFullYear()} CampusConnect. All rights reserved.</p>
            <span className="text-border">•</span>
            <a
              href="https://developer.puter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:text-foreground text-text-3/80 transition-colors"
            >
              Powered by Puter
            </a>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
 <a href="https://twitter.com/campusconnect" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Twitter</a>
 <a href="https://linkedin.com/company/campusconnect" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">LinkedIn</a>
 <a href="https://instagram.com/campusconnect" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Instagram</a>
 </div>
 </div>
 </Reveal>

 </div>
 </footer>
 )
}
