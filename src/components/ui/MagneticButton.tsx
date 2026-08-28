"use client"

import { motion, useSpring } from"framer-motion"
import { useRef, useState, useCallback } from"react"

import { cn } from"@/lib/utils"

interface MagneticButtonProps {
 children: React.ReactNode
 className?: string
 variant?:"filled" |"outline" |"ghost"
 href?: string
 onClick?: () => void
 type?:"button" |"submit"
 disabled?: boolean
"data-cursor"?: string
}

export default function MagneticButton({
 children,
 className,
 variant ="filled",
 href,
 onClick,
 type ="button",
 disabled,
}: MagneticButtonProps) {
 const anchorRef = useRef<HTMLAnchorElement>(null)
 const buttonRef = useRef<HTMLButtonElement>(null)
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
 const [isHovered, setIsHovered] = useState(false)

 const x = useSpring(0, { stiffness: 300, damping: 30 })
 const y = useSpring(0, { stiffness: 300, damping: 30 })

 const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
 const el = anchorRef.current ?? buttonRef.current
 if (!el) return
 const rect = el.getBoundingClientRect()
 const cx = rect.left + rect.width / 2
 const cy = rect.top + rect.height / 2
 x.set((e.clientX - cx) * 0.35)
 y.set((e.clientY - cy) * 0.35)
 }, [x, y])

 const handleMouseLeave = useCallback(() => {
 x.set(0)
 y.set(0)
 setIsHovered(false)
 }, [x, y])

 const baseStyles = cn(
"relative inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 select-none whitespace-nowrap outline-none focus-visible:ring-2",
"px-6 py-3 text-sm",
 variant ==="filled" && [
"text-white active:scale-[0.97]",
 ],
 variant ==="outline" && [
"border active:scale-[0.97]",
 ],
 variant ==="ghost" &&"active:scale-[0.97]",
 disabled &&"opacity-50 cursor-not-allowed",
 className
 )

 // Inline styles per variant (CSS vars from design system)
 const variantStyle =
 variant ==="filled"
 ? {
 background:"var(--grad-brand)",
 boxShadow:"var(--shadow-glow-primary)",
 color:"#fff",
 }
 : variant ==="outline"
 ? {
 borderColor:"var(--border)",
 color:"var(--text-2)",
 background:"rgba(17,17,39,0.5)",
 }
 : {
 color:"var(--text-2)",
 }

 const handleHoverEnter = () => {
 setIsHovered(true)
 }

 const sharedMotionProps = {
 style: { x, y, ...variantStyle },
 onMouseMove: handleMouseMove,
 onMouseEnter: handleHoverEnter,
 onMouseLeave: handleMouseLeave,
 whileTap: { scale: 0.97 },
"data-cursor":"button",
 } as const

 if (href) {
 return (
 <motion.a
 ref={anchorRef}
 href={href}
 className={baseStyles}
 {...sharedMotionProps}
 >
 {children}
 </motion.a>
 )
 }

 return (
 <motion.button
 ref={buttonRef}
 type={type}
 onClick={onClick}
 disabled={disabled}
 className={baseStyles}
 {...sharedMotionProps}
 >
 {children}
 </motion.button>
 )
}
