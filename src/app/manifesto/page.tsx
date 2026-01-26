"use client"

import { motion } from "framer-motion"
import { Shield, Users, Zap, Heart, Star, CheckCircle2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

export default function ManifestoPage() {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header / Navigation */}
            <div className="max-w-7xl mx-auto px-4 pt-8">
                <Link href="/about">
                    <Button variant="ghost" className="text-slate-500 hover:text-slate-900 font-bold gap-2">
                        <ArrowLeft size={18} /> Back to Story
                    </Button>
                </Link>
            </div>

            <div className="max-w-4xl mx-auto px-4 pt-16 space-y-24">
                {/* Hero section */}
                <section className="text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest"
                    >
                        <Shield size={14} className="text-electric" /> The CampusConnect Manifesto
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none"
                    >
                        Trust is <br /><span className="brand-name italic text-electric">Student-Built</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed"
                    >
                        We believe the traditional model of corporate trust is broken.
                        We are building a new foundation where students aren't just participants—they are the arbiters of integrity.
                    </motion.p>
                </section>

                {/* Core Pillars */}
                <div className="grid gap-12">
                    <ManifestoSection
                        icon={<Users className="text-electric" />}
                        title="01. The Student Foundation"
                        content="Traditional platforms rely on top-down verification. CampusConnect flips the script. We believe that a student's reputation within their own community is the most powerful signal of professional capability and reliability."
                    />
                    <ManifestoSection
                        icon={<Zap className="text-amber-500" />}
                        title="02. Empowerment over Extraction"
                        content="We aren't here to take; we're here to build. Every interaction on our platform is designed to increase a student's 'Trust Capital'—a digital asset more valuable than any resume."
                    />
                    <ManifestoSection
                        icon={<Heart className="text-red-500" />}
                        title="03. Radical Transparency"
                        content="Trust requires visibility. Our peer-to-peer scoring and verified campus identities ensure that every gig, every payout, and every collaboration is backed by real-world accountability."
                    />
                </div>

                {/* Final Statement */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="bg-slate-950 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                        <Star size={300} />
                    </div>
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            This is more than a marketplace. <br />It's a <span className="text-electric">Trust Factory</span>.
                        </h2>
                        <div className="space-y-4">
                            <p className="text-slate-400 text-lg font-medium leading-relaxed">
                                Join us in redefining the future of work. Where your value is proven by your actions,
                                and your growth is accelerated by the trust of your peers.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-6">
                                <Link href="/dashboard/student">
                                    <Button className="bg-electric hover:bg-blue-600 px-10 h-16 rounded-2xl font-black text-lg shadow-glow">
                                        Join the Revolution
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    )
}

function ManifestoSection({ icon, title, content }: { icon: any, title: string, content: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row gap-8 items-start p-8 rounded-4xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
        >
            <div className="h-16 w-16 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center text-3xl group-hover:bg-electric/10 transition-colors">
                {icon}
            </div>
            <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
                <p className="text-lg text-slate-600 leading-relaxed font-medium">
                    {content}
                </p>
            </div>
        </motion.div>
    )
}
