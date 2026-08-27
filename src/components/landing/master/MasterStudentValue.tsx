"use client"

import { User, CheckCircle, Search, LayoutDashboard } from "lucide-react"
import React from "react"

import { Reveal } from "@/components/ui/motion/Reveal"

export function MasterStudentValue() {
  const steps = [
    {
      icon: User,
      title: "1. Build your profile",
      desc: "Verify your student status and add your skills. Your profile acts as your master resume."
    },
    {
      icon: Search,
      title: "2. Find & apply",
      desc: "Discover local startups hiring from your campus. Apply with one click."
    },
    {
      icon: LayoutDashboard,
      title: "3. Track applications",
      desc: "No more black holes. Track your application status directly on your dashboard."
    },
    {
      icon: CheckCircle,
      title: "4. Work & get paid",
      desc: "Communicate with founders, submit work, and receive secure payments via escrow."
    }
  ]

  return (
    <section className="w-full bg-[#FAFCFA] py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-350">
        
        <Reveal>
          <div className="max-w-3xl mb-16 lg:mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#1FA971]/20 text-xs font-semibold text-[#1FA971] mb-6 shadow-sm">
              <User className="w-3.5 h-3.5" />
              For Students
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#232B27] tracking-tight mb-6 leading-tight">
              Launch your career <br className="hidden sm:block"/>
              <span className="text-[#1FA971]">before you graduate.</span>
            </h2>
            <p className="text-lg text-[#4A5550] font-medium max-w-2xl">
              Gain real-world experience, build your network, and earn money while studying. CampusConnect is designed specifically for the student journey.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, idx) => (
            <Reveal key={idx} delay={idx * 0.1}>
              <div className="bg-white rounded-3xl border border-gray-100 p-8 h-full shadow-[0_5px_30px_-15px_rgba(0,0,0,0.03)] hover:border-[#1FA971]/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#E8F3EE] flex items-center justify-center mb-6">
                  <step.icon className="w-6 h-6 text-[#1FA971]" />
                </div>
                <h3 className="text-xl font-bold text-[#232B27] mb-3">{step.title}</h3>
                <p className="text-[#4A5550] font-medium leading-relaxed text-sm">
                  {step.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}
