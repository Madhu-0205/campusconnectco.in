"use client"

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
            <span
                className="text-xs font-bold uppercase tracking-[0.2em] whitespace-nowrap"
                style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)" }}
            >
                {label}
            </span>
            <span
                className="shrink-0 w-1.5 h-1.5 rounded-full mx-8"
                style={{ background: "var(--primary-light)", opacity: 0.5 }}
            />
        </>
    )
}

export default function CCMarquee() {
    const allItems = [...ITEMS, ...ITEMS]
    return (
        <div
            className="relative overflow-hidden py-4"
            style={{
                background: "var(--surface)",
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
            }}
        >
            {/* Edge fades */}
            <div
                className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
                style={{ background: "linear-gradient(to right, var(--surface), transparent)" }}
            />
            <div
                className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
                style={{ background: "linear-gradient(to left, var(--surface), transparent)" }}
            />
            <div className="flex marquee-track">
                {allItems.map((item, i) => <MarqueeItem key={i} label={item} />)}
            </div>
        </div>
    )
}
