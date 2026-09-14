"use client"

import { ChevronDown } from "lucide-react"
import React, { useState } from "react"

import { Reveal } from "@/components/ui/motion/Reveal"

interface FAQItem {
  question: string
  answer: string
}

export function MasterFAQ({ faqs }: { faqs: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="w-full bg-[#FAFCFA] py-24 lg:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-350">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <Reveal>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#232B27] tracking-tight mb-6">
                Frequently Asked <br className="hidden sm:block" />
                <span className="text-[#1FA971]">Questions</span>
              </h2>
              <p className="text-lg text-[#4A5550] font-medium max-w-md">
                Everything you need to know about finding opportunities and hiring talent on CampusConnectCo.
              </p>
            </Reveal>
          </div>
          
          <div className="lg:col-span-7">
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <Reveal key={idx} delay={idx * 0.1}>
                  <div 
                    className={`rounded-2xl border transition-all duration-300 ${
                      openIndex === idx ? 'border-[#1FA971]/30 bg-white shadow-sm' : 'border-gray-100 bg-white hover:border-[#1FA971]/20'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                      aria-expanded={openIndex === idx}
                    >
                      <h3 className={`text-lg font-bold pr-8 ${openIndex === idx ? 'text-[#1FA971]' : 'text-[#232B27]'}`}>
                        {faq.question}
                      </h3>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        openIndex === idx ? 'bg-[#E8F3EE] text-[#1FA971] rotate-180' : 'bg-gray-50 text-gray-400'
                      }`}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </button>
                    
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="p-6 pt-0 text-[#4A5550] font-medium leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
