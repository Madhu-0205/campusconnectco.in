"use client"

import { Hero3D } from "@/components/ui/3d/Hero3D"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, Globe, ShieldCheck, Zap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()
  }, [supabase])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Background */}
      <div className="fixed inset-0 pointer-events-none">
        <Hero3D />
      </div>

      <main className="relative z-10 pt-20 pb-32 max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-white/60 backdrop-blur-md mb-8 text-sm text-slate-600 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live on 50+ Campuses
            </div>

            <div className="flex flex-col items-center mb-10">
              <span className="student-badge mb-4">Made by students for students</span>
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-linear-to-b from-slate-900 to-slate-600 pb-2 px-2">
                Earn. Learn. <br /> <span className="brand-name italic">CampusConnect</span>
              </h1>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
              The exclusive gig marketplace for the Indian student community. Connect with local businesses,
              join campus clubs, and build your portfolio with zero fees.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14 bg-electric hover:bg-blue-600">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/auth/signin" className="w-full sm:w-auto">
                    <Button size="lg" variant="glass" className="w-full sm:w-auto text-lg px-8 h-14">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-6 mb-32">
          {[
            { label: "Active Students", value: "12K+" },
            { label: "Gigs Completed", value: "8.5K" },
            { label: "Student Earnings", value: "₹3.5Cr+" },
            { label: "Indian Campuses", value: "50+" },
          ].map((stat, i) => (
            <Card key={i} className="text-center p-8 bg-white/40 backdrop-blur-xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:scale-105 transition-all rounded-[2.5rem]">
              <div className="text-3xl font-black brand-name mb-1 tracking-tighter">{stat.value}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</div>
            </Card>
          ))}
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it Works</h2>
            <p className="text-muted-foreground">Three simple steps to start earning.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Create Profile", desc: "Verify your student status and showcase your skills.", icon: Globe, color: "bg-blue-500/10 text-blue-600" },
              { title: "Browse & Apply", desc: "Filter gigs by pay, location, and skill match.", icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-600" },
              { title: "Get Paid", desc: "Secure escrow payments released instantly upon approval.", icon: ShieldCheck, color: "bg-amber-500/10 text-amber-600" }
            ].map((step, i) => (
              <Card key={i} className="p-10 bg-white/60 backdrop-blur-xl border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] relative group overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                  <step.icon className="h-40 w-40" />
                </div>
                <div className={`h-16 w-16 rounded-3xl ${step.color} flex items-center justify-center mb-8 shadow-inner`}>
                  <step.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black mb-4 text-slate-900 tracking-tight">{step.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-20 relative z-10 bg-white/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">© 2026 CampusConnect Inc. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
