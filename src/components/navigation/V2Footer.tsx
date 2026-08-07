"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"

import { HoverMagnetic } from "@/components/ui/motion/HoverMagnetic"
import { Reveal } from "@/components/ui/motion/Reveal"

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-text-2 hover:text-white transition-colors">
    {children}
  </Link>
)

export function V2Footer() {
  return (
    <footer className="pt-24 pb-8 relative overflow-hidden bg-bg border-t border-white/5">
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
          
          <div className="lg:col-span-1">
            <Reveal>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-lg">
                  C
                </div>
                <span className="font-semibold text-lg tracking-tight">CampusConnect</span>
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
          <div className="w-full flex justify-center py-12 border-t border-white/5">
            <h2 className="text-[12vw] md:text-[14vw] font-extrabold tracking-tighter text-white/5 select-none text-center leading-none">
              CAMPUSCONNECT
            </h2>
          </div>
        </Reveal>
        
        <Reveal delay={0.5}>
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-sm text-text-3">
            <p>© {new Date().getFullYear()} CampusConnect. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
            </div>
          </div>
        </Reveal>

      </div>
    </footer>
  )
}
