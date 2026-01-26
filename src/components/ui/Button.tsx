"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "glass"
    size?: "sm" | "md" | "lg"
    children?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", children, ...props }, ref) => {

        const variants = {
            primary: "bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/20",
            secondary: "bg-secondary text-secondary-foreground hover:brightness-110",
            outline: "border-2 border-primary text-primary hover:bg-primary/10",
            ghost: "hover:bg-muted text-foreground",
            glass: "glass text-foreground hover:bg-white/40 shadow-sm"
        }

        const sizes = {
            sm: "h-9 px-4 text-sm",
            md: "h-11 px-6 text-base",
            lg: "h-14 px-8 text-lg"
        }

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className={cn(
                    "relative inline-flex items-center justify-center rounded-2xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer overflow-hidden",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                <span className="relative z-10 flex items-center gap-2">{children}</span>
                {variant === 'primary' && (
                    <motion.div
                        className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/10 to-transparent"
                        initial={{ x: "100%" }}
                        whileHover={{ x: "-100%" }}
                        transition={{ duration: 0.5 }}
                    />
                )}
            </motion.button>
        )
    }
)
Button.displayName = "Button"
