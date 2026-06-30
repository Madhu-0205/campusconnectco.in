"use client";

import { motion } from "framer-motion";

export default function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }} // Slightly increased travel distance for drama
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }} // Trigger slightly before element is fully in view
            transition={{
                duration: 0.8, // Slower duration
                delay: delay,
                ease: [0.25, 1, 0.5, 1] // "Luxury" cubic-bezier (Websitestyle.ai feel)
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
