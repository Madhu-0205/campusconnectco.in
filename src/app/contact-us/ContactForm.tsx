"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate a network request
        setTimeout(() => setIsSubmitting(false), 1500);
    };

    return (
        <form className="space-y-8 relative z-10 flex flex-col" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label htmlFor="name" className="block font-mono uppercase tracking-widest text-[#8a8a93]">Full Name</label>
                    <input 
                        id="name"
                        type="text" 
                        required
                        className="w-full bg-transparent border-[#27272a] text-white placeholder-[#52525b] pb-3 form-input outline-none appearance-none rounded-none" 
                        placeholder="John Doe" 
                        autoComplete="name"
                    />
                </div>
                <div className="space-y-3">
                    <label htmlFor="email" className="block font-mono uppercase tracking-widest text-[#8a8a93]">Email Address</label>
                    <input 
                        id="email"
                        type="email" 
                        required
                        className="w-full bg-transparent border-[#27272a] text-white placeholder-[#52525b] pb-3 form-input outline-none appearance-none rounded-none" 
                        placeholder="john@example.com" 
                        autoComplete="email"
                    />
                </div>
            </div>

            <div className="space-y-3 pt-2">
                <label htmlFor="subject" className="block font-mono uppercase tracking-widest text-[#8a8a93]">Subject Area</label>
                <select 
                    id="subject"
                    required
                    className="w-full bg-transparent border-[#27272a] text-white pb-3 form-input outline-none appearance-none rounded-none cursor-pointer" 
                >
                    <option className="bg-[#0a0a0f] text-white">Escrow Payment Issue</option>
                    <option className="bg-[#0a0a0f] text-white">Enterprise Recruitment</option>
                    <option className="bg-[#0a0a0f] text-white">Partnership Inquiry</option>
                    <option className="bg-[#0a0a0f] text-white">General Support</option>
                </select>
            </div>

            <div className="space-y-3 pt-2">
                <label htmlFor="message" className="block font-mono uppercase tracking-widest text-[#8a8a93]">Your Message</label>
                <textarea 
                    id="message"
                    rows={5} 
                    required
                    className="w-full bg-transparent border-[#27272a] text-white placeholder-[#52525b] pb-3 form-input outline-none appearance-none resize-none rounded-none" 
                    placeholder="Provide details privately..." 
                />
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting}
                className="mt-8 flex items-center justify-between w-full p-5 bg-white text-black hover:bg-(--accent-warm) hover:text-black focus-visible:bg-(--accent-warm) transition-colors duration-400 group rounded-xl outline-none disabled:opacity-75 disabled:cursor-wait"
            >
                <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-display, "Syne", sans-serif)' }}>
                    {isSubmitting ? "Dispatching..." : "Dispatch Message"}
                </span>
                <div className="flex items-center gap-1 overflow-hidden">
                    <span className="text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-2 hidden sm:block">Secure Send</span>
                    <ArrowRight className="w-6 h-6 -translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)]" />
                </div>
            </button>
        </form>
    );
}
