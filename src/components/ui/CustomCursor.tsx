"use client"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export default function CustomCursor() {
    const [mounted, setMounted] = useState(false)
    const [hovering, setHovering] = useState(false)
    const [onCard, setOnCard] = useState(false)

    // Raw mouse values
    const mouseX = useMotionValue(-200)
    const mouseY = useMotionValue(-200)

    // Dot follows instantly
    const dotX = useSpring(mouseX, { stiffness: 2000, damping: 80, mass: 0.1 })
    const dotY = useSpring(mouseY, { stiffness: 2000, damping: 80, mass: 0.1 })

    // Ring follows with lag
    const ringX = useSpring(mouseX, { stiffness: 200, damping: 28, mass: 0.5 })
    const ringY = useSpring(mouseY, { stiffness: 200, damping: 28, mass: 0.5 })

    useEffect(() => {
        setMounted(true)

        const onMove = (e: MouseEvent) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
        }

        const onMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (
                target.closest("a") ||
                target.closest("button") ||
                target.closest("[data-cursor='button']")
            ) {
                setHovering(true)
                setOnCard(false)
            } else if (target.closest("[data-cursor='card']")) {
                setOnCard(true)
                setHovering(false)
            } else {
                setHovering(false)
                setOnCard(false)
            }
        }

        window.addEventListener("mousemove", onMove, { passive: true })
        window.addEventListener("mouseover", onMouseOver, { passive: true })
        return () => {
            window.removeEventListener("mousemove", onMove)
            window.removeEventListener("mouseover", onMouseOver)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Only render on desktop
    if (!mounted) return null

    return (
        <>
            {/* Main dot — 8px, follows exactly */}
            <motion.div
                style={{
                    translateX: dotX,
                    translateY: dotY,
                    x: "-50%",
                    y: "-50%",
                }}
                className="pointer-events-none fixed top-0 left-0 z-9999"
            >
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: hovering || onCard ? "#ff4d1c" : "#0a0a0f" }}
                />
            </motion.div>

            {/* Ring — 36px, lagged */}
            <motion.div
                style={{
                    translateX: ringX,
                    translateY: ringY,
                    x: "-50%",
                    y: "-50%",
                    mixBlendMode: "difference",
                }}
                animate={{
                    width: onCard ? 64 : hovering ? 56 : 36,
                    height: onCard ? 64 : hovering ? 56 : 36,
                    backgroundColor: hovering ? "rgba(255,77,28,0.15)" : "rgba(0,0,0,0)",
                    borderColor: hovering || onCard ? "#ff4d1c" : "rgba(10,10,15,0.5)",
                }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                className="pointer-events-none fixed top-0 left-0 z-9999 rounded-full border flex items-center justify-center"
            >
                {onCard && (
                    <span className="font-bold text-white tracking-widest uppercase">
                        View
                    </span>
                )}
            </motion.div>
        </>
    )
}
