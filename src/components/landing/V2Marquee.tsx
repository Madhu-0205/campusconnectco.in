"use client"

import React from "react"


const ITEMS = [
    "Campus Gigs",
    "Startup Internships",
    "AI Career Roadmap",
    "Secure Payments",
    "Private Messaging",
    "Campus Network",
    "Any College",
    "Any City in India",
]

function MarqueeItem({ label }: { label: string }) {
    return (
        <>
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest whitespace-nowrap text-muted-foreground">
                {label}
            </span>
            <span className="shrink-0 w-1.5 h-1.5 rounded-full mx-8 bg-foreground/20" />
        </>
    )
}

export function V2Marquee() {
    const allItems = [...ITEMS, ...ITEMS]
    
    return (
        <div className="relative overflow-hidden py-3 bg-bg border-y border-border pointer-events-none select-none">
            {/* Edge fades */}
            <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-linear-to-r from-bg to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-linear-to-l from-bg to-transparent" />
            
            <div 
                className="flex items-center w-max motion-safe:animate-marquee"
                style={{
                    // Use standard CSS animation, fallback to no animation if reduced-motion
                    animation: "marquee 30s linear infinite"
                }}
            >
                {allItems.map((item, i) => <MarqueeItem key={`mq-${i}`} label={item} />)}
                {/* Duplicate one more set to ensure seamless looping on ultra-wide screens */}
                {allItems.map((item, i) => <MarqueeItem key={`mq-dup-${i}`} label={item} />)}
            </div>
            
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .motion-safe\\:animate-marquee {
                        animation: none !important;
                    }
                }
            `}</style>
        </div>
    )
}
