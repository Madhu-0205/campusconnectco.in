"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Zap, Target, Users, Shield, ArrowRight, Heart, Star, CheckCircle2 } from "lucide-react"

const storySteps = [
    {
        title: "The Vision",
        desc: "Born out of a simple need: to empower students with real-world experience while they study. CampusConnect isn't just a marketplace; it's a growth engine.",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop",
        icon: <Zap className="text-amber-500" />
    },
    {
        title: "The Partnership",
        desc: "We bring businesses and talent together through intelligent matching. Every gig posted starts a cycle of collaboration and mutual growth.",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
        icon: <Target className="text-electric" />
    },
    {
        title: "The Future",
        desc: "From short-term gigs to long-term career paths. Our internship portal bridges the gap between campus life and the professional corporate world.",
        image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop",
        icon: <Shield className="text-emerald-500" />
    }
]

import Link from "next/link"

export default function AboutClient() {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <div className="space-y-32 pb-32">
            {/* Mission Hero */}
            <section className="text-center max-w-4xl mx-auto pt-20 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-electric/10 rounded-full border border-electric/20 text-electric font-black text-xs uppercase tracking-widest mb-8"
                >
                    <Star size={14} className="animate-pulse" /> Our Journey
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-6xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-tight"
                >
                    The Story of <span className="brand-name italic">CampusConnect</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl text-slate-600 leading-relaxed font-medium"
                >
                    We are building the trust-building foundation of campus talent.
                    <span className="text-slate-900 font-bold italic"> Students are our engine, and trust is our fuel.</span>
                </motion.p>
            </section>

            {/* Interactive Story Section */}
            <section className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Our <span className="text-electric">Evolution</span></h2>
                        <div className="space-y-4">
                            {storySteps.map((step, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveStep(i)}
                                    className={`w-full text-left p-6 rounded-3xl transition-all duration-500 border-2 ${activeStep === i
                                        ? 'bg-white border-electric shadow-2xl scale-[1.02]'
                                        : 'bg-transparent border-transparent hover:bg-white/50 grayscale opacity-60'
                                        }`}
                                >
                                    <div className="flex items-start gap-5">
                                        <div className={`p-4 rounded-2xl ${activeStep === i ? 'bg-electric text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            {step.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                                            {activeStep === i && (
                                                <motion.p
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="text-slate-600 font-medium"
                                                >
                                                    {step.desc}
                                                </motion.p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative aspect-square">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, x: 20, rotate: 2 }}
                                animate={{ opacity: 1, x: 0, rotate: 0 }}
                                exit={{ opacity: 0, x: -20, rotate: -2 }}
                                transition={{ duration: 0.5 }}
                                className="w-full h-full"
                            >
                                <Card className="w-full h-full p-3 rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border-none">
                                    <img
                                        src={storySteps[activeStep].image}
                                        className="w-full h-full object-cover rounded-[2.5rem]"
                                        alt={storySteps[activeStep].title}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                                    <div className="absolute bottom-10 left-10 text-white">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="h-1 w-8 bg-electric rounded-full" />
                                            <span className="text-xs font-black uppercase tracking-widest text-electric">Step {activeStep + 1}</span>
                                        </div>
                                        <p className="text-xl font-black">{storySteps[activeStep].title}</p>
                                    </div>
                                </Card>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* The Students-as-Foundation Section */}
            <section className="bg-slate-50 py-32 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-electric/20 rounded-[3rem] blur-3xl group-hover:bg-electric/30 transition-all" />
                        <Card className="p-12 rounded-[3.5rem] bg-slate-950 text-white border-none shadow-2xl relative z-10 overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                                <Heart size={180} />
                            </div>
                            <h3 className="text-4xl font-black mb-8 leading-tight">Trust is Built <br /><span className="text-electric">By Students</span></h3>
                            <div className="space-y-6">
                                {[
                                    "Verified campus identities only.",
                                    "Peer-to-peer reputation scoring.",
                                    "Quality control through community curation.",
                                    "Transparency in every single gig."
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 text-emerald-400 font-bold">
                                        <CheckCircle2 size={24} />
                                        <span className="text-slate-300 text-lg leading-tight">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                    <div className="space-y-8">
                        <div className="p-3 bg-white shadow-xl rounded-2xl w-fit">
                            <Shield className="text-electric" size={32} />
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            The Foundation <br />Of Our Platform
                        </h2>
                        <p className="text-xl text-slate-600 font-medium leading-relaxed">
                            Unlike traditional platforms, CampusConnect is a <span className="text-slate-900 font-bold">trust-building collective</span>.
                            We believe that students are the most reliable foundation for any professional collaboration.
                        </p>
                        <p className="text-xl text-slate-600 font-medium leading-relaxed italic">
                            By centering trust around the student community, we ensure every gig is backed by integrity.
                        </p>
                        <Link href="/manifesto">
                            <Button variant="outline" className="h-16 px-8 rounded-2xl border-2 border-slate-200 font-black text-lg hover:bg-slate-900 hover:text-white transition-all group">
                                Read Our Manifesto <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Interactive Community Section */}
            <section className="px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="bg-slate-950 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-3xl"
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,#3b82f611,transparent)]" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-electric/10 rounded-full blur-[100px]" />

                    <div className="relative z-10 max-w-3xl mx-auto space-y-10">
                        <div className="inline-flex -space-x-4 mb-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-16 w-16 rounded-full border-4 border-slate-950 bg-slate-800 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                                </div>
                            ))}
                            <div className="h-16 w-16 rounded-full border-4 border-slate-950 bg-electric flex items-center justify-center font-black text-white text-sm">
                                +50k
                            </div>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-none">
                            Ready to Join the <span className="text-electric italic">Trust Factory?</span>
                        </h2>
                        <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                            Join over 50,000 students who are building their future and proving their value every single day.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                            <Button size="lg" className="bg-electric hover:bg-blue-600 px-12 h-18 text-xl font-black rounded-3xl shadow-glow">
                                Become a Member
                            </Button>
                            <Button variant="glass" size="lg" className="border-white/10 bg-white/5 hover:bg-white/10 px-12 h-18 text-xl font-black rounded-3xl backdrop-blur-md">
                                Hire Talent
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    )
}
