"use client";

import ServiceCard from "@/components/Marketplace/ServiceCard";
import FadeIn from "@/components/FadeIn";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

export default function Marketplace() {
    const services = [
        { title: "I will tutor you in Data Structures & Algorithms", provider: "Alex Johnson", rating: 4.9, reviews: 120, price: "3,000", category: "Tutoring" },
        { title: "Minimalist UI/UX Design for your Startup", provider: "Maria Garcia", rating: 5.0, reviews: 85, price: "12,000", category: "Design" },
        { title: "Full Stack React/Next.js Development", provider: "Kenji Sato", rating: 4.8, reviews: 200, price: "25,000", category: "Development" },
        { title: "Professional Resume & Cover Letter Writing", provider: "Emily Chen", rating: 4.7, reviews: 310, price: "1,500", category: "Writing" },
        { title: "Python Scripting & Automation", provider: "David Kim", rating: 4.9, reviews: 56, price: "5,000", category: "Development" },
        { title: "Social Media Marketing Strategy", provider: "Sarah Williams", rating: 4.6, reviews: 42, price: "8,000", category: "Marketing" },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
                <div className="mb-8">
                    <h1 className="text-3xl font-heading font-bold text-white mb-2">Service Marketplace</h1>
                    <p className="text-gray-400">Discover top talent from your campus network.</p>
                </div>
            </FadeIn>

            <FadeIn delay={0.1}>
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search for services (e.g. 'Calculus Tutoring')"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-electric/50 transition-all focus:bg-slate-800"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white hover:bg-slate-700 transition-colors hover:shadow-lg hover:shadow-electric/10">
                        <SlidersHorizontal size={20} />
                        <span>Filters</span>
                    </button>
                </div>
            </FadeIn>

            <FadeIn delay={0.2}>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {["All", "Development", "Design", "Tutoring", "Writing", "Marketing", "Video"].map((cat, i) => (
                        <button
                            key={cat}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${i === 0 ? 'bg-electric text-white shadow-lg shadow-electric/25' : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700 hover:text-white'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </FadeIn>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {services.map((service, i) => (
                    <motion.div key={i} variants={item}>
                        <ServiceCard {...service} image="" />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
