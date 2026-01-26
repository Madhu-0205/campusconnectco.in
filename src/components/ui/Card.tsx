"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "./Button" // Reusing cn utility

interface CardProps extends HTMLMotionProps<"div"> {
    variant?: "default" | "glass" | "gradient"
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "default", children, ...props }, ref) => {

        const variants = {
            default: "bg-card text-card-foreground border border-border shadow-sm",
            glass: "glass text-foreground shadow-lg hover:shadow-xl",
            gradient: "bg-linear-to-br from-white to-muted border border-white/50 shadow-md"
        }

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={cn(
                    "rounded-3xl p-6 transition-all",
                    variants[variant],
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        )
    }
)
Card.displayName = "Card"
