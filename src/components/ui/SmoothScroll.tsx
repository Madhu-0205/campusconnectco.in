"use client"

import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import type Lenis from "lenis"
import { ReactLenis } from "lenis/react"
import type { LenisRef } from "lenis/react"
import { useEffect, useRef } from "react"

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger)
}

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
    // Lenis instance provided by ReactLenis
    const lenisRef = useRef<LenisRef>(null)

    useEffect(() => {
        // Connect Lenis to GSAP ticker for perfect synchronization with ScrollTrigger
        const update = (time: number) => {
            // GSAP time is in seconds, Lenis expects milliseconds
            lenisRef.current?.lenis?.raf(time * 1000)
        }

        gsap.ticker.add(update)
        gsap.ticker.lagSmoothing(0)

        return () => {
            gsap.ticker.remove(update)
        }
    }, [])

    // Ensure ScrollTrigger updates on scroll
    useEffect(() => {
        const lenis = lenisRef.current?.lenis;
        if (!lenis) return;
        
        const onScroll = () => {
            ScrollTrigger.update();
        };
        
        lenis.on('scroll', onScroll);
        return () => {
            lenis.off('scroll', onScroll);
        };
    }, []);

    return (
        <ReactLenis
            root
            ref={lenisRef}
            autoRaf={false}
            style={{ position: "relative" }}
            options={{
                duration: 1.5, // slightly longer for a luxurious feel
                easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: "vertical",
                gestureOrientation: "vertical",
                smoothWheel: true,
                wheelMultiplier: 1.05,
                touchMultiplier: 2,
            }}
        >
            {children}
        </ReactLenis>
    )
}
