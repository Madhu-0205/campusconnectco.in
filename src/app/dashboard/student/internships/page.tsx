"use client"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"
import { Search, Filter, Building2, MapPin, Calendar, ArrowRight } from "lucide-react"
import Image from "next/image"

const internships = [
    {
        id: 1,
        title: "Software Engineering Intern",
        company: "TechNova Solutions",
        location: "Remote / Bengaluru",
        duration: "3 Months",
        stipend: "₹25,000 / month",
        posted: "2 days ago",
        tags: ["React", "Node.js", "PostgreSQL"]
    },
    {
        id: 2,
        title: "Product Design Intern",
        company: "CreativeFlow Studio",
        location: "Mumbai",
        duration: "6 Months",
        stipend: "₹20,000 / month",
        posted: "1 day ago",
        tags: ["Figma", "UI/UX", "Prototyping"]
    },
    {
        id: 3,
        title: "Data Science Intern",
        company: "Quant analytics",
        location: "Hyderabad",
        duration: "4 Months",
        stipend: "₹30,000 / month",
        posted: "3 days ago",
        tags: ["Python", "Pandas", "Machine Learning"]
    }
]

export default function InternshipsPage() {
    return (
        <div className="space-y-10 pb-20">
            {/* Storytelling Header Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
            >
                <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/40 to-transparent z-10" />
                <img
                    src="/internship_hero.png"
                    alt="Internship Success Path"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-20 h-full flex flex-col justify-center px-12 max-w-2xl">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl font-bold text-white mb-4"
                    >
                        Your Career Starts Here
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-200 text-lg mb-8 leading-relaxed"
                    >
                        Connect with industry leaders, gain real-world experience, and build the foundation of your professional story.
                    </motion.p>
                    <div className="flex gap-4">
                        <Button size="lg" className="bg-electric hover:bg-blue-600 shadow-lg shadow-electric/30">
                            Apply Now
                        </Button>
                        <Button size="lg" variant="glass" className="text-white border-white/20">
                            View Success Stories
                        </Button>
                    </div>
                </div>
            </motion.section>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Search and Filters */}
                <aside className="w-full md:w-64 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Filter size={20} className="text-electric" />
                        <h3 className="font-bold text-slate-900">Filters</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-2">Role Type</label>
                            <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-electric/20 outline-none">
                                <option>Technical</option>
                                <option>Design</option>
                                <option>Management</option>
                                <option>Marketing</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-2">Location</label>
                            <div className="space-y-2">
                                {['Remote', 'Office', 'Hybrid'].map(loc => (
                                    <label key={loc} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                        <input type="checkbox" className="rounded border-slate-300 text-electric focus:ring-electric" />
                                        {loc}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Internship Listings */}
                <div className="flex-1 space-y-6">
                    <div className="flex gap-4 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search internships (e.g. 'Software Intern')"
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-electric/20 outline-none shadow-sm"
                            />
                        </div>
                        <Button className="bg-slate-900 hover:bg-slate-800 rounded-2xl px-8">Find</Button>
                    </div>

                    <div className="grid gap-4">
                        {internships.map((job) => (
                            <motion.div
                                key={job.id}
                                whileHover={{ y: -5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <Card className="p-6 border-slate-100 hover:border-electric/30 hover:shadow-xl transition-all group">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-electric/5 group-hover:text-electric transition-colors">
                                                <Building2 size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900 mb-1">{job.title}</h3>
                                                <p className="text-sm text-slate-500 font-medium">{job.company}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900">{job.stipend}</p>
                                            <p className="text-xs text-slate-400">{job.posted}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 mt-6 text-sm text-slate-600">
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full">
                                            <MapPin size={14} className="text-slate-400" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full">
                                            <Calendar size={14} className="text-slate-400" />
                                            {job.duration}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-50">
                                        <div className="flex gap-2">
                                            {job.tags.map(tag => (
                                                <span key={tag} className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{tag}</span>
                                            ))}
                                        </div>
                                        <Button variant="ghost" className="text-electric hover:text-blue-600 hover:bg-blue-50 gap-2 font-bold p-0">
                                            Apply <ArrowRight size={18} />
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
